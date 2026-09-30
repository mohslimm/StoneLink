const fs = require('fs');
const path = require('path');
const dns = require('dns');
const mongoose = require('mongoose');

// Prefer IPv4 & Google/Cloudflare DNS for resilient resolution on Algerian networks
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {}

const leadsPath = path.join(__dirname, '..', 'data', 'all_leads.json');
const latestResultsPath = path.join(__dirname, '..', 'data', 'latest_scrape_results.json');
const envPath = path.join(__dirname, '..', '.env.local');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  });
}

const PRIMARY_URI = process.env.MONGODB_URI || 'mongodb+srv://lpiks:7ypmjHukQ7CMiPlW@cluster0.ggmoybl.mongodb.net/stonelink?retryWrites=true&w=majority';
const DIRECT_REPLICA_FALLBACK = 'mongodb://lpiks:7ypmjHukQ7CMiPlW@ac-za5lc36-shard-00-00.ggmoybl.mongodb.net:27017,ac-za5lc36-shard-00-01.ggmoybl.mongodb.net:27017,ac-za5lc36-shard-00-02.ggmoybl.mongodb.net:27017/stonelink?ssl=true&authSource=admin&replicaSet=atlas-rb39ac-shard-0';

function hasValidWebsite(url) {
  if (!url) return false;
  const clean = url.trim().toLowerCase();
  return clean !== '' && clean !== 'pas de site web' && clean !== 'non renseigné' && clean !== 'aucun' && clean.length > 3;
}

async function connectToMongo() {
  const opts = { serverSelectionTimeoutMS: 6000, connectTimeoutMS: 6000 };
  try {
    console.log('🔄 Connexion à MongoDB Atlas via URI primaire...');
    await mongoose.connect(PRIMARY_URI, opts);
    console.log('⚡ Connecté avec succès via URI primaire !');
  } catch (err) {
    console.warn('⚠️ Échec URI primaire (' + err.message + '). Bascule sur ReplicaSet direct...');
    await mongoose.connect(DIRECT_REPLICA_FALLBACK, opts);
    console.log('⚡ Connecté avec succès via ReplicaSet direct !');
  }
}

async function syncToAtlas() {
  try {
    await connectToMongo();

    // Load leads: prioritize latest results if present, otherwise all_leads
    let leadsToSync = [];
    if (fs.existsSync(latestResultsPath)) {
      try {
        const lr = JSON.parse(fs.readFileSync(latestResultsPath, 'utf8'));
        if (lr && Array.isArray(lr.leads) && lr.leads.length > 0) {
          leadsToSync = lr.leads;
          console.log(`📡 Détection de ${leadsToSync.length} leads dans le dernier scan.`);
        }
      } catch (e) {}
    }

    if (leadsToSync.length === 0 && fs.existsSync(leadsPath)) {
      leadsToSync = JSON.parse(fs.readFileSync(leadsPath, 'utf8'));
    }

    if (leadsToSync.length === 0) {
      console.log('ℹ️ Aucun prospect à synchroniser.');
      await mongoose.disconnect();
      return;
    }

    const ProspectSchema = new mongoose.Schema({
      _id: { type: String },
      companyName: { type: String, default: 'Sans entreprise' },
      contactName: { type: String, default: 'Sans contact' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      website: { type: String, default: '' },
      score: { type: Number, default: 0 },
      niche: { type: String, default: 'Général' },
      country: { type: String, default: 'Algérie' },
      city: { type: String, default: '' },
      stage: { type: String, default: 'nouveau' },
      priority: { type: String, default: 'cold' },
      notes: { type: mongoose.Schema.Types.Mixed, default: '' },
      isDeleted: { type: Boolean, default: false },
      deletedAt: { type: Date, default: null },
      activities: { type: Array, default: [] },
      callHistory: { type: Array, default: [] },
    }, { timestamps: true, strict: false });

    const Prospect = mongoose.models.Prospect || mongoose.model('Prospect', ProspectSchema);

    let inserted = 0;
    let updated = 0;

    for (const lead of leadsToSync) {
      const companyName = lead.Businessname || lead.companyName || 'Sans nom';
      const city = lead.Wilaya || lead.city || 'Algérie';
      const phone = lead.Phonenumber || lead.phone || '';
      const website = lead.Website || lead.website || '';
      const hasWeb = hasValidWebsite(website);

      let cleanScore = 0;
      if (hasWeb) {
        const rawScore = (typeof lead.WebsiteScore === 'number' && lead.WebsiteScore > 0)
          ? Math.round(lead.WebsiteScore * 10)
          : (lead.Googlemapsscore ? Math.round(parseFloat(String(lead.Googlemapsscore).replace(',', '.')) * 15) : 48);
        cleanScore = isNaN(rawScore) ? 50 : Math.min(Math.max(rawScore, 15), 98);
      }

      const noteText = city ? `Zone: ${city}` : '';

      // Check if prospect exists by phone (if available) or companyName + city
      let existing = null;
      if (phone && phone.length > 5) {
        existing = await Prospect.findOne({ phone, isDeleted: { $ne: true } });
      }
      if (!existing && companyName) {
        existing = await Prospect.findOne({ 
          companyName: new RegExp(`^${companyName.trim()}$`, 'i'),
          isDeleted: { $ne: true }
        });
      }

      if (existing) {
        // Update existing with fresh data
        await Prospect.updateOne(
          { _id: existing._id },
          {
            $set: {
              phone: phone || existing.phone,
              website: website || existing.website,
              score: cleanScore || existing.score,
              city: city || existing.city,
              niche: lead.Niche || existing.niche || 'Agence de voyage',
            }
          }
        );
        updated++;
      } else {
        // Insert new prospect with a clean unique _id
        const docId = lead.id || `lead_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        await Prospect.create({
          _id: docId,
          companyName,
          contactName: lead.OwnerName || `Responsable ${companyName}`,
          email: lead.Emailaddress || '',
          phone,
          website: website || 'Pas de site web',
          score: cleanScore,
          niche: lead.Niche || 'Agence de voyage',
          country: 'Algérie',
          city,
          stage: 'nouveau',
          priority: 'cold',
          notes: noteText,
          isDeleted: false,
          activities: [
            {
              id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              type: 'prospect_created',
              description: `Importé via scan territorial Bot-Se (${city})`,
              timestamp: new Date(),
              status: 'completed',
            }
          ],
        });
        inserted++;
      }
    }

    console.log(`\n🎉 Synchronisation MongoDB Atlas terminée avec succès !`);
    console.log(`   - Nouveaux prospects créés : ${inserted}`);
    console.log(`   - Prospects mis à jour      : ${updated}`);
    console.log(`   - Total traités             : ${leadsToSync.length}`);

    const totalActive = await Prospect.countDocuments({ isDeleted: { $ne: true } });
    console.log(`📊 Total prospects actifs dans MongoDB Atlas : ${totalActive}\n`);

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Erreur de synchronisation Atlas :', err);
    process.exit(1);
  }
}

syncToAtlas();
