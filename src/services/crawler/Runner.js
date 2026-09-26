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

if (customQuery) Config.searchQueries = customQuery.split(',').map(s => s.trim()).filter(Boolean);
if (customArea) Config.searchAreas = customArea.split(',').map(s => s.trim()).filter(Boolean);
if (customCount) Config.targetCount = parseInt(customCount, 10);
if (isHeaded) Config.openBrowser = true;
if (isHeadless) Config.openBrowser = false;

const archiveDir = path.join(process.cwd(), 'data', 'archive');
if (!fs.existsSync(archiveDir)) fs.mkdirSync(archiveDir, { recursive: true });

async function run() {
  const numQueries = Config.searchQueries.length;
  const numAreas = Config.searchAreas.length;
  const totalCombinations = numQueries * numAreas;

  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║   StoneLink Sovereign Scraper Engine (Powered by Bot-Se)     ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  console.log(`🔍  Queries : ${Config.searchQueries.join(' | ')}`);
  console.log(`📍  Areas   : ${Config.searchAreas.join(' | ')}`);
  console.log(`🎯  Target  : ${Config.targetCount} per combination`);
  console.log(`👁️  Browser : ${Config.openBrowser ? 'Visible (Headed)' : 'Headless'}\n`);

  let browser;

  try {
    const { browser: b, context, page } = await launchBrowser();
    browser = b;

    let newlyScrapedLeads = [];

    for (const query of Config.searchQueries) {
      for (const area of Config.searchAreas) {
        console.log(`📡  Scanning [${query}] in: ${area}...`);
        const rawLeads = await scrapeMaps(page, area, query);
        console.log(`🌐  Enriching ${rawLeads.length} leads with website data...\n`);

        for (let i = 0; i < rawLeads.length; i++) {
          const lead = rawLeads[i];
          console.log(`   [${i + 1}/${rawLeads.length}] Checking: ${lead.Businessname || lead.Website || 'Lead'}`);

          let extra = {};
          if (lead.Website) {
            extra = await enrichWebsite(context, lead.Website);
          }

          const ALGERIAN_WILAYAS = ['alger', 'oran', 'annaba', 'bejaia', 'constantine', 'blida', 'setif', 'tizi ouzou'];
          const isAlgerian = ALGERIAN_WILAYAS.some(w => area.toLowerCase().includes(w));

          let ownerInfo = { OwnerName: '', OwnerLinkedIn: '' };
          if (!isAlgerian && lead.Businessname) {
            ownerInfo = await scrapeLinkedInOwner(context, lead.Businessname, area);
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
            Instagramlink: extra.Instagramlink || '',
            Facebooklink: extra.Facebooklink || '',
            Linkedinlink: extra.Linkedinlink || '',
            WhatsAppLink: extra.WhatsAppLink || '',
            TikToklink: extra.TikToklink || '',
            WebsiteScore: extra.WebsiteScore !== undefined ? extra.WebsiteScore : 5,
            Weaknesses: extra.Weaknesses || [],
            OwnerName: ownerInfo.OwnerName || '',
            OwnerLinkedIn: ownerInfo.OwnerLinkedIn || '',
          };

          newlyScrapedLeads.push(mergedLead);
        }
      }
    }

    console.log(`\n🎉 Scan terminé ! ${newlyScrapedLeads.length} nouveaux leads récoltés.`);

    // 1. Save CSV to archive
    const csvFileName = `run_${Date.now()}.csv`;
    const csvPath = path.join(archiveDir, csvFileName);
    await writeCsv(newlyScrapedLeads, csvPath);
    console.log(`📁 Archive CSV sauvegardée dans : ${csvPath}`);

    // 2. Merge into StoneLink data/all_leads.json
    const allLeadsPath = path.join(process.cwd(), 'data', 'all_leads.json');
    let existingLeads = [];
    if (fs.existsSync(allLeadsPath)) {
      try {
        existingLeads = JSON.parse(fs.readFileSync(allLeadsPath, 'utf8'));
      } catch (e) {
        existingLeads = [];
      }
    }

    // Deduplicate by Website or Businessname + Wilaya
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
    console.log(`⚡ ${addedCount} nouveaux leads fusionnés dans data/all_leads.json (Total en base locale: ${existingLeads.length})`);

    // 3. Trigger seed_and_migrate to update prospects.ts in real-time
    try {
      console.log(`🔄 Mise à jour du CRM StoneLink...`);
      execSync('node scripts/seed_and_migrate.js', { stdio: 'inherit' });
    } catch (err) {
      console.warn(`Erreur lors de la mise à jour des prospects:`, err.message);
    }

    // 4. Try Atlas sync in background if available
    try {
      execSync('node scripts/sync_atlas.js', { stdio: 'inherit' });
    } catch (e) {}

  } catch (error) {
    console.error('❌ Erreur lors du scraping :', error);
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔒 Navigateur fermé.');
    }
  }
}

run();
