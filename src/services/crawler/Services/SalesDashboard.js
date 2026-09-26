// ============================================================
// Src/Services/SalesDashboard.js — Premium Filterable Interface
// ============================================================

import fs   from 'fs';
import path from 'path';
import { generatePitches } from '../../Dashboard/src/utils/PitchGenerator.js';

/**
 * Generates a high-fidelity HTML Sales Dashboard with Filters.
 */
export function generateSalesDashboard(leads, outputPath) {
  // Extract unique wilayas and statuses for filters
  const wilayas = [...new Set(leads.map(l => l.Wilaya || 'Algeria'))];
  const statuses = ['No Website', 'Reputation Emergency', 'LinkedIn Prospect', 'Instagram Prospect', 'Ouedkniss Advertiser', 'General Lead'];

  const htmlStart = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sales Command Center</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #0f172a;
            --card-bg: #1e293b;
            --accent: #3b82f6;
            --accent-glow: rgba(59, 130, 246, 0.5);
            --text: #f1f5f9;
            --text-dim: #94a3b8;
            --success: #10b981;
            --danger: #ef4444;
            --gold: #f59e0b;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Inter', sans-serif; 
            background: var(--bg); 
            color: var(--text);
            line-height: 1.6;
            padding: 40px 20px;
        }

        .container { max-width: 1200px; margin: 0 auto; }

        header {
            margin-bottom: 40px;
            border-bottom: 1px solid #334155;
            padding-bottom: 30px;
        }

        h1 { font-size: 2.5rem; font-weight: 800; letter-spacing: -1px; margin-bottom: 10px; }
        
        /* ── Filters ────────────────────────────────────────────────────────── */
        .filter-group {
            margin-bottom: 20px;
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            align-items: center;
        }
        .filter-label { font-size: 0.8rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700; min-width: 80px; }
        .filter-btn {
            background: #334155;
            border: 1px solid #475569;
            color: #fff;
            padding: 6px 16px;
            border-radius: 99px;
            cursor: pointer;
            font-size: 0.85rem;
            transition: 0.2s;
        }
        .filter-btn:hover { background: #475569; }
        .filter-btn.active { background: var(--accent); border-color: var(--accent); }

        .custom-dropdown {
            position: relative;
            min-width: 200px;
            font-size: 0.9rem;
            user-select: none;
        }
        .dropdown-selected {
            background: #1e293b;
            border: 1px solid #334155;
            color: #fff;
            padding: 10px 16px;
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: all 0.2s;
        }
        .dropdown-selected::after {
            content: '▼';
            font-size: 0.7rem;
            color: #94a3b8;
        }
        .dropdown-selected:hover { border-color: var(--accent); }
        .dropdown-options {
            position: absolute;
            top: 110%;
            left: 0;
            right: 0;
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 8px;
            max-height: 300px;
            overflow-y: auto;
            display: none;
            z-index: 100;
            box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        }
        .dropdown-options.show { display: block; }
        .dropdown-option {
            padding: 10px 16px;
            color: #cbd5e1;
            cursor: pointer;
            transition: background 0.2s;
        }
        .dropdown-option:hover {
            background: #334155;
            color: #fff;
        }
        .dropdown-options::-webkit-scrollbar { width: 6px; }
        .dropdown-options::-webkit-scrollbar-track { background: transparent; }
        .dropdown-options::-webkit-scrollbar-thumb { background: #475569; border-radius: 10px; }

        .search-box {
            width: 100%;
            background: #1e293b;
            border: 1px solid #334155;
            padding: 12px 20px;
            border-radius: 12px;
            color: #fff;
            font-size: 1rem;
            margin-top: 20px;
            outline: none;
        }
        .search-box:focus { border-color: var(--accent); }

        /* ── Grid & Cards ───────────────────────────────────────────────────── */
        .wilaya-section { margin-bottom: 60px; }
        .wilaya-title {
            font-size: 1.8rem;
            color: var(--accent);
            margin-bottom: 25px;
            display: flex;
            align-items: center;
            gap: 12px;
            border-left: 4px solid var(--accent);
            padding-left: 15px;
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 25px;
        }

        .card {
            background: var(--card-bg);
            border-radius: 16px;
            padding: 24px;
            border: 1px solid #334155;
            transition: all 0.3s ease;
            position: relative;
        }
        .card.hidden { display: none; }

        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 99px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            margin-bottom: 12px;
        }

        .badge-blue { background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid #3b82f6; }
        .badge-red { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid #ef4444; }
        .badge-gold { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid #f59e0b; }
        .badge-gray { background: rgba(148, 163, 184, 0.2); color: #cbd5e1; border: 1px solid #94a3b8; }

        .biz-name { font-size: 1.25rem; font-weight: 700; margin-bottom: 8px; color: #fff; }
        .phone { display: block; color: var(--text-dim); font-size: 0.9rem; margin-bottom: 15px; }

        .score-row { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; }
        .stars { color: #fbbf24; font-size: 1.1rem; }
        .rating-num { background: #334155; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; }

        .pitch-preview {
            background: rgba(15, 23, 42, 0.5);
            padding: 15px;
            border-radius: 12px;
            font-size: 0.9rem;
            color: #cbd5e1;
            font-style: italic;
            margin-bottom: 25px;
            border: 1px dashed #475569;
        }

        .actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .btn {
            padding: 12px;
            border-radius: 8px;
            font-size: 0.85rem;
            font-weight: 600;
            text-align: center;
            text-decoration: none;
            cursor: pointer;
            transition: 0.2s;
            border: none;
        }

        .btn-wa { background: var(--success); color: #fff; grid-column: span 2; }
        .btn-copy { background: #475569; color: #fff; }
        .btn-call { background: transparent; border: 1px solid #475569; color: #fff; }
        .btn:hover { filter: brightness(1.2); }

        .toast {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--accent);
            color: #fff;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            display: none;
            z-index: 1000;
        }
    </style>
</head>
<body>
    <div id="toast" class="toast">Copied to clipboard!</div>
    <div class="container">
        <header>
            <h1>Sales Command Center</h1>
            
            <div class="filter-group">
                <span class="filter-label">Wilayas:</span>
                <div class="custom-dropdown" id="wilaya-dropdown">
                    <div class="dropdown-selected" onclick="toggleDropdown('wilaya-dropdown')">All Cities</div>
                    <div class="dropdown-options">
                        <div class="dropdown-option" onclick="selectWilaya('all', 'All Cities')">All Cities</div>
                        ${wilayas.map(w => `<div class="dropdown-option" onclick="selectWilaya('${w}', '${w}')">${w}</div>`).join('')}
                    </div>
                </div>
            </div>

            <div class="filter-group">
                <span class="filter-label">Status:</span>
                <div class="custom-dropdown" id="status-dropdown">
                    <div class="dropdown-selected" onclick="toggleDropdown('status-dropdown')">All Statuses</div>
                    <div class="dropdown-options">
                        <div class="dropdown-option" onclick="selectStatus('all', 'All Statuses')">All Statuses</div>
                        ${statuses.map(s => `<div class="dropdown-option" onclick="selectStatus('${s}', '${s}')">${s}</div>`).join('')}
                    </div>
                </div>
            </div>

            <input type="text" class="search-box" placeholder="Search by clinic name..." onkeyup="searchClinics(this.value)">
        </header>
  `;

  const htmlEnd = `
    </div>
    <script>
        let currentWilaya = 'all';
        let currentStatus = 'all';
        let currentSearch = '';

        function toggleDropdown(id) {
            // Close other dropdowns first
            document.querySelectorAll('.dropdown-options').forEach(opt => {
                if (opt.parentElement.id !== id) opt.classList.remove('show');
            });
            document.querySelector('#' + id + ' .dropdown-options').classList.toggle('show');
        }

        function selectWilaya(value, label) {
            document.querySelector('#wilaya-dropdown .dropdown-selected').innerHTML = label;
            document.querySelector('#wilaya-dropdown .dropdown-options').classList.remove('show');
            currentWilaya = value;
            applyAllFilters();
        }

        function selectStatus(value, label) {
            document.querySelector('#status-dropdown .dropdown-selected').innerHTML = label;
            document.querySelector('#status-dropdown .dropdown-options').classList.remove('show');
            currentStatus = value;
            applyAllFilters();
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.custom-dropdown')) {
                document.querySelectorAll('.dropdown-options').forEach(opt => opt.classList.remove('show'));
            }
        });

        function searchClinics(val) {
            currentSearch = val.toLowerCase();
            applyAllFilters();
        }

        function applyAllFilters() {
            const cards = document.querySelectorAll('.card');
            const sections = document.querySelectorAll('.wilaya-section');

            cards.forEach(card => {
                const w = card.getAttribute('data-wilaya');
                const s = card.getAttribute('data-status');
                const name = card.querySelector('.biz-name').innerText.toLowerCase();

                const matchW = (currentWilaya === 'all' || currentWilaya === w);
                const matchS = (currentStatus === 'all' || currentStatus === s);
                const matchSearch = name.includes(currentSearch);

                if (matchW && matchS && matchSearch) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });

            // Hide empty sections
            sections.forEach(sec => {
                const visibleCards = sec.querySelectorAll('.card:not(.hidden)').length;
                sec.style.display = visibleCards > 0 ? 'block' : 'none';
            });
        }

        function copyMsg(btn, text) {
            navigator.clipboard.writeText(text);
            const toast = document.getElementById('toast');
            toast.style.display = 'block';
            setTimeout(() => { toast.style.display = 'none'; }, 2000);
        }
    </script>
</body>
</html>
  `;

  // Group leads by Wilaya for the initial render
  const groupedLeads = {};
  leads.forEach(l => {
    const w = l.Wilaya || 'Algeria';
    if (!groupedLeads[w]) groupedLeads[w] = [];
    groupedLeads[w].push(l);
  });

  let sectionsHtml = '';

  for (const [wilaya, wilayaLeads] of Object.entries(groupedLeads)) {
    sectionsHtml += `
      <div class="wilaya-section" data-wilaya="${wilaya}">
        <h2 class="wilaya-title">📍 ${wilaya}</h2>
        <div class="grid">
    `;

    wilayaLeads.forEach(lead => {
        let scoreStr = (lead.Googlemapsscore || '0').replace(',', '.');
        let score = parseFloat(scoreStr);
        if (isNaN(score)) score = 0;
        const displayScore = Math.min(5, Math.max(0, score));
        const roundedScore = Math.round(displayScore);
        const phone = lead.Phonenumber || '';
        let cleanPhone = phone.replace(/\D/g, ''); // Removes all spaces, dashes, +, and ()
        if (cleanPhone.startsWith('0')) {
            cleanPhone = '213' + cleanPhone.substring(1); // Handle Algerian local numbers
        }

        const generatedData = generatePitches(lead);
        const frenchRegions = ['alger', 'oran', 'constantine', 'blida', 'annaba', 'bejaia', 'paris', 'lyon', 'marseille', 'algeria', 'france'];
        const isFrench = frenchRegions.some(fr => wilaya.toLowerCase().includes(fr));
        
        const pitch = isFrench ? generatedData.pitches.fr : generatedData.pitches.en;
        
        let badgeClass = 'badge-blue';
        if (generatedData.badgeClass.includes('red-500')) badgeClass = 'badge-red';
        if (generatedData.badgeClass.includes('yellow-500') || generatedData.badgeClass.includes('orange-500')) badgeClass = 'badge-gold';
        
        const status = generatedData.status;

        const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(pitch)}`;

        sectionsHtml += `
            <div class="card" data-wilaya="${wilaya}" data-status="${status}">
                ${generatedData.priority ? `<span class="badge" style="background: rgba(168,85,247,0.2); color: #c084fc; border: 1px solid #a855f7;">⭐ PRIORITY</span>` : ''}
                <span class="badge ${badgeClass}">${status}</span>
                <div class="biz-name">${lead.Businessname}</div>
                <span class="phone" style="margin-bottom: ${lead.OwnerName ? '8px' : '15px'};">📞 ${lead.Phonenumber || 'No Phone'}</span>
                ${lead.OwnerName ? `<div style="font-size: 0.9rem; margin-bottom: 15px; color: #60a5fa;">👨‍💼 <b>${lead.OwnerName}</b></div>` : ''}
                
                <div class="score-row">
                    <span class="stars">${'★'.repeat(roundedScore)}${'☆'.repeat(Math.max(0, 5 - roundedScore))}</span>
                    <span class="rating-num">${score > 0 ? scoreStr : 'N/A'}</span>
                </div>

                <div class="pitch-preview">
                    "${pitch}"
                </div>

                <div class="actions">
                    ${phone ? `<a href="${waLink}" target="_blank" class="btn btn-wa">🚀 SEND VIA WHATSAPP</a>` : ''}
                    ${phone ? `<button onclick="copyMsg(this, \`${pitch.replace(/`/g, '\\`').replace(/\${/g, '\\${')}\`)" class="btn btn-copy">📋 COPY MESSAGE</button>` : ''}
                    ${lead.OwnerLinkedIn ? `<a href="${lead.OwnerLinkedIn}" target="_blank" class="btn btn-call" style="background:#0077b5; border:none; grid-column: span 2;">👨‍💼 OWNER LINKEDIN</a>` : ''}
                    ${lead.Instagramlink ? `<a href="${lead.Instagramlink}" target="_blank" class="btn btn-call" style="background:#E1306C; border:none;">📸 INSTAGRAM</a>` : ''}
                    ${lead.Linkedinlink ? `<a href="${lead.Linkedinlink}" target="_blank" class="btn btn-call" style="background:#0077b5; border:none;">🏢 LINKEDIN</a>` : ''}
                    ${phone ? `<a href="tel:${phone}" class="btn btn-call">📞 CALL</a>` : ''}
                </div>
            </div>
        `;
    });

    sectionsHtml += `</div></div>`;
  }

  const finalHtml = htmlStart + sectionsHtml + htmlEnd;
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  fs.writeFileSync(outputPath, finalHtml);
  console.log(`✅  Filterable Dashboard generated: ${outputPath}`);
}
