// ============================================================
// Src/Config/Config.js — Central settings loaded from .env
// ============================================================

import 'dotenv/config';
import fs from 'fs';
import path from 'path';

// ── Env helpers ──────────────────────────────────────────────────────────────
const bool = (key, fallback) =>
  process.env[key] !== undefined
    ? process.env[key].trim().toLowerCase() === 'true'
    : fallback;

const int = (key, fallback) =>
  process.env[key] ? parseInt(process.env[key], 10) : fallback;

const str = (key, fallback) =>
  process.env[key]?.trim() || fallback;

// ── Resolve flags ─────────────────────────────────────────────────────────────
const testMode    = bool('TEST_MODE',    false);
const openBrowser = bool('OPEN_BROWSER', true);
const fullCount   = int('RESULT_COUNT',  30);
const onlyNoWebsite = bool('ONLY_NO_WEBSITE', false);

// ── Auto-Numbering Logic ──────────────────────────────────────────────────────
const rawQueryStr = str('SEARCH_QUERY', 'Restaurant');
const searchQueries = rawQueryStr.split(',').map(q => q.trim()).filter(Boolean);
const baseName = searchQueries.length > 1 
  ? 'multi_query_run' 
  : searchQueries[0].replace(/[^a-z0-9]/gi, '_').toLowerCase();

const outputDir = 'Output';
let counter = 1;
let currentCsvName = `${baseName}_${counter}.csv`;

while (fs.existsSync(path.join(outputDir, currentCsvName))) {
  counter++;
  currentCsvName = `${baseName}_${counter}.csv`;
}

// ── Config object ─────────────────────────────────────────────────────────────
const Config = {

  // Search
  searchQueries: searchQueries,
  searchAreas: str('SEARCH_AREA',  'Paris').split(',').map(a => a.trim()).filter(Boolean),

  // When TEST_MODE=true only 3 results are scraped
  targetCount: testMode ? 3 : fullCount,

  // Flags
  testMode,
  openBrowser,
  onlyNoWebsite,

  // Output
  outputDir:  outputDir,
  outputFile: currentCsvName,

  // Browser
  browser: {
    headless: !openBrowser,
    viewport:   { width: 1366, height: 768 },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    locale:     'en-US',
    timezoneId: 'Europe/Paris',
  },

  // Human-like delay ranges (ms)
  delays: {
    betweenKeystrokes: { min: 80,   max: 200  },
    afterSearch:       { min: 2000, max: 4000 },
    betweenScrolls:    { min: 2000, max: 4000 },
    afterResultClick:  { min: 1500, max: 3000 },
    betweenLeads:      { min: 500,  max: 1500 },
    pageLoad:          { min: 2000, max: 3500 },
  },
};

export default Config;
