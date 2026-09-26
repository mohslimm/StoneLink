// ============================================================
// Src/GenerateDashboard.js
// ============================================================

import fs from 'fs';
import path from 'path';
import { generateSalesDashboard } from './Services/SalesDashboard.js';

const OUTPUT_DIR = 'Output';
const HTML_OUTPUT = 'Output/Sales-Dashboard.html';

/**
 * Simple manual CSV parser to avoid extra dependencies.
 */
function parseCsv(content) {
    const lines = content.split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const results = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Simple but effective comma split (ignoring commas in quotes for score)
        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

        const obj = {};
        headers.forEach((header, index) => {
            let val = (values[index] || '').trim();
            if (val.startsWith('"') && val.endsWith('"')) {
                val = val.substring(1, val.length - 1);
            }
            obj[header] = val;
        });
        results.push(obj);
    }
    return results;
}

async function run() {
    console.log('🚀  Scanning Output folder for CSV files...');
    
    if (!fs.existsSync(OUTPUT_DIR)) {
        console.error(`❌  Error: ${OUTPUT_DIR} not found!`);
        return;
    }

    const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.csv'));
    
    if (files.length === 0) {
        console.log('⚠️  No CSV files found in Output folder.');
        return;
    }

    let allRecords = [];

    for (const file of files) {
        const filePath = path.join(OUTPUT_DIR, file);
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const records = parseCsv(content);
            console.log(`📈  Parsed ${records.length} leads from ${file}`);
            allRecords = allRecords.concat(records);
        } catch (e) {
            console.error(`❌ Failed to read ${file}: ${e.message}`);
        }
    }

    console.log(`\n🌟  Total Leads Found: ${allRecords.length}`);
    
    // Deduplicate to be safe
    const seen = new Set();
    const uniqueRecords = allRecords.filter((lead) => {
        const key = `${lead.Businessname}|${lead.Phonenumber}`.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    console.log(`🧹  Removed ${allRecords.length - uniqueRecords.length} duplicates across files.`);
    console.log(`📊  Generating Master Dashboard with ${uniqueRecords.length} unique leads...`);
        
    generateSalesDashboard(uniqueRecords, HTML_OUTPUT);
    
    console.log('\n🔥  INSTRUCTIONS:');
    console.log(`1. Open ${HTML_OUTPUT} in your browser.`);
    console.log('2. Click "SEND VIA WHATSAPP" for the "Reputation Emergency" leads first.');
    console.log('3. Close your first client today!');
}

run();
