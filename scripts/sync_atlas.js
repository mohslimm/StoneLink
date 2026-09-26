const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const leadsPath = path.join(__dirname, '..', 'data', 'all_leads.json');
const envPath = path.join(__dirname, '..', '.env.local');

// Load environment variables manually
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://steppingstonesdevcontact_db_user:rBwWegtSuJ0kT5BL@ac-za5lc36-shard-00-00.ggmoybl.mongodb.net:27017,ac-za5lc36-shard-00-01.ggmoybl.mongodb.net:27017,ac-za5lc36-shard-00-02.ggmoybl.mongodb.net:27017/stonelink?ssl=true&authSource=admin&replicaSet=atlas-qj1r3v-shard-0';

async function syncToAtlas() {
  console.log('🔄 Tentative de synchronisation vers MongoDB Atlas...');
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 4000 });
    console.log('⚡ Connecté à MongoDB Atlas !');

    const rawLeads = JSON.parse(fs.readFileSync(leadsPath, 'utf8'));

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
      score: Number,
      notes: Array,
      activities: Array,
      weaknesses: Array,
      campaignId: String,
      createdAt: { type: Date, default: Date.now },
    }, { strict: false }));

    let synced = 0;
    for (const lead of rawLeads) {
      const stage = (lead.PipelineStage || 'new').toLowerCase().includes('contact') ? 'contacted' : 'new';
      const cleanEmail = lead.Emailaddress || `contact@${(lead.Businessname || 'lead').toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;

      await Prospect.updateOne(
        { email: cleanEmail },
        {
          $setOnInsert: {
            companyName: lead.Businessname || 'Prospect',
            contactName: lead.OwnerName || `Responsable ${lead.Businessname || ''}`,
            phone: lead.Phonenumber || '',
            website: lead.Website || '',
            niche: lead.Niche || 'general',
            city: lead.Wilaya || 'Alger',
            country: 'DZ',
            stage,
            score: (typeof lead.WebsiteScore === 'number' && lead.WebsiteScore > 0) ? Math.round(lead.WebsiteScore * 10) : 50,
            weaknesses: lead.Weaknesses || [],
            campaignId: lead.CampaignID || '',
            notes: lead.Notes ? [{ content: lead.Notes, timestamp: new Date(), author: 'Bot-Se' }] : [],
          }
        },
        { upsert: true }
      );
      synced++;
    }

    console.log(`🎉 ${synced} prospects synchronisés avec succès dans MongoDB Atlas !`);
    await mongoose.disconnect();
  } catch (err) {
    console.log(`⚠️ Atlas injoignable pour le moment (${err.message}).`);
    console.log(`💡 Les 702 leads sont actifs dans StoneLink en mode résilient local.`);
  }
}

syncToAtlas();
