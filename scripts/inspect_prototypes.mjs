import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envMatch = envContent.match(/MONGODB_URI=(.*)/);
const MONGODB_URI = envMatch ? envMatch[1].trim() : '';

function parseFollowUpData(notes) {
  if (!notes) return { currentStep: 0 };
  const match = notes.match(/<!-- FOLLOWUP_DATA: ([\s\S]*?) -->/);
  if (!match) return { currentStep: 0 };
  try {
    return JSON.parse(match[1]);
  } catch {
    return { currentStep: 0 };
  }
}

async function main() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const col = db.collection('prospects');

  const prototypeLeads = await col.find({
    stage: 'prototype',
    isDeleted: { $ne: true }
  }).toArray();

  console.log(`Found ${prototypeLeads.length} prototype leads.\n`);

  const categorized = prototypeLeads.map((lead) => {
    const fu = parseFollowUpData(lead.notes);
    return {
      _id: lead._id.toString(),
      id: lead.id,
      company: lead.companyName || lead.company,
      niche: lead.niche,
      currentStep: fu.currentStep ?? 0,
      notesExcerpt: (lead.notes || '').replace(/<!--[\s\S]*?-->/g, '').trim().slice(0, 60),
      rawNotes: lead.notes || '',
    };
  });

  for (const c of categorized) {
    console.log(`[Step ${c.currentStep}] [${c.niche || 'no-niche'}] "${c.company}" (id: ${c.id || c._id})`);
  }

  await mongoose.disconnect();
}

main().catch(console.error);
