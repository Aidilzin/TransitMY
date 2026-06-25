# TransitMY — Malaysia Smart Transit Assistant for Tourists

TransitMY is a modern, responsive, and feature-rich web application designed to help tourists navigate the public transportation network in Malaysia. Built using React, Vite, TypeScript, Tailwind CSS, and Express, the application serves as a comprehensive transit hub, featuring simulated real-time tracking, an advanced route planner, interactive maps, and a built-in AI assistant powered by the Google Gemini API.

---

## 🌟 Key Features

### 1. Interactive 3D Isometric Station Map
* **Isometric 3D Canvas Rendering**: Located in the Station Maps tab, featuring a high-fidelity interactive map of KL Sentral.
* **50+ Real Shop Locations**: Mapped to grid coordinates for both Level 1 and Level 2, sourced from official floor plans.
* **Searchable Directory**: Full-text search and category filtering (Tickets, Food, Retail, ATM, Services, Transport, Facilities) dynamically highlights locations on the map.
* **Controls**: Pan, zoom (mouse wheel and screen controls), auto-fit centering, and floor switching (L1/L2) with automatic view resets.

### 2. Simulated GTFS-RT Live Arrival Tracking
* **Express Simulation Endpoint**: `/api/live-tracking` simulates live arrival data for KTM Komuter, LRT Kelana Jaya, MRT Kajang, KLIA Ekspres, and more.
* **Real-time Status Badges**: Displays dynamic statuses (e.g., "On Time", "Delayed", "Arriving") and active countdown ETAs.

### 3. Route & Journey Planner
* **Dynamic Routing**: An intuitive journey planner that calculates transit options between key stations in Malaysia, complete with step-by-step connections.

### 4. TransitMY AI Assistant
* **Google Gemini Integration**: A floating chatbot assistant powered by `gemini-2.5-flash` using the official `@google/genai` SDK.
* **Transit Expert**: Answer queries like directions, ticketing info, and commuter tips on the fly.

### 5. Multi-Language Support
* Fully translated UI supporting:
  * 🇬🇧 English
  * 🇲🇾 Bahasa Malaysia
  * 🇨🇳 Chinese (中文)
  * 🇮🇳 Tamil (தமிழ்)

### 6. Premium Theme Support
* Caches user preferences in `localStorage`.
* Detects system preferences (`prefers-color-scheme`) for seamless transitions.
* Custom-themed canvas overlay ensures high-contrast readability in both light and dark modes.

---

## 🛠️ Tech Stack

* **Frontend**:
  * React 19 (UI Components)
  * TypeScript (Type safety)
  * Vite 6 (Fast build tool and dev server)
  * Tailwind CSS (Utility-first styling)
  * Lucide React (Icons)
  * Motion (Micro-animations & transitions)
* **Backend**:
  * Express.js (API routing & proxy)
  * `@google/genai` (Official Google GenAI SDK for chatbot interactions)
  * `dotenv` (Environment configuration management)
  * `tsx` & `esbuild` (Fast TypeScript runner and bundle compiler)

---

## 📂 Project Directory Structure

```text
├── assets/                  # Static assets and graphics
├── src/
│   ├── components/
│   │   ├── JourneyPlanner.tsx    # Journey planner component & route visualization
│   │   └── KLSentralMap3D.tsx    # Isometric 3D floor map and directory panel
│   ├── utils/
│   │   └── planner.ts            # Route calculation helper functions
│   ├── App.tsx                   # Main application layout, state, and tabs
│   ├── data.ts                   # Static data (station lists, fares, UI translations)
│   ├── index.css                 # Custom CSS rules and Tailwind imports
│   ├── main.tsx                  # React DOM mounting
│   └── types.ts                  # Shared TypeScript interfaces
├── server.ts                # Express backend (API proxies, Gemini chatbot endpoint, live tracking simulator)
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
└── package.json             # Scripts and package dependencies
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js installed (v18+ recommended).

### 1. Installation
Clone the repository and install the project dependencies:
```bash
npm install
```

### 2. Environment Setup
Create a `.env.local` file in the root directory (you can copy `.env.example` as a starting point):
```bash
cp .env.example .env.local
```

Configure the environment variables in `.env.local`:
* **`GEMINI_API_KEY`**: Required for the TransitMY AI assistant chatbot to generate responses.
* **`APP_URL`**: The base URL where the app is hosted (e.g., `http://localhost:3000` or production URL).

Example `.env.local`:
```env
GEMINI_API_KEY="your_actual_gemini_api_key"
APP_URL="http://localhost:3000"
```

### 3. Running the App in Development
Start the Express server and Vite development environment:
```bash
npm run dev
```
The server will run on `http://localhost:3000` by default.

### 4. Building for Production
Build both the static frontend assets and bundle the Express server code:
```bash
npm run build
```
The production assets will be compiled into the `dist/` directory, and the backend server compiled into `dist/server.cjs`.

### 5. Running in Production
Once built, launch the production server:
```bash
npm start
```

---

## 📜 Available Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| `npm run dev` | `tsx server.ts` | Runs the development server (express + vite dev setup) |
| `npm run build` | `vite build && esbuild ...` | Compiles the frontend assets and bundles backend into `dist/server.cjs` |
| `npm run build:static` | `vite build` | Compiles static frontend files only |
| `npm run start` | `node dist/server.cjs` | Starts the production-built Express server |
| `npm run clean` | `rm -rf dist server.js` | Removes build directories and temporary outputs |
| `npm run lint` | `tsc --noEmit` | Performs TypeScript compiler syntax/type check |

---

## 📈 Recent Updates
See the [CHANGELOG.md](CHANGELOG.md) for detailed descriptions of recent milestones, including the complete overhaul of the 3D map engine, responsive directory updates, status badges, and multi-language enhancements.
