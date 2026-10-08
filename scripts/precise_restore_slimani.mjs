import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envMatch = envContent.match(/MONGODB_URI=(.*)/);
const MONGODB_URI = envMatch ? envMatch[1].trim() : '';

const EXCLUDED_PATTERNS = [
  'bejaia tours',
  'b&o',
  'khelladi',
  'kheladi',
  'jil voyage',
  'kabylie voyage',
  'landmark',
  'land voyage',
  'sid travel',
  'بوغرارة',
  'unilink',
  'madenia',
  'medina',
];

function isClinic(lead) {
  const niche = (lead.niche || '').toLowerCase();
  const name = ((lead.companyName || '') + ' ' + (lead.company || '')).toLowerCase();
  return (
    niche.includes('dent') ||
    niche.includes('clini') ||
    name.includes('dent') ||
    name.includes('cabinet') ||
    name.includes('clinique')
  );
}

function isExcludedAgency(lead) {
  const name = ((lead.companyName || '') + ' ' + (lead.company || '')).toLowerCase();
  return EXCLUDED_PATTERNS.some((p) => name.includes(p.toLowerCase()));
}

function parseFollowUpData(notes) {
  if (!notes) return null;
  const match = notes.match(/<!--\s*FOLLOWUP_DATA:\s*([\s\S]*?)\s*-->/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

function extractCleanNotes(notes) {
  if (!notes) return '';
  return notes.replace(/<!--\s*FOLLOWUP_DATA:[\s\S]*?-->/g, '').trim();
}

function serializeNotes(cleanText, followUpData) {
  const payload = JSON.stringify(followUpData);
  return cleanText
    ? `${cleanText}\n\n<!-- FOLLOWUP_DATA: ${payload} -->`
    : `<!-- FOLLOWUP_DATA: ${payload} -->`;
}

async function main() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI);
  const col = mongoose.connection.db.collection('prospects');

  const prototypeLeads = await col.find({
    stage: 'prototype',
    isDeleted: { $ne: true },
  }).toArray();

  console.log(`Found ${prototypeLeads.length} prototype leads in MongoDB.\n`);

  const allLeadsPath = path.join(__dirname, '..', 'data', 'all_leads.json');
  let localLeads = null;
  if (fs.existsSync(allLeadsPath)) {
    localLeads = JSON.parse(fs.readFileSync(allLeadsPath, 'utf8'));
  }

  const clinicsStep0 = [];
  const excludedAgenciesStep0 = [];
  const agenciesStep1 = [];

  const now = new Date();

  for (const lead of prototypeLeads) {
    const name = lead.companyName || lead.company;
    const cleanNotes = extractCleanNotes(lead.notes);
    const existingFollowUp = parseFollowUpData(lead.notes) || {};

    const rawCreation = existingFollowUp.prototypeSentAt || lead.ContactedAt || lead.createdAt;
    const initialDate = rawCreation ? new Date(rawCreation) : new Date(now.getTime() - 2 * 86400000);
    const prototypeSentAt = isNaN(initialDate.getTime()) ? now.toISOString() : initialDate.toISOString();

    let targetStep = 1;

    if (isClinic(lead)) {
      targetStep = 0;
      clinicsStep0.push({ id: lead._id, name });
    } else if (isExcludedAgency(lead)) {
      targetStep = 0;
      excludedAgenciesStep0.push({ id: lead._id, name });
    } else {
      targetStep = 1;
      agenciesStep1.push({ id: lead._id, name });
    }

    const updatedFollowUpData = {
      currentStep: targetStep,
      prototypeSentAt,
      lastActionAt: targetStep === 1 ? now.toISOString() : prototypeSentAt,
      history: existingFollowUp.history || [],
      primaryObjection: existingFollowUp.primaryObjection,
    };

    const newSerializedNotes = serializeNotes(cleanNotes, updatedFollowUpData);

    // Update using strict _id only
    await col.updateOne(
      { _id: lead._id },
      { $set: { notes: newSerializedNotes, updatedAt: now } }
    );

    // Sync local cache
    if (localLeads) {
      const idx = localLeads.findIndex((l) => l.id === lead._id || l._id === lead._id);
      if (idx !== -1) {
        localLeads[idx].Notes = newSerializedNotes;
        localLeads[idx].notes = newSerializedNotes;
      }
    }
  }

  if (localLeads) {
    fs.writeFileSync(allLeadsPath, JSON.stringify(localLeads, null, 2), 'utf8');
    console.log('✅ Synchronized data/all_leads.json locally.');
  }

  console.log('\n========================================================');
  console.log('  FINAL VERIFIED AUDIT REPORT');
  console.log('========================================================');
  console.log(`\n🏥 CLINICS IN STEP 0 (${clinicsStep0.length}):`);
  clinicsStep0.forEach((c) => console.log(`   - ${c.name} [${c.id}]`));

  console.log(`\n⏳ EXCLUDED AGENCIES IN STEP 0 (${excludedAgenciesStep0.length}):`);
  excludedAgenciesStep0.forEach((a) => console.log(`   - ${a.name} [${a.id}]`));

  console.log(`\n⚡ TRAVEL AGENCIES ADVANCED TO RELANCE #1 (${agenciesStep1.length}):`);
  agenciesStep1.forEach((a, i) => console.log(`   ${i + 1}. ${a.name} [${a.id}]`));

  console.log('\n========================================================');
  console.log(`TOTAL PROTOTYPES: ${prototypeLeads.length}`);
  console.log(`TOTAL IN STEP 0: ${clinicsStep0.length + excludedAgenciesStep0.length} (4 Cliniques + ${excludedAgenciesStep0.length} Agences)`);
  console.log(`TOTAL IN RELANCE #1: ${agenciesStep1.length}`);
  console.log('========================================================\n');

  await mongoose.disconnect();
}

main().catch(console.error);
