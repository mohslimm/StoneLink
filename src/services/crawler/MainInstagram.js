// ============================================================
// Src/MainInstagram.js — Orchestrator for Social Media
// ============================================================

import { launchBrowser }  from './Core/Browser.js';
import { scrapeInstagramViaGoogle } from './Services/InstagramScraper.js';
import { writeCsv }       from './Database/CsvWriter.js';
import { generateSalesDashboard } from './Services/SalesDashboard.js';
import Config             from './Config/Config.js';
import path from 'path';

async function main() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║   Instagram X-Ray Lead Gen Bot               ║');
  console.log('╚══════════════════════════════════════════════╝\n');
  
  let browser;

  try {
    const { browser: b, page } = await launchBrowser();
    browser = b;

    // 1. Scrape Instagram profiles via Google
    const leads = await scrapeInstagramViaGoogle(page);

    if (leads.length === 0) {
        console.warn('❌  No leads found. Try a different query in .env');
        return;
    }

    // 2. Save to CSV
    await writeCsv(leads);

    // 3. Generate Sales Dashboard
    const dashboardPath = path.join(Config.outputDir, 'Instagram-Dashboard.html');
    generateSalesDashboard(leads, dashboardPath);

    console.log(`\n✅  Done! Results → Output/Instagram-Dashboard.html`);
    console.log('═══════════════════════════════════════════════\n');

  } catch (err) {
    console.error('❌  Fatal error:', err.message);
  } finally {
    if (browser) await browser.close();
  }
}

main();
