import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const {
      query = 'Dentiste',
      area = 'Alger',
      count = 20,
      onlyNoWebsite = true,
      testMode = false,
      openBrowser = false,
    } = await req.json();

    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    // Remove any previous stop signal
    const stopSignalPath = path.join(dataDir, 'crawler_stop_signal');
    if (fs.existsSync(stopSignalPath)) {
      try { fs.unlinkSync(stopSignalPath); } catch (e) {}
    }

    const runnerScript = path.join(process.cwd(), 'src', 'services', 'crawler', 'Runner.js');

    const args = [
      runnerScript,
      '--query', String(query),
      '--area', String(area),
      '--count', testMode ? '3' : String(count),
    ];

    if (onlyNoWebsite) {
      args.push('--only-no-website');
    }

    if (testMode) {
      args.push('--test-mode');
    }

    if (openBrowser) {
      args.push('--headed');
    } else {
      args.push('--headless');
    }

    console.log(`[Crawler API] Spawning Bot-Se engine: node ${args.join(' ')} (openBrowser: ${openBrowser})`);

    const child = spawn(process.execPath, args, {
      detached: true,
      stdio: 'ignore',
      cwd: process.cwd(),
      windowsHide: !openBrowser,
    });

    child.unref();

    const queriesCount = String(query).split(',').filter(Boolean).length;
    const areasCount = String(area).split(',').filter(Boolean).length;
    const totalTarget = (queriesCount * areasCount) * (testMode ? 3 : Number(count));

    // Write initial status file immediately so UI gets instant feedback
    const initialStatus = {
      pid: child.pid,
      status: 'running',
      query: String(query),
      area: String(area),
      targetCount: totalTarget,
      currentCount: 0,
      currentCombination: 'Initialisation du scraper...',
      currentLead: 'Démarrage du moteur Playwright...',
      openBrowser: !!openBrowser,
      testMode: !!testMode,
      onlyNoWebsite: !!onlyNoWebsite,
      startedAt: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      logs: [
        `⚡ Moteur Bot-Se démarré avec succès (PID: ${child.pid}).`,
        `🎯 Cibles : ${query} à ${area} (Total attendu: ~${totalTarget} prospects).`,
        `👁️ Affichage Navigateur : ${openBrowser ? 'Visible (Chromium Actif)' : 'Furtif (Arrière-plan)'}`,
        onlyNoWebsite ? '⏩ Filtre actif : Commerces sans site web uniquement.' : '🌐 Filtre : Tous commerces.',
      ],
      leads: []
    };

    fs.writeFileSync(
      path.join(dataDir, 'crawler_status.json'),
      JSON.stringify(initialStatus, null, 2),
      'utf8'
    );

    return NextResponse.json({
      success: true,
      message: `Scraper Bot-Se démarré pour [${query}] à [${area}] (${testMode ? '3 cibles de test' : `${count} prospects`}).`,
      pid: child.pid,
      config: {
        query,
        area,
        count: testMode ? 3 : count,
        onlyNoWebsite,
        testMode,
        openBrowser,
      }
    });

  } catch (error: any) {
    console.error('[Crawler API Error]', error);
    return NextResponse.json({ error: 'Erreur lancement scraper', details: error.message }, { status: 500 });
  }
}
