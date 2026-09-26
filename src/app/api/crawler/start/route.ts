import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { query = 'Dentiste', area = 'Alger', count = 20, headed = false } = await req.json();

    const runnerScript = path.join(process.cwd(), 'src', 'services', 'crawler', 'Runner.js');

    const args = [
      runnerScript,
      '--query', String(query),
      '--area', String(area),
      '--count', String(count)
    ];

    if (headed) {
      args.push('--headed');
    } else {
      args.push('--headless');
    }

    console.log(`[Crawler API] Spawning background scraper: node ${args.join(' ')}`);

    const child = spawn(process.execPath, args, {
      detached: true,
      stdio: 'ignore',
      cwd: process.cwd()
    });

    child.unref();

    return NextResponse.json({
      success: true,
      message: `Scraper démarré en arrière-plan pour [${query}] dans [${area}] (${count} prospects).`,
      pid: child.pid
    });

  } catch (error: any) {
    console.error('[Crawler API Error]', error);
    return NextResponse.json({ error: 'Erreur lancement scraper', details: error.message }, { status: 500 });
  }
}
