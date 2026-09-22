# StoneLink — AI Sales Cockpit & Outreach Platform

> **Stepping Stones Agency** | Modern B2B Sales Cockpit, Lead Intelligence & High-Conversion Outreach Platform.

StoneLink is a full-stack, enterprise-grade sales cockpit designed for high-velocity agency prospecting, automated website auditing, AI-driven pitch generation, interactive softphone dialing, and frictionless client deal closure.

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Project Structure](#4-project-structure)
5. [Installation & Setup](#5-installation--setup)
6. [Usage](#6-usage)
7. [Features](#7-features)
8. [API Documentation](#8-api-documentation)
9. [Database](#9-database)
10. [Authentication & Security](#10-authentication--security)
11. [Configuration & Environment Variables](#11-configuration--environment-variables)
12. [Development Guide](#12-development-guide)
13. [Deployment](#13-deployment)
14. [Troubleshooting](#14-troubleshooting)
15. [Dependencies & Integrations](#15-dependencies--integrations)
16. [Future Improvements & Technical Debt](#16-future-improvements--technical-debt)
17. [Complete Project Flow](#17-complete-project-flow)
18. [⚡ Quick Start](#-quick-start)

---

## 1. 🎯 Project Overview

### What StoneLink Does
StoneLink is a specialized B2B sales acceleration platform built for agency founders and sales teams selling high-ticket digital solutions (web redos, custom ERPs, CRO optimization). It streamlines prospecting, automates real-time website performance auditing, streams personalized AI sales scripts during calls, deploys custom branded prototype preview sites ("Mirror Sites"), and tracks client document interactions in a Sovereign Vault.

### Main Purpose & Objectives
- **Eliminate Cold Calling Hesitation**: Equip sales reps with real-time, AI-streamed scripts, structured calling phases, and interactive objection handling matrices tailored to the prospect's exact audit metrics.
- **Quantify Prospect Financial Pain**: Automatically query Google PageSpeed Insights to generate Lighthouse performance scores (SEO, Speed, Mobile) and compute lost monthly revenue (€/$) for target domains.
- **Accelerate Time-to-Demo**: Dynamically customize industry prototype templates (Dental, Travel, Law, Real Estate) and deploy personalized preview links ("Mirror Sites") in seconds.
- **Full Engagement Transparency**: Monitor email open rates via transparent 1x1 GIF tracking pixels, track document consultations in the client vault, and capture e-signatures in real time through an integrated monospace terminal feed.

### Problems Solved
| Problem | StoneLink Solution |
| :--- | :--- |
| Generic, unpersuasive cold call scripts | Dynamic Claude 3.5 Haiku SSE script generation personalized by domain audit metrics & niche |
| Vague sales value propositions | Real-time calculation of estimated monthly revenue loss (€/$) based on Lighthouse scores |
| High friction in delivering proposals | Built-in Sovereign Vault, WebRTC softphone dialer, and automated email outreach sequences |
| Lack of post-pitch visibility | Transparent 1x1 GIF open tracking, Vault document view detection & instant deal conversion alerts |

---

## 2. 🏗️ Architecture

StoneLink utilizes a hybrid web/desktop architecture combining Next.js 15 (App Router with Turbopack), serverless API routes, MongoDB Atlas, Anthropic Claude AI, Twilio Voice WebRTC, and Tauri v2 cross-platform desktop bundling.

```
                  +-------------------------------------------------------+
                  |               Tauri v2 Desktop App                    |
                  |                (Cross-Platform GUI)                   |
                  +--------------------------+----------------------------+
                                             |
                                             v
+-------------------------------------------------------------------------------------------------+
|                                 Next.js 15 (App Router)                                         |
|                                                                                                 |
|  +--------------------+  +----------------------+  +---------------------+  +----------------+  |
|  |     Hero Cockpit   |  |   Calling Studio     |  |     CRM Pipeline    |  |  Sovereign     |  |
|  |    (Real-time Audit) |  | (WebRTC + AI Stream) |  |   (Kanban / Drawer) |  |  Vault         |  |
|  +---------+----------+  +----------+-----------+  +----------+----------+  +-------+--------+  |
|            |                        |                         |                     |           |
+------------|------------------------|-------------------------|---------------------|-----------+
             |                        |                         |                     |
             v                        v                         v                     v
+-------------------------------------------------------------------------------------------------+
|                                  Next.js API Routes / Services                                  |
|                                                                                                 |
|  /api/market-link   /api/call/script    /api/prospects    /api/forge         /api/tracking/*   |
|  /api/profiler      /api/call/token     /api/agent        /api/vault         /api/outreach/cron|
|  /api/analytics     /api/generate       /api/shadow       /api/terminal      /api/email/*      |
+-------+--------------------+-------------------+------------------+------------------+----------+
        |                    |                   |                  |                  |
        v                    v                   v                  v                  v
+---------------+    +---------------+   +---------------+  +---------------+  +---------------+
| Google        |    | Anthropic     |   | Twilio Voice  |  | MongoDB Atlas |  | SMTP / Mail   |
| PageSpeed API |    | Claude Models |   | WebRTC SDK    |  | Mongoose ORM  |  | (Hostinger)   |
+---------------+    +---------------+   +---------------+  +---------------+  +---------------+
```

### Communication Flow
1. **State & Frontend UI**: Global application state is managed using **Zustand** (`src/stores/useStoneStore.ts`) with optimistic local updates synced asynchronously to serverless API routes.
2. **AI Processing & Streaming**: Serverless API endpoints invoke Anthropic API (`claude-3-7-sonnet-20250219` and `claude-3-5-haiku-20241022`) using Server-Sent Events (SSE) for low-latency script delivery and structured JSON package generation.
3. **VoIP Telephony**: The browser requests a Twilio JWT Voice token via `/api/call/token` and establishes direct WebRTC audio streams to prospect phone numbers via Twilio TwiML webhooks (`/api/call/voice`).
4. **Database & Persistence**: Mongoose connects lazily to MongoDB Atlas for prospect management, multi-step sequence tracking, terminal event logging, and document vault storage.

---

## 3. 🛠️ Technology Stack

### Core Frameworks & Runtimes
- **Frontend Framework**: Next.js 15.1.0 (App Router, Turbopack, React 19)
- **Desktop Runtime**: Tauri v2.11 (Rust backend wrapper for cross-platform desktop compilation)
- **Language**: TypeScript (Strict Mode) & Node.js (v18+)

### Design System & UI
- **Styling**: Tailwind CSS v4 (`@import "tailwindcss"`)
- **Design Tokens**: Antigravity Quiet Luxury System (`#060610` Void background, `#c5a059` Gold accents, semi-transparent glass cards)
- **Animations**: Framer Motion 11.15 & GSAP 3.15 (ScrollTrigger)
- **Icons**: Lucide React
- **Typography**: Cormorant Garamond (Display/Titles) & Outfit (Body UI) via Google Fonts
- **Charts & Data Visualization**: Chart.js 4.5, Recharts 3.8

### State & Database
- **Global State**: Zustand 5.0 (with `persist` middleware)
- **Database**: MongoDB Atlas via Mongoose 9.6

### AI Engines & External Integrations
- **AI Models**: Anthropic SDK (`@anthropic-ai/sdk`) — Claude 3.7 Sonnet (`claude-3-7-sonnet-20250219`) & Claude 3.5 Haiku (`claude-3-5-haiku-20241022`)
- **Site Audit**: Google PageSpeed Insights API v5
- **VoIP Telephony**: `@twilio/voice-sdk` & `twilio` Node SDK
- **Email Transmission**: `nodemailer` (Hostinger / Custom SMTP) with 1x1 GIF open tracking
- **Validation**: Zod 3.24

---

## 4. 📂 Project Structure

```
StoneLink/
├── .env.local                    # Environment variables (API keys, DB URIs)
├── next.config.js                # Next.js configuration
├── package.json                  # Dependencies & npm scripts
├── postcss.config.mjs            # PostCSS configuration for Tailwind v4
├── tsconfig.json                 # TypeScript strict compiler configuration
│
├── ai-sandbox/                   # Express testing server for prompt engineering (Port 4000)
│   ├── routes/                   # Standalone prompt testing routes (critique, email, objection)
│   ├── services/                 # AI service wrappers (openai.js)
│   └── server.js                 # Standalone Express server entry point
│
├── forge/                        # Prototype engine templates & metadata
│   └── templates/                # Niche prototype templates (dental, travel)
│
├── instances/                    # Client deployment instance configurations
│   ├── dental/                   # Dental instance token configurations (zekri.json)
│   └── travel/                   # Travel instance token configurations (parfait.json)
│
├── registry/                     # AI Prompt Registry templates
│   └── registry.json             # Structured system/user prompt definitions
│
├── scripts/                      # Utility & dataset generation scripts
│   └── gen_mock.js               # CSV lead list parser -> mockData.ts generator
│
├── src-tauri/                    # Tauri v2 Desktop Wrapper (Rust)
│   ├── capabilities/             # Application permissions & security caps
│   ├── src/                      # Rust codebase (main.rs, lib.rs)
│   └── tauri.conf.json           # Tauri desktop window & build configuration
│
└── src/                          # Next.js Application Core
    ├── app/                      # App Router Pages & API Routes
    │   ├── api/                  # Serverless API endpoints
    │   │   ├── agent/            # Context-aware AI Co-pilot assistant
    │   │   ├── analytics/        # CRO performance metrics & AI insights generator
    │   │   ├── call/             # Voice WebRTC token, TwiML, script generation
    │   │   │   ├── script/       # Claude SSE call script generator
    │   │   │   ├── token/        # Twilio WebRTC JWT token generator
    │   │   │   └── voice/        # Twilio TwiML voice handler webhook
    │   │   ├── email/            # Email generation & SMTP send via Nodemailer
    │   │   │   ├── generate/     # AI email copywriter (Claude Sonnet)
    │   │   │   └── send/         # SMTP email dispatcher with tracking pixel
    │   │   ├── forge/            # Prototype customization deployer
    │   │   ├── generate/         # Commercial package generator (Site, Logo, Script)
    │   │   ├── market-link/      # PageSpeed website auditor & loss calculator
    │   │   ├── outreach/cron/    # Sequence execution cron job
    │   │   ├── profiler/         # Psychological profiling module
    │   │   ├── prospects/        # Prospect CRUD API ([id] route included)
    │   │   ├── prototypes/       # Prototype catalog & customizer (/customize)
    │   │   ├── shadow/           # Intent signal detection (Shadow Intelligence)
    │   │   ├── terminal/         # System event feed API
    │   │   ├── tracking/         # Analytics tracking pixels & event handlers
    │   │   │   ├── email/        # 1x1 transparent GIF open pixel
    │   │   │   ├── mirror/contact/ # Mirror page callback request tracker
    │   │   │   └── vault/        # Document view & e-signature tracking
    │   │   └── vault/            # Document vault file management
    │   ├── call/                 # Calling Studio Page (/call)
    │   ├── crm/                  # Lead CRM Pipeline Page (/crm)
    │   ├── mirror/[prospectId]/  # Prospect Mirror Landing Page (/mirror/PROSPECT_ID)
    │   ├── settings/             # System Settings Page (/settings)
    │   ├── vault/[prospectId]/   # Prospect Sovereign Vault Page (/vault/PROSPECT_ID)
    │   ├── globals.css           # Global Tailwind CSS v4 & custom variables
    │   ├── layout.tsx            # App Root Layout
    │   └── page.tsx              # Cockpit Landing Page (Hero + Real-time Scanner)
    │
    ├── components/               # React Components
    │   └── ui/                   # Reusable Design System Components
    │       ├── CallTimer.tsx     # Live calling timer
    │       ├── CircularScore.tsx # Animated SVG radial score meter
    │       ├── ColorSwatch.tsx   # Color palette indicator
    │       ├── CopyButton.tsx    # One-click clipboard copy
    │       ├── GlassCard.tsx     # Glassmorphic panel wrapper
    │       ├── GoldButton.tsx    # Primary CTA gold shimmer button
    │       ├── Modal.tsx         # Accessible overlay modal
    │       ├── ScoreGauge.tsx    # Horizontal gauge bar
    │       ├── SkeletonLoader.tsx# Loading state skeleton wrapper
    │       ├── StatusBadge.tsx   # Color-coded badge pills
    │       ├── TabBar.tsx        # Segmented navigation tabs
    │       ├── TerminalLine.tsx  # Monospace console log line
    │       └── custom/           # Compound UI components (Navbar, Toast, InputField)
    │
    ├── data/                     # Mock data seeds (prospects.ts)
    ├── hooks/                    # Custom React Hooks (useCallStore.ts, useReminderEngine.ts, useUIStore.ts)
    ├── lib/                      # Core Utilities & Helpers
    │   ├── constants.ts          # Color tokens, constants, stage metadata
    │   ├── mockData.ts           # Pre-generated prospect dataset
    │   ├── mongodb.ts            # Mongoose connection cached instance
    │   ├── pipelineConfig.ts     # Stages & pipeline helper definitions
    │   ├── utils.ts              # General utilities (clsx, escapeHtml)
    │   ├── validators.ts         # Zod schemas for input validation
    │   └── variants.ts           # Framer Motion animation variants
    │
    ├── models/                   # Mongoose Database Models
    │   ├── Prospect.ts           # Main Prospect schema (leads, activities, emails, notes)
    │   ├── Sequence.ts           # Multi-step email outreach sequence schema
    │   ├── TerminalEvent.ts      # System feed log event schema
    │   └── Vault.ts              # Sovereign Document Vault schema
    │
    ├── services/                 # Service Abstractions (ai.ts, db.ts)
    ├── stores/                   # Zustand Global Stores
    │   ├── notificationStore.ts  # Application notification manager
    │   └── useStoneStore.ts      # Primary store (prospects, active module, terminal)
    └── types/                    # TypeScript Type Definitions
        ├── index.ts              # Core UI types
        ├── pipeline.ts           # Prospect, CallScript, Activity, DealStage types
        └── prototypes.ts         # Prototype catalog & resolver types
```

---

## 5. ⚡ Installation & Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** (v9+) or **pnpm** (v8+)
- **MongoDB**: A running local instance (`mongodb://localhost:27017`) or a MongoDB Atlas connection URI.
- **Rust & Cargo**: Required **only** if building the Tauri desktop application.

### Step-by-Step Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mohslimm/StoneLink.git
   cd StoneLink
   ```

2. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create `.env.local` in the root directory:
   ```bash
   cp .env.local.example .env.local
   ```
   Fill in the required configuration keys (refer to [Section 11](#11-configuration--environment-variables)).

4. **Seed Mock Prospect Data (Optional)**:
   ```bash
   node scripts/gen_mock.js
   ```

5. **Start the Next.js Development Server**:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:3000`.

6. **Launch as Desktop App via Tauri (Optional)**:
   ```bash
   npm run tauri dev
   ```

---

## 6. 🚀 Usage

### 1. Analyzing a New Lead Domain
1. Open `http://localhost:3000`.
2. Scroll to the **Nouveau lead** section on the hero page.
3. Enter a target website URL (e.g., `https://exemple-clinic.fr`) and click **Analyser**.
4. The system runs a PageSpeed audit, calculates scores, estimates monthly loss, and generates an initial pitch script.

### 2. Conducting an AI-Assisted Cold Call
1. Navigate to `/call` or click **Lancer un appel** on any prospect.
2. Select a prospect from the sidebar list.
3. Click **Lancer l'Appel**. If Twilio WebRTC credentials are configured, audio connects directly in-browser.
4. Follow the **Step-by-Step AI Script** (Opener -> Audit Reveal -> Pitch -> Social Proof -> Transition -> Close).
5. Use the **Objection Handling Matrix** to counter prospect resistance in real time.
6. Select the **Call Outcome** (RDV pris, Rappeler, Prototype demandé, Pas intéressé) to record notes and automatically advance the pipeline stage.

### 3. Managing Prospects in the CRM
1. Navigate to `/crm`.
2. Switch between **Dashboard**, **Kanban Board**, and **Table View**.
3. Filter prospects by Niche (Dental, Travel, Law, etc.), Priority (Hot, Warm, Cold), Country, or Deal Stage.
4. Click any prospect row to open the **Detail Drawer** to edit notes, view activity history, or send custom emails.

### 4. Customizing Industry Prototypes & Mirror Sites
1. Open a prospect's drawer in `/crm` or visit `/call`.
2. Click **Générer le Prototype**.
3. Select a base prototype template (e.g., `dental-zekri` or `travel-parfait`).
4. Apply custom branding tokens (primary colors, company tagline, logo).
5. Deploy the customized preview link to share `/mirror/[prospectId]` directly with the prospect.

### 5. Document Vault & Closing Deals
1. Navigate to `/vault/[prospectId]` to manage proposals, audit reports, and contracts.
2. Upload new documents or select existing templates.
3. Share the secure Vault URL with the prospect.
4. When the prospect views the document or signs the contract via `/api/tracking/vault/sign`, the system logs a `CLOSED_WON` event in the terminal feed.

---

## 7. 🌟 Features

### 1. Live Audit & Financial Loss Engine (`/api/market-link`)
- Queries Google PageSpeed Insights for Lighthouse performance metrics across Mobile, SEO, and Speed.
- Includes a deterministic fallback hash algorithm ensuring offline compatibility.
- Calculates estimated monthly revenue loss (€/$) based on conversion drop-offs.

### 2. Streaming AI Sales Script Generator (`/api/call/script`)
- Powered by Anthropic Claude 3.5 Haiku via Server-Sent Events (SSE).
- Streams 6 structured script phases tailored to prospect-specific metrics.
- Provides real-time objection handlers for price, existing provider, timing, and authority.

### 3. Twilio WebRTC Softphone (`/api/call/token`, `/api/call/voice`)
- Embedded in-browser softphone utilizing `@twilio/voice-sdk`.
- Generates secure JWT access tokens for outbound dialing.
- Includes call duration timers, mute, and instant outcome logging.

### 4. Psychological Profiler & Shadow Intelligence (`/api/profiler`, `/api/shadow`)
- Analyzes prospect context to infer decision-maker personality types (e.g., Pragmatic ROI-focused vs. Visionary).
- Monitors buyer intent signals (LinkedIn activity, funding announcements, repeat site visits) and automatically upgrades prospect priority to `HOT`.

### 5. Commercial Package Engine (`/api/generate`)
- Generates complete sales packages using Claude 3.7 Sonnet.
- Returns site adaptation guidelines, color palette recommendations, brand logo concepts, and pitch points in structured JSON format.

### 6. Prototype Forge & Client Mirror Sites (`/api/prototypes/customize`)
- Dynamic URL parameter injection engine to convert template prototypes into custom branded client previews.
- Client-facing Mirror Landing Page (`/mirror/[prospectId]`) with interactive callback buttons.

### 7. Sovereign Vault & Document E-Signature (`/vault/[prospectId]`, `/api/tracking/vault/sign`)
- Secure client portal for contract and proposal distribution.
- Real-time document open alerts and client e-signature recording that transitions deals to `CLOSED_WON`.

### 8. Automated Email Sequences & Tracking (`/api/email/send`, `/api/outreach/cron`)
- Multi-step email campaign executor run via cron route.
- Inserts transparent 1x1 GIF pixels (`/api/tracking/email`) into outgoing HTML mail to track open rates in real time.

### 9. Terminal Log Feed (`/api/terminal`)
- Monospace real-time event log tracking system actions (scans, email opens, call logs, deal closures, intent signals).

---

## 8. 📡 API Documentation

### Prospect Management Endpoints

#### `GET /api/prospects`
Retrieves a paginated list of prospects with optional search and filtering.
- **Query Parameters**:
  - `niche` (string): Filter by niche (`dental`, `travel`, `law`, etc. or `all`).
  - `stage` (string): Filter by deal stage (`new`, `to_call`, `interested`, `closed_won`, etc.).
  - `priority` (string): Filter by priority (`hot`, `warm`, `cold`).
  - `country` (string): Filter by country code (`FR`, `DZ`, `CA`, etc.).
  - `search` (string): Search term matching company name, contact, email, or city.
  - `limit` (number, default: 100): Page limit.
  - `offset` (number, default: 0): Page offset.
- **Response** (200 OK):
  ```json
  {
    "data": [ ...prospects ],
    "meta": { "total": 42, "limit": 100, "offset": 0, "hasMore": false }
  }
  ```

#### `POST /api/prospects`
Creates a new prospect record after Zod validation and email deduplication check.
- **Body**: See `ProspectSchema` in `src/lib/validators.ts`.
- **Response** (201 Created):
  ```json
  { "data": { "id": "67...", "companyName": "...", "email": "..." } }
  ```
- **Error Responses**: `400 Bad Request` (Validation error), `409 Conflict` (Email exists), `500 Internal Server Error`.

#### `GET /api/prospects/[id]`
Retrieves a single prospect by MongoDB ObjectId.

#### `PATCH /api/prospects/[id]`
Updates prospect attributes (e.g., stage, priority, notes).

#### `DELETE /api/prospects/[id]`
Removes a prospect record from the database.

---

### Intelligence & AI Endpoints

#### `POST /api/market-link`
Audits a domain's performance and estimates financial loss.
- **Body**: `{ "name": "Clinic X", "website": "https://clinic-x.fr", "niche": "dental" }`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "audit": {
      "companyName": "Clinic X",
      "website": "https://clinic-x.fr",
      "lighthouseScore": 38,
      "estimatedLoss": 3400,
      "scores": { "seo": 45, "performance": 35, "mobile": 35 },
      "issues": [ "Temps de réponse serveur excessif (> 600ms)" ],
      "auditSummary": "..."
    }
  }
  ```

#### `POST /api/call/script`
Generates a multi-step call script via Claude 3.5 Haiku SSE.
- **Body**: `{ "prospectId": "123", "companyName": "Dental Clinic", "contactName": "Dr. Smith", "niche": "dental", "city": "Paris", "country": "FR", "lighthouseScore": 34, "estimatedLoss": 2500 }`
- **Response**: Server-Sent Events stream (`text/event-stream`).

#### `POST /api/profiler`
Generates a psychological profile and pain point breakdown using Claude 3.7.
- **Body**: `{ "prospectId": "PROSPECT_OBJECT_ID" }`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "profile": {
      "decisionMakerType": "Pragmatique ROIste",
      "estimatedPains": [ "Perte de visibilité mobile", "Conversion faible" ],
      "profilerSummary": "..."
    }
  }
  ```

#### `POST /api/generate`
Generates a full commercial package (Site adaptation, logo concept, script) via Claude 3.7.
- **Body**: `{ "niche": "dental", "name": "Cabinet Zekri", "city": "Alger", "lighthouseScore": 38, "estimatedLoss": 2400 }`
- **Response** (200 OK): `{ "siteAdaptation": { ... }, "logoConcept": { ... }, "callScript": { ... } }`

#### `POST /api/agent`
Sends user prompt and active prospect context to the AI Co-pilot assistant.
- **Body**: `{ "message": "Rédige un email de relance", "history": [], "activeProspect": { ... } }`
- **Response** (200 OK): `{ "message": "Bonjour..." }`

#### `GET /api/analytics`
Calculates pipeline stats and generates 3 strategic insights via Claude 3.7.
- **Response** (200 OK): `{ "success": true, "metrics": { ... }, "insights": [ ... ] }`

---

### Telephony & Outreach Endpoints

#### `POST /api/call/token`
Generates a Twilio WebRTC Voice access token for browser calling.
- **Body**: `{ "identity": "agent-user" }`
- **Response** (200 OK): `{ "success": true, "token": "JWT_TOKEN", "identity": "agent-user" }`

#### `POST /api/call/voice`
Twilio TwiML voice webhook handling outbound call dialing.

#### `POST /api/email/generate`
Generates personalized email subject, text, and HTML using Claude Sonnet.
- **Body**: `{ "prospect": { "id": "123", "companyName": "...", "email": "..." }, "previewUrl": "..." }`
- **Response** (200 OK): `{ "subject": "...", "bodyText": "...", "bodyHtml": "..." }`

#### `POST /api/email/send`
Dispatches HTML email with embedded 1x1 tracking pixel via Nodemailer SMTP.
- **Body**: `{ "to": "client@example.com", "subject": "...", "bodyHtml": "...", "bodyText": "...", "prospectId": "123" }`
- **Response** (200 OK): `{ "emailId": "...", "sentAt": "...", "simulated": false }`

#### `GET /api/outreach/cron`
Executes active multi-step email sequences based on step day offsets.

---

### Tracking, Vault & Prototype Endpoints

#### `GET /api/tracking/email?id=EMAIL_ID&prospectId=PROSPECT_ID`
Returns transparent 1x1 GIF pixel and marks email status as `opened` in MongoDB.

#### `POST /api/tracking/vault`
Logs document viewing in Vault and updates prospect stage.

#### `POST /api/tracking/vault/sign`
Marks contract as signed, updates prospect stage to `closed_won`, and logs deal status.

#### `POST /api/tracking/mirror/contact`
Handles prospect callback request from Mirror site and upgrades priority to `HOT`.

#### `GET /api/vault?prospectId=ID` & `POST /api/vault`
Manages prospect document upload and file consultation records.

#### `POST /api/forge`
Updates prospect with custom prototype URL and advances stage to `prototype_ready`.

#### `GET /api/terminal` & `POST /api/terminal`
Retrieves recent system events or logs new terminal feed entries.

---

## 9. 🗄️ Database

StoneLink utilizes MongoDB Atlas managed via Mongoose 9. Database models are located in `src/models/`.

### 1. `Prospect` Schema (`src/models/Prospect.ts`)
| Field | Type | Options | Description |
| :--- | :--- | :--- | :--- |
| `companyName` | String | Required | Company name |
| `contactName` | String | Required | Key decision maker name |
| `email` | String | Required, Indexed | Primary email address |
| `phone` | String | Optional | Contact phone number |
| `website` | String | Optional | Domain URL |
| `niche` | String | Required | Industry niche (`dental`, `travel`, `law`, etc.) |
| `country` | String | Required | Country code (`FR`, `DZ`, `CA`, etc.) |
| `city` | String | Required | City location |
| `stage` | String | Default: `'new'` | Pipeline stage (`new`, `to_call`, `interested`, `closed`, etc.) |
| `priority` | String | Default: `'cold'` | Priority rank (`hot`, `warm`, `cold`) |
| `estimatedDealValue`| Number | Optional | Contract value (€/$) |
| `customizedPrototypeUrl` | String | Optional | Deployed preview URL |
| `notes` | Array | `NoteSchema` | Call notes and AI profiler summaries |
| `emails` | Array | `EmailSchema` | Sent email history with open/click statuses |
| `activities` | Array | `ActivitySchema` | Audit trail of stage transitions |
| `aiAssets` | Mixed | Optional | Generated site adaptations, logo concepts & scripts |

### 2. `Sequence` Schema (`src/models/Sequence.ts`)
Tracks automated email sequence campaigns per prospect, containing an array of steps with `dayOffset`, `subjectTemplate`, `bodyTemplate`, and `executed` flag.

### 3. `TerminalEvent` Schema (`src/models/TerminalEvent.ts`)
Stores real-time system feed log entries (`scan`, `detection`, `generation`, `success`, `alert`, `deploy`, `info`, `error`, `warning`).

### 4. `Vault` Schema (`src/models/Vault.ts`)
Manages client document records (`proposal`, `contract`, `invoice`, `audit`) along with document view timestamps and optional password hashes.

---

## 10. 🔒 Authentication & Security

### Security Practices
- **Input Validation**: All API request bodies are parsed using Zod schemas (`src/lib/validators.ts`) prior to database interactions.
- **XSS Prevention**: User-supplied input strings in custom prototypes and emails are sanitized via HTML entity escaping routines (`escapeHtml`).
- **Secret Isolation**: Database URIs, API keys, and JWT secrets are loaded strictly from `process.env` on server routes and never exposed to the client bundle.
- **Database Query Injection Safeguards**: Mongoose schema sanitization and parameterized queries prevent MongoDB query injection.

---

## 11. ⚙️ Configuration & Environment Variables

Create a `.env.local` file in the root directory.

### Environment Variable Matrix

| Variable Name | Required? | Description | Example / Placeholder |
| :--- | :---: | :--- | :--- |
| `MONGODB_URI` | **Yes** | MongoDB Atlas connection URI | `mongodb+srv://user:pass@cluster.mongodb.net/stonelink` |
| `ANTHROPIC_API_KEY` | **Yes** | Anthropic Claude API Key | `sk-ant-api03-your-key-here` |
| `JWT_SECRET` | **Yes** | Secret key for JWT signing | `your-secure-random-jwt-secret` |
| `NEXT_PUBLIC_APP_URL` | Optional | Application URL for tracking pixels | `http://localhost:3000` |
| `NEXT_PUBLIC_BASE_URL` | Optional | Base URL for dynamic prototype links | `http://localhost:3000` |
| `GOOGLE_PAGESPEED_API_KEY` | Optional | Google PageSpeed Insights API Key | `AIzaSyYourPageSpeedKey` |
| `TWILIO_ACCOUNT_SID` | Optional | Twilio Account SID | `ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` |
| `TWILIO_API_KEY` | Optional | Twilio API Key SID | `SKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` |
| `TWILIO_API_SECRET` | Optional | Twilio API Key Secret | `your_twilio_api_secret` |
| `TWILIO_TWIML_APP_SID` | Optional | Twilio TwiML Application SID | `APXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` |
| `TWILIO_CALLER_ID` | Optional | Verified Twilio Caller ID Phone Number | `+33123456789` |
| `SMTP_HOST` | Optional | Outgoing SMTP host server | `smtp.hostinger.com` |
| `SMTP_PORT` | Optional | Outgoing SMTP server port | `465` |
| `SMTP_USER` | Optional | Outgoing SMTP email address | `contact@yourdomain.com` |
| `SMTP_PASS` | Optional | Outgoing SMTP email password | `your_smtp_password` |

> ⚠️ **CAUTION**: Never commit `.env.local` or raw API credentials to version control.

---

## 12. 💻 Development Guide

### Coding Conventions & Guidelines
- **Framework Architecture**: Use React 19 Client Components (`"use client"`) only when interactivity (hooks, state) is required; keep data fetching in Server Components or API routes.
- **State Management**: Manage global state via **Zustand** stores (`src/stores/useStoneStore.ts`). Avoid using React Context API.
- **Styling**: Use utility classes from **Tailwind CSS v4**. Maintain design token compliance (`--gold-500`, `--bg-void`, dark luxury theme).
- **TypeScript**: Strict mode enabled. Do not use `any` or `@ts-ignore`.
- **Async & Cleanup**: Always include cleanup functions and `AbortController` when executing asynchronous fetch operations inside `useEffect`.

### Useful Commands

```bash
# Start Next.js development server with Turbopack
npm run dev

# Run Next.js production build
npm run build

# Start production server after building
npm run start

# Run ESLint validation
npm run lint

# Launch Tauri Desktop Dev Window
npm run tauri dev

# Package Desktop Executable via Tauri
npm run tauri build
```

---

## 13. 🚢 Deployment

### Deploying to Vercel (Web Application)
1. Push your repository to GitHub / GitLab.
2. Import the project into the Vercel Dashboard.
3. In Project Settings, select **Next.js** framework preset.
4. Add all environment variables from `.env.local` to the Vercel Environment Variables section.
5. Deploy. Vercel automatically detects Next.js App Router API routes.

### Building Desktop Executables (Tauri)
To build standalone cross-platform desktop executables (Windows `.msi`/`.exe`, macOS `.dmg`, Linux `.AppImage`):
1. Ensure Rust toolchain is installed (`rustup`).
2. Execute build command:
   ```bash
   npm run tauri build
   ```
3. Compiled installers will be output to `src-tauri/target/release/bundle/`.

---

## 14. 🔧 Troubleshooting

### Common Issues & Solutions

#### 1. MongoDB Connection Timeout
- **Symptom**: API routes fail with 500 error: `MongooseError: Operation buffering timed out`.
- **Cause**: IP address not whitelisted in MongoDB Atlas or invalid `MONGODB_URI`.
- **Solution**: Add current IP to MongoDB Atlas Network Access whitelist or set to `0.0.0.0/0`.

#### 2. Anthropic API Key Error / Script Generation Fails
- **Symptom**: `/api/call/script` or `/api/generate` returns 500 error or static fallback response.
- **Cause**: `ANTHROPIC_API_KEY` missing or expired in `.env.local`.
- **Solution**: Verify `ANTHROPIC_API_KEY` in `.env.local` and ensure your Anthropic account has active credits.

#### 3. Twilio WebRTC Audio Issues
- **Symptom**: Clicking "Lancer l'Appel" shows configuration error.
- **Cause**: Missing Twilio credentials or blocked browser microphone permission.
- **Solution**: Confirm `TWILIO_ACCOUNT_SID`, `TWILIO_API_KEY`, `TWILIO_API_SECRET`, and `TWILIO_TWIML_APP_SID` in `.env.local`. Ensure microphone permissions are granted in browser settings.

---

## 15. 🔗 Dependencies & Integrations

### Critical Packages
- **`next`**: React framework supporting SSR, App Router, and serverless API endpoints.
- **`mongoose` & `mongodb`**: Database connection object modeling for MongoDB Atlas.
- **`@anthropic-ai/sdk`**: Client SDK for requesting completions and SSE streaming from Claude 3.7 Sonnet and 3.5 Haiku models.
- **`@twilio/voice-sdk` & `twilio`**: WebRTC browser calling SDK and TwiML token generator.
- **`framer-motion` & `gsap`**: High-performance UI animation libraries.
- **`zustand`**: Lightweight global state management.
- **`zod`**: Schema validation for API payloads.
- **`nodemailer`**: Node.js SMTP email module.
- **`@tauri-apps/api` & `@tauri-apps/cli`**: Desktop windowing and build tools.

---

## 16. 🔮 Future Improvements & Technical Debt

### Identified Technical Debt & Open Work Items
1. **`ai-sandbox/server.js` Standalone Express App**:
   - *Status*: Minimal Express server with mock endpoint handlers (`res.json({ message: "..." })`).
   - *Improvement*: Connect sandbox server directly to the prompt templates defined in `registry/registry.json`.
2. **Empty Instance Configuration Files**:
   - *Status*: `instances/dental/zekri.json` contains an empty JSON object (`{}`).
   - *Improvement*: Populate instance configuration files with client token overrides.
3. **Database Migration Script**:
   - *Status*: `scripts/gen_mock.js` parses CSV files and writes static TypeScript to `src/lib/mockData.ts`.
   - *Improvement*: Extend script to support direct MongoDB database seeding via Mongoose.
4. **Empty API Directory Cleanup**:
   - *Status*: `src/app/api/ai` folder exists as an empty directory.
   - *Improvement*: Remove redundant directory or move AI endpoint handlers into it.

---

## 17. 🔄 Complete Project Flow

```
[ User Inputs Prospect URL ]
          │
          ▼
┌───────────────────────────┐      Google PageSpeed API
│  /api/market-link Audit   ├──────────────────────────────► [ Audit Metrics & Loss Calculated ]
└─────────┬─────────────────┘                                             │
          │                                                               │
          ▼                                                               ▼
┌───────────────────────────┐                                 ┌───────────────────────┐
│   Prospect Saved in DB    │                                 │ Psychological Profile │
│     (MongoDB Atlas)       │◄────────────────────────────────┤   (/api/profiler)     │
└─────────┬─────────────────┘                                 └───────────────────────┘
          │
          ▼
┌───────────────────────────┐
│  Calling Studio (/call)   │
│   Claude SSE Script Gen   │
└─────────┬─────────────────┘
          │
          ├───────────────────────────────────┐
          ▼                                   ▼
┌───────────────────────────┐       ┌───────────────────┐
│   Twilio WebRTC Softphone │       │  Send SMTP Email  │
│   Live Objection Matrix   │       │ (/api/email/send) │
└─────────┬─────────────────┘       └─────────┬─────────┘
          │                                   │
          └─────────────────┬─────────────────┘
                            │
                            ▼
               ┌─────────────────────────┐
               │  Custom Prototype Forge │
               │   (/api/prototypes)     │
               └────────────...──────────┘
                            │
                            ▼
               ┌─────────────────────────┐
               │  Mirror Site & Vault    │
               │  (/mirror & /vault)     │
               └────────────┬────────────┘
                            │
                            ▼
               ┌─────────────────────────┐
               │   Vault E-Signature     │
               │ (/api/tracking/vault)   │
               └────────────┬────────────┘
                            │
                            ▼
              ★ DEAL CLOSED WON (Status Updated) ★
```

---

## ⚡ Quick Start

Want to get StoneLink up and running in **under 2 minutes**? Follow these steps:

```bash
# 1. Clone repo & navigate into workspace
git clone https://github.com/mohslimm/StoneLink.git
cd StoneLink

# 2. Install dependencies
npm install

# 3. Create .env.local file
cat <<EOT > .env.local
MONGODB_URI=mongodb://localhost:27017/stonelink
ANTHROPIC_API_KEY=your_anthropic_api_key_here
JWT_SECRET=your_jwt_secret_here
EOT

# 4. Start Next.js development server
npm run dev
```

Open **`http://localhost:3000`** in your browser to access your AI Sales Cockpit! 🚀
