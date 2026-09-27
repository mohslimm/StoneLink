import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    const statusFilePath = path.join(dataDir, 'crawler_status.json');
    const resultsFilePath = path.join(dataDir, 'latest_scrape_results.json');

    let statusData: any = null;
    let latestResults: any = null;

    if (fs.existsSync(statusFilePath)) {
      try {
        statusData = JSON.parse(fs.readFileSync(statusFilePath, 'utf8'));
      } catch (e) {}
    }

    if (fs.existsSync(resultsFilePath)) {
      try {
        latestResults = JSON.parse(fs.readFileSync(resultsFilePath, 'utf8'));
      } catch (e) {}
    }

    if (!statusData) {
      return NextResponse.json({
        isRunning: false,
        status: 'idle',
        targetCount: 0,
        currentCount: 0,
        logs: [],
        latestResults: latestResults || null,
      });
    }

    // Check if the process is actually running
    let isAlive = false;
    if (statusData.pid && statusData.status === 'running') {
      try {
        // Signal 0 checks for process existence without killing
        process.kill(statusData.pid, 0);
        isAlive = true;
      } catch (err: any) {
        // ESRCH means process does not exist
        isAlive = false;
      }

      // If the process ended but status was still 'running', mark as completed
      if (!isAlive) {
        statusData.status = 'completed';
        statusData.currentLead = 'Scan terminé';
        try {
          fs.writeFileSync(statusFilePath, JSON.stringify(statusData, null, 2), 'utf8');
        } catch (e) {}
      }
    }

    return NextResponse.json({
      isRunning: isAlive && statusData.status === 'running',
      status: statusData.status || (isAlive ? 'running' : 'idle'),
      pid: statusData.pid || null,
      query: statusData.query || '',
      area: statusData.area || '',
      targetCount: statusData.targetCount || (latestResults?.total || 0),
      currentCount: statusData.status === 'running' 
        ? (statusData.currentCount || 0) 
        : (latestResults?.leads?.length || statusData.currentCount || 0),
      currentCombination: statusData.currentCombination || '',
      currentLead: statusData.currentLead || '',
      openBrowser: !!statusData.openBrowser,
      testMode: !!statusData.testMode,
      logs: statusData.logs || [],
      startedAt: statusData.startedAt || null,
      endedAt: statusData.endedAt || null,
      latestResults: latestResults || (statusData.leads ? { total: statusData.leads.length, leads: statusData.leads } : null),
    });

  } catch (error: any) {
    console.error('[Crawler Status API Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
