# StoneLink — Unified Operations & Architecture Guide
> **Stepping Stones Agency** | Master Operational Reference & CLI Cheat Sheet

---

## ⚡ Quick CLI Cheat Sheet

| Action | Command | Description |
| :--- | :--- | :--- |
| **Start Web App** | `npm run dev` | Launches Next.js App Router on `http://localhost:3000` |
| **Start Desktop App** | `npm run tauri dev` | Compiles & launches native Tauri v2 cross-platform desktop app |
| **Run Scraper (Headless)** | `npm run bot -- --query "Dentiste" --area "Alger" --count 20` | Scrapes Google Maps silently and syncs leads directly to CRM |
| **Run Scraper (Visible/Headed)** | `npm run bot -- --query "Voyage" --area "Oran" --count 15 --headed` | Launches visible Chromium browser with stealth & humanized mouse curves |
| **Instagram Scraper** | `npm run bot:instagram` | Runs the Instagram X-Ray Google dorking engine |
| **Ouedkniss Scraper** | `npm run bot:ouedkniss` | Runs the specialized Algerian classifieds scraper |
| **Sync Database** | `npm run sync:atlas` | Upserts all 702 leads to MongoDB Atlas when internet access is enabled |
| **Re-migrate Data** | `npm run migrate` | Compiles `data/all_leads.json` into resilient local store (`src/data/prospects.ts`) |

---

## 🧭 Application Navigation

The unified platform unites all tools in a single header navigation:

1. **Cockpit (`/`)**: High-level agency KPIs, conversion trends, and instant domain performance auditor.
2. **CRM & Pipeline (`/crm`)**: 702+ prospect management, interactive Kanban stages (`Nouveaux`, `Contactés`, `Prototypes`, `Fermés`), notes, and CSV importer.
3. **Studio d'Appel (`/call`)**: WebRTC browser softphone via Twilio, real-time Claude 3.5/3.7 SSE script generation, and live objection counter-cards.
4. **Campagnes (`/campaigns`)**: Lead harvesting history grouped by Wilaya and niche, with CSV exports and the one-click **"Nouveau Scan"** modal.
5. **Contrats & Devis (`/contracts`)**: Multi-step quote generator using Square Port-Saïd black market exchange rates (DZD 250/270/310), development hour estimations, and contract drafting.
6. **Analytics (`/analytics`)**: Conversion telemetry, regional distribution (Alger, Oran, Constantine, etc.), and technical website vulnerability detection.
7. **Mirror Sites (`/mirror/[prospectId]`)**: Personalized client demo with running millisecond "Cost of Inaction" ticker and interactive ROI growth calculators.
8. **Sovereign Vault (`/vault/[prospectId]`)**: Secure client portal with project milestones, contract downloads, and real-time e-signature tracking.
9. **Paramètres (`/settings`)**: Agency profiles, API keys, and custom pitch templates.

---

## 🔄 End-to-End Agency Workflow

```
1. ACQUIRE (Bot-Se Engine)
   • Run `npm run bot` or click "Nouveau Scan" in /campaigns
   • Stealth Playwright crawls Maps/IG/Ouedkniss & extracts emails/socials
   • Evaluates SSL, speed, meta tags, and generates website scores
                 │
                 ▼
2. ORCHESTRATE (CRM & Pricing)
   • Leads land automatically in /crm without manual CSV transfers
   • Run /contracts to generate quotes in DZD/EUR based on black market rates
                 │
                 ▼
3. ENGAGE (Calling Studio)
   • Launch WebRTC softphone in /call
   • Real-time Claude AI stream delivers custom pitches (Algerian Darija, FR, AR, EN)
   • Overcome objections with one-click counter-arguments
                 │
                 ▼
4. CONVERT (Mirror Site & Urgency)
   • Send prospect personalized link: `/mirror/[prospectId]`
   • Live ticker shows estimated revenue lost per second
                 │
                 ▼
5. CLOSE & DELIVER (Sovereign Vault)
   • Prospect logs into `/vault/[prospectId]`
   • E-sign official contracts & track project milestones
```

---

## 🔐 Environment Configuration (`.env.local`)

Ensure `.env.local` at the root contains:

```ini
# AI Engines
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# Database
MONGODB_URI=mongodb://steppingstonesdevcontact_db_user:...@ac-za5lc36-shard-00-00.ggmoybl.mongodb.net:27017/.../stonelink?ssl=true&authSource=admin

# Telephony (Twilio WebRTC)
TWILIO_ACCOUNT_SID=AC...
TWILIO_API_KEY=SK...
TWILIO_API_SECRET=...
TWILIO_TWIML_APP_SID=AP...

# Security & App
JWT_SECRET=...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

> **Note on MongoDB Atlas**: If your IP address changes or is not whitelisted in Atlas, StoneLink automatically switches to **Mode Résilient Local**, keeping all 702 prospects, notes, and stages fully active in memory and on disk. Run `npm run sync:atlas` once network access is granted.

---

## 👥 Git Workflow for Abdelhadi & Mohamed

Both partners work on this single repository (`StoneLink`):

1. **Pull before starting**:
   ```bash
   git pull origin main
   ```
2. **Work on modular branches**:
   * Scraper updates: `git checkout -b feat/scraper-improvements`
   * Telephony / UI updates: `git checkout -b feat/call-studio`
3. **Commit & Push**:
   ```bash
   git add .
   git commit -m "feat: description of work"
   git push origin <branch-name>
   ```
4. Merge into `main` after verification.
