import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import SequenceModel from '@/models/Sequence';
import ProspectModel from '@/models/Prospect';

export async function GET(req: Request) {
  try {
    if (mongoose.connection.readyState !== 1) {
      const uri = process.env.MONGODB_URI;
      if (uri) await mongoose.connect(uri);
    }

    const activeSequences = await SequenceModel.find({ active: true });
    let emailsSent = 0;

    for (const seq of activeSequences) {
      const prospect = await ProspectModel.findById(seq.prospectId);
      if (!prospect) continue;

      const daysSinceStart = Math.floor((Date.now() - seq.startDate.getTime()) / (1000 * 60 * 60 * 24));

      for (let i = 0; i < seq.steps.length; i++) {
        const step = seq.steps[i];
        if (!step.executed && daysSinceStart >= step.dayOffset) {
           const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
           
           // Replace simple variables
           const subject = step.subjectTemplate.replace(/\{\{company\}\}/g, prospect.companyName);
           const bodyText = step.bodyTemplate
             .replace(/\{\{name\}\}/g, prospect.contactName)
             .replace(/\{\{company\}\}/g, prospect.companyName);
             
           const bodyHtml = `<p style="font-family:Arial,sans-serif;color:#1e293b;line-height:1.6;">${bodyText.replace(/\n/g, '<br/>')}</p>`;

           try {
             await fetch(`${appUrl}/api/email/send`, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                 to: prospect.email,
                 subject,
                 bodyText,
                 bodyHtml,
                 prospectId: prospect.id,
                 prototypeUrl: prospect.customizedPrototypeUrl
               })
             });
             
             step.executed = true;
             step.executedAt = new Date();
             emailsSent++;
           } catch(e) {
             console.error('Failed to send outreach email', e);
           }
        }
      }

      // Desactivate sequence if all steps are done
      const allDone = seq.steps.every((s: any) => s.executed);
      if (allDone) {
        seq.active = false;
      }
      
      await seq.save();
    }

    return NextResponse.json({ success: true, emailsSent, activeSequences: activeSequences.length });
  } catch (error) {
    console.error('Cron Error:', error);
    return NextResponse.json({ error: "Erreur cron outreach" }, { status: 500 });
  }
}
