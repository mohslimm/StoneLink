// ============================================================
// Src/Services/OuedknissScraper.js — Direct Extraction
// ============================================================

import { sleep, randomDelay, randomSleep } from '../Utils/Delay.js';
import { clean }         from '../Utils/Formatter.js';
import Config             from '../Config/Config.js';

/**
 * Searches Ouedkniss directly and extracts phone numbers.
 */
export async function scrapeOuedknissDirect(page) {
    const searchTerm = `${Config.searchQuery} ${Config.searchArea}`.replace('in ', '').trim();
    const url = `https://www.ouedkniss.com/recherche?q=${encodeURIComponent(searchTerm)}`;
    
    console.log(`🚀  Directly searching Ouedkniss: "${searchTerm}"`);
    
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await sleep(3000);

    // Collect ad links from the results page
    // Ouedkniss uses Nuxt/Vue, links are usually inside a specific card structure
    const adLinks = await page.$$eval('a', (anchors) => {
        return anchors
            .map(a => a.href)
            .filter(href => href.includes('ouedkniss.com/') && (href.includes('/details') || /\d+$/.test(href)))
            .slice(0, 20); // Limit to first 20 for safety
    });

    const uniqueLinks = [...new Set(adLinks)];
    console.log(`✅  Found ${uniqueLinks.length} potential ads.`);

    const leads = [];

    for (let i = 0; i < uniqueLinks.length; i++) {
        const adUrl = uniqueLinks[i];
        console.log(`📍  [${i + 1}/${uniqueLinks.length}] Checking ad...`);
        
        try {
            await page.goto(adUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
            await sleep(3000);

            const title = await page.locator('h1').first().innerText().catch(() => 'Ouedkniss Ad');
            
            // Try to find the "Show number" button
            // Ouedkniss uses different classes, so we look for text
            const phoneBtn = page.locator('button, a').filter({ hasText: /appeler|téléphone|voir le numéro|show number/i }).first();
            
            let phone = '';
            if (await phoneBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
                await phoneBtn.click();
                await sleep(2000);
                
                // Extract number from the page
                phone = await page.evaluate(() => {
                    const text = document.body.innerText;
                    const match = text.match(/(05|06|07)\d{8}|(05|06|07)\s\d{2}\s\d{2}/);
                    return match ? match[0].replace(/\s/g, '') : '';
                });
            }

            if (phone) {
                leads.push({
                    Businessname: title.trim(),
                    Phonenumber: phone,
                    Website: adUrl,
                    Googlemapsscore: 'Ouedkniss Ad',
                    Source: 'Ouedkniss'
                });
                console.log(`   ✔ Found: ${phone}`);
            } else {
                console.warn(`   ❌ No phone number found on this ad.`);
            }

        } catch (err) {
            console.warn(`   ⚠️  Error: ${err.message}`);
        }

        await randomSleep(Config.delays.betweenLeads);
    }

    return leads;
}
