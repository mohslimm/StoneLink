// ============================================================
// Src/Services/MapsScraper.js — Google Maps search & extraction
// ============================================================

import Config            from '../Config/Config.js';
import { sleep, randomDelay, randomSleep } from '../Utils/Delay.js';
import { clean }         from '../Utils/Formatter.js';

// ── Selectors ─────────────────────────────────────────────────────────────────
const SEL = {
  // input[name="q"] is the stable selector — the id (ucc-1) is dynamic
  searchBox:   'input[name="q"]',
  searchBtn:   'button[aria-label="Rechercher"], button[aria-label="Search"]',
  feed:        'div[role="feed"]',
  card:        'div[role="feed"] .Nv2PK',
  endOfList:   '[jsaction*="pane.resultSection.endOfResults"], .HlvSq, [role="feed"] p.fontTitleSmall',

  // Detail panel
  name:        'h1.DUwDvf, h1[class*="fontHeadlineLarge"]',
  score:       'div.F7nice span[aria-hidden="true"]',
  reviews:     'div.F7nice span[aria-label*="reviews"], div.F7nice span[aria-label*="avis"]',
  phone:       '[data-item-id^="phone"] .Io6YTe, button[data-tooltip="Copy phone number"] .Io6YTe',
  website:     'a[data-tooltip="Open website"], a[data-item-id^="authority"]',
  closed:      '.m6QErb.W4E79c [style*="color: rgb(217, 48, 37)"], .m6QErb.W4E79c [style*="color: #d93025"]', // Red text usually means closed
};


// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Types text into a selector character by character with random delays.
 * This is the core "human typing" behaviour the bot uses on the search bar.
 */
async function humanType(page, selector, text) {
  await page.click(selector);
  await sleep(200);

  for (const char of text) {
    await page.keyboard.type(char);                          // type one character
    await sleep(randomDelay({ min: 40, max: 120 }));          // fast fluid typing
  }
}

// ── Scroll Logic ──────────────────────────────────────────────────────────────

async function scrollUntilLoaded(page, targetCount, options = {}) {
  const MAX_SCROLLS = 30;
  const STUCK_LIMIT = 3;

  const log = options.onLog || console.log;
  log(`🔄 Défilement de la liste Google Maps (Cible: ${targetCount} résultats)...`);

  let prevCount  = 0;
  let stuckCount = 0;

  for (let i = 1; i <= MAX_SCROLLS; i++) {
    if (options.isCancelled?.()) {
      log('🛑 Arrêt demandé pendant le défilement.');
      break;
    }

    // Count visible result cards
    const count = await page.$$eval(
      SEL.card,
      (els) => els.filter((el) => el.innerText?.trim().length > 0).length
    ).catch(() => 0);

    if (count >= targetCount) {
      log(`✅ Objectif atteint : ${count}/${targetCount} fiches chargées.`);
      break;
    }

    // End-of-list sentinel selector
    const ended = await page.$(SEL.endOfList)
      .then((el) => el?.isVisible().catch(() => false) ?? false)
      .catch(() => false);

    // End-of-list text detection inside the feed
    const reachedEndText = await page.evaluate(() => {
      const feed = document.querySelector('div[role="feed"]');
      if (!feed) return false;
      const text = feed.innerText || '';
      return text.includes("Vous avez atteint la fin de la liste") || 
             text.includes("You've reached the end of the list") ||
             text.includes("Fin des résultats") ||
             text.includes("fin de la liste");
    }).catch(() => false);

    if (ended || reachedEndText) {
      log(`📍 Fin des résultats Google Maps détectée (${count} fiches disponibles dans cette zone).`);
      break;
    }

    // Stuck detection (if no new cards appear for 3 consecutive scrolls)
    if (count === prevCount && count > 0) {
      stuckCount++;
      if (stuckCount >= STUCK_LIMIT) {
        log(`📍 Aucune fiche supplémentaire trouvée après ${STUCK_LIMIT} défilements — Total disponible : ${count} fiches.`);
        break;
      }
    } else {
      stuckCount = 0;
    }

    prevCount = count;

    if (i % 2 === 0 || count !== prevCount) {
      options.onStatusUpdate?.({
        currentLead: `Défilement Google Maps: ${count} fiches repérées...`,
      });
    }

    // Scroll the feed element directly — progressive depth
    const amount = 800 + i * 50;
    await page.evaluate(
      ({ sel, amt }) => { 
        const feed = document.querySelector(sel);
        if (feed) feed.scrollBy(0, amt); 
      },
      { sel: SEL.feed, amt: amount }
    ).catch(() => {});

    await sleep(1400);
  }

  const final = await page.$$eval(SEL.card, (els) => els.length).catch(() => 0);
  log(`🏷️ Total de fiches repérées sur la carte : ${final}`);
}

// ── Detail panel extraction ────────────────────────────────────────────────────

async function extractFromPanel(page) {
  await sleep(1000);

  const get = async (sel) =>
    page.locator(sel).first().textContent({ timeout: 4000 })
      .then((t) => clean(t))
      .catch(() => '');

  // Extract social links directly from the Maps panel (if present)
  const socialLinks = await page.$$eval('a[href]', (anchors) => {
    const found = { Instagramlink: '', Facebooklink: '', Linkedinlink: '', TikToklink: '' };
    anchors.forEach(a => {
      const href = a.href.toLowerCase();
      if (!found.Instagramlink && href.includes('instagram.com')) found.Instagramlink = a.href;
      if (!found.Facebooklink  && href.includes('facebook.com'))  found.Facebooklink  = a.href;
      if (!found.Linkedinlink  && href.includes('linkedin.com'))  found.Linkedinlink  = a.href;
      if (!found.TikToklink    && href.includes('tiktok.com'))    found.TikToklink    = a.href;
    });
    return found;
  }).catch(() => ({ Instagramlink: '', Facebooklink: '', Linkedinlink: '', TikToklink: '' }));

  // Check for "Closed" text
  const closedText = await page.$$eval(SEL.closed, (els) => els.map(el => el.innerText).join(' ')).catch(() => '');
  const isClosed = /fermé définitivement|permanently closed/i.test(closedText);

  return {
    Businessname:    await get(SEL.name),
    Googlemapsscore: await get(SEL.score),
    ReviewCount:     await get(SEL.reviews),
    Phonenumber:     await get(SEL.phone),
    Website: await page.locator(SEL.website).first()
      .getAttribute('href', { timeout: 4000 }).catch(() => '') ?? '',
    IsClosed: isClosed,
    ...socialLinks
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Navigates to Google Maps, types the search query letter by letter,
 * scrolls to load enough results, then extracts lead data from each card.
 *
 * @param {import('playwright').Page} page
 * @param {string} area
 * @param {string} query
 * @param {object} [options]
 * @param {Function} [options.onLeadFound]
 * @param {Function} [options.onLog]
 * @param {Function} [options.onStatusUpdate]
 * @param {Function} [options.isCancelled]
 * @returns {Promise<Array>} Array of raw lead objects
 */
export async function scrapeMaps(page, area, query, options = {}) {
  const { targetCount } = Config;
  const searchTerm = `${query} ${area}`;
  const log = options.onLog || console.log;

  log(`🗺️ Navigation vers Google Maps pour "${searchTerm}"...`);
  await page.goto('https://www.google.com/maps', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  // ── Detect and handle Google's consent wall ──────────────────────────────
  await sleep(1500);
  const currentUrl = page.url();

  if (currentUrl.includes('consent.google.com')) {
    log('🍪 Consentement Google détecté, validation...');
    try {
      const acceptBtn = page.locator('button').filter({ hasText: /accept|accepter|tout/i });
      await acceptBtn.first().click({ timeout: 10000 });
      await page.waitForURL('**/maps**', { timeout: 20000 });
      log('✅ Consentement validé.');
    } catch (err) {
      console.error('❌ Échec clic consentement:', err.message);
    }
  } else if (currentUrl.includes('google.com/maps')) {
    const modalBtn = await page.locator('button').filter({ hasText: /accept|accepter/i })
      .first().isVisible({ timeout: 2000 }).catch(() => false);
    if (modalBtn) {
      await page.locator('button').filter({ hasText: /accept|accepter/i }).first().click().catch(() => {});
    }
  }

  if (options.isCancelled?.()) return [];

  // ── Wait for the search box ──────────────────────────────────
  options.onStatusUpdate?.({ currentLead: `Initialisation de la recherche : ${searchTerm}...` });
  await page.waitForSelector(SEL.searchBox, { timeout: 30000 });

  // ── Type the search query ───────────────────────────────────
  log(`⌨️ Recherche : "${searchTerm}"`);
  await page.click(SEL.searchBox);
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await sleep(200);

  await humanType(page, SEL.searchBox, searchTerm);
  await sleep(300);
  await page.keyboard.press('Enter');

  if (options.isCancelled?.()) return [];

  // ── Wait for the results feed ─────────────────────────────────────────────
  await page.waitForSelector(SEL.feed, { timeout: 30000 });
  await sleep(1500);

  // ── Scroll until we have enough cards (or end of list) ────────────────────
  await scrollUntilLoaded(page, targetCount, options);

  if (options.isCancelled?.()) return [];

  // ── Collect ALL card URLs in one shot BEFORE clicking anything ───────────
  const cardUrls = await page.$$eval(
    `${SEL.card} a[href*="/maps/place/"], div[role="feed"] a[href*="/maps/place/"]`,
    (anchors) => [...new Set(anchors.map((a) => a.href))]
  ).catch(() => []);

  const toVisit = cardUrls.slice(0, targetCount);
  log(`🗂️ [${area}] ${toVisit.length} fiches réelles trouvées — Lancement de l'extraction détaillée...`);

  // ── Navigate to each card URL directly ───────────────────────────────────
  const leads = [];

  for (let i = 0; i < toVisit.length; i++) {
    if (options.isCancelled?.()) {
      log('🛑 Arrêt demandé pendant l\'extraction.');
      break;
    }

    const url = toVisit[i];
    options.onStatusUpdate?.({
      currentLead: `Extraction fiche ${i + 1}/${toVisit.length} : ${area}...`,
    });

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
      const lead = await extractFromPanel(page);

      if (lead.IsClosed) {
        log(`   ⏩ [${i + 1}/${toVisit.length}] ${lead.Businessname || 'Commerce'} — Fermé définitivement (Ignoré)`);
        continue;
      }

      leads.push(lead);

      // ── STREAM IN REAL-TIME TO RUNNER! ──────────────────────────────────
      if (options.onLeadFound) {
        const shouldStop = await options.onLeadFound(lead, i + 1, toVisit.length);
        if (shouldStop) {
          log(`🎯 Objectif atteint pour cette zone.`);
          break;
        }
      }
    } catch (err) {
      log(`   ⚠️ Erreur extraction fiche ${i + 1}: ${err.message}`);
    }

    if (options.isCancelled?.()) break;

    await sleep(600);
  }

  log(`🏁 [${area}] Extraction terminée : ${leads.length} fiches analysées.`);
  return leads;
}
