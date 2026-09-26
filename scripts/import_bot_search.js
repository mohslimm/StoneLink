const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Path to Bot-Search Output
const BOT_SEARCH_OUTPUT = 'C:\\Users\\moham\\Downloads\\Bot-Search-main\\Bot-Search-main\\Output';

function parseCsv(filePath, defaultNiche = 'Général') {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Fichier introuvable : ${filePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) {
    console.warn(`⚠️ Fichier CSV vide ou sans données : ${filePath}`);
    return [];
  }

  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
  
  // Detect columns
  const nameIdx = headers.findIndex(h => h.includes('business') || h.includes('nom') || h.includes('name') || h.includes('company'));
  const phoneIdx = headers.findIndex(h => h.includes('phone') || h.includes('tel') || h.includes('telephone'));
  const webIdx = headers.findIndex(h => h.includes('web') || h.includes('site') || h.includes('url'));
  const emailIdx = headers.findIndex(h => h.includes('email') || h.includes('mail'));
  const scoreIdx = headers.findIndex(h => h.includes('score') || h.includes('lighthouse'));

  const dataRows = lines.slice(1);
  const leads = [];

  dataRows.forEach((row, index) => {
    // Regex for CSV with quoted strings
    const cells = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => (c || '').replace(/^"|"$/g, '').trim());
    
    const companyName = cells[nameIdx !== -1 ? nameIdx : 0] || `Lead #${index + 1}`;
    const phone = phoneIdx !== -1 ? cells[phoneIdx] : (cells[1] || '');
    const website = webIdx !== -1 ? cells[webIdx] : (cells[2] || '');
    const email = emailIdx !== -1 ? cells[emailIdx] : (cells[4] || '');
    const rawScore = scoreIdx !== -1 ? Number(cells[scoreIdx]) : NaN;
    const score = !isNaN(rawScore) && rawScore > 0 ? rawScore : Math.floor(Math.random() * (75 - 30) + 30);

    // Auto-detect niche from filename
    let niche = defaultNiche;
    const baseName = path.basename(filePath).toLowerCase();
    if (baseName.includes('dental') || baseName.includes('dentiste')) niche = 'Santé / Dentaire';
    else if (baseName.includes('voyage') || baseName.includes('travel')) niche = 'Voyage & Tourisme';
    else if (baseName.includes('law') || baseName.includes('avocat')) niche = 'Juridique';
    else if (baseName.includes('immo') || baseName.includes('real-estate') || baseName.includes('property')) niche = 'Immobilier';
    else if (baseName.includes('derma') || baseName.includes('plastic') || baseName.includes('spa')) niche = 'Santé / Esthétique';
    else if (baseName.includes('yacht') || baseName.includes('boat')) niche = 'Nautisme & Yachting';

    leads.push({
      id: `bot-${Date.now()}-${index + 1}`,
      companyName,
      contactName: `Responsable ${companyName}`,
      phone,
      website,
      email: email || `contact@${companyName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'lead'}.com`,
      score,
      sector: niche,
      niche: niche.toLowerCase().split(' ')[0],
      stage: 'nouveau',
      priority: score < 45 ? 'hot' : 'warm',
      city: 'Paris',
      country: 'FR',
      lastContact: 'Importé aujourd\'hui',
      callHistory: [],
      notes: `Importé depuis Bot-Search (${path.basename(filePath)})`,
      scriptReady: true,
    });
  });

  return leads;
}

async function run() {
  const args = process.argv.slice(2);
  let targetFile = args[0];

  if (!targetFile) {
    console.log(`\n🔍 Recherche des fichiers CSV dans Bot-Search Output (${BOT_SEARCH_OUTPUT})...`);
    if (fs.existsSync(BOT_SEARCH_OUTPUT)) {
      const files = fs.readdirSync(BOT_SEARCH_OUTPUT).filter(f => f.endsWith('.csv'));
      console.log(`📁 ${files.length} fichiers CSV trouvés :`);
      files.slice(0, 10).forEach((f, i) => console.log(`   ${i + 1}. ${f}`));
      if (files.length > 10) console.log(`   ... et ${files.length - 10} autres`);

      // Pick the most recent CSV or Leadlist.csv
      targetFile = path.join(BOT_SEARCH_OUTPUT, files.find(f => f.toLowerCase() === 'leadlist.csv') || files[0]);
      console.log(`\n🚀 Fichier sélectionné par défaut : ${targetFile}`);
    } else {
      console.error(`❌ Répertoire introuvable : ${BOT_SEARCH_OUTPUT}`);
      process.exit(1);
    }
  }

  const leads = parseCsv(targetFile);
  console.log(`✅ ${leads.length} leads extraits avec succès !`);

  // Try MongoDB Atlas insertion
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://steppingstonesdevcontact_db_user:rBwWegtSuJ0kT5BL@ac-za5lc36-shard-00-00.ggmoybl.mongodb.net:27017,ac-za5lc36-shard-00-01.ggmoybl.mongodb.net:27017,ac-za5lc36-shard-00-02.ggmoybl.mongodb.net:27017/stonelink?ssl=true&authSource=admin&replicaSet=atlas-qj1r3v-shard-0';

  try {
    console.log('🔄 Connexion à MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
    console.log('⚡ Connecté à MongoDB ! Insertion en base...');

    const Prospect = mongoose.models.Prospect || mongoose.model('Prospect', new mongoose.Schema({
      companyName: String,
      contactName: String,
      email: String,
      phone: String,
      website: String,
      niche: String,
      country: String,
      city: String,
      stage: { type: String, default: 'new' },
      priority: { type: String, default: 'cold' },
      notes: Array,
      activities: Array,
      createdAt: { type: Date, default: Date.now },
    }, { strict: false }));

    let count = 0;
    for (const lead of leads) {
      await Prospect.updateOne(
        { email: lead.email },
        { $setOnInsert: lead },
        { upsert: true }
      );
      count++;
    }

    console.log(`🎉 ${count} prospects insérés/synchronisés dans MongoDB Atlas !`);
    await mongoose.disconnect();
  } catch (err) {
    console.warn(`⚠️ Impossible de joindre MongoDB Atlas (${err.message}).`);
    console.log(`💡 Les leads peuvent être directement importés via le bouton "Importer CSV" dans l'interface CRM (http://localhost:3000/crm) !`);
  }
}

run();
