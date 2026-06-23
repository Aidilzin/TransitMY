# TransitMY — Changelog

All notable changes to this project are documented here, in reverse chronological order.  
Format: **[Date] – Description** with details on what was added/changed/fixed.

---

## [2026-06-23] – KL Sentral 3D Map Complete Overhaul

### Added
- **Map Zooming Capabilities**: Adds interactive mouse wheel scroll zooming and floating zoom control buttons (＋ and －) with auto-fit reset functions to scale the 3D canvas rendering dynamically.
- **Theme Persistence**: Caches chosen theme settings in `localStorage` and queries OS system preferences (`prefers-color-scheme`) on startup to ensure a consistent experience across Chrome, Firefox, and Edge.
- **50+ real KL Sentral shop locations** mapped to grid coordinates for both Level 1 and Level 2, sourced from klsentral.info floor plans:
  - Level 1: Guardian, 7-Eleven (×2), McDonald's, Starbucks, KFC, Chatime, Burger King, myNews.com, Secret Recipe, Ayam Penyet Express, Panettone, La Cucur, and more
  - Level 1: Bank Islam ATM, CIMB ATM, Maybank ATM, MEPS ATM; currency exchanges (CIMB, Major Exclusive, Merchantrade)
  - Level 1: KTM Komuter gates, KTM ERL gates, LRT Kelana Jaya gates (×2), KLIA Ekspres, KLIA Transit
  - Level 1: RapidKL Office, Tourist Information Centre, Tourist taxi counter, Dr. Locker (×2), Yes 4G (×2)
  - Level 2: AirAsia counter, KTM ETS ticket counter, Budget Taxi, iCard Student counter, Skypark Link waiting area, KFC, AmBank ATM
- **Searchable Directory panel** below the 3D map:
  - Full-text search across shop names and descriptions
  - Category filter dropdown (Tickets, Food, Retail, ATM, Services, Transport, Facilities)
  - Click any directory entry to highlight/select the shop on the 3D map
  - Shows count of results found
- **Category colour coding** with 7 distinct colours for different pod types
- **Category legend** row below the canvas for reference
- **Reset View button** to re-centre the map after panning and restore fits-to-screen zoom level.

### Fixed
- **Overlapping pods**: All pod grid coordinates completely redesigned with zero overlap — each shop has unique non-overlapping (x, y, w, h) grid placement
- **Map zoom/centering**: Implemented `computeOrigin()` auto-fit that calculates the bounding box of all pods and centres the view perfectly on canvas size — works on any screen
- **Floor switching**: Pan position resets to zero when switching floors so the new floor is always centred
- **Mobile layout**: Canvas height uses `clamp(280px, 45vw, 500px)` and info panel stacks vertically below the canvas on small screens. Floor buttons wrap. Directory grid adapts from 1→2→3 columns.
- **Single-floor view correctness**: Removed the "All Floors" stacked view that caused confusion; only L1 and L2 are navigable (no floor plan available for other levels)

### Changed
- Canvas background is now a dark navy with subtle grid pattern for all themes (better contrast for coloured pods)
- Pod wall height reduced from 22px → 18px for less visual clutter
- Floor slab is thinner (12px walls vs 18px before)
- Text on small pods now truncates at 16 characters and shows "…"
- Directory panel is collapsible (click header to open/close)
- Removed Masjid Jamek from station selector (no floor plan data exists for 3D rendering)
- Removed "Official Directory Map Image" tab (replaced by the new interactive map + directory)
- Removed old `renderInteractiveMap()` SVG function (~220 lines) and all related state (`selectedMapStation`, `selectedMapLevel`, `selectedMapNode`, `mapViewMode`)

---

## [2026-06-23] – Initial 3D Map Implementation

### Added
- New `KLSentralMap3D.tsx` component using HTML5 Canvas with isometric projection
- 3-floor stacked isometric view (L0/L1/L2) using painter's algorithm
- Drag-to-pan, scroll-to-zoom, click-to-select interaction
- Floor filter buttons (All Floors / L0 / L1 / L2)
- Info panel showing selected location description
- Vertical pillar connections between floors in stacked view

---

## [2026-06-23] – Theme & Live Tracking

### Fixed
- Theme toggle persistence fixed for Chrome/Edge (localStorage-based with `color-scheme` CSS property)
- Firefox theme override issue noted (browser-level OS theme may override in-app setting)

### Added
- Simulated GTFS-RT live train arrival data via `/api/live-tracking` Express endpoint
- Live arrival badges on station cards (On Time / Delayed / Arriving)
- Estimated time of arrival (ETA) countdown display

---

## [2026-06-23] – Initial Architecture Setup

### Added
- React + Vite + TypeScript frontend
- Express.js backend (`server.ts`) acting as a proxy and GTFS-RT simulation server
- Multi-language support (English, Bahasa Malaysia, Chinese, Tamil) via `UI_TRANSLATIONS` in `data.ts`
- Tabs: Live Arrivals, Route Planner, Live Routes, Pass & Card, Station Maps, Fares Matrix, Commuter Tips
- Journey Planner component (`JourneyPlanner.tsx`) with route calculation
- Mobile bottom navigation bar
- AI chat floating bubble (TransitMY AI assistant)
- Dark mode toggle

---

## Notes for Future Agents

### Architecture
- **Frontend**: React 18 + Vite 6 + TypeScript + Tailwind CSS
- **Backend**: Express.js (`server.ts`) served via `tsx`
- **Dev**: `npm run dev` starts `tsx server.ts` which also spawns Vite dev server
- **Build**: `npm run build` runs `vite build` + `esbuild server.ts`
- **Hosting**: Intended for GitHub Pages (static) or any Node.js host

### Known Issues
- Firefox may use system OS theme instead of in-app toggle (system-level CSS `prefers-color-scheme` override)
- Canvas 3D map cannot zoom (only pan) — zoom would require canvas `scale()` transforms
- Shop data for KL Sentral Level 2 is partial; Nu Sentral Mall shops are not listed (different entity)
- No Masjid Jamek 3D map — no floor plan data available

### Key Files
- `src/App.tsx` — Main application (~1845 lines), all tab logic
- `src/components/KLSentralMap3D.tsx` — Isometric 3D map with directory
- `src/components/JourneyPlanner.tsx` — Route planner component
- `src/data.ts` — All static data (stations, timetables, translations)
- `src/types.ts` — TypeScript interfaces
- `server.ts` — Express backend + live tracking simulation
- `CHANGELOG.md` — This file
