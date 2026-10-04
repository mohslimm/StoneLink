// ============================================================
// src/services/crawler/Runner.js — Unified Lead Scraper
// Stepping Stones Agency — StoneLink & Bot-Se Merger
// ============================================================

import { launchBrowser } from './Core/Browser.js';
import { scrapeMaps } from './Services/MapsScraper.js';
import { enrichWebsite } from './Services/WebEnricher.js';
import { scrapeLinkedInOwner } from './Services/LinkedInOwnerScraper.js';
import { writeCsv } from './Database/CsvWriter.js';
import Config from './Config/Config.js';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { execSync } from 'child_process';

// Parse command line arguments
const args = process.argv.slice(2);
function getArg(flag, fallback) {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : fallback;
}

const customQuery = getArg('--query', null);
const customArea = getArg('--area', null);
const customCount = getArg('--count', null);
const isHeaded = args.includes('--headed');
const isHeadless = args.includes('--headless');
const onlyNoWebsite = args.includes('--only-no-website');
const testMode = args.includes('--test-mode');

if (customQuery) Config.searchQueries = customQuery.split(',').map(s => s.trim()).filter(Boolean);
if (customArea) Config.searchAreas = customArea.split(',').map(s => s.trim()).filter(Boolean);
if (testMode) {
  Config.targetCount = 3;
  Config.testMode = true;
} else if (customCount) {
  Config.targetCount = parseInt(customCount, 10);
}

if (!Config.browser) Config.browser = {};
if (isHeaded) {
  Config.openBrowser = true;
  Config.browser.headless = false;
}
if (isHeadless) {
  Config.openBrowser = false;
  Config.browser.headless = true;
}
Config.onlyNoWebsite = onlyNoWebsite;

const dataDir = path.join(process.cwd(), 'data');
const archiveDir = path.join(dataDir, 'archive');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(archiveDir)) fs.mkdirSync(archiveDir, { recursive: true });

const statusFilePath = path.join(dataDir, 'crawler_status.json');
const latestResultsPath = path.join(dataDir, 'latest_scrape_results.json');
const stopSignalPath = path.join(dataDir, 'crawler_stop_signal');

// Clean up any stale stop signal before starting
if (fs.existsSync(stopSignalPath)) {
  try { fs.unlinkSync(stopSignalPath); } catch (e) {}
}

const numQueries = Config.searchQueries.length;
const numAreas = Config.searchAreas.length;
const totalCombinations = numQueries * numAreas;
const totalTarget = totalCombinations * Config.targetCount;

const logs = [];
function addLog(msg) {
  const time = new Date().toLocaleTimeString('fr-FR');
  const line = `[${time}] ${msg}`;
  console.log(line);
  logs.push(line);
  if (logs.length > 50) logs.shift();
}

function writeStatus(patch = {}) {
  try {
    let current = {};
    if (fs.existsSync(statusFilePath)) {
      try { current = JSON.parse(fs.readFileSync(statusFilePath, 'utf8')); } catch (e) {}
    }
    const updated = {
      ...current,
      pid: process.pid,
      query: Config.searchQueries.join(', '),
      area: Config.searchAreas.join(', '),
      targetCount: totalTarget,
      openBrowser: Config.openBrowser,
      testMode: Config.testMode,
      onlyNoWebsite: Config.onlyNoWebsite,
      lastUpdate: new Date().toISOString(),
      logs: logs.slice(-25),
      ...patch,
    };
    if (patch.status === 'running') {
      delete updated.errorMessage;
      delete updated.endedAt;
    }
    fs.writeFileSync(statusFilePath, JSON.stringify(updated, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing crawler status:', err.message);
  }
}

function writeResults(leads, status = 'running') {
  try {
    const data = {
      status,
      timestamp: new Date().toISOString(),
      query: Config.searchQueries.join(', '),
      area: Config.searchAreas.join(', '),
      total: leads.length,
      leads: leads,
    };
    fs.writeFileSync(latestResultsPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing latest results:', err.message);
  }
}

let newlyScrapedLeads = [];
let browserInstance = null;
let isStopping = false;

async function saveAndSync(reason = 'completed') {
  if (isStopping) return;
  isStopping = true;

  addLog(`💾 Sauvegarde et synchronisation (${reason}) — ${newlyScrapedLeads.length} leads récoltés...`);

  // 1. Write archive CSV if any leads
  if (newlyScrapedLeads.length > 0) {
    try {
      const csvFileName = `run_${Date.now()}.csv`;
      const csvPath = path.join(archiveDir, csvFileName);
      await writeCsv(newlyScrapedLeads, csvPath);
      addLog(`📁 Archive CSV sauvegardée : ${csvFileName}`);
    } catch (e) {
      addLog(`⚠️ Erreur CSV : ${e.message}`);
    }
  }

  // 2. Merge into all_leads.json (SKIP in Test Mode to keep CRM clean!)
  if (Config.testMode) {
    addLog(`🧪 [Mode Test Actif] Les ${newlyScrapedLeads.length} leads de validation ne sont PAS injectés dans le CRM (Mode Bac à Sable).`);
  } else {
    const allLeadsPath = path.join(dataDir, 'all_leads.json');
    let existingLeads = [];
    if (fs.existsSync(allLeadsPath)) {
      try {
        existingLeads = JSON.parse(fs.readFileSync(allLeadsPath, 'utf8'));
      } catch (e) {
        existingLeads = [];
      }
    }

    let addedCount = 0;
    for (const n of newlyScrapedLeads) {
      const isDuplicate = existingLeads.some(e =>
        (n.Website && e.Website && n.Website === e.Website) ||
        (n.Businessname && e.Businessname && n.Businessname.toLowerCase() === e.Businessname.toLowerCase() && n.Wilaya === e.Wilaya)
      );
      if (!isDuplicate) {
        existingLeads.unshift(n);
        addedCount++;
      }
    }

    fs.writeFileSync(allLeadsPath, JSON.stringify(existingLeads, null, 2), 'utf8');
    addLog(`⚡ ${addedCount} nouveaux leads fusionnés dans la base (${existingLeads.length} au total).`);

    // 3. Trigger sync_atlas to inject directly into MongoDB Atlas and update local fallback
    try {
      addLog(`🔄 Synchronisation directe vers MongoDB Atlas...`);
      execSync('node scripts/sync_atlas.js', { stdio: 'ignore' });
      execSync('node scripts/seed_and_migrate.js', { stdio: 'ignore' });
      addLog(`✅ Prospects synchronisés dans MongoDB Atlas avec succès !`);
    } catch (err) {
      addLog(`⚠️ Synchronisation Atlas : ${err.message}`);
    }
  }

  // 4. Update status & results files
  writeStatus({
    status: reason,
    currentCount: newlyScrapedLeads.length,
    currentLead: reason === 'stopped' ? 'Scan annulé par l’utilisateur' : 'Scan terminé avec succès',
    endedAt: new Date().toISOString(),
  });
  writeResults(newlyScrapedLeads, reason);

  // 5. Close browser
  if (browserInstance) {
    try {
      await browserInstance.close();
      addLog('🔒 Navigateur fermé.');
    } catch (e) {}
  }

  // Remove stop signal if present
  if (fs.existsSync(stopSignalPath)) {
    try { fs.unlinkSync(stopSignalPath); } catch (e) {}
  }

  addLog(`🏁 Fin du processus (Statut: ${reason}).`);
  process.exit(0);
}

// Handle signals
process.on('SIGINT', () => saveAndSync('stopped'));
process.on('SIGTERM', () => saveAndSync('stopped'));

async function run() {
  addLog('╔══════════════════════════════════════════════════════════════╗');
  addLog('║   StoneLink Sovereign Scraper Engine (Powered by Bot-Se)     ║');
  addLog('╚══════════════════════════════════════════════════════════════╝');
  addLog(`🔍 Queries : ${Config.searchQueries.join(' | ')}`);
  addLog(`📍 Areas   : ${Config.searchAreas.join(' | ')}`);
  addLog(`🎯 Target  : ${Config.targetCount} par zone (${totalTarget} au total)`);
  addLog(`👁️ Browser : ${Config.openBrowser ? 'Visible (Headed)' : 'Furtif (Headless)'}`);

  writeStatus({
    status: 'running',
    startedAt: new Date().toISOString(),
    currentCount: 0,
    targetCount: totalTarget,
    currentCombination: 'Initialisation Playwright...',
    currentLead: 'Préparation du moteur...',
  });
  writeResults([], 'running');

  try {
    const { browser: b, context, page } = await launchBrowser();
    browserInstance = b;

    let comboCount = 0;

    for (const query of Config.searchQueries) {
      for (const area of Config.searchAreas) {
        // Check for cancellation before starting an area
        if (fs.existsSync(stopSignalPath)) {
          addLog('🛑 Signal d’arrêt détecté ! Interruption immédiate du scraping...');
          await saveAndSync('stopped');
          return;
        }

        comboCount++;
        const comboLabel = `${query} — ${area} (${comboCount}/${totalCombinations})`;
        addLog(`📡 Scanning [${query}] à : ${area}...`);

        writeStatus({
          currentCombination: comboLabel,
          currentLead: `Recherche Google Maps pour ${query} à ${area}...`,
        });

        let areaQuotaReached = false;

        await scrapeMaps(page, area, query, {
          onLog: (msg) => addLog(msg),
          onStatusUpdate: (patch) => writeStatus(patch),
          isCancelled: () => fs.existsSync(stopSignalPath),
          onLeadFound: async (lead, cardIndex, totalCardsInArea) => {
            if (fs.existsSync(stopSignalPath)) return true;

            const leadTitle = lead.Businessname || lead.Website || 'Commerce inconnu';
            const hasWebsite = !!lead.Website && lead.Website.trim() !== '' && !lead.Website.toLowerCase().includes('pas de site') && lead.Website.length > 3;

            // 1. Filter: Only no website
            if (Config.onlyNoWebsite && hasWebsite) {
              addLog(`   ⏩ [${cardIndex}/${totalCardsInArea}] ${leadTitle} a déjà un site (${lead.Website}) — Ignoré ('Sans site uniquement' actif).`);
              writeStatus({
                currentLead: `Ignoré (a un site) : ${leadTitle}`,
              });
              return false;
            }

            // 2. Web enrichment (if website exists)
            let extra = {};
            if (lead.Website && hasWebsite) {
              try {
                extra = await enrichWebsite(context, lead.Website);
              } catch (e) {}
            }

            // 3. LinkedIn owner (for non-Algerian targets)
            const ALGERIAN_WILAYAS = [
              'alger', 'oran', 'annaba', 'bejaia', 'constantine', 'blida', 'setif', 
              'tizi ouzou', 'tlemcen', 'batna', 'biskra', 'boumerdes', 'tipaza', 
              'chlef', 'mostaganem', 'skikda', 'sidi bel abbes', 'jijel', 'medea',
              'tiaret', 'ouargla', 'tebessa', 'el oued', 'bordj bou arreridj'
            ];
            const isAlgerian = ALGERIAN_WILAYAS.some(w => area.toLowerCase().includes(w));
            let ownerInfo = { OwnerName: '', OwnerLinkedIn: '' };
            if (!isAlgerian && lead.Businessname) {
              try {
                ownerInfo = await scrapeLinkedInOwner(context, lead.Businessname, area);
              } catch (e) {}
            }

            const campaignId = `${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${area.replace(/[^a-z0-9]/gi, '')}`;

            const mergedLead = {
              id: crypto.randomUUID(),
              ...lead,
              Wilaya: area,
              Niche: query,
              PipelineStage: 'New',
              Notes: '',
              ContactedAt: null,
              RespondedAt: null,
              DailyOutreachDate: null,
              CampaignID: campaignId,
              RunDate: new Date().toISOString(),
              Emailaddress: extra.Emailaddress || '',
              Instagramlink: extra.Instagramlink || lead.Instagramlink || '',
              Facebooklink: extra.Facebooklink || lead.Facebooklink || '',
              Linkedinlink: extra.Linkedinlink || lead.Linkedinlink || '',
              WhatsAppLink: extra.WhatsAppLink || lead.WhatsAppLink || '',
              TikToklink: extra.TikToklink || lead.TikToklink || '',
              WebsiteScore: extra.WebsiteScore !== undefined ? extra.WebsiteScore : (hasWebsite ? 5 : 0),
              Weaknesses: extra.Weaknesses || (!hasWebsite ? ['Pas de site internet professionnel'] : []),
              OwnerName: ownerInfo.OwnerName || '',
              OwnerLinkedIn: ownerInfo.OwnerLinkedIn || '',
            };

            // Deduplication within current run
            const isDuplicate = newlyScrapedLeads.some(e =>
              (mergedLead.Website && e.Website && mergedLead.Website === e.Website) ||
              (mergedLead.Businessname && e.Businessname && mergedLead.Businessname.toLowerCase() === e.Businessname.toLowerCase() && mergedLead.Wilaya === e.Wilaya)
            );

            if (isDuplicate) {
              addLog(`   ⏩ [Doublon] ${leadTitle} déjà enregistré dans ce scan.`);
              return false;
            }

            newlyScrapedLeads.push(mergedLead);

            // Live progressive feedback in logs
            const siteBadge = hasWebsite ? `🌐 ${mergedLead.Website}` : `🚫 Sans site internet`;
            const phoneBadge = mergedLead.Phonenumber ? `📞 ${mergedLead.Phonenumber}` : `⚠️ Sans tél`;
            addLog(`✔ [${area}] ${mergedLead.Businessname || 'Entreprise'} — ${phoneBadge} — ${siteBadge} (${newlyScrapedLeads.length}/${totalTarget})`);

            // Live updates to status & results files (Streaming in Real-Time to UI!)
            writeStatus({
              currentCount: newlyScrapedLeads.length,
              currentLead: `${mergedLead.Businessname} (${area})`,
            });
            writeResults(newlyScrapedLeads, 'running');

            // Incremental disk safety persistence into all_leads.json
            if (!Config.testMode) {
              try {
                const allLeadsPath = path.join(dataDir, 'all_leads.json');
                let existingLeads = [];
                if (fs.existsSync(allLeadsPath)) {
                  try { existingLeads = JSON.parse(fs.readFileSync(allLeadsPath, 'utf8')); } catch (e) { existingLeads = []; }
                }
                const exists = existingLeads.some(e =>
                  (mergedLead.Website && e.Website && mergedLead.Website === e.Website) ||
                  (mergedLead.Businessname && e.Businessname && mergedLead.Businessname.toLowerCase() === e.Businessname.toLowerCase() && mergedLead.Wilaya === e.Wilaya)
                );
                if (!exists) {
                  existingLeads.unshift(mergedLead);
                  fs.writeFileSync(allLeadsPath, JSON.stringify(existingLeads, null, 2), 'utf8');
                }
              } catch (e) {}
            }

            // Test mode check
            if (Config.testMode && newlyScrapedLeads.length >= 3) {
              addLog(`   🧪 [Mode Test] Quota de 3 prospects atteint pour la validation.`);
              areaQuotaReached = true;
              return true;
            }

            return false;
          }
        });

        // Check if stopped during area
        if (fs.existsSync(stopSignalPath)) {
          addLog('🛑 Signal d’arrêt détecté ! Interruption immédiate du scraping...');
          await saveAndSync('stopped');
          return;
        }

        if (Config.testMode && (areaQuotaReached || newlyScrapedLeads.length >= 3)) {
          break;
        }
      }

      if (Config.testMode && newlyScrapedLeads.length >= 3) {
        break;
      }
    }

    addLog(`\n🎉 Scan terminé avec succès ! ${newlyScrapedLeads.length} prospects qualifiés.`);
    await saveAndSync('completed');

  } catch (error) {
    addLog(`❌ Erreur fatale : ${error.message}`);
    writeStatus({
      status: 'error',
      errorMessage: error.message,
    });
    await saveAndSync('error');
  }
}

run();
