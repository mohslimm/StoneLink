import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import ProspectModel from '@/models/Prospect';
import TerminalEventModel from '@/models/TerminalEvent';

// 1x1 transparent GIF base64
const PIXEL_B64 = "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
const pixelBuffer = Buffer.from(PIXEL_B64, 'base64');

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const emailId = searchParams.get('id');
    const prospectId = searchParams.get('prospectId');

    if (emailId && prospectId) {
      if (mongoose.connection.readyState !== 1) {
        const uri = process.env.MONGODB_URI;
        if (uri) await mongoose.connect(uri);
      }

      const prospect = await ProspectModel.findById(prospectId);
      
      if (prospect) {
        const emailIndex = prospect.emails.findIndex((e: any) => e.id === emailId);
        
        if (emailIndex !== -1 && !prospect.emails[emailIndex].opened) {
          prospect.emails[emailIndex].opened = true;
          prospect.emails[emailIndex].openedAt = new Date();
          await prospect.save();

          await TerminalEventModel.create({
            type: 'alert',
            module: 'Outreach',
            source: prospect.companyName,
            message: `Email ouvert par ${prospect.contactName}`,
            prospectId: prospectId
          });
        }
      }
    }
  } catch (error) {
    console.error('Tracking pixel error:', error);
  }

  // Toujours renvoyer le pixel de manière transparente
  return new NextResponse(pixelBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}
