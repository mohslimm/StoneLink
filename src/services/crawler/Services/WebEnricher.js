// ============================================================
// Src/Services/WebEnricher.js — Website deep-dive using Cheerio
// ============================================================

import * as cheerio  from 'cheerio';
import Config        from '../Config/Config.js';
import { sleep, randomDelay } from '../Utils/Delay.js';
import { normalizeUrl } from '../Utils/Formatter.js';

const EMPTY = {
  Emailaddress:  '',
  Instagramlink: '',
  Facebooklink:  '',
  Linkedinlink:  '',
  WhatsAppLink:  '',
  WebsiteScore:  0,
  Weaknesses:    [],
};

/**
 * Scrapes a website for email and social media links.
 *
 * @param {import('playwright').BrowserContext} context
 * @param {string} websiteUrl
 * @returns {Promise<{ Emailaddress, Instagramlink, Facebooklink, Linkedinlink, WhatsAppLink, WebsiteScore, Weaknesses }>}
 */
export async function enrichWebsite(context, websiteUrl) {
  if (!websiteUrl) return EMPTY;

  const url = normalizeUrl(websiteUrl);
  let page;

  try {
    page = await context.newPage();

    // Block heavy assets — speeds up enrichment and reduces fingerprint
    await page.route('**/*', (route) => {
      const type = route.request().resourceType();
      if (['image', 'media', 'font', 'stylesheet'].includes(type)) route.abort();
      else route.continue();
    });

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await sleep(randomDelay(Config.delays.pageLoad));

    // Fix 2: Scroll simulation to trigger lazy-loading
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)).catch(() => {});
    await sleep(1500);
    await page.evaluate(() => window.scrollTo(0, 0)).catch(() => {});
    await sleep(500);

    let html = await page.content();
    let fullHtml = html;

    // Fix 1: Multi-page crawling
    const $ = cheerio.load(html);
    const keywords = ["contact", "about", "services", "اتصل", "تواصل", "عن", "خدمات"];
    const targetUrls = [];

    $('a').each((_, el) => {
      const href = $(el).attr('href');
      if (!href || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#') || href.startsWith('javascript:')) return;
      
      const lowerHref = href.toLowerCase();
      const lowerText = $(el).text().toLowerCase();
      
      const matches = keywords.some(kw => lowerHref.includes(kw) || lowerText.includes(kw));
      if (matches) {
        try {
          const absoluteUrl = new URL(href, url).href;
          const urlObj = new URL(url);
          // Only crawl same domain and avoid revisiting homepage
          if (absoluteUrl.startsWith('http') && absoluteUrl.includes(urlObj.hostname) && !targetUrls.includes(absoluteUrl) && absoluteUrl !== url && absoluteUrl !== url + '/') {
            targetUrls.push(absoluteUrl);
          }
        } catch (e) {
          // Ignore invalid URLs
        }
      }
    });

    // Visit up to 2 extra pages
    const pagesToVisit = targetUrls.slice(0, 2);
    for (const nextUrl of pagesToVisit) {
      try {
        await page.goto(nextUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await sleep(randomDelay(Config.delays.pageLoad));
        
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)).catch(() => {});
        await sleep(1500);
        await page.evaluate(() => window.scrollTo(0, 0)).catch(() => {});
        await sleep(500);
        
        const nextHtml = await page.content();
        fullHtml += `\n<!-- PAGE: ${nextUrl} -->\n` + nextHtml;
      } catch (err) {
        // Silently skip failed secondary pages
      }
    }

    return parseContactsAndAudit(fullHtml, url);

  } catch (err) {
    console.warn(`  ⚠️  Enrichment failed for ${url}: ${err.message}`);
    return EMPTY;
  } finally {
    if (page && !page.isClosed()) await page.close();
  }
}

// ── HTML parsing & Auditing ──────────────────────────────────────────────────

function parseContactsAndAudit(html, url) {
  const $ = cheerio.load(html);

  let Emailaddress  = '';
  let Instagramlink = '';
  let Facebooklink  = '';
  let Linkedinlink  = '';
  let WhatsAppLink  = '';

  // Email extraction
  const EMAIL_REGEX = /[\w.+-]+@[\w-]+\.[a-zA-Z]{2,6}(?!\.(jpg|jpeg|png|gif|svg|webp|pdf|ico))/i;
  const INVALID_EXT = /\.(jpg|jpeg|png|gif|svg|webp|pdf|ico|bmp|tiff)$/i;

  $('a[href^="mailto:"]').each((_, el) => {
    if (Emailaddress) return;
    const raw = $(el).attr('href').replace('mailto:', '').split('?')[0].trim();
    if (raw.includes('@') && !INVALID_EXT.test(raw)) Emailaddress = raw;
  });

  if (!Emailaddress) {
    const match = $('body').text().match(EMAIL_REGEX);
    if (match && !INVALID_EXT.test(match[0])) Emailaddress = match[0];
  }

  // Social links extraction
  $('a[href]').each((_, el) => {
    const href = ($(el).attr('href') || '').toLowerCase();
    if (!Instagramlink && href.includes('instagram.com')) Instagramlink = normalizeUrl($(el).attr('href'));
    if (!Facebooklink  && href.includes('facebook.com'))  Facebooklink  = normalizeUrl($(el).attr('href'));
    if (!Linkedinlink  && href.includes('linkedin.com'))  Linkedinlink  = normalizeUrl($(el).attr('href'));
    if (!WhatsAppLink  && (href.includes('wa.me/') || href.includes('api.whatsapp.com/') || href.startsWith('whatsapp://'))) {
      WhatsAppLink = $(el).attr('href');
    }
  });

  // ── Website Audit ──
  let score = 10;
  let weaknesses = [];

  // Security Check
  if (!url.startsWith('https://')) {
    score -= 2;
    weaknesses.push('Missing SSL (Not Secure)');
  }

  // SEO Checks
  const title = $('title').text().trim();
  if (!title || title.length < 5) {
    score -= 1;
    weaknesses.push('Missing or bad Title Tag');
  }

  const metaDesc = $('meta[name="description"]').attr('content');
  if (!metaDesc || metaDesc.length < 20) {
    score -= 1;
    weaknesses.push('Missing Meta Description');
  }

  const h1 = $('h1').text().trim();
  if (!h1) {
    score -= 1;
    weaknesses.push('Missing H1 Heading');
  }

  // Accessibility / Image SEO
  let imagesWithoutAlt = 0;
  $('img').each((_, el) => {
    if (!$(el).attr('alt')) imagesWithoutAlt++;
  });
  if (imagesWithoutAlt > 3) {
    score -= 1;
    weaknesses.push('Images missing ALT text');
  }

  // Tech / UX Checks
  const viewport = $('meta[name="viewport"]').attr('content');
  if (!viewport) {
    score -= 2;
    weaknesses.push('Not mobile responsive (Missing Viewport)');
  }

  const favicon = $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href');
  if (!favicon) {
    score -= 1;
    weaknesses.push('Missing Favicon');
  }

  // No Analytics
  let hasAnalytics = false;
  $('script').each((_, el) => {
    const src = $(el).attr('src') || '';
    const inner = $(el).html() || '';
    if (/gtag|GTM-|fbq|pixel/i.test(src) || /gtag|GTM-|fbq|pixel/i.test(inner)) {
      hasAnalytics = true;
    }
  });
  if (!hasAnalytics) {
    score -= 1;
    weaknesses.push("No analytics installed — you can't track your visitors or measure ROI.");
  }
  
  // Missing OG Tags
  const ogTitle = $('meta[property="og:title"]').attr('content');
  if (!ogTitle) {
    score -= 1;
    weaknesses.push("Missing Open Graph tags — your site looks broken when shared on WhatsApp or Facebook.");
  }

  // No Contact Form
  const hasForm = $('form').length > 0;
  if (!hasForm) {
    score -= 1;
    weaknesses.push("No contact form — visitors have no easy way to request a quote online.");
  }

  // Missing Social Proof
  const bodyText = $('body').text().toLowerCase();
  const hasProof = /reviews|testimonials|clients|avis|تقييمات|عملاء/.test(bodyText);
  if (!hasProof) {
    score -= 1;
    weaknesses.push("No testimonials or reviews visible on the website.");
  }

  // Prevent negative score
  score = Math.max(0, score);

  return { 
    Emailaddress, 
    Instagramlink, 
    Facebooklink, 
    Linkedinlink,
    WhatsAppLink,
    WebsiteScore: score,
    Weaknesses: weaknesses
  };
}
