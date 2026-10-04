import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    const statusFilePath = path.join(dataDir, 'crawler_status.json');
    const stopSignalPath = path.join(dataDir, 'crawler_stop_signal');
    const resultsFilePath = path.join(dataDir, 'latest_scrape_results.json');

    // 1. Create stop signal file so Runner.js breaks immediately and executes saveAndSync
    try {
      fs.writeFileSync(stopSignalPath, 'STOP', 'utf8');
    } catch (e) {}

    let pid: number | null = null;
    let statusData: any = null;

    if (fs.existsSync(statusFilePath)) {
      try {
        statusData = JSON.parse(fs.readFileSync(statusFilePath, 'utf8'));
        if (statusData && statusData.pid) {
          pid = statusData.pid;
        }
      } catch (e) {}
    }

    // Try optional body pid if provided
    try {
      const body = await req.json();
      if (body && body.pid) pid = body.pid;
    } catch (e) {}

    // 2. Kill the process tree on Windows if pid exists
    if (pid) {
      try {
        // First check if alive
        process.kill(pid, 0);
        // Force kill process tree on Windows
        exec(`taskkill /pid ${pid} /t /f`, (err) => {
          if (err) console.log(`[Crawler Stop] Process ${pid} already exited or taskkill error:`, err.message);
        });
      } catch (err: any) {
        // Process might already be dead
        console.log(`[Crawler Stop] Process ${pid} was not running.`);
      }
    }

    // 3. Ensure any saved leads are synced into all_leads.json and seed_and_migrate runs
    let latestResults: any = null;
    if (fs.existsSync(resultsFilePath)) {
      try {
        latestResults = JSON.parse(fs.readFileSync(resultsFilePath, 'utf8'));
      } catch (e) {}
    }

    if (!statusData?.testMode && latestResults && Array.isArray(latestResults.leads) && latestResults.leads.length > 0) {
      const allLeadsPath = path.join(dataDir, 'all_leads.json');
      let existingLeads: any[] = [];
      if (fs.existsSync(allLeadsPath)) {
        try { existingLeads = JSON.parse(fs.readFileSync(allLeadsPath, 'utf8')); } catch (e) {}
      }

      let added = 0;
      for (const n of latestResults.leads) {
        const isDuplicate = existingLeads.some(e =>
          (n.Website && e.Website && n.Website === e.Website) ||
          (n.Businessname && e.Businessname && n.Businessname.toLowerCase() === e.Businessname.toLowerCase() && n.Wilaya === e.Wilaya)
        );
        if (!isDuplicate) {
          existingLeads.unshift(n);
          added++;
        }
      }

      fs.writeFileSync(allLeadsPath, JSON.stringify(existingLeads, null, 2), 'utf8');

      // Trigger sync_atlas and seed_and_migrate to immediately push preserved leads to MongoDB Atlas
      exec('node scripts/sync_atlas.js && node scripts/seed_and_migrate.js', (err) => {
        if (err) console.error('[Crawler Stop] sync error:', err.message);
      });
    }

    // 4. Update status file
    if (statusData) {
      statusData.status = 'stopped';
      statusData.currentLead = 'Scan interrompu par l’utilisateur';
      statusData.endedAt = new Date().toISOString();
      if (!statusData.logs) statusData.logs = [];
      statusData.logs.push(`[${new Date().toLocaleTimeString('fr-FR')}] 🛑 Scan arrêté manuellement par l’utilisateur.`);
      try {
        fs.writeFileSync(statusFilePath, JSON.stringify(statusData, null, 2), 'utf8');
      } catch (e) {}
    }

    return NextResponse.json({
      success: true,
      message: 'Scan Bot-Se arrêté avec succès.',
      savedLeadsCount: latestResults?.leads?.length || 0,
      latestResults: latestResults || null,
    });

  } catch (error: any) {
    console.error('[Crawler Stop Error]', error);
    return NextResponse.json({ error: 'Erreur lors de l’arrêt du scraper', details: error.message }, { status: 500 });
  }
}
