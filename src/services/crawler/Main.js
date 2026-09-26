// ============================================================
// Src/Main.js — Orchestrator
// ============================================================

import { launchBrowser }  from './Core/Browser.js';
import { scrapeMaps }     from './Services/MapsScraper.js';
import { enrichWebsite }  from './Services/WebEnricher.js';
import { scrapeLinkedInOwner } from './Services/LinkedInOwnerScraper.js';
import { writeCsv }       from './Database/CsvWriter.js';
import Config             from './Config/Config.js';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

async function main() {
  const numQueries = Config.searchQueries.length;
  const numAreas = Config.searchAreas.length;
  const totalCombinations = numQueries * numAreas;

  console.log('╔══════════════════════════════════════════════╗');
  console.log('║   Google Maps Lead Generation Bot            ║');
  console.log('╚══════════════════════════════════════════════╝\n');
  console.log(`🔍  Queries : ${Config.searchQueries.join(' | ')}`);
  console.log(`📍  Areas   : ${Config.searchAreas.join(' | ')}`);
  console.log(`🎯  Target  : ${Config.targetCount} per area`);
  console.log(`👁️  Browser : ${Config.openBrowser ? 'Visible' : 'Headless'}`);
  console.log(`🧪  Test    : ${Config.testMode ? 'ON (3 results)' : 'OFF'}\n`);
  console.log(`🚀  Starting run: ${numQueries} queries × ${numAreas} areas = ${totalCombinations} search combinations\n`);

  let browser;

  try {
    // ── 1. Launch browser ──────────────────────────────────────────────────
    const { browser: b, context, page } = await launchBrowser();
    browser = b;

    let allLeads = [];

    for (const query of Config.searchQueries) {
      for (const area of Config.searchAreas) {
        console.log(`📡  Scanning [${query}] in Area: ${area}...`);
        
        // ── 2. Scrape Google Maps ──────────────────────────────────────────────
        const rawLeads = await scrapeMaps(page, area, query);

        // ── 3. Enrich each lead with website data ──────────────────────────────
        console.log(`🌐  Starting website enrichment for [${query}] in ${area}…\n`);
      
      for (let i = 0; i < rawLeads.length; i++) {
        const lead = rawLeads[i];
        console.log(`🔗  [${i + 1}/${rawLeads.length}] ${lead.Website || '(no website)'}`);

        if (Config.onlyNoWebsite && lead.Website) {
          console.log(`⏩  [Skipped] 'No Website Only' mode is active, skipping business with website.`);
          continue;
        }

        const extra = await enrichWebsite(context, lead.Website);
        
        // Skip LinkedIn owner search for Algerian cities to save time and avoid blocks
        const ALGERIAN_WILAYAS = [
          'alger', 'oran', 'annaba', 'béjaia', 'bejaia', 'constantine', 'blida', 'setif', 
          'tizi ouzou', 'batna', 'chlef', 'tlemcen', 'skikda', 'tiaret', 'tebessa', 
          'jijel', 'biskra', 'mascara', 'ouargla', 'boumerdes', 'tipaza', 'djelfa',
          'sidi bel abbes', 'guelma', 'bordj', 'bouira', 'mila', 'ain defla', 'relizane'
        ];
        const isAlgerian = ALGERIAN_WILAYAS.some(w => area.toLowerCase().includes(w));
        
        let ownerInfo = { OwnerName: '', OwnerLinkedIn: '' };
        
        const disableLinkedInSearch = false; // Turned on per user request
        
        if (disableLinkedInSearch || isAlgerian) {
          console.log(`💼  [Skipped] LinkedIn owner search bypassed globally for this run.`);
        } else {
          ownerInfo = await scrapeLinkedInOwner(context, lead.Businessname, area);
        }
        
        const mergedLead = { 
          id: crypto.randomUUID(),
          ...lead, 
          Wilaya: area, 
          Niche: query,
          PipelineStage: 'New',
          Notes: '',
          ContactedAt: null,
          RespondedAt: null,
          DailyOutreachDate: null
        };
        if (extra.Emailaddress)  mergedLead.Emailaddress = extra.Emailaddress;
        if (extra.Instagramlink) mergedLead.Instagramlink = extra.Instagramlink;
        if (extra.Facebooklink)  mergedLead.Facebooklink = extra.Facebooklink;
        if (extra.Linkedinlink)  mergedLead.Linkedinlink = extra.Linkedinlink;
        if (extra.WhatsAppLink)  mergedLead.WhatsAppLink = extra.WhatsAppLink;
        if (extra.TikToklink)    mergedLead.TikToklink    = extra.TikToklink;
        if (extra.WebsiteScore !== undefined) mergedLead.WebsiteScore = extra.WebsiteScore;
        if (extra.Weaknesses !== undefined)   mergedLead.Weaknesses   = extra.Weaknesses;
        
        mergedLead.OwnerName = ownerInfo.OwnerName;
        mergedLead.OwnerLinkedIn = ownerInfo.OwnerLinkedIn;

        allLeads.push(mergedLead);
      }
    }
    }

    const enrichedLeads = allLeads;

    // ── 4. Deduplicate by Businessname + Phonenumber ──────────────────────
    const seen = new Set();
    const uniqueLeads = enrichedLeads.filter((lead) => {
      const key = `${lead.Businessname}|${lead.Phonenumber}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const removed = enrichedLeads.length - uniqueLeads.length;
    if (removed > 0) console.log(`🧹  Removed ${removed} duplicate(s) — ${uniqueLeads.length} unique leads.\n`);

    // ── 5. Sort by Rating (High to Low) ──────────────────────────────────────
    console.log('📊  Sorting leads by rating…');
    uniqueLeads.sort((a, b) => {
      const scoreA = parseFloat((a.Googlemapsscore || '0').replace(',', '.'));
      const scoreB = parseFloat((b.Googlemapsscore || '0').replace(',', '.'));
      return scoreB - scoreA;
    });

    // ── 6. Save to CSV ──────────────────────────────────────────────────────
    await writeCsv(uniqueLeads);

    // ── 7. Update Master JSON Database for React Dashboard ───────────────────
    if (Config.testMode) {
      console.log('🧪  Test Mode is ON — Skipping React DB update to prevent test data on dashboard.');
    } else {
      const dbPath = path.join(process.cwd(), 'Dashboard', 'src', 'assets', 'all_leads.json');
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

      let existingLeads = [];
      if (fs.existsSync(dbPath)) {
        try {
          existingLeads = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
          
          // Backfill UUID and CRM fields for existing leads
          existingLeads = existingLeads.map(l => ({
            id: l.id || crypto.randomUUID(),
            PipelineStage: l.PipelineStage || 'New',
            Notes: l.Notes || '',
            ContactedAt: l.ContactedAt || null,
            RespondedAt: l.RespondedAt || null,
            DailyOutreachDate: l.DailyOutreachDate || null,
            ...l, // Spread l after to keep existing values for these fields if they exist
          }));
        } catch (e) {
          console.warn('⚠️  Could not parse existing all_leads.json. Starting fresh.');
        }
      }

      // Add run date and CampaignID to distinguish campaigns
      const runDate = new Date().toISOString();
      const datePrefix = runDate.slice(0, 10).replace(/-/g, ''); // YYYYMMDD
      uniqueLeads.forEach(l => {
        l.RunDate = runDate;
        l.CampaignID = `${datePrefix}-${l.Wilaya.replace(/\s+/g, '')}`;
      });

      const masterLeads = [...existingLeads, ...uniqueLeads];
      fs.writeFileSync(dbPath, JSON.stringify(masterLeads, null, 2));
      console.log(`🔥  React DB updated → Dashboard/src/assets/all_leads.json`);
    }

    console.log(`✅  Done! Results → Output/${Config.outputFile}`);
    console.log(`🚀  Run 'cd Dashboard && npm run dev' to view the Command Center!`);
    console.log('═══════════════════════════════════════════════\n');

  } catch (err) {
    console.error('❌  Fatal error:', err.message);
    console.error(err.stack);
  } finally {
    if (browser) await browser.close();
  }
}

main();
