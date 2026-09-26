// ============================================================
// Src/Services/LinkedInOwnerScraper.js — LinkedIn X-Ray
// ============================================================

import { sleep, randomSleep } from '../Utils/Delay.js';
import Config from '../Config/Config.js';

const SEL = {
    results: 'div.g, div[data-hveid]',
    title: 'h3',
    link: 'a',
    snippet: 'div[style*="-webkit-line-clamp"]',
};

/**
 * Uses Google to find LinkedIn profiles of business owners/CEOs.
 *
 * @param {import('playwright').BrowserContext} context
 * @param {string} businessName
 * @param {string} area
 * @returns {Promise<{ OwnerName: string, OwnerLinkedIn: string }>}
 */
export async function scrapeLinkedInOwner(context, businessName, area) {
    if (!businessName) return { OwnerName: '', OwnerLinkedIn: '' };

    const query = `("CEO" OR "Founder" OR "Co-founder" OR "CTO" OR "COO" OR "Owner" OR "Managing Director" OR "Partner" OR "President") "${businessName}" "${area}" site:linkedin.com/in/`;

    console.log(`💼  Searching LinkedIn Owner for: ${businessName}`);

    let page;
    try {
        page = await context.newPage();

        // Stealth: Large random delay before initiating the search
        await randomSleep({ min: 8000, max: 15000 });

        await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`, {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });

        // Stealth: Simulate a human reading the page before acting
        await randomSleep({ min: 2000, max: 5000 });

        // Handle Consent Wall
        const consentBtn = page.locator('button').filter({ hasText: /accept|accepter|tout|agree/i });
        if (await consentBtn.first().isVisible({ timeout: 3000 }).catch(() => false)) {
            // Stealth: Move mouse to button before clicking
            const box = await consentBtn.first().boundingBox();
            if (box) {
                await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 10 });
                await sleep(500);
            }
            await consentBtn.first().click();
            await randomSleep({ min: 2000, max: 4000 });
        }

        // Stealth: Randomly scroll down a bit like a real user browsing results
        await page.mouse.wheel(0, Math.floor(Math.random() * 500) + 200);
        await sleep(1000);

        const ownerData = await page.$$eval(SEL.results, (els) => {
            for (let el of els) {
                const h3 = el.querySelector('h3');
                const anchor = el.querySelector('a');

                if (!anchor || !anchor.href.includes('linkedin.com/in/')) continue;

                const title = h3?.innerText || '';
                const url = anchor.href;

                // LinkedIn titles on Google are usually like "John Doe - CEO - Business Name | LinkedIn"
                // Let's grab just the name before the first hyphen or pipe
                let name = title.split(' - ')[0].split(' | ')[0].trim();

                return {
                    OwnerName: name,
                    OwnerLinkedIn: url
                };
            }
            return { OwnerName: '', OwnerLinkedIn: '' }; // Fallback if no valid link found
        });

        return ownerData;

    } catch (err) {
        console.warn(`  ⚠️  LinkedIn Owner search failed for ${businessName}: ${err.message}`);
        return { OwnerName: '', OwnerLinkedIn: '' };
    } finally {
        if (page && !page.isClosed()) await page.close();
    }
}
