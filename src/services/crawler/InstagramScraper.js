// ============================================================
// Src/Services/InstagramScraper.js — The "X-Ray" Method
// ============================================================

import { sleep, randomDelay, randomSleep } from '../Utils/Delay.js';
import { clean }         from '../Utils/Formatter.js';
import Config             from '../Config/Config.js';

const SEL = {
    results: 'div.g, div[data-hveid]', // More generic for Google results
    title: 'h3',
    link: 'a',
    snippet: 'div[style*="-webkit-line-clamp"]', // Often where the snippet lives now
};

/**
 * Uses Google to find Instagram profiles with contact info.
 * This avoids Instagram's aggressive bot detection.
 */
export async function scrapeInstagramViaGoogle(page) {
    const query = `site:instagram.com "${Config.searchQuery}" "${Config.searchArea}" ("05" OR "06" OR "07")`;
    
    console.log(`🔍  Launching Instagram X-Ray Search: "${query}"`);
    
    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`, {
        waitUntil: 'domcontentloaded',
    });

    // ── Better Consent Wall Handling ──────────────────────────────────────────
    await sleep(2000);
    const consentBtn = page.locator('button').filter({ hasText: /accept|accepter|tout|agree/i });
    if (await consentBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log('🍪  Bypassing Google consent wall...');
        await consentBtn.first().click();
        await sleep(3000);
    }

    console.log('📡  Extracting profiles from Google results...');
    
    const leads = await page.$$eval(SEL.results, (els) => {
        return els.map(el => {
            const h3 = el.querySelector('h3');
            const anchor = el.querySelector('a');
            const snippetEl = el.querySelector('div[style*="-webkit-line-clamp"], .VwiC3b');
            
            if (!anchor || !anchor.href.includes('instagram.com')) return null;

            const title = h3?.innerText || '';
            const url = anchor.href;
            const snippet = snippetEl?.innerText || '';
            
            // Simplified phone regex for Algerian numbers in bios
            const phoneMatch = snippet.match(/(05|06|07)\d{8}/) || snippet.match(/(05|06|07)\s\d{2}\s\d{2}/);
            const phone = phoneMatch ? phoneMatch[0].replace(/\s/g, '') : '';

            // Clean title
            const username = title.split('(@')[1]?.split(')')[0] || '';
            const displayName = title.split('(@')[0].trim() || title;

            return {
                Businessname: displayName,
                Username: username,
                Phonenumber: phone,
                Instagramlink: url,
                BioSnippet: snippet
            };
        }).filter(l => l !== null);
    });

    console.log(`✅  Found ${leads.length} potential Instagram leads.`);
    return leads;
}
