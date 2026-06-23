import React, { useRef, useEffect, useCallback, useState, useMemo } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
export type PodCategory = "ticket" | "food" | "retail" | "atm" | "service" | "transport" | "facility";

export interface Pod {
  id: string;
  label: string;
  icon: string;
  category: PodCategory;
  x: number; y: number; // grid units
  w: number; h: number;
  desc: string;
  floor: number; // 0=Ground, 1=Level1, 2=Level2
}

// ─── CATEGORY CONFIG ─────────────────────────────────────────────────────────
const CAT_CONFIG: Record<PodCategory, { color: string; dark: string; label: string }> = {
  ticket:    { color: "#DC2626", dark: "#991B1B",   label: "Tickets & Gates" },
  food:      { color: "#D97706", dark: "#92400E",   label: "Food & Beverage" },
  retail:    { color: "#7C3AED", dark: "#4C1D95",   label: "Retail & Shops" },
  atm:       { color: "#0891B2", dark: "#164E63",   label: "ATM & Banking" },
  service:   { color: "#059669", dark: "#064E3B",   label: "Services" },
  transport: { color: "#1D4ED8", dark: "#1E3A8A",   label: "Transport Lines" },
  facility:  { color: "#64748B", dark: "#334155",   label: "Facilities" },
};

// ─── FLOOR DATA (real KL Sentral shops from klsentral.info maps) ───────────────
// Level 1 grid is 24×16, Level 2 grid is 24×12
// Carefully placed, non-overlapping based on actual floor plan layout

const PODS: Pod[] = [
  // ── LEVEL 1 (Main Concourse) ──────────────────────────────────────────────
  // Left column shops (west side)
  { id:"l1-haji-roll",    floor:1, label:"Haji Roll",         icon:"🥗", category:"food",     x:0,  y:0,  w:2,  h:2,  desc:"Local food stall serving traditional Malay rolls and snacks." },
  { id:"l1-mak-bar",      floor:1, label:"Mak Bar",           icon:"☕", category:"food",     x:0,  y:2,  w:2,  h:2,  desc:"Casual café offering local drinks and light snacks." },
  { id:"l1-seven-l",      floor:1, label:"7-Eleven",          icon:"🏪", category:"retail",   x:0,  y:4,  w:2,  h:2,  desc:"24-hour convenience store. Good for bottled water, quick snacks, and top-up cards." },
  { id:"l1-tooz",         floor:1, label:"Tooz Café",         icon:"🧋", category:"food",     x:0,  y:6,  w:2,  h:2,  desc:"Bubble tea and light meals café." },
  { id:"l1-mirage",       floor:1, label:"Mirage Optics",     icon:"👓", category:"retail",   x:0,  y:8,  w:2,  h:2,  desc:"Optical shop offering prescription glasses and sunglasses." },
  { id:"l1-print",        floor:1, label:"Print Station",     icon:"🖨️", category:"service",  x:0,  y:10, w:2,  h:2,  desc:"Printing and photocopying services." },
  { id:"l1-yes-4g",       floor:1, label:"Yes 4G",            icon:"📱", category:"retail",   x:0,  y:12, w:2,  h:2,  desc:"Yes mobile network kiosk. Buy SIM cards and data plans." },
  { id:"l1-jalinan",      floor:1, label:"Jalinan Duta",      icon:"💱", category:"service",  x:0,  y:14, w:2,  h:2,  desc:"Currency exchange outlet." },

  // Second column
  { id:"l1-cimb-ex",      floor:1, label:"CIMB Bank Exchange",icon:"💰", category:"atm",      x:2,  y:0,  w:3,  h:2,  desc:"CIMB Bank currency exchange counter and ATM kiosk." },
  { id:"l1-bank-islam",   floor:1, label:"Bank Islam ATM",    icon:"🏧", category:"atm",      x:2,  y:2,  w:2,  h:2,  desc:"Bank Islam ATM machine." },
  { id:"l1-cimb-atm",     floor:1, label:"CIMB Bank ATM",     icon:"🏧", category:"atm",      x:2,  y:4,  w:2,  h:2,  desc:"CIMB Bank ATM cluster. Accepts Visa/Mastercard." },
  { id:"l1-maybank-atm",  floor:1, label:"Maybank ATM",       icon:"🏧", category:"atm",      x:2,  y:6,  w:2,  h:2,  desc:"Maybank ATM. Available 24 hours." },
  { id:"l1-maybank",      floor:1, label:"Maybank Branch",    icon:"🏦", category:"atm",      x:2,  y:8,  w:2,  h:3,  desc:"Full Maybank branch. Counter services available during banking hours." },
  { id:"l1-malindo",      floor:1, label:"Malindo Air",        icon:"✈️", category:"service",  x:2,  y:11, w:2,  h:2,  desc:"Malindo Air (Batik Air) ticketing counter." },
  { id:"l1-travel",       floor:1, label:"Travel Monster",    icon:"🌍", category:"service",  x:2,  y:13, w:2,  h:2,  desc:"Travel agency offering tour packages and hotel bookings." },

  // Center-left column (shops)
  { id:"l1-ayam",         floor:1, label:"Ayam Penyet Express",icon:"🍗",category:"food",     x:4,  y:0,  w:3,  h:2,  desc:"Indonesian fried chicken (Ayam Penyet) fast food restaurant." },
  { id:"l1-chicken",      floor:1, label:"The Chicken Treats", icon:"🍗",category:"food",     x:4,  y:2,  w:3,  h:2,  desc:"Fried chicken restaurant serving local-style meals." },
  { id:"l1-digi",         floor:1, label:"Digi",               icon:"📱",category:"retail",   x:4,  y:4,  w:2,  h:2,  desc:"Digi telco kiosk. Buy SIM cards and mobile plans." },
  { id:"l1-xpax",         floor:1, label:"XPAX",               icon:"📡",category:"retail",   x:6,  y:4,  w:2,  h:2,  desc:"Celcom XPAX mobile telco counter." },
  { id:"l1-book",         floor:1, label:"Bookstore",          icon:"📚",category:"retail",   x:8,  y:4,  w:2,  h:2,  desc:"Book and magazine store." },
  { id:"l1-panettone",    floor:1, label:"Panettone",          icon:"🥐",category:"food",     x:4,  y:6,  w:2,  h:2,  desc:"Italian bakery and café serving pastries and coffee." },
  { id:"l1-samsung",      floor:1, label:"Samsung",            icon:"📱",category:"retail",   x:6,  y:6,  w:2,  h:2,  desc:"Samsung official store for phones and electronics." },
  { id:"l1-mealstn",      floor:1, label:"Meals Station",      icon:"🍱",category:"food",     x:8,  y:6,  w:2,  h:2,  desc:"Quick meal kiosk with local and Western food options." },

  // Airline baggage check-in (large area, west side lower)
  { id:"l1-baggage-checkin", floor:1, label:"Airline Baggage Check-In", icon:"🧳",category:"transport", x:0, y:16, w:4, h:3, desc:"Airline baggage check-in counters. Primarily for Malaysia Airlines and KLIA Ekspres passengers. Must show ticket." },

  // KTM Komuter large area (center)
  { id:"l1-ktm",          floor:1, label:"KTM Komuter Gates", icon:"🚂",category:"transport", x:5,  y:10, w:6,  h:6,  desc:"KTM Komuter heavy-rail fare gates. Serves Batu Caves and Seremban suburban lines. Requires separate KTM ticket." },
  { id:"l1-ktm-ticket",   floor:1, label:"KTM Ticket Counter", icon:"🎟️",category:"ticket",  x:4,  y:9,  w:2,  h:2,  desc:"Staffed KTM ticket counter. Buy Komuter and ETS intercity rail tickets here." },
  { id:"l1-ktm-ticket2",  floor:1, label:"KTM Ticket Counter", icon:"🎟️",category:"ticket",  x:10, y:9,  w:2,  h:2,  desc:"Second KTM ticket counter (east side of KTM concourse)." },

  // Center area services
  { id:"l1-mynews",       floor:1, label:"myNews.com",         icon:"📰",category:"retail",   x:9,  y:0,  w:3,  h:2,  desc:"myNews convenience store and magazine rack." },
  { id:"l1-chatime",      floor:1, label:"Chatime",            icon:"🧋",category:"food",     x:9,  y:2,  w:3,  h:2,  desc:"Popular bubble tea chain." },
  { id:"l1-info",         floor:1, label:"Information Counter",icon:"ℹ️",category:"service",  x:10, y:5,  w:2,  h:2,  desc:"Tourist and passenger information desk. Staff can help with directions and transit questions." },
  { id:"l1-cimb-may",     floor:1, label:"CIMB/Maybank ATM",  icon:"🏧",category:"atm",      x:10, y:7,  w:2,  h:2,  desc:"Combined CIMB and Maybank ATM kiosk." },

  // KTM ERL (east center)
  { id:"l1-erl",          floor:1, label:"KTM ERL Gates",      icon:"✈️",category:"transport", x:12, y:10, w:6,  h:5,  desc:"KLIA Ekspres and KLIA Transit premium airport express gates. Non-stop to KLIA in ~28 min." },
  { id:"l1-klia-trans-tc", floor:1, label:"KLIA Transit Counter",icon:"🎫",category:"ticket", x:11, y:9,  w:2,  h:2,  desc:"KLIA Transit ticket purchase counter. Stops at Putrajaya/Cyberjaya and Salak Tinggi." },

  // Right side shops (east)
  { id:"l1-newsplus",     floor:1, label:"Newsplus",            icon:"🏪",category:"retail",   x:12, y:0,  w:4,  h:2,  desc:"Newsplus convenience store. Good for snacks, drinks, and reading material." },
  { id:"l1-moneychange",  floor:1, label:"Money Changer",       icon:"💱",category:"service",  x:16, y:0,  w:2,  h:2,  desc:"Authorised money changer with competitive rates." },
  { id:"l1-meps-atm",     floor:1, label:"MEPS ATM",            icon:"🏧",category:"atm",      x:12, y:2,  w:2,  h:2,  desc:"MEPS interbank ATM network. Accepts most Malaysian bank cards." },
  { id:"l1-lacucur",      floor:1, label:"La Cucur",            icon:"🍳",category:"food",     x:14, y:2,  w:2,  h:2,  desc:"Local Malaysian food stall serving traditional 'cucur' fritters and snacks." },
  { id:"l1-mcdonalds",    floor:1, label:"McDonald's",          icon:"🍔",category:"food",     x:12, y:4,  w:4,  h:3,  desc:"McDonald's fast food. Open extended hours. Useful 24-hour option on some nights." },
  { id:"l1-tune-talk",    floor:1, label:"Tune Talk",           icon:"📱",category:"retail",   x:16, y:4,  w:2,  h:2,  desc:"Tune Talk prepaid SIM kiosk. Affordable data plans for tourists." },
  { id:"l1-tourism-info", floor:1, label:"Tourist Info Centre", icon:"🗺️",category:"service",  x:16, y:6,  w:3,  h:3,  desc:"Official Malaysia Tourism Board information centre. Free maps, brochures, and travel advice." },

  // Far right column
  { id:"l1-secret",       floor:1, label:"Secret Recipe",       icon:"🍰",category:"food",     x:18, y:0,  w:3,  h:2,  desc:"Popular Malaysian café chain. Famous for their cakes and Western-Asian fusion meals." },
  { id:"l1-swiss",        floor:1, label:"Swiss Recipe",         icon:"🫕",category:"food",     x:18, y:2,  w:2,  h:2,  desc:"Swiss-inspired café serving sandwiches and pastries." },
  { id:"l1-dr-locker",    floor:1, label:"Dr. Locker",          icon:"🔐",category:"service",  x:20, y:0,  w:3,  h:4,  desc:"Smart luggage storage lockers. Pay by the hour. Available in various sizes for suitcases and backpacks." },
  { id:"l1-starbucks",    floor:1, label:"Starbucks",           icon:"☕",category:"food",     x:18, y:4,  w:3,  h:3,  desc:"Starbucks coffee outlet. Table seating available with power outlets." },
  { id:"l1-taxi-counter", floor:1, label:"Taxi Ticket Counter", icon:"🚕",category:"transport", x:22, y:4,  w:2,  h:3,  desc:"Fixed-price taxi ticket counter. Recommended over street hailing. Pay at counter, then board assigned taxi." },
  { id:"l1-major-fx",     floor:1, label:"Major Currency Exch.",icon:"💵",category:"service",  x:19, y:7,  w:3,  h:2,  desc:"Major Exclusive Currency Exchange. Handles many global currencies including USD, EUR, GBP, JPY, and more." },

  // LRT Kelana Jaya (two gate areas bottom)
  { id:"l1-lrt-lkj-w",   floor:1, label:"LRT Kelana Jaya Line", icon:"🚇",category:"transport", x:3, y:16, w:8,  h:4,  desc:"LRT Kelana Jaya Line (Red Line) western fare gates. Tap Touch 'n Go or insert blue token. Trains to KLCC, Masjid Jamek, Gombak, Putra Heights." },
  { id:"l1-lrt-lkj-e",   floor:1, label:"LRT Kelana Jaya Line", icon:"🚇",category:"transport", x:13, y:16, w:8, h:4,  desc:"LRT Kelana Jaya Line (Red Line) eastern fare gates. Same line, different gate cluster. Board trains here." },
  { id:"l1-burger-king",  floor:1, label:"Burger King",          icon:"🍔",category:"food",    x:7,  y:17, w:3,  h:3,  desc:"Burger King fast food restaurant inside LRT concourse." },
  { id:"l1-merchantrade", floor:1, label:"Merchantrade",         icon:"💱",category:"service", x:5,  y:20, w:3,  h:2,  desc:"Merchantrade currency exchange and money remittance services." },
  { id:"l1-dr-locker2",   floor:1, label:"Dr. Locker",           icon:"🔐",category:"service", x:9,  y:20, w:2,  h:2,  desc:"Additional Dr. Locker smart luggage storage station near LRT." },
  { id:"l1-yes-4g-2",     floor:1, label:"Yes 4G",               icon:"📱",category:"retail",  x:11, y:20, w:2,  h:2,  desc:"Yes mobile network SIM and reload kiosk." },
  { id:"l1-klia-ex-dep",  floor:1, label:"KLIA Ekspres (Dep.)", icon:"🛫",category:"transport", x:0, y:20, w:4,  h:3,  desc:"KLIA Ekspres departure gate. Premium non-stop service to KL International Airport. Check-in open 1h before departure." },
  { id:"l1-klia-trans",   floor:1, label:"KLIA Transit",         icon:"🚆",category:"transport", x:13, y:20, w:5, h:3,  desc:"KLIA Transit gate. Stops at Putrajaya/Cyberjaya (25 min) and Salak Tinggi (35 min) before KLIA." },
  { id:"l1-klia-ex-arr",  floor:1, label:"KLIA Ekspres (Arr.)", icon:"🛬",category:"transport", x:20, y:20, w:4,  h:3,  desc:"KLIA Ekspres arrival gate. Passengers from airport arrive here. Welcome boards and information available." },
  { id:"l1-guardian",     floor:1, label:"Guardian",             icon:"💊",category:"retail",   x:12, y:2,  w:2,  h:2,  desc:"Guardian pharmacy and health/beauty store. Good place to buy medicine, toiletries, and travel essentials." },
  { id:"l1-7eleven-r",    floor:1, label:"7-Eleven",             icon:"🏪",category:"retail",   x:14, y:0,  w:2,  h:2,  desc:"Second 7-Eleven convenience store in the station (east side). Open 24 hours." },

  // ── LEVEL 2 (KTM ETS & Mall Connection) ──────────────────────────────────
  { id:"l2-main-entrance", floor:2, label:"Main Entrance (Hilton)", icon:"🏨",category:"facility",  x:8,  y:0,  w:6,  h:2,  desc:"Main Level 2 entrance connected to Hilton and Le Méridien Hotel. Covered walkway." },
  { id:"l2-air-asia",      floor:2, label:"AirAsia Counter",         icon:"✈️",category:"service",   x:0,  y:0,  w:4,  h:3,  desc:"AirAsia ticketing and passenger services desk." },
  { id:"l2-go-genting",    floor:2, label:"Go Genting",              icon:"🎰",category:"service",   x:0,  y:3,  w:2,  h:2,  desc:"Genting Highlands bus and package booking counter." },
  { id:"l2-bk-travel",     floor:2, label:"BK Travel",               icon:"🌍",category:"service",   x:2,  y:3,  w:2,  h:2,  desc:"Travel agency for bus tickets and holiday packages." },
  { id:"l2-dr-locker-l2",  floor:2, label:"Dr. Locker",              icon:"🔐",category:"service",   x:4,  y:0,  w:2,  h:2,  desc:"Luggage storage lockers on Level 2, near AirAsia counter." },
  { id:"l2-dr-locker-l2b", floor:2, label:"Dr. Locker",              icon:"🔐",category:"service",   x:6,  y:2,  w:2,  h:2,  desc:"Second luggage storage kiosk on Level 2." },
  { id:"l2-ambank-atm",    floor:2, label:"AmBank ATM",               icon:"🏧",category:"atm",       x:8,  y:2,  w:2,  h:2,  desc:"AmBank ATM machine on Level 2." },
  { id:"l2-budget-taxi",   floor:2, label:"Budget Taxi Counter",     icon:"🚕",category:"transport", x:10, y:0,  w:3,  h:2,  desc:"Budget taxi coupon counter. Fixed price metered taxi service." },
  { id:"l2-icard",         floor:2, label:"iCard Student Counter",   icon:"🎓",category:"service",   x:13, y:0,  w:3,  h:2,  desc:"Student discount card and iCard registration counter." },
  { id:"l2-ktm-ets-counter",floor:2, label:"KTM ETS Counter",        icon:"🚆",category:"ticket",    x:16, y:0,  w:4,  h:2,  desc:"KTM ETS (Electric Train Service) long-distance ticket purchase counter. Serves intercity routes to Ipoh, Butterworth, Gemas." },
  { id:"l2-info",          floor:2, label:"Information Counter",      icon:"ℹ️",category:"service",   x:8,  y:4,  w:2,  h:2,  desc:"Level 2 passenger information desk." },
  { id:"l2-cimb-atm",      floor:2, label:"CIMB ATM",                 icon:"🏧",category:"atm",       x:6,  y:4,  w:2,  h:2,  desc:"CIMB Bank ATM on Level 2." },
  { id:"l2-mutiara",       floor:2, label:"Mutiara Mart",             icon:"🏪",category:"retail",    x:4,  y:4,  w:2,  h:3,  desc:"Small mart and convenience store on Level 2." },
  { id:"l2-pondok-polls",  floor:2, label:"Pondok Polls",             icon:"🗳️",category:"service",   x:2,  y:5,  w:2,  h:2,  desc:"Polling and government services counter." },
  { id:"l2-nile-money",    floor:2, label:"Nile Money Changer",       icon:"💱",category:"service",   x:0,  y:5,  w:2,  h:3,  desc:"Currency exchange service." },
  { id:"l2-ktm-ets-wait",  floor:2, label:"KTM ETS Waiting Area",    icon:"🪑",category:"facility",  x:6,  y:6,  w:6,  h:4,  desc:"Air-conditioned waiting lounge for KTM ETS intercity rail passengers. Comfortable seats with power outlets." },
  { id:"l2-skypark",       floor:2, label:"Skypark Link Waiting",     icon:"🪑",category:"facility",  x:13, y:6,  w:5,  h:4,  desc:"Waiting area for Skypark Link Express to Sultan Abdul Aziz Shah Airport (Subang Airport). Bus departs from Level 2." },
  { id:"l2-kfc",           floor:2, label:"KFC",                      icon:"🍗",category:"food",      x:18, y:4,  w:4,  h:5,  desc:"KFC fast food restaurant on Level 2. Good option before catching a long KTM ETS train." },
  { id:"l2-escl-l1",       floor:2, label:"Escalators to Level 1",   icon:"⬇️",category:"facility",  x:8,  y:6,  w:2,  h:2,  desc:"Escalators and stairs going down to Level 1 main concourse." },
  { id:"l2-escl-l3",       floor:2, label:"Escalators to Level 3",   icon:"⬆️",category:"facility",  x:10, y:6,  w:2,  h:2,  desc:"Escalators going up to Level 3 (Nu Sentral Mall)." },
];

// ─── Isometric projection constants ───────────────────────────────────────────
const TILE = 32;        // px per grid unit
const WALL_H = 18;      // default wall height px
const FLOOR_GAP = 100;  // vertical px separation between floors in all-floors view

// ─── Colour system ────────────────────────────────────────────────────────────
const FLOOR_COLORS = [
  { slab: "#1a2744", slabStroke: "#1e3a6e", accent: "#3B82F6" }, // L0 (unused)
  { slab: "#0f2035", slabStroke: "#1a3a5c", accent: "#06B6D4" }, // L1
  { slab: "#0f2e1a", slabStroke: "#1a4e2a", accent: "#10B981" }, // L2
];

// ─── ISO helpers ──────────────────────────────────────────────────────────────
function iso(gx: number, gy: number, floorIdx: number, ox: number, oy: number, zoom = 1.0) {
  const sx = (gx - gy) * Math.cos(Math.PI / 6) * TILE * zoom;
  const sy = ((gx + gy) * Math.sin(Math.PI / 6) * TILE - floorIdx * FLOOR_GAP) * zoom;
  return { x: ox + sx, y: oy + sy };
}

function hexAdjust(hex: string, amt: number): string {
  const n = parseInt(hex.replace("#",""), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amt));
  const b = Math.max(0, Math.min(255, (n & 0xff) + amt));
  return "#" + ((r<<16)|(g<<8)|b).toString(16).padStart(6,"0");
}

function pointInQuad(px: number, py: number, pts: {x:number;y:number}[]): boolean {
  let inside = false;
  const n = pts.length;
  for (let i=0,j=n-1; i<n; j=i++) {
    const {x:xi,y:yi}=pts[i], {x:xj,y:yj}=pts[j];
    if (((yi>py)!==(yj>py)) && px < (xj-xi)*(py-yi)/(yj-yi)+xi) inside=!inside;
  }
  return inside;
}

// ─── Draw one isometric box ────────────────────────────────────────────────────
function drawBox(
  ctx: CanvasRenderingContext2D,
  pod: Pod, fi: number, ox: number, oy: number,
  fill: string, stroke: string, selected: boolean, hovered: boolean,
  zoom = 1.0,
) {
  const {x,y,w,h} = pod;
  const tl = iso(x,   y,   fi, ox, oy, zoom);
  const tr = iso(x+w, y,   fi, ox, oy, zoom);
  const br = iso(x+w, y+h, fi, ox, oy, zoom);
  const bl = iso(x,   y+h, fi, ox, oy, zoom);
  const wh = (selected ? WALL_H + 10 : WALL_H) * zoom;
  const alpha = hovered && !selected ? 0.85 : 1;

  ctx.globalAlpha = alpha;

  // left wall
  ctx.beginPath();
  ctx.moveTo(bl.x,bl.y); ctx.lineTo(bl.x,bl.y+wh);
  ctx.lineTo(br.x,br.y+wh); ctx.lineTo(br.x,br.y);
  ctx.closePath();
  ctx.fillStyle = selected ? "#78350f" : hexAdjust(fill, -40);
  ctx.fill();
  ctx.strokeStyle = stroke; ctx.lineWidth = selected?2:0.6; ctx.stroke();

  // right wall
  ctx.beginPath();
  ctx.moveTo(br.x,br.y); ctx.lineTo(br.x,br.y+wh);
  ctx.lineTo(tr.x,tr.y+wh); ctx.lineTo(tr.x,tr.y);
  ctx.closePath();
  ctx.fillStyle = selected ? "#92400e" : hexAdjust(fill, -20);
  ctx.fill();
  ctx.strokeStyle = stroke; ctx.lineWidth = selected?2:0.6; ctx.stroke();

  // top
  ctx.beginPath();
  ctx.moveTo(tl.x,tl.y); ctx.lineTo(tr.x,tr.y);
  ctx.lineTo(br.x,br.y); ctx.lineTo(bl.x,bl.y);
  ctx.closePath();
  ctx.fillStyle = selected ? "#FBBF24" : hovered ? hexAdjust(fill,20) : fill;
  ctx.fill();
  ctx.strokeStyle = selected ? "#FDE047" : stroke;
  ctx.lineWidth = selected?2.5:0.8; ctx.stroke();

  ctx.globalAlpha = 1;

  // icon + label on top face
  const cx = (tl.x+tr.x+br.x+bl.x)/4;
  const cy = (tl.y+tr.y+br.y+bl.y)/4;
  ctx.save();
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  // Only show icon if pod is wide enough
  if (w >= 2 && h >= 2) {
    ctx.font = `${Math.max(9, Math.min(w*TILE*zoom*0.15, 18*zoom))}px serif`;
    ctx.fillText(pod.icon, cx, cy - 6 * zoom);
    ctx.font = `bold ${Math.max(6, Math.min(w*TILE*zoom*0.09, 10*zoom))}px Inter,sans-serif`;
    ctx.fillStyle = selected ? "#1c1917" : "#e2e8f0";
    ctx.fillText(pod.label.length > 18 ? pod.label.slice(0,16)+"…" : pod.label, cx, cy + 7 * zoom);
  } else {
    ctx.font = `bold ${Math.max(5, Math.min(w*TILE*zoom*0.11, 9*zoom))}px Inter,sans-serif`;
    ctx.fillStyle = selected ? "#1c1917" : "#e2e8f0";
    ctx.fillText(pod.icon, cx, cy);
  }
  ctx.restore();
}

// ─── Main component ────────────────────────────────────────────────────────────
interface KLSentralMapProps { theme: "light" | "dark"; }

const KLSentralMap3D: React.FC<KLSentralMapProps> = ({ theme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // View state
  const panX = useRef(0);
  const panY = useRef(0);
  const zoomScale = useRef(1.0);
  const drag = useRef<{sx:number;sy:number;px:number;py:number}|null>(null);
  const isDragging = useRef(false);

  const [activeFloor, setActiveFloor] = useState<1|2>(1);
  const [selectedId, setSelectedId] = useState<string>("l1-ktm");
  const [hoveredId, setHoveredId] = useState<string|null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [catFilter, setCatFilter] = useState<PodCategory|"all">("all");
  const [directoryOpen, setDirectoryOpen] = useState(false);

  const hitQuads = useRef<{id:string; pts:{x:number;y:number}[]}[]>([]);

  // ── Auto-fit: compute canvas-centre so all pods of current floor are visible ──
  const computeOrigin = useCallback((W: number, H: number, floor: number) => {
    const pods = PODS.filter(p => p.floor === floor);
    if (!pods.length) return { ox: W/2, oy: H/2, fitZoom: 1.0 };
    let minX=Infinity, maxX=-Infinity, minY=Infinity, maxY=-Infinity;
    const fi = 0; // always render at fi=0 for single floor
    for (const pod of pods) {
      for (const [gx,gy] of [
        [pod.x,pod.y],[pod.x+pod.w,pod.y],[pod.x+pod.w,pod.y+pod.h],[pod.x,pod.y+pod.h]
      ]) {
        const p = iso(gx,gy,fi,0,0, 1.0);
        minX=Math.min(minX,p.x); maxX=Math.max(maxX,p.x);
        minY=Math.min(minY,p.y); maxY=Math.max(maxY,p.y);
      }
    }
    const padX = 40, padY = 40;
    const mapW = maxX - minX + padX*2;
    const mapH = maxY - minY + padY*2 + WALL_H + 20;
    const fitZoom = Math.min((W-20)/mapW, (H-20)/mapH, 1.2);

    let minXZ = Infinity, maxXZ = -Infinity, minYZ = Infinity, maxYZ = -Infinity;
    for (const pod of pods) {
      for (const [gx,gy] of [
        [pod.x,pod.y],[pod.x+pod.w,pod.y],[pod.x+pod.w,pod.y+pod.h],[pod.x,pod.y+pod.h]
      ]) {
        const p = iso(gx,gy,fi,0,0, fitZoom);
        minXZ=Math.min(minXZ,p.x); maxXZ=Math.max(maxXZ,p.x);
        minYZ=Math.min(minYZ,p.y); maxYZ=Math.max(maxYZ,p.y);
      }
    }
    const ox = W/2 - ((minXZ+maxXZ)/2);
    const oy = H/2 - ((minYZ+maxYZ)/2) - (WALL_H * fitZoom)/2;
    return { ox, oy, fitZoom };
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;

    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = theme === "dark" ? "#0d1420" : "#111827";
    ctx.fillRect(0,0,W,H);

    // Subtle grid background
    ctx.strokeStyle = "rgba(255,255,255,0.025)";
    ctx.lineWidth = 0.5;
    for(let i=0;i<W;i+=30){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,H);ctx.stroke();}
    for(let j=0;j<H;j+=30){ctx.beginPath();ctx.moveTo(0,j);ctx.lineTo(W,j);ctx.stroke();}

    const { ox: baseOx, oy: baseOy } = computeOrigin(W, H, activeFloor);
    const ox = baseOx + panX.current;
    const oy = baseOy + panY.current;

    const floorColors = FLOOR_COLORS[activeFloor];
    const fi = 0;
    const pods = PODS.filter(p => p.floor === activeFloor);

    // Find slab bounds
    const maxGX = Math.max(...pods.map(p=>p.x+p.w));
    const maxGY = Math.max(...pods.map(p=>p.y+p.h));
    const slabW = maxGX + 1, slabH = maxGY + 1;

    // Draw slab
    const slabTL = iso(0,0,fi,ox,oy, zoomScale.current);
    const slabTR = iso(slabW,0,fi,ox,oy, zoomScale.current);
    const slabBR = iso(slabW,slabH,fi,ox,oy, zoomScale.current);
    const slabBL = iso(0,slabH,fi,ox,oy, zoomScale.current);

    // Slab side walls
    const wallHt = 12 * zoomScale.current;
    ctx.beginPath();
    ctx.moveTo(slabBL.x,slabBL.y); ctx.lineTo(slabBL.x,slabBL.y+wallHt);
    ctx.lineTo(slabBR.x,slabBR.y+wallHt); ctx.lineTo(slabBR.x,slabBR.y);
    ctx.closePath();
    ctx.fillStyle = hexAdjust(floorColors.slab,-50); ctx.fill();

    ctx.beginPath();
    ctx.moveTo(slabBR.x,slabBR.y); ctx.lineTo(slabBR.x,slabBR.y+wallHt);
    ctx.lineTo(slabTR.x,slabTR.y+wallHt); ctx.lineTo(slabTR.x,slabTR.y);
    ctx.closePath();
    ctx.fillStyle = hexAdjust(floorColors.slab,-30); ctx.fill();

    ctx.beginPath();
    ctx.moveTo(slabTL.x,slabTL.y); ctx.lineTo(slabTR.x,slabTR.y);
    ctx.lineTo(slabBR.x,slabBR.y); ctx.lineTo(slabBL.x,slabBL.y);
    ctx.closePath();
    ctx.fillStyle = floorColors.slab;
    ctx.fill();
    ctx.strokeStyle = floorColors.slabStroke; ctx.lineWidth=1; ctx.stroke();

    // Grid overlay
    ctx.strokeStyle = "rgba(255,255,255,0.04)"; ctx.lineWidth=0.4;
    for(let gx=0;gx<=slabW;gx++){
      const a=iso(gx,0,fi,ox,oy, zoomScale.current), b=iso(gx,slabH,fi,ox,oy, zoomScale.current);
      ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
    }
    for(let gy=0;gy<=slabH;gy++){
      const a=iso(0,gy,fi,ox,oy, zoomScale.current), b=iso(slabW,gy,fi,ox,oy, zoomScale.current);
      ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
    }

    // Floor label
    ctx.save();
    ctx.font="bold 11px Inter,sans-serif";
    ctx.fillStyle = floorColors.accent;
    ctx.textAlign="center"; ctx.textBaseline="middle";
    const lblPt = iso(slabW/2, -1.5, fi, ox, oy, zoomScale.current);
    ctx.fillText(activeFloor===1?"Level 1 · Main Concourse":"Level 2 · KTM ETS & Mall Link", lblPt.x, lblPt.y);
    ctx.restore();

    // Draw pods (sorted for painter's algorithm: higher gy first)
    const quads: {id:string;pts:{x:number;y:number}[]}[] = [];
    const sortedPods = [...pods].sort((a,b)=>(a.y+a.h)-(b.y+b.h)||(a.x)-(b.x));

    for (const pod of sortedPods) {
      const catColor = CAT_CONFIG[pod.category].color;
      const isSel = pod.id===selectedId;
      const isHov = pod.id===hoveredId;
      drawBox(ctx, pod, fi, ox, oy, hexAdjust(catColor,-10), hexAdjust(catColor,20), isSel, isHov, zoomScale.current);

      const tl=iso(pod.x,pod.y,fi,ox,oy, zoomScale.current);
      const tr=iso(pod.x+pod.w,pod.y,fi,ox,oy, zoomScale.current);
      const br=iso(pod.x+pod.w,pod.y+pod.h,fi,ox,oy, zoomScale.current);
      const bl=iso(pod.x,pod.y+pod.h,fi,ox,oy, zoomScale.current);
      quads.push({id:pod.id, pts:[tl,tr,br,bl]});
    }
    hitQuads.current = quads;
  }, [selectedId, hoveredId, activeFloor, theme, computeOrigin]);

  // ── Resize and Auto-Fit Zoom ──
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ro = new ResizeObserver(() => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      const { fitZoom } = computeOrigin(canvas.width, canvas.height, activeFloor);
      if (zoomScale.current === 1.0) {
        zoomScale.current = fitZoom;
      }
      draw();
    });
    ro.observe(container);
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    const { fitZoom } = computeOrigin(canvas.width, canvas.height, activeFloor);
    zoomScale.current = fitZoom;
    draw();
    return () => ro.disconnect();
  }, [draw, activeFloor, computeOrigin]);

  useEffect(() => { draw(); }, [draw]);

  // Reset pan on floor change
  const switchFloor = useCallback((f: 1|2) => {
    panX.current = 0; panY.current = 0;
    const canvas = canvasRef.current;
    if (canvas) {
      const { fitZoom } = computeOrigin(canvas.width, canvas.height, f);
      zoomScale.current = fitZoom;
    } else {
      zoomScale.current = 1.0;
    }
    setActiveFloor(f);
  }, [computeOrigin]);

  // Register wheel event listener to allow zoom and prevent page scroll when hovering/zooming the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = 1.08;
      const newZoom = e.deltaY < 0 
        ? Math.min(3.0, zoomScale.current * zoomFactor) 
        : Math.max(0.4, zoomScale.current / zoomFactor);
      
      zoomScale.current = newZoom;
      draw();
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [draw]);

  // ── Pointer events ─────────────────────────────────────────────────────────
  const onDown = (e: React.PointerEvent) => {
    drag.current = { sx:e.clientX, sy:e.clientY, px:panX.current, py:panY.current };
    isDragging.current = false;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (drag.current) {
      const dx=e.clientX-drag.current.sx, dy=e.clientY-drag.current.sy;
      if(Math.abs(dx)+Math.abs(dy)>4) isDragging.current=true;
      panX.current=drag.current.px+dx;
      panY.current=drag.current.py+dy;
      draw();
    } else {
      const canvas=canvasRef.current; if(!canvas) return;
      const r=canvas.getBoundingClientRect();
      const px=e.clientX-r.left, py=e.clientY-r.top;
      let hit:string|null=null;
      for(const q of [...hitQuads.current].reverse()){
        if(pointInQuad(px,py,q.pts)){hit=q.id;break;}
      }
      if(hit!==hoveredId) setHoveredId(hit);
    }
  };
  const onUp = (e: React.PointerEvent) => {
    if(!isDragging.current){
      const canvas=canvasRef.current; if(!canvas) return;
      const r=canvas.getBoundingClientRect();
      const px=e.clientX-r.left, py=e.clientY-r.top;
      for(const q of [...hitQuads.current].reverse()){
        if(pointInQuad(px,py,q.pts)){setSelectedId(q.id);break;}
      }
    }
    drag.current=null;
  };
  const onLeave = () => { drag.current=null; setHoveredId(null); };

  // ── Selected pod info ─────────────────────────────────────────────────────
  const selectedPod = PODS.find(p=>p.id===selectedId);

  // ── Directory filter ──────────────────────────────────────────────────────
  const directoryPods = useMemo(() => {
    return PODS
      .filter(p => p.floor === activeFloor)
      .filter(p => catFilter==="all" || p.category===catFilter)
      .filter(p => !searchQ || p.label.toLowerCase().includes(searchQ.toLowerCase()) || p.desc.toLowerCase().includes(searchQ.toLowerCase()));
  }, [activeFloor, catFilter, searchQ]);

  const categories = useMemo(() => {
    const seen = new Set<PodCategory>();
    PODS.filter(p=>p.floor===activeFloor).forEach(p=>seen.add(p.category));
    return Array.from(seen);
  }, [activeFloor]);

  return (
    <div className="flex flex-col gap-3 w-full">

      {/* ── Floor + Controls Row ── */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-mono font-bold uppercase text-slate-400 dark:text-zinc-500 tracking-wider">Floor:</span>
        {([1,2] as const).map(f => (
          <button key={f}
            onClick={() => switchFloor(f)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
              activeFloor===f
                ? "bg-sky-600 text-white border-sky-500 shadow"
                : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700"
            }`}>
            {f===1 ? "L1 – Main Concourse" : "L2 – KTM ETS & Mall Link"}
          </button>
        ))}
        <button
          onClick={() => {
            panX.current = 0;
            panY.current = 0;
            const canvas = canvasRef.current;
            if (canvas) {
              const { fitZoom } = computeOrigin(canvas.width, canvas.height, activeFloor);
              zoomScale.current = fitZoom;
            } else {
              zoomScale.current = 1.0;
            }
            draw();
          }}
          className="ml-auto px-2.5 py-1.5 rounded-lg text-[10px] font-bold border border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          title="Reset view">
          ⌖ Reset
        </button>
        <span className="text-[10px] text-slate-400 dark:text-zinc-500 hidden md:block">
          🖱️ Drag to pan · Click a location
        </span>
      </div>

      {/* ── Map + Info Panel ── */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Canvas */}
        <div ref={containerRef}
          className="flex-1 rounded-xl overflow-hidden border border-slate-300 dark:border-zinc-700 shadow-lg relative"
          style={{ minHeight: 280, height: "clamp(280px, 45vw, 500px)", cursor: hoveredId ? "pointer" : "grab" }}>
          <canvas ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onLeave}
            style={{ touchAction:"none" }} />
          
          {/* Floating Zoom Controls */}
          <div className="absolute bottom-2 left-2 flex gap-1 z-10">
            <button
              onClick={() => {
                zoomScale.current = Math.min(3.0, zoomScale.current * 1.25);
                draw();
              }}
              className="w-7 h-7 rounded-lg bg-white/90 dark:bg-zinc-800/90 border border-slate-200 dark:border-zinc-700 shadow flex items-center justify-center text-xs font-bold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-750 select-none cursor-pointer"
              title="Zoom In">
              ＋
            </button>
            <button
              onClick={() => {
                zoomScale.current = Math.max(0.4, zoomScale.current / 1.25);
                draw();
              }}
              className="w-7 h-7 rounded-lg bg-white/90 dark:bg-zinc-800/90 border border-slate-200 dark:border-zinc-700 shadow flex items-center justify-center text-xs font-bold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-750 select-none cursor-pointer"
              title="Zoom Out">
              －
            </button>
          </div>

          <div className="absolute bottom-2 right-2 text-[8px] text-slate-500 dark:text-zinc-600 font-mono select-none pointer-events-none">
            KL Sentral · TransitMY
          </div>
        </div>

        {/* Info Panel */}
        <div className="md:w-60 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-3 shadow-sm flex flex-col gap-2 shrink-0">
          {selectedPod ? (
            <>
              <div className="flex items-start gap-2">
                <span className="text-xl shrink-0">{selectedPod.icon}</span>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-slate-800 dark:text-white text-sm leading-tight">{selectedPod.label}</h4>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{backgroundColor: CAT_CONFIG[selectedPod.category].color}}/>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">{CAT_CONFIG[selectedPod.category].label}</span>
                  </div>
                </div>
              </div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider" style={{color: FLOOR_COLORS[selectedPod.floor].accent}}>
                {selectedPod.floor===1 ? "L1 · Main Concourse" : "L2 · KTM ETS & Mall Link"}
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed bg-slate-50 dark:bg-zinc-900 p-2.5 rounded-lg border border-slate-100 dark:border-zinc-800 flex-1">
                {selectedPod.desc}
              </p>
              <div className="text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-lg p-2 leading-relaxed">
                📌 Signs: <strong>Blue→LRT · Green→MRT · Orange→KTM · Purple→ERL</strong>
              </div>
            </>
          ) : (
            <div className="text-sm text-slate-400 dark:text-zinc-500 text-center py-6">
              Click a location on the map
            </div>
          )}
        </div>
      </div>

      {/* ── Category Legend ── */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(CAT_CONFIG) as PodCategory[]).filter(c => PODS.some(p=>p.floor===activeFloor && p.category===c)).map(c => (
          <div key={c} className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{backgroundColor: CAT_CONFIG[c].color}}/>
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">{CAT_CONFIG[c].label}</span>
          </div>
        ))}
      </div>

      {/* ── Directory Section ── */}
      <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl overflow-hidden shadow-sm">
        {/* Directory Header */}
        <button
          onClick={() => setDirectoryOpen(o=>!o)}
          className="w-full flex items-center justify-between p-3 text-sm font-bold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-750 transition cursor-pointer">
          <span className="flex items-center gap-2">
            🔍 Station Directory
            <span className="text-xs font-normal text-slate-400 dark:text-zinc-500">— all shops & services</span>
          </span>
          <span className={`transition-transform duration-200 ${directoryOpen?"rotate-180":""}`}>▼</span>
        </button>

        {directoryOpen && (
          <div className="border-t border-slate-100 dark:border-zinc-700 p-3 space-y-3">
            {/* Search + Category filter */}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Search shops, services..."
                value={searchQ}
                onChange={e=>setSearchQ(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-600 bg-slate-50 dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-sky-400"
              />
              <select
                value={catFilter}
                onChange={e=>setCatFilter(e.target.value as PodCategory|"all")}
                className="px-2 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-600 bg-slate-50 dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-sky-400 cursor-pointer">
                <option value="all">All Categories</option>
                {categories.map(c=>(
                  <option key={c} value={c}>{CAT_CONFIG[c].label}</option>
                ))}
              </select>
            </div>

            {/* Results */}
            <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium mb-1">
              {directoryPods.length} location{directoryPods.length!==1?"s":""} found
            </div>
            <div className="max-h-64 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 pr-1">
              {directoryPods.map(pod => (
                <button
                  key={pod.id}
                  onClick={() => {
                    setSelectedId(pod.id);
                    if(pod.floor !== activeFloor) switchFloor(pod.floor as 1|2);
                  }}
                  className={`text-left px-2.5 py-2 rounded-lg border text-xs transition cursor-pointer flex items-start gap-2 ${
                    selectedId===pod.id
                      ? "bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200"
                      : "bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700"
                  }`}>
                  <span className="shrink-0 text-sm">{pod.icon}</span>
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{pod.label}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{backgroundColor: CAT_CONFIG[pod.category].color}}/>
                      <span className="text-[9px] text-slate-400 dark:text-zinc-500">{CAT_CONFIG[pod.category].label}</span>
                    </div>
                  </div>
                </button>
              ))}
              {directoryPods.length===0 && (
                <div className="col-span-3 text-center text-slate-400 dark:text-zinc-500 py-4 text-xs">
                  No locations match your search
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KLSentralMap3D;
