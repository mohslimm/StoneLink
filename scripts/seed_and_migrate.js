const fs = require('fs');
const path = require('path');

const leadsPath = path.join(__dirname, '..', 'data', 'all_leads.json');
const targetTsPath = path.join(__dirname, '..', 'src', 'data', 'prospects.ts');

if (!fs.existsSync(leadsPath)) {
  console.error('❌ all_leads.json introuvable dans data/ : ' + leadsPath);
  process.exit(1);
}

const rawLeads = JSON.parse(fs.readFileSync(leadsPath, 'utf8'));
console.log(`📦 ${rawLeads.length} leads chargés depuis data/all_leads.json`);

function mapStage(stage) {
  if (!stage) return 'nouveau';
  const s = stage.toLowerCase();
  if (s.includes('contact')) return 'contacte';
  if (s.includes('respond')) return 'contacte';
  if (s.includes('negot')) return 'prototype';
  if (s.includes('close') || s.includes('ferm')) return 'ferme';
  if (s.includes('lost') || s.includes('perdu')) return 'perdu';
  return 'nouveau';
}

function formatDate(dateStr) {
  if (!dateStr) return 'Non contacté';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Non contacté';
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return 'Non contacté';
  }
}

const mappedProspects = rawLeads.map((l, index) => {
  const stage = mapStage(l.PipelineStage);
  const score = (typeof l.WebsiteScore === 'number' && l.WebsiteScore > 0)
    ? Math.round(l.WebsiteScore * 10)
    : (l.Googlemapsscore ? Math.round(parseFloat(l.Googlemapsscore.replace(',', '.')) * 15) : 48);

  const cleanScore = isNaN(score) ? 50 : Math.min(Math.max(score, 15), 98);
  const company = l.Businessname || `Entreprise #${index + 1}`;
  const name = l.OwnerName && l.OwnerName.trim() ? l.OwnerName.trim() : `Responsable ${company}`;
  const email = l.Emailaddress || '';
  const phone = l.Phonenumber || '';
  const url = l.Website || '';
  const sector = l.Niche || l.Categories || 'Général';
  const lastContact = formatDate(l.ContactedAt);

  let notes = l.Notes || '';
  if (l.Weaknesses && Array.isArray(l.Weaknesses) && l.Weaknesses.length > 0) {
    const wText = `Faiblesses détectées : ${l.Weaknesses.join(', ')}`;
    notes = notes ? `${notes} | ${wText}` : wText;
  }
  if (l.Wilaya) {
    notes = notes ? `${notes} | Zone: ${l.Wilaya}` : `Zone: ${l.Wilaya}`;
  }

  const callHistory = [];
  if (l.ContactedAt) {
    callHistory.push({
      id: `call-${l.id || index}`,
      date: formatDate(l.ContactedAt),
      duration: '4:15',
      outcome: l.RespondedAt ? 'prototype' : 'rappeler',
      notes: notes || 'Premier contact initié.',
    });
  }

  return {
    id: l.id || `lead-${index + 1}`,
    name,
    company,
    url: url || 'Pas de site web',
    phone: phone || 'Non renseigné',
    email: email || 'Non renseigné',
    score: cleanScore,
    sector,
    stage,
    lastContact,
    scriptReady: true,
    callHistory,
    notes,
  };
});

const contactedCount = mappedProspects.filter(p => p.stage === 'contacte').length;
const newCount = mappedProspects.filter(p => p.stage === 'nouveau').length;
const prototypeCount = mappedProspects.filter(p => p.stage === 'prototype').length;
const closedCount = mappedProspects.filter(p => p.stage === 'ferme').length;

console.log(`📊 Statistiques de la migration :`);
console.log(`   - Total prospects : ${mappedProspects.length}`);
console.log(`   - Nouveaux        : ${newCount}`);
console.log(`   - Contactés       : ${contactedCount}`);
console.log(`   - Prototypes      : ${prototypeCount}`);
console.log(`   - Fermés          : ${closedCount}`);

// Read existing prospects.ts to keep mockScriptPhases, mockObjections, etc.
let existingTs = '';
if (fs.existsSync(targetTsPath)) {
  existingTs = fs.readFileSync(targetTsPath, 'utf8');
}

const appendixStart = existingTs.indexOf('export const mockScriptPhases');
const appendix = appendixStart !== -1 ? existingTs.slice(appendixStart) : `
export const mockScriptPhases = [];
export const mockObjections = [];
export const weeklyTrend = [42, 45, 48, 52, 55, 58, 62, 65, 68, 72, 75, 78];
export const conversionTrend = [18, 19, 19.5, 20, 20.8, 21.5, 22, 22.5, 23, 23.2, 23.4, 23.8];
export const rdvTrend = [12, 14, 15, 17, 18, 20, 21, 23, 25, 27, 30, 33];
`;

const newTsContent = `import type { Prospect } from '@/types';

// Migrated from Bot-Se all_leads.json — Total: ${mappedProspects.length} prospects
export const mockProspects: Prospect[] = ${JSON.stringify(mappedProspects, null, 2)};

${appendix}
`;

fs.writeFileSync(targetTsPath, newTsContent, 'utf8');
console.log(`✅ ${mappedProspects.length} prospects enregistrés avec succès dans ${targetTsPath} !`);
