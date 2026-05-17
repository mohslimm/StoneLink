
const fs = require('fs');

function parseCsv(path, niche) {
    const content = fs.readFileSync(path, 'utf8');
    const lines = content.split('\n').filter(line => line.trim() !== '');
    const headers = lines[0].split(',');
    const data = lines.slice(1, 51); // Get top 50

    return data.map((line, index) => {
        const cells = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        
        const companyName = (cells[0] || '').replace(/"/g, '').trim();
        const phone = (cells[1] || '').trim();
        const website = (cells[2] || '').trim();
        const email = (cells[4] || '').trim();
        
        const id = niche === 'dental' ? index + 1 : index + 51;
        const stage = index < 5 ? 'to_call' : index < 15 ? 'new' : index < 20 ? 'interested' : 'new';
        const priority = index < 10 ? 'hot' : index < 25 ? 'warm' : 'cold';
        
        let lighthouseScore = 0;
        if (website && website !== '') {
            lighthouseScore = Math.floor(Math.random() * (65 - 25) + 25);
        } else {
            lighthouseScore = Math.floor(Math.random() * (20 - 5) + 5);
        }

        const estimatedDealValue = Math.floor(Math.random() * (4500 - 2500) + 2500);
        const estimatedLoss = Math.floor(estimatedDealValue * 0.6);

        const contactPrefix = niche === 'dental' ? 'Dr.' : 'Responsable';
        const contactName = `${contactPrefix} ${companyName.split(' ')[0]}`;

        return {
            id: `01DZ${String(id).padStart(4, '0')}`,
            companyName,
            contactName,
            email,
            phone,
            website,
            city: 'Alger',
            country: 'DZ',
            niche,
            stage,
            priority,
            lighthouseScore,
            estimatedDealValue,
            estimatedLoss,
            notes: [],
            emails: [],
            activities: [
                { 
                    id: `act-init-${id}`, 
                    timestamp: `makeDate(${Math.floor(Math.random() * 7 + 1)})`, 
                    type: 'prospect_created', 
                    description: `Import CSV ${niche} Alger` 
                }
            ],
            agentHistory: [],
            interested: false,
            lastContactedAt: undefined,
            lastReminderAt: undefined,
            createdAt: `makeDate(${Math.floor(Math.random() * 10 + 1)})`
        };
    });
}

const dental = parseCsv('C:\\Users\\moham\\Downloads\\Leadlist dental clinics.csv', 'dental');
const travel = parseCsv('C:\\Users\\moham\\Downloads\\Leadlist-TravelAgency.csv', 'travel');

const allProspects = [...dental, ...travel];

let output = 'import type { Prospect, Prototype } from \'@/types/pipeline\'\n\n';
output += 'function makeDate(daysAgo: number): Date {\n  const d = new Date();\n  d.setDate(d.getDate() - daysAgo);\n  return d;\n}\n\n';
output += 'export const MOCK_PROSPECTS: Prospect[] = [\n';
allProspects.forEach(p => {
    output += '  {\n';
    Object.keys(p).forEach(key => {
        let val = p[key];
        if (key === 'activities') {
            output += `    activities: [{ id: '${val[0].id}', timestamp: ${val[0].timestamp}, type: '${val[0].type}', description: '${val[0].description}' }],\n`;
        } else if (key === 'createdAt') {
            output += `    createdAt: ${val},\n`;
        } else if (val === undefined) {
            output += `    ${key}: undefined,\n`;
        } else if (typeof val === 'string' && !val.startsWith('makeDate')) {
            output += `    ${key}: '${val.replace(/'/g, "\\'")}',\n`;
        } else {
            output += `    ${key}: ${val},\n`;
        }
    });
    output += '  },\n';
});
output += '];\n';

fs.writeFileSync('c:\\dev\\StoneLink\\src\\lib\\mockData.ts', output);
