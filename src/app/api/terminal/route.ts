import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import TerminalEvent from '@/models/TerminalEvent';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    const events = await TerminalEvent.find().sort({ timestamp: -1 }).limit(100);
    return NextResponse.json(events);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const newEvent = await TerminalEvent.create(body);
    return NextResponse.json(newEvent, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
