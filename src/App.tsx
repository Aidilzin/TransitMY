import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import {
  MessageSquare,
  Network,
  Ticket,
  AlertCircle,
  TrendingUp,
  Image as ImageIcon,
  Send,
  RefreshCw,
  Clock,
  MapPin,
  X,
  HelpCircle,
  Volume2,
  Info,
  Sliders,
  AlertTriangle,
  ChevronRight,
  Sun,
  Moon,
  Map,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  Train,
  Bus,
  Layers,
  Compass
} from "lucide-react";
import { Language, TabId, Message, Timetable, Announcement } from "./types";
import {
  UI_TRANSLATIONS,
  TRANSIT_LINES,
  TICKETING_GUIDE,
  TRANSIT_TIPS,
  FARE_GUESTIMATION,
  SUGGESTED_PROMPTS
} from "./data";
import JourneyPlanner from "./components/JourneyPlanner";
import KLSentralMap3D from "./components/KLSentralMap3D";

const LOCAL_INITIAL_TIMETABLES: Timetable[] = [
  { id: "kj-lrt-gombak", line: "Kelana Jaya LRT", color: "#EF4444", destination: "Gombak", station: "KL Sentral", minutes: 3, status: "On Time" },
  { id: "kj-lrt-putra", line: "Kelana Jaya LRT", color: "#EF4444", destination: "Putra Heights", station: "KL Sentral", minutes: 5, status: "On Time" },
  { id: "kj-mrt-kwasa", line: "Kajang MRT", color: "#10B981", destination: "Kwasa Damansara", station: "Bukit Bintang", minutes: 6, status: "On Time" },
  { id: "kj-mrt-kajang", line: "Kajang MRT", color: "#10B981", destination: "Kajang", station: "Bukit Bintang", minutes: 8, status: "On Time" },
  { id: "ktm-komuter-batu-caves", line: "KTM Komuter (Batu Caves Line)", color: "#3B82F6", destination: "Batu Caves", station: "KL Sentral", minutes: 14, status: "Minor Delay" },
  { id: "monorail-titiwangsa", line: "KL Monorail", color: "#F59E0B", destination: "Titiwangsa", station: "Hang Tuah", minutes: 2, status: "On Time" },
  { id: "putra-mrt-putrajaya", line: "Putrajaya MRT", color: "#EC4899", destination: "Putrajaya Sentral", station: "Ampang Park", minutes: 7, status: "On Time" }
];

const LOCAL_GENERAL_ANNOUNCEMENTS: Announcement[] = [
  { id: 1, text: "⚠️ KTM Komuter Batu Caves Line experiencing minor scheduling delays (+5 mins) due to track maintenance near Sentul.", type: "warning" },
  { id: 2, text: "🎫 Save queueing time: Tourists can purchase the 'MyCity 3-Day Pass' for unlimited rides on LRT, MRT, and Monorail for RM25!", type: "info" }
];

const travelCategories: Record<Language, { text: string; desc: string }[]> = {
  en: [
    { text: "LRT / MRT lines", desc: "Urban Heavy Rail" },
    { text: "Monorail Line", desc: "Central Elevated" },
    { text: "KTM Railways", desc: "Suburban Regional" },
    { text: "Airport Rails", desc: "Direct Gateway Link" },
    { text: "BRT Sunway", desc: "Electric Elevated Bus" }
  ],
  bm: [
    { text: "Aliran LRT / MRT", desc: "Laluan Berat Bandar" },
    { text: "Aliran Monorel", desc: "Tinggi Berpusat" },
    { text: "Kereta Api KTM", desc: "Serantau Pinggir Bandar" },
    { text: "Laluan Lapangan Terbang", desc: "Hub Pintu Masuk Terus" },
    { text: "BRT Sunway", desc: "Bas Elektrik Tinggi" }
  ],
  zh: [
    { text: "LRT / MRT 轻铁捷运", desc: "城市重轨" },
    { text: "单轨火车", desc: "市中心高架" },
    { text: "KTM 铁路", desc: "郊区区域铁路" },
    { text: "机场快铁", desc: "直达门户通道" },
    { text: "BRT 双威快捷巴士", desc: "高架电动巴士" }
  ],
  ta: [
    { text: "LRT / MRT சேவைகள்", desc: "நகர கனரக ரயில்" },
    { text: "மோனோரயில்", desc: "மத்திய உயர்த்தப்பட்ட ரயில்" },
    { text: "கேடிஎம் ரயில்வே", desc: "புறநகர் பிராந்திய ரயில்" },
    { text: "விமான ரயில்வே", desc: "நேரடி நுழைவாயில் இணைப்பு" },
    { text: "பிஆர்டி சன்வே", desc: "மின்சார உயர்த்தப்பட்ட பஸ்" }
  ]
};

const tipLabels: Record<Language, { know: string; advice: string }> = {
  en: { know: "💡 What you should know:", advice: "⭐ Guest Advice Guideline:" },
  bm: { know: "💡 Apa yang anda perlu tahu:", advice: "⭐ Garis Panduan Syor Tetamu:" },
  zh: { know: "💡 乘车须知：", advice: "⭐ 观光贴士：" },
  ta: { know: "💡 நீங்கள் அறிய வேண்டியவை:", advice: "⭐ பயணிக்கான வழிகாட்டுதல்:" }
};

const SYSTEM_INSTRUCTION = `You are TransitMY, a friendly and knowledgeable Malaysia public transit assistant. You help tourists, expats, and first-time riders navigate Malaysia's complex public transport network confidently.

You have expert knowledge of:
- All rail lines: LRT (Kelana Jaya & Ampang/Sri Petaling lines), MRT (Putrajaya & Kajang lines), KTM Komuter (Port Klang & Seremban lines), KL Monorail, BRT Sunway, and ERL (KLIA Ekspres & KLIA Transit)
- Ticketing: Touch 'n Go card, MyRapid card, single-journey tokens, token machines, and where to top up
- Key interchange stations: KL Sentral, Masjid Jamek, Chan Sow Lin, Hang Tuah, Titiwangsa, Gombak
- Fares, operating hours (approx. 6am–midnight for most lines), and peak vs off-peak times
- Common mistakes tourists make (wrong platform, wrong exit, touching out before transferring, not knowing bag rules)
- Walking connections between stations (e.g. Pasar Seni ↔ Masjid Jamek, Hang Tuah LRT ↔ Monorail)

When answering:
- Always give step-by-step directions when someone asks how to get somewhere
- Mention the specific line name AND line color (e.g. "Take the MRT Putrajaya Line — the blue line")
- Warn about common pain points proactively (e.g. "Make sure you tap out before leaving, or you'll be charged the maximum fare")
- If the user uploads a photo of a sign, ticket machine, or map, explain what they're looking at
- Answer in the user's language if they write in Malay, Mandarin, or Tamil
- Keep answers concise and scannable — use short bullet points for multi-step directions.`;

function detectLanguage(messages: any[]): "en" | "bm" | "zh" | "ta" {
  let text = "";
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user" && messages[i].text) {
      text = messages[i].text;
      break;
    }
  }

  if (!text) return "en";

  if (/[\u4e00-\u9fa5]/.test(text)) {
    return "zh";
  }

  if (/[\u0b80-\u0bff]/.test(text)) {
    return "ta";
  }

  const msKeywords = [
    "selamat", "stesen", "tiket", "harga", "tambang", "laluan", 
    "bagaimana", "dari", "ke", "saya", "tanya", "panduan", 
    "bantuan", "kereta", "api", "kembalikan", "ada", "boleh",
    "monorel", "lrt", "mrt", "jalan", "kad", "sentral", "masjid",
    "jamek", "puncak", "pasar", "seni", "apa", "di mana"
  ];
  const cleanedText = text.toLowerCase();
  const matchedMs = msKeywords.filter(word => cleanedText.includes(word)).length;
  if (matchedMs >= 2 || (matchedMs >= 1 && (cleanedText.includes(" lrt") || cleanedText.includes(" mrt") || cleanedText.includes(" lrt ") || cleanedText.includes(" mrt ")))) {
    return "bm";
  }

  return "en";
}

// ── Route knowledge base for offline client fallback ─────────────────────────
const CLIENT_ROUTE_KB: Array<{ keys: string[]; answer: string }> = [
  {
    keys: ["seremban", "nilai", "pulau sebang", "tampin"],
    answer: `### \u{1F686} KL Sentral \u2192 Seremban (KTM Komuter)\n\n1. Go to the **KTM Komuter** section inside KL Sentral (lower level, follow blue KTM signs).\n2. **Buy a ticket** at the counter or TVM \u2014 Touch 'n Go is accepted.\n3. Board the **KTM Seremban Line** (brown / Line 2) towards **Pulau Sebang/Tampin**.\n4. Seremban is a major stop \u2014 journey takes about **1 h 30 min \u2013 2 h**.\n5. **Tap out** at Seremban gate when you arrive.\n\n> \u26A0\uFE0F KTM runs less frequently than LRT/MRT \u2014 check the schedule first. Operating hours: ~6 AM \u2013 midnight.`
  },
  {
    keys: ["klcc", "twin tower", "petronas tower", "suria klcc"],
    answer: `### \u{1F3D9}\uFE0F Getting to KLCC / Petronas Twin Towers\n\n1. Take the **LRT Kelana Jaya Line (Red / Line 5)**.\n2. Board any train towards **Gombak** direction.\n3. Alight at **KLCC station** (2 stops from Masjid Jamek, 3 stops from KL Sentral).\n4. Exit via **Exit A** \u2014 the towers are directly above the station.\n\n> \u{1F4A1} Touch 'n Go or single-journey token both work. RM2\u20134 depending on origin.`
  },
  {
    keys: ["bukit bintang", "bintang walk", "pavilion", "bb plaza"],
    answer: `### \u{1F6CD}\uFE0F Getting to Bukit Bintang / Pavilion\n\n**Option 1 \u2014 MRT (Recommended):**\n1. Take the **MRT Kajang Line (Green / Line 9)**.\n2. Alight at **Bukit Bintang MRT** station \u2014 connected underground to Pavilion.\n\n**Option 2 \u2014 KL Monorail:**\n1. Take the **KL Monorail (Orange / Line 8)**.\n2. Alight at **Bukit Bintang Monorail** station.\n\n> \u{1F4A1} Both options are valid. MRT is faster from most interchange stations.`
  },
  {
    keys: ["klia", "airport", "terminal", "klia2", "flight", "klia transit", "klia ekspres"],
    answer: `### \u2708\uFE0F KL Sentral \u2192 KLIA / KLIA2 (ERL)\n\n1. Go to the **ERL (Express Rail Link)** counter at KL Sentral basement.\n2. **KLIA Ekspres** \u2014 non-stop, takes **28 minutes**, ~RM55.\n3. **KLIA Transit** \u2014 stops at Salak Tinggi, takes ~35 min, cheaper.\n4. For **KLIA2** (AirAsia terminal): take KLIA Transit or the free KLIA2 shuttle bus from KLIA.\n\n> \u23F0 ERL runs every 15\u201320 min. First train ~5 AM, last ~1 AM.`
  },
  {
    keys: ["batu cave", "batu caves"],
    answer: `### \u{1F54C} Getting to Batu Caves\n\n1. Take the **KTM Komuter Batu Caves Line** (grey).\n2. Board at **KL Sentral** or **Bank Negara** KTM station.\n3. Alight at the terminal stop: **Batu Caves** station.\n4. The famous staircase is right outside the station (~3-min walk).\n\n> \u23F0 Journey ~30\u201340 min from KL Sentral. Runs daily; last train around 10:30 PM.`
  },
  {
    keys: ["port klang", "pelabuhan klang"],
    answer: `### \u2693 KL Sentral \u2192 Port Klang (KTM Komuter)\n\n1. Go to the **KTM Komuter** section at KL Sentral.\n2. Take the **KTM Port Klang Line** (blue / Line 1) towards **Port Klang**.\n3. Journey takes approximately **1 hour**.\n4. **Tap out** at Port Klang station.\n\n> \u{1F4A1} Trains run every 20\u201330 min during peak hours.`
  },
  {
    keys: ["midvalley", "mid valley", "the gardens mall"],
    answer: `### \u{1F3EC} Getting to Mid Valley Megamall / The Gardens\n\n1. Take the **KTM Komuter** from KL Sentral (Port Klang Line or Seremban Line).\n2. Alight at **Mid Valley KTM** station \u2014 directly connected to Mid Valley Megamall via covered walkway.\n\n> \u23F1\uFE0F Only 1 stop from KL Sentral (~5 min). Very convenient!`
  },
  {
    keys: ["sunway pyramid", "sunway lagoon", "subang jaya", "usj", "brt sunway"],
    answer: `### \u{1F3D8}\uFE0F Getting to Subang Jaya / Sunway\n\n1. Take the **LRT Kelana Jaya Line (Red)** from KL Sentral or Masjid Jamek.\n2. Alight at **Subang Jaya** or **USJ 7** depending on your destination.\n\n**For BRT Sunway** (Sunway Pyramid, Sunway Lagoon):\n1. Ride LRT to **Subang Jaya** station.\n2. Transfer to **BRT Sunway Line** (green elevated bus) \u2014 free within BRT zone.\n\n> \u{1F4A1} Sunway Pyramid: LRT to SJ11 then BRT.`
  },
  {
    keys: ["pasar seni", "central market", "chinatown", "petaling street"],
    answer: `### \u{1F3EE} Getting to Pasar Seni / Central Market / Chinatown\n\n1. Take the **LRT Kelana Jaya Line (Red / Line 5)**.\n2. Alight at **Pasar Seni** station.\n3. Central Market is a 2-minute walk from Exit A.\n4. For Petaling Street (Chinatown), walk ~5 minutes south.\n\n> \u{1F4A1} Also reachable via LRT Ampang Line \u2014 same Pasar Seni station.`
  },
  {
    keys: ["titiwangsa", "ampang jaya", "ampang park"],
    answer: `### \u{1F306} Getting to Titiwangsa / Ampang\n\n**To Titiwangsa:**\n1. Take **LRT Kelana Jaya Line** or **KL Monorail** to **Titiwangsa** station.\n\n**To Ampang:**\n1. Take **LRT Ampang Line (Orange / Line 3)** from Masjid Jamek or Chan Sow Lin.\n\n> \u{1F4A1} Masjid Jamek is the best interchange between Kelana Jaya and Ampang lines.`
  },
  {
    keys: ["gombak", "zoo negara", "zoo"],
    answer: `### \u{1F981} Getting to Gombak / Zoo Negara\n\n1. Take the **LRT Kelana Jaya Line (Red / Line 5)** all the way to **Gombak** (terminal station).\n2. From Gombak LRT, take a **Rapid bus or Grab** to Zoo Negara (~10 min away).\n\n> \u23F1\uFE0F From KL Sentral to Gombak: ~40 minutes.`
  },
  {
    keys: ["putrajaya", "cyberjaya", "putrajaya sentral"],
    answer: `### \u{1F3DB}\uFE0F Getting to Putrajaya / Cyberjaya\n\n**Option 1 \u2014 MRT (Recommended):**\n1. Take the **MRT Putrajaya Line (Blue / Line 12)** from KL Sentral or Pasar Seni.\n2. Alight at **Putrajaya Sentral** or **Cyberjaya Utara** station.\n\n**Option 2 \u2014 ERL KLIA Transit:**\n1. Board KLIA Transit at KL Sentral.\n2. Alight at **Putrajaya & Cyberjaya** station (~20 min).\n\n> \u{1F4A1} MRT is cheaper; ERL is faster.`
  },
  {
    keys: ["bangsar", "bangsar south"],
    answer: `### \u{1F33F} Getting to Bangsar\n\n1. Take the **LRT Kelana Jaya Line (Red)** from KL Sentral.\n2. Alight at **Bangsar LRT** station (1 stop from KL Sentral).\n3. Walk or take a feeder bus into Bangsar village.\n\n> \u23F1\uFE0F Only ~3 minutes from KL Sentral!`
  },
  {
    keys: ["chow kit", "chowkit"],
    answer: `### \u{1F35C} Getting to Chow Kit\n\n1. Take the **KL Monorail (Orange / Line 8)** to **Chow Kit** station.\n2. The market is directly below the station.\n\n> \u{1F4A1} Alternatively, LRT Kelana Jaya Line to Dang Wangi then walk north.`
  },
  {
    keys: ["operating hour", "opening hour", "when does", "what time", "first train", "last train", "schedule", "timetable"],
    answer: `### \u23F0 Transit Operating Hours\n\n| Line | First Train | Last Train |\n|------|-------------|------------|\n| LRT Kelana Jaya | ~6:00 AM | ~11:50 PM |\n| LRT Ampang/Sri Petaling | ~6:00 AM | ~11:45 PM |\n| MRT Kajang | ~6:00 AM | ~11:50 PM |\n| MRT Putrajaya | ~6:00 AM | ~11:50 PM |\n| KL Monorail | ~6:00 AM | ~11:45 PM |\n| KTM Komuter | ~5:30 AM | ~11:00 PM |\n| ERL (KLIA) | ~5:00 AM | ~1:00 AM |\n\n> \u26A0\uFE0F Schedules may vary on public holidays. Check the Arrivals tab for live data.`
  },
  {
    keys: ["ticket", "token", "fare", "price", "cost", "how much", "touch n go", "touch 'n go", "buy ticket"],
    answer: `### \u{1F3AB} Ticketing & Fares\n\n*   **Touch 'n Go (TnG) Card** \u2014 Best option. Buy at major station counters (RM10 card + RM10 minimum load). Accepted on all rail lines.\n*   **Single-Journey Token** \u2014 Blue coin token from TVMs. Cash only (RM1/RM5 notes or coins).\n*   **MyCity Pass** \u2014 Tourist unlimited-ride pass: 1-Day (RM15) or 3-Day (RM25) for all LRT, MRT, Monorail lines.\n\n> \u{1F4A1} Gates require minimum **RM10.00 balance** on TnG to open. Top up at station kiosks or 7-Eleven.`
  },
  {
    keys: ["bag", "luggage", "backpack", "baggage", "suitcase"],
    answer: `### \u{1F392} Bags & Luggage on Transit\n\n*   **Backpacks/carry-on bags** \u2014 Allowed on all lines.\n*   **Large suitcases** \u2014 Allowed but must not block doors or aisles.\n*   **Oversized items** \u2014 May be refused; check with station staff.\n*   **Priority seats** \u2014 Reserved for elderly, disabled, and pregnant passengers.`
  },
];

function getLocalFallbackText(messages: any[], lang: "en" | "bm" | "zh" | "ta"): string {
  const lastMessageText = messages[messages.length - 1]?.text || "";
  const query = lastMessageText.toLowerCase();

  // Try route KB first — covers destinations and common topics
  for (const entry of CLIENT_ROUTE_KB) {
    if (entry.keys.some(k => query.includes(k))) {
      return `*(Note: AI service temporarily unavailable. Showing cached transit knowledge.)*\n\n${entry.answer}`;
    }
  }

  // Language-specific generic fallback when no route matched
  if (lang === "zh") {
    return `*(提示：AI服务暂时繁忙，TransitMY 已启动本地备用模式。)*\n\n### \u{1F5FA}\uFE0F 主要线路\n*   **LRT 格拉那再也线 (红/5):** Gombak \u2194 Putra Heights，途经KLCC、Pasar Seni\n*   **MRT 加影线 (绿/9):** 武吉免登、默迪卡\n*   **KTM:** 芙蓉、巴生港口、黑风洞\n*   **ERL:** KL Sentral \u2192 KLIA 仅28分钟\n\n**请重新告诉我您的出发地和目的地，我来帮您规划路线！**`;
  } else if (lang === "bm") {
    return `*(Nota: Perkhidmatan AI sibuk. TransitMY menggunakan mod sandaran.)*\n\n### \u{1F5FA}\uFE0F Laluan Utama\n*   **LRT Kelana Jaya (Merah/5):** Gombak \u2194 Putra Heights via KLCC, Pasar Seni\n*   **MRT Kajang (Hijau/9):** Bukit Bintang, Merdeka\n*   **KTM:** Seremban, Port Klang, Batu Caves\n*   **ERL:** KL Sentral \u2192 KLIA dalam 28 minit\n\n**Sila beritahu saya dari mana anda bermula dan ke mana anda hendak pergi!**`;
  } else if (lang === "ta") {
    return `*(அறிவிப்பு: AI சேவை இடைக்காலமாக இல்லை. உள்ளூர் தரவு பயன்படுத்தப்படுகிறது.)*\n\n### \u{1F5FA}\uFE0F முக்கிய பாதைகள்\n*   **LRT கெலானா ஜெயா (சிவப்பு/5):** KLCC, Pasar Seni வழியாக Gombak \u2194 Putra Heights\n*   **MRT காஜாங் (பச்சை/9):** Bukit Bintang, Merdeka\n*   **KTM:** Seremban, Batu Caves\n*   **ERL:** KL Sentral \u2192 KLIA 28 நிமிடம்\n\n**உங்கள் பயண தொடக்கம் மற்றும் இலக்கை சொல்லுங்கள்!**`;
  } else {
    return `*(Note: AI service temporarily busy. Here's essential KL transit info.)*\n\n### \u{1F5FA}\uFE0F Key Lines\n*   **LRT Kelana Jaya (Red/5):** Gombak \u2194 Putra Heights via KLCC, Pasar Seni, KL Sentral\n*   **LRT Ampang/Sri Petaling (Orange/3&4):** Interchange at Masjid Jamek & Chan Sow Lin\n*   **MRT Kajang (Green/9):** Muzium Negara, Bukit Bintang, Merdeka\n*   **MRT Putrajaya (Blue/12):** KL Sentral to Putrajaya/Cyberjaya\n*   **KL Monorail (Orange/8):** Bukit Bintang, Chow Kit *(board at Nu Sentral side of KL Sentral)*\n*   **KTM Komuter:** Seremban, Port Klang, Batu Caves, Mid Valley\n*   **ERL:** KL Sentral \u2192 KLIA in 28 min (RM55)\n\n**Try asking me again with your specific origin and destination!**`;
  }
}



export default function App() {
  const [lang, setLang] = useState<Language>("en");
  const [activeTab, setActiveTab] = useState<TabId>("arrivals"); // arrivals is the default landing page.
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "light" || savedTheme === "dark") {
        return savedTheme;
      }
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
    }
    return "light";
  });
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [selectedNetworkLine, setSelectedNetworkLine] = useState<string>("LRT 5"); // default Kelana Jaya line
  const [selectedStationCode, setSelectedStationCode] = useState<string>("KJ15"); // default KL Sentral
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      role: "model",
      text: "Selamat Datang! Welcome to Malaysia. I am TransitMY, your smart public transit companion. 🇲🇾\n\nI can help you navigate Kuala Lumpur's rail network including the LRT, MRT, Monorail, KTM Komuter, and airport lines. Ask me for directions, ticket advice, or upload a photo of a confusing sign!",
      timestamp: new Date()
    }
  ]);
  const [loading, setLoading] = useState(false);


  // Sync theme with HTML class attribute
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);
  
  // Real-time Timetable & Alerts State
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [stationFilter, setStationFilter] = useState<string>("All");
  const [refreshCountdown, setRefreshCountdown] = useState(30);
  const [secCounters, setSecCounters] = useState<Record<string, number>>({});
  const [systemAlertMessage, setSystemAlertMessage] = useState<string | null>(null);

  // Image Upload State
  const [selectedImage, setSelectedImage] = useState<{
    data: string; // Base64 raw
    mimeType: string;
    previewUrl: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load live timetable & announcements from Express server-side API
  const fetchTimetableData = async () => {
    try {
      const response = await fetch("/api/timetable");
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }
      const data = await response.json();
      const loadedTimetables = data.timetables || LOCAL_INITIAL_TIMETABLES;
      const loadedAnnouncements = data.announcements || LOCAL_GENERAL_ANNOUNCEMENTS;
      
      setTimetables(loadedTimetables);
      setAnnouncements(loadedAnnouncements);
      
      // Initialize custom countdown seconds for each train (e.g. minutes * 60)
      const initialSeconds: Record<string, number> = {};
      loadedTimetables.forEach((t: Timetable) => {
        initialSeconds[t.id] = t.minutes * 60;
      });
      setSecCounters(initialSeconds);
      setRefreshCountdown(30);
    } catch (e) {
      console.warn("Failed to load live timetables from server, using local fallback:", e);
      setTimetables(LOCAL_INITIAL_TIMETABLES);
      setAnnouncements(LOCAL_GENERAL_ANNOUNCEMENTS);
      
      const initialSeconds: Record<string, number> = {};
      LOCAL_INITIAL_TIMETABLES.forEach((t: Timetable) => {
        initialSeconds[t.id] = t.minutes * 60;
      });
      setSecCounters(initialSeconds);
      setRefreshCountdown(30);
    }
  };

  useEffect(() => {
    fetchTimetableData();
  }, []);

  // Update timer counters every second
  useEffect(() => {
    const interval = setInterval(() => {
      // Tick down global refresh timer
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          fetchTimetableData();
          return 30;
        }
        return prev - 1;
      });

      // Tick down individual train countdown seconds
      setSecCounters((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((key) => {
          if (next[key] > 0) {
            next[key] -= 1;
          } else {
            // Auto reset back to a random interval around 7-10 minutes to simulate real arrivals
            next[key] = (Math.floor(Math.random() * 5) + 6) * 60;
          }
        });
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Scroll chat to bottom with smoothly animated frames
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, isChatOpen]);

  // Handle suggested chip clicking
  const handleSuggestedPrompt = (promptText: string) => {
    setInputMessage(promptText);
    sendMessage(promptText);
  };

  // Convert minutes & seconds for a cleaner reading format
  const formatTimeLeft = (secondsTotal: number) => {
    if (secondsTotal === undefined) return "Calculating...";
    const m = Math.floor(secondsTotal / 60);
    const s = secondsTotal % 60;
    if (m === 0 && s === 0) return "Arriving Now 🚉";
    return `${m}m ${s < 10 ? "0" : ""}${s}s`;
  };

  // Simulate an instant delay alert trigger
  const triggerSimulatedDelay = () => {
    // Select a random train to delay
    if (timetables.length === 0) return;
    const randomIndex = Math.floor(Math.random() * timetables.length);
    const targetTrain = timetables[randomIndex];

    const updated = [...timetables];
    updated[randomIndex] = {
      ...targetTrain,
      status: "Delayed",
      minutes: targetTrain.minutes + 8
    };

    // Update countdown seconds
    setSecCounters((prev) => ({
      ...prev,
      [targetTrain.id]: (targetTrain.minutes + 8) * 60
    }));

    setTimetables(updated);

    const alertText = `⚠️ SIGNAL FAILURE SIMULATED: ${targetTrain.line} heading to ${targetTrain.destination} is now experiencing severe delay of +8 minutes due to simulated rail obstruction.`;
    setSystemAlertMessage(alertText);

    // Auto-dismiss simulated alert banner after 12 seconds
    setTimeout(() => {
      setSystemAlertMessage(null);
    }, 12000);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Extract pure base64 code by stripping the prefix "data:...;base64,"
      const commaIndex = base64String.indexOf(",");
      const pureBase64 = commaIndex !== -1 ? base64String.substring(commaIndex + 1) : base64String;

      setSelectedImage({
        data: pureBase64,
        mimeType: file.type,
        previewUrl: base64String // used for frontend image element src
      });
    };
    reader.readAsDataURL(file);
  };

  const triggerImageSelector = () => {
    fileInputRef.current?.click();
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Chat message submission API handler
  const sendMessage = async (overrideText?: string) => {
    const textToSend = overrideText !== undefined ? overrideText : inputMessage;
    if (!textToSend.trim() && !selectedImage) return;

    const userMessageId = `user-${Date.now()}`;
    const userMsg: Message = {
      id: userMessageId,
      role: "user",
      text: textToSend,
      timestamp: new Date()
    };

    if (selectedImage) {
      userMsg.image = {
        data: selectedImage.data,
        mimeType: selectedImage.mimeType
      };
    }

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setLoading(true);

    const imageToSend = selectedImage ? { ...selectedImage } : null;
    removeSelectedImage();

    try {
      // Gather relevant client message histories for stateless full-context thread handling
      const messageThread = messages.map((m) => ({
        role: m.role,
        text: m.text,
        image: m.image
      }));

      // Append current message
      messageThread.push({
        role: "user",
        text: textToSend,
        image: imageToSend ? { data: imageToSend.data, mimeType: imageToSend.mimeType } : undefined
      });

      const lang = detectLanguage(messageThread);

      // POST to our Express backend /api/chat proxy endpoint
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messageThread })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error || "TransitMY backend server error.");
      }

      const data = await res.json();
      const replyText = data.text || "I am sorry, I could not generate a response.";
      
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "model",
          text: replyText,
          timestamp: new Date()
        }
      ]);
    } catch (err: any) {
      console.error("Express API connection failed, using local fallback:", err);
      const messageThread = messages.map((m) => ({
        role: m.role,
        text: m.text,
        image: m.image
      }));
      messageThread.push({
        role: "user",
        text: textToSend,
        image: imageToSend ? { data: imageToSend.data, mimeType: imageToSend.mimeType } : undefined
      });
      const lang = detectLanguage(messageThread);
      const replyText = getLocalFallbackText(messageThread, lang);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "model",
          text: replyText,
          timestamp: new Date(),
          isError: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Stations available for filtering based on our timetable database
  const stationsToFilter = ["All", "KL Sentral", "Bukit Bintang", "Hang Tuah", "Ampang Park"];

  const filteredTimetables = timetables.filter((t) => {
    if (stationFilter === "All") return true;
    return t.station.toLowerCase() === stationFilter.toLowerCase();
  });


  const t = UI_TRANSLATIONS[lang];

  return (
    <div id="transitmy-app" className="flex flex-col min-h-screen bg-slate-50 font-sans dark:bg-zinc-900 dark:text-zinc-100 transition-colors duration-300 pb-[68px] md:pb-0">
      
      {/* 1. TOP HEADER WITH ACCENT STRIPES & LANG SWITCHER */}
      <header className="sticky top-0 z-50 h-16 bg-white dark:bg-zinc-800 border-b border-slate-200 dark:border-zinc-700 flex items-center justify-between px-4 sm:px-8 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          {/* Authentic vertical Malaysia flag accent bars */}
          <div className="flex gap-1 shrink-0">
            <div className="w-2 sm:w-3 h-5 sm:h-6 bg-malaysia-blue rounded-sm"></div>
            <div className="w-2 sm:w-3 h-5 sm:h-6 bg-malaysia-red rounded-sm"></div>
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-1.5 font-display">
              Transit<span className="text-malaysia-blue dark:text-blue-400">MY</span>
              <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-zinc-700 text-slate-500 dark:text-zinc-400 text-[10px] rounded font-semibold uppercase tracking-wider">
                BETA
              </span>
            </h1>
            <p className="hidden md:block text-xs text-slate-400 dark:text-zinc-400">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Right side Language Switcher bar */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex bg-slate-100 dark:bg-zinc-700 p-0.5 sm:p-1 rounded-lg text-xs font-semibold">
            {(["en", "bm", "zh", "ta"] as Language[]).map((ln) => (
              <button
                key={ln}
                onClick={() => setLang(ln)}
                className={`px-2 sm:px-3 py-1 rounded-md transition-all ${
                  lang === ln
                    ? "bg-white dark:bg-zinc-600 shadow-sm text-malaysia-blue dark:text-blue-400 font-bold"
                    : "text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200"
                }`}
              >
                {ln.toUpperCase()}
              </button>
            ))}
          </div>
          {/* Theme Switcher Button */}
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-600 flex items-center justify-center text-slate-500 dark:text-zinc-300 transition-colors"
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>


        </div>
      </header>

      {/* SYSTEM DYNAMIC SIMULATED ALERT WRAPPER */}
      {systemAlertMessage && (
        <div className="bg-amber-500 text-white py-2.5 px-4 sm:px-8 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-md transition-all animate-bounce">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0" />
            <p>{systemAlertMessage}</p>
          </div>
          <button onClick={() => setSystemAlertMessage(null)} className="hover:opacity-80 p-1 shrink-0">
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── ROLLING INFO TICKER (peak hours + tourist advisories) ── */}
      {(() => {
        const peakMessages: Record<Language, string[]> = {
          en: [
            "⏰ PEAK HOURS: Mon–Fri 7:30–9:00am & 5:30–7:30pm — expect packed trains. Board at rear/middle cars for more space.",
            "🎫 TOURIST TIP: Buy a Touch 'n Go card at any major station — skip token queues and get discounted fares.",
            "🚇 TRANSFER TIP: At interchange stations (Masjid Jamek, Pasar Seni), do NOT tap out — walk directly between lines.",
            "🍔 NO EATING: RM500 fine for food/drinks inside trains or paid concourse areas. Finish snacks before the gate.",
            "👩 PINK COACHES: MRT & LRT have dedicated Women-Only coaches marked with pink flower stickers. Men are not permitted.",
            "🧳 AIRPORT: KLIA Ekspres from KL Sentral reaches KLIA in 28 mins. Buy online for 10% discount.",
          ],
          bm: [
            "⏰ WAKTU PUNCAK: Isnin–Jumaat 7:30–9:00pg & 5:30–7:30ptg — tren amat sesak. Naik di gerabak belakang/tengah.",
            "🎫 PELANCONG: Beli kad Touch 'n Go di stesen utama — elak beratur panjang dan nikmati tambang diskaun.",
            "🚇 PERTUKARAN: Di stesen pertukaran (Masjid Jamek, Pasar Seni), JANGAN tap keluar — jalan terus tukar laluan.",
            "🍔 DILARANG MAKAN: Denda RM500 untuk makan/minum di dalam tren atau kawasan prabayar.",
          ],
          zh: [
            "⏰ 高峰时段：周一至五上午7:30–9:00及傍晚5:30–7:30 — 列车极为拥挤。请尽量乘坐后节或中节车厢。",
            "🎫 游客贴士：在主要车站购买 Touch 'n Go 卡，免去排队买票，享受优惠票价。",
            "🚇 换乘提示：在换乘站（占美清真寺、中央艺术坊）换乘时切勿刷卡出闸，直接步行换乘即可。",
            "🍔 禁止饮食：在列车内或付费区内吃喝将被罚款 RM500。请在出闸前用完食物。",
          ],
          ta: [
            "⏰ பருவ நேரம்: திங்கள்–வெள்ளி 7:30–9:00 மு.ப & 5:30–7:30 மா.ப — ரயில்கள் மிகவும் நிரம்பியிருக்கும்.",
            "🎫 சுற்றுலா குறிப்பு: Touch 'n Go கார்டை வாங்கி வரிசையில் காத்திருக்காமல் பயணிக்கலாம்.",
            "🚇 பரிமாற்றம்: மஸ்ஜித் ஜமெக், பாசார் செனி நிலையங்களில் கார்டை டாப் அவுட் செய்யாமல் நேரடியாக நடந்து செல்லுங்கள்.",
          ],
        };
        const msgs = [...(announcements.map(a => a.text)), ...(peakMessages[lang] || peakMessages.en)];
        return (
          <div className="bg-slate-800 dark:bg-zinc-950 text-white overflow-hidden h-7 flex items-center shrink-0 border-b border-slate-700 dark:border-zinc-800">
            <div className="shrink-0 bg-malaysia-red text-white text-[10px] font-bold px-2.5 h-full flex items-center gap-1 z-10">
              <AlertTriangle size={10} />
              <span>LIVE</span>
            </div>
            <div className="flex-1 overflow-hidden relative">
              <div
                className="flex whitespace-nowrap"
                style={{
                  animation: "ticker-scroll 60s linear infinite",
                }}
              >
                {[...msgs, ...msgs].map((msg, i) => (
                  <span key={i} className="text-[11px] text-slate-200 px-8 shrink-0">{msg}</span>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* MAIN APPLICATION STAGE (BENTO ROW LAYOUT FOR MULTI-COLUMN DESIGN) */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 w-full max-w-7xl mx-auto p-3 sm:p-4 gap-4 overflow-hidden relative">
        
        {/* ==========================================
            CENTER CHAT LAYOUT PANEL (PRIMARY INTERACTION)
            ========================================== */}
        <div className="flex-1 flex flex-col bg-white dark:bg-zinc-800 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-zinc-700 shadow-lg md:shadow-xl relative overflow-hidden h-full">
          
          {/* Mobile Timetable Arrival banner (sticky overlay for quick mobile glance) */}
          {activeTab !== "arrivals" && (
            <div className="md:hidden bg-slate-50 dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 p-2 text-xs flex items-center justify-between gap-2 overflow-x-auto whitespace-nowrap shrink-0">
              <span className="font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                <Clock size={12} className="text-malaysia-blue dark:text-blue-400 shrink-0" />
                Live arrivals:
              </span>
              <div className="flex gap-2 text-[10px]">
                {timetables.slice(0, 3).map((item) => {
                  const secs = secCounters[item.id] !== undefined ? secCounters[item.id] : item.minutes * 60;
                  return (
                    <span key={item.id} className="bg-white dark:bg-zinc-800 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700">
                      <strong style={{ color: item.color }}>{item.destination}</strong> • {formatTimeLeft(secs)}
                    </span>
                  );
                })}
              </div>
              <button
                onClick={() => {
                  setIsChatOpen(!isChatOpen);
                }}
                className="text-[10px] font-bold text-malaysia-blue dark:text-blue-400 underline cursor-pointer shrink-0"
              >
                Ask AI
              </button>
            </div>
          )}

          {/* Top Panel Tab Bar (Docked Tab bar inside center column) */}
          <div className="hidden md:flex bg-slate-100 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 p-2 overflow-x-auto shrink-0 gap-1 scrollbar-none select-none">
            {[
              { id: "arrivals", label: t.arrivalsTab, icon: <Clock size={14} /> },
              { id: "planner", label: t.plannerTab, icon: <Compass size={14} /> },
              { id: "network", label: t.routesTab, icon: <Network size={14} /> },
              { id: "ticketing", label: t.passesTab, icon: <Ticket size={14} /> },
              { id: "maps", label: t.mapsTab, icon: <Map size={14} /> },
              { id: "fares", label: t.faresTab, icon: <TrendingUp size={14} /> },
              { id: "tips", label: t.tipsTab, icon: <AlertCircle size={14} /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer border ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-zinc-800 shadow-sm text-malaysia-blue dark:text-blue-400 border-slate-200 dark:border-zinc-700 font-extrabold"
                    : "text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 border-transparent bg-transparent"
                }`}
              >
                <div className={`${activeTab === tab.id ? "text-malaysia-blue dark:text-sky-400 scale-110" : "text-slate-400"} shrink-0`}>
                  {tab.icon}
                </div>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Unified Interactive visual panels switcher: Show visual representations on BOTH mobile and desktop when they choose any reference tab */}
          <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto bg-slate-50 dark:bg-zinc-900 transition-all duration-300">
            
            {/* Responsive Header detailing current active reference tab summary */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-zinc-800 shrink-0">
                <div className="flex items-center gap-2">
                  {activeTab === "arrivals" && <Clock className="text-malaysia-blue dark:text-blue-400 animate-pulse" size={20} />}
                  {activeTab === "planner" && <Compass className="text-malaysia-blue dark:text-blue-400 animate-spin-slow" size={20} />}
                  {activeTab === "network" && <Network className="text-malaysia-blue dark:text-blue-400" size={20} />}
                  {activeTab === "ticketing" && <Ticket className="text-malaysia-blue dark:text-blue-400" size={20} />}
                  {activeTab === "tips" && <Sliders className="text-malaysia-blue dark:text-blue-400" size={20} />}
                  {activeTab === "fares" && <TrendingUp className="text-malaysia-blue dark:text-blue-400" size={20} />}
                  {activeTab === "maps" && <Map className="text-malaysia-blue dark:text-blue-400" size={20} />}
                  
                  <h3 className="font-bold text-slate-800 dark:text-white capitalize text-base sm:text-lg font-display">
                    {activeTab === "arrivals" ? (lang === "en" ? "Live Arrivals & Status" : lang === "bm" ? "Ketibaan Langsung & Status" : lang === "zh" ? "实时到达及状态" : "நேரடி வருகைகள் & நிலை") :
                     activeTab === "planner" ? (lang === "en" ? "Route & Fare Estimator" : lang === "bm" ? "Anggaran Tambang & Laluan" : lang === "zh" ? "线路与票价智能规划" : "பாதை கணிப்பான்") :
                     activeTab === "network" ? t.networkTitle : 
                     activeTab === "ticketing" ? t.ticketingTitle :
                     activeTab === "tips" ? t.tipsTitle :
                     activeTab === "fares" ? t.faresTitle :
                     t.mapsTitle}
                  </h3>
                </div>
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="px-3.5 py-1.5 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-200 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <MessageSquare size={13} />
                  Ask AI
                </button>
              </div>

              {/* ==================== 0A. LIVE ARRIVALS & STATUS (New Central Focal Point) ==================== */}
              {activeTab === "arrivals" && (
                <div className="flex flex-col md:flex-row gap-4 h-full min-h-0">
                  <div className="flex-1 bg-white dark:bg-zinc-800 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-zinc-700 shadow-sm flex flex-col shrink-0 min-h-0">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="text-malaysia-blue dark:text-blue-400" size={20} />
                        <h2 className="font-bold text-slate-800 dark:text-white text-lg">
                          Live Station Arrivals
                        </h2>
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="System telemetry stream online"></span>
                    </div>

                    {/* Filter selection dropdown */}
                    <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-sm">
                      <span className="text-slate-500 dark:text-zinc-400 font-semibold shrink-0">{t.currentStation}</span>
                      <select
                        value={stationFilter}
                        onChange={(e) => setStationFilter(e.target.value)}
                        className="bg-slate-100 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-lg px-3 py-1.5 border-none font-semibold focus:ring-2 focus:ring-malaysia-blue pointer-events-auto w-full sm:w-auto min-w-0 max-w-full sm:max-w-[200px] truncate text-sm"
                      >
                        {stationsToFilter.map((st) => (
                          <option key={st} value={st}>
                            {st === "All" ? t.allStations : st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 min-h-[300px] scrollbar-thin">
                      {filteredTimetables.length === 0 ? (
                        <div className="text-center py-10 text-sm text-slate-400">
                          No train service timetables matching this hub.
                        </div>
                      ) : (
                        filteredTimetables.map((item) => {
                          const secondsLeft = secCounters[item.id] !== undefined ? secCounters[item.id] : item.minutes * 60;
                          const isDelay = item.status === "Delayed" || item.status === "Minor Delay";
                          return (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 transition hover:bg-slate-100 dark:hover:bg-zinc-800/80"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {/* Direct Line Badge Indicators */}
                                <div
                                  className="w-2 h-10 rounded-full shrink-0"
                                  style={{ backgroundColor: item.color }}
                                ></div>
                                <div className="min-w-0">
                                  <p className="font-bold text-sm sm:text-base text-slate-800 dark:text-white truncate">
                                    {item.destination}
                                  </p>
                                  <p className="text-xs text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                                    {item.station} • {item.line}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <span
                                  className={`text-sm sm:text-lg font-mono font-bold block ${
                                    isDelay ? "text-amber-500" : "text-emerald-500"
                                  }`}
                                >
                                  {formatTimeLeft(secondsLeft)}
                                </span>
                                <span className="text-[10px] sm:text-xs mt-0.5 px-1.5 py-0.5 inline-block bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 rounded font-medium">
                                  {item.status}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Simulated Live telemetry controls */}
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-700 flex items-center justify-between gap-1 shrink-0">
                      <span className="text-xs text-slate-400 dark:text-zinc-400 font-medium">
                        Auto sync: {refreshCountdown}s
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={triggerSimulatedDelay}
                          className="px-3 py-1.5 text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 rounded-lg hover:bg-rose-100 transition-colors"
                          title="Inject randomly generated delay"
                        >
                          Delay Simulator
                        </button>
                        <button
                          onClick={fetchTimetableData}
                          className="p-2 rounded-lg bg-slate-100 dark:bg-zinc-700 hover:bg-slate-200 text-slate-600 dark:text-zinc-300 transition-colors"
                          title={t.refreshBtn}
                        >
                          <RefreshCw size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-3 italic leading-tight text-center">
                      {t.disclaimer}
                    </p>
                  </div>

                  {/* Right side area for Operator status */}
                  <div className="w-full md:w-[320px] bg-white dark:bg-zinc-800 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-zinc-700 shadow-sm flex flex-col shrink-0 h-fit lg:h-full">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wider flex items-center gap-1.5">
                          <Sliders size={16} className="text-malaysia-blue dark:text-blue-400" />
                          Operator Status
                        </h3>
                        <span className="text-[10px] bg-sky-50 dark:bg-zinc-900 border border-sky-100 dark:border-zinc-800/60 text-sky-600 dark:text-sky-400 px-1.5 py-0.5 rounded font-mono font-bold animate-pulse">
                          AUTO-SYNCED
                        </span>
                      </div>
                      <div className="space-y-3">
                        {[
                          { line: "LRT Kelana Jaya", interval: "3 mins", status: "Optimal", color: "#EF4444" },
                          { line: "MRT Kajang", interval: "4 mins", status: "Optimal", color: "#10B981" },
                          { line: "MRT Putrajaya", interval: "6 mins", status: "Optimal", color: "#EC4899" },
                          { line: "KL Monorail", interval: "7 mins", status: "Dense Crowd", color: "#84CC16" },
                          { line: "KTM Komuter", interval: "30 mins", status: "Joint-Track Ops", color: "#3B82F6" },
                          { line: "ERL Airport Link", interval: "20 mins", status: "On Schedule", color: "#A855F7" }
                        ].map((op, oIdx) => (
                          <div key={oIdx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800 transition hover:bg-slate-100 dark:hover:bg-zinc-800/80">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: op.color }}></div>
                              <span className="text-xs font-bold text-slate-700 dark:text-zinc-200 truncate">{op.line}</span>
                            </div>
                            <div className="text-right flex items-center gap-2 shrink-0">
                              <span className="text-[10px] text-slate-400 dark:text-zinc-400 font-mono italic">{op.interval}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold text-white shadow-sm ${
                                op.status === "Optimal" || op.status === "On Schedule" 
                                  ? "bg-emerald-500/90" 
                                  : op.status === "Dense Crowd" 
                                  ? "bg-amber-500/90" 
                                  : "bg-blue-500/90"
                              }`}>{op.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-5 space-y-3 shrink-0 flex-1 md:flex-none md:mt-auto">
                      <div className="p-3 bg-[#CC0001]/10 border border-[#CC0001]/20 dark:bg-rose-950/40 dark:border-rose-900/40 rounded-xl leading-relaxed">
                        <p className="text-xs text-[#CC0001] dark:text-rose-400 font-bold flex items-center gap-1.5 mb-1.5 uppercase tracking-wide">
                          <Volume2 size={14} className="animate-bounce" /> Peak Hour Warning
                        </p>
                        <p className="text-[11px] text-[#CC0001]/80 dark:text-rose-400/80">
                          Major interchanges are highly congested <strong>7:30-9am</strong> and <strong>5pm-7pm</strong>. Plan accordingly!
                        </p>
                      </div>

                      <div className="p-3 bg-amber-50/70 border border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/40 rounded-xl leading-relaxed">
                        <p className="text-xs text-amber-800 dark:text-amber-300 font-bold flex items-center gap-1.5 mb-1.5">
                          <Info size={14} /> Tourist Advisory
                        </p>
                        <p className="text-[11px] text-amber-700 dark:text-amber-400">
                          Always ensure your Touch 'n Go card has a minimum balance of <strong>RM2.00</strong> before entering any RapidKL terminal gates to avoid barrier locking.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================== 0. INTERACTIVE JOURNEY PLANNER & FARES ESTIMATOR (Tier 1 Priority!) ==================== */}
              {activeTab === "planner" && (
                <JourneyPlanner lang={lang} />
              )}

              {/* ==================== 1. VISUAL ROUTE STATION ORDER MODULE ==================== */}
              {activeTab === "network" && (
                <div className="space-y-5">
                  <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
                    {lang === "en" ? "Select a transit line below to view the official station order, interchanges, and specific route insights." :
                     lang === "bm" ? "Pilih aliran pengangkutan di bawah untuk melihat susunan rasmi stesen, stesen pertukaran, dan maklumat lanjut." :
                     lang === "zh" ? "在下方选择轨道线路，即可直观查看车站顺序、转乘站及乘车指南。" :
                     "கீழே உள்ள ரயில் சேவையைத் தேர்ந்தெடுத்து நிலையங்களின் வரிசைமுறையைக் காணுங்கள்."}
                  </p>

                  {/* 1A. Line selector horizontal scroll cards */}
                  <div className="flex gap-2.5 overflow-x-auto pb-2 select-none shrink-0 scrollbar-thin">
                    {[
                      { code: "LRT 5", name: "Kelana Jaya", color: "#EF4444", short: "LRT 5" },
                      { code: "MRT 9", name: "Kajang", color: "#10B981", short: "MRT 9" },
                      { code: "MRT 12", name: "Putrajaya", color: "#EC4899", short: "MRT 12" },
                      { code: "Monorail 8", name: "KL Monorail", color: "#84CC16", short: "MRL 8" },
                      { code: "KTM 1", name: "Seremban Line", color: "#3B82F6", short: "KTM 1" },
                      { code: "ERL 7", name: "KLIA Express", color: "#A855F7", short: "ERL 7" }
                    ].map((lineItem) => (
                      <button
                        key={lineItem.code}
                        onClick={() => {
                          setSelectedNetworkLine(lineItem.code);
                          // Auto set local selected station to first node of line
                          if (lineItem.code === "LRT 5") setSelectedStationCode("KJ15");
                          else if (lineItem.code === "MRT 9") setSelectedStationCode("KG18A");
                          else if (lineItem.code === "MRT 12") setSelectedStationCode("PY20");
                          else if (lineItem.code === "Monorail 8") setSelectedStationCode("MR6");
                          else if (lineItem.code === "KTM 1") setSelectedStationCode("KC05");
                          else if (lineItem.code === "ERL 7") setSelectedStationCode("KE1");
                        }}
                        className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                          selectedNetworkLine === lineItem.code
                            ? "bg-white dark:bg-zinc-800 shadow-md border-slate-300 dark:border-zinc-700"
                            : "bg-slate-100/70 dark:bg-zinc-800 hover:bg-white dark:hover:bg-zinc-800 border-transparent text-slate-500 dark:text-zinc-400"
                        }`}
                      >
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: lineItem.color }}></div>
                        <div className="text-left font-mono">
                          <span className="block text-[10px] opacity-75">{lineItem.short}</span>
                          <span className="block text-slate-800 dark:text-white leading-normal -mt-0.5">{lineItem.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* 1B. ETA-aware station list */}
                  {(() => {
                    const LINE_COLOR: Record<string, string> = {
                      "LRT 5": "#EF4444", "MRT 9": "#10B981", "MRT 12": "#EC4899",
                      "Monorail 8": "#84CC16", "KTM 1": "#3B82F6", "ERL 7": "#A855F7"
                    };
                    const color = LINE_COLOR[selectedNetworkLine] ?? "#64748B";
                    const stationList = (selectedNetworkLine === "LRT 5" ? [
                      { code: "KJ1", name: "Gombak", isInterchange: false, transfers: [] },
                      { code: "KJ2", name: "Taman Melati", isInterchange: false, transfers: [] },
                      { code: "KJ3", name: "Wangsa Maju", isInterchange: false, transfers: [] },
                      { code: "KJ4", name: "Sri Rampai", isInterchange: false, transfers: [] },
                      { code: "KJ5", name: "Setiawangsa", isInterchange: false, transfers: [] },
                      { code: "KJ6", name: "Jelatek", isInterchange: false, transfers: [] },
                      { code: "KJ7", name: "Dato' Keramat", isInterchange: false, transfers: [] },
                      { code: "KJ8", name: "Damai", isInterchange: false, transfers: [] },
                      { code: "KJ9", name: "Ampang Park", isInterchange: true, transfers: ["PY19"], tip: "Underground tunnel swap to MRT Putrajaya line." },
                      { code: "KJ10", name: "KLCC", isInterchange: false, transfers: [], tip: "Twin Towers. Air-con walkway to Bukit Bintang." },
                      { code: "KJ11", name: "Kampung Baru", isInterchange: false, transfers: [] },
                      { code: "KJ12", name: "Dang Wangi", isInterchange: false, transfers: [], tip: "Walk 5 min to Bukit Nanas Monorail station." },
                      { code: "KJ13", name: "Masjid Jamek", isInterchange: true, transfers: ["AG3","SP3"], tip: "Do NOT tap out — walk directly to swap lines." },
                      { code: "KJ14", name: "Pasar Seni", isInterchange: true, transfers: ["KG16"], tip: "Chinatown hub. Walk to MRT Kajang & old KTM." },
                      { code: "KJ15", name: "KL Sentral", isInterchange: true, transfers: ["MR1","KA1","KE1","KG15"], tip: "Malaysia's main hub. Follow colour-coded signs." },
                      { code: "KJ16", name: "Bangsar", isInterchange: false, transfers: [] },
                      { code: "KJ17", name: "Abdullah Hukum", isInterchange: true, transfers: ["KD01"], tip: "Walkway to Mid Valley Megamall." },
                      { code: "KJ18", name: "Kerinchi", isInterchange: false, transfers: [] },
                      { code: "KJ19", name: "Universiti", isInterchange: false, transfers: [] },
                      { code: "KJ20", name: "Taman Jaya", isInterchange: false, transfers: [] },
                      { code: "KJ21", name: "Asia Jaya", isInterchange: false, transfers: [] },
                      { code: "KJ22", name: "Taman Paramount", isInterchange: false, transfers: [] },
                      { code: "KJ23", name: "Taman Bahagia", isInterchange: false, transfers: [] },
                      { code: "KJ24", name: "Kelana Jaya", isInterchange: false, transfers: [] },
                      { code: "KJ25", name: "Lembah Subang", isInterchange: false, transfers: [] },
                      { code: "KJ26", name: "Ara Damansara", isInterchange: false, transfers: [] },
                      { code: "KJ27", name: "Glenmarie", isInterchange: false, transfers: [] },
                      { code: "KJ28", name: "Subang Jaya", isInterchange: true, transfers: ["KD09"], tip: "Interchange with KTM Port Klang Line." },
                      { code: "KJ29", name: "SS15", isInterchange: false, transfers: [], tip: "Student hub — bubble tea street & cafes." },
                      { code: "KJ30", name: "SS18", isInterchange: false, transfers: [] },
                      { code: "KJ31", name: "USJ 7", isInterchange: true, transfers: ["SB7"], tip: "BRT Sunway → Sunway Lagoon & Pyramid." },
                      { code: "KJ32", name: "Taipan", isInterchange: false, transfers: [] },
                      { code: "KJ33", name: "Wawasan", isInterchange: false, transfers: [] },
                      { code: "KJ34", name: "USJ 21", isInterchange: false, transfers: [] },
                      { code: "KJ35", name: "Alam Megah", isInterchange: false, transfers: [] },
                      { code: "KJ36", name: "Subang Alam", isInterchange: false, transfers: [] },
                      { code: "KJ37", name: "Putra Heights", isInterchange: true, transfers: ["SP31"], tip: "Terminal. Cross-platform swap to LRT Sri Petaling." },
                    ] : selectedNetworkLine === "MRT 9" ? [
                      { code: "KG04", name: "Kwasa Damansara", isInterchange: true, transfers: ["PY01"], tip: "Dual terminus — platform-skip to swap lines." },
                      { code: "KG05", name: "Kwasa Sentral", isInterchange: false, transfers: [] },
                      { code: "KG06", name: "Kota Damansara", isInterchange: false, transfers: [] },
                      { code: "KG07", name: "Surian", isInterchange: false, transfers: [] },
                      { code: "KG08", name: "Mutiara Damansara", isInterchange: false, transfers: [], tip: "Bridge link to Ikea & The Curve." },
                      { code: "KG09", name: "Bandar Utama", isInterchange: false, transfers: [], tip: "Direct to 1 Utama Shopping Mall." },
                      { code: "KG10", name: "TTDI", isInterchange: false, transfers: [] },
                      { code: "KG12", name: "Phileo Damansara", isInterchange: false, transfers: [] },
                      { code: "KG13", name: "Pusat Bandar Damansara", isInterchange: false, transfers: [] },
                      { code: "KG14", name: "Semantan", isInterchange: false, transfers: [] },
                      { code: "KG15", name: "Muzium Negara", isInterchange: true, transfers: ["KJ15"], tip: "250m air-con tunnel to KL Sentral." },
                      { code: "KG16", name: "Pasar Seni", isInterchange: true, transfers: ["KJ14"], tip: "Chinatown. Walkway to LRT Kelana Jaya Line." },
                      { code: "KG17", name: "Merdeka", isInterchange: true, transfers: ["AG4","SP4"] },
                      { code: "KG18A", name: "Bukit Bintang", isInterchange: true, transfers: ["MR6"], tip: "Exit A→Lot 10. Exit E→Pavilion KL." },
                      { code: "KG20", name: "Tun Razak Exchange (TRX)", isInterchange: true, transfers: ["PY23"], tip: "Deepest station. Cross-platform to MRT Putrajaya." },
                      { code: "KG21", name: "Cochrane", isInterchange: false, transfers: [], tip: "MyTown Mall & Ikea Cheras." },
                      { code: "KG22", name: "Maluri", isInterchange: true, transfers: ["AG2"] },
                      { code: "KG23", name: "Taman Pertama", isInterchange: false, transfers: [] },
                      { code: "KG24", name: "Taman Midah", isInterchange: false, transfers: [] },
                      { code: "KG25", name: "Taman Mutiara", isInterchange: false, transfers: [] },
                      { code: "KG26", name: "Taman Connaught", isInterchange: false, transfers: [] },
                      { code: "KG27", name: "Taman Suntex", isInterchange: false, transfers: [] },
                      { code: "KG28", name: "Sri Raya", isInterchange: false, transfers: [] },
                      { code: "KG29", name: "Bandar Tun Hussein Onn", isInterchange: false, transfers: [] },
                      { code: "KG30", name: "Batu 11 Cheras", isInterchange: false, transfers: [] },
                      { code: "KG31", name: "Bukit Dukung", isInterchange: false, transfers: [] },
                      { code: "KG32", name: "Sungai Jernih", isInterchange: false, transfers: [] },
                      { code: "KG33", name: "Stadium Kajang", isInterchange: false, transfers: [] },
                      { code: "KG34", name: "Sungai Kantan", isInterchange: false, transfers: [] },
                      { code: "KG35", name: "Kajang", isInterchange: true, transfers: ["KB06"], tip: "Terminal. Links to KTM Seremban Line." },
                    ] : selectedNetworkLine === "MRT 12" ? [
                      { code: "PY01", name: "Kwasa Damansara", isInterchange: true, transfers: ["KG04"] },
                      { code: "PY02", name: "Kampung Selamat", isInterchange: false, transfers: [] },
                      { code: "PY03", name: "Sungai Buloh", isInterchange: true, transfers: ["KA04"], tip: "Interchange with KTM Komuter." },
                      { code: "PY04", name: "Damansara Damai", isInterchange: false, transfers: [] },
                      { code: "PY05", name: "Sri Damansara Barat", isInterchange: false, transfers: [] },
                      { code: "PY06", name: "Sri Damansara Sentral", isInterchange: false, transfers: [] },
                      { code: "PY07", name: "Sri Damansara Timur", isInterchange: false, transfers: [] },
                      { code: "PY08", name: "Metro Prima", isInterchange: false, transfers: [] },
                      { code: "PY09", name: "Kepong Baru", isInterchange: false, transfers: [] },
                      { code: "PY10", name: "Jinjang", isInterchange: false, transfers: [] },
                      { code: "PY11", name: "Sri Delima", isInterchange: false, transfers: [] },
                      { code: "PY12", name: "Kampung Batu", isInterchange: true, transfers: ["KC03"] },
                      { code: "PY13", name: "Kentonmen", isInterchange: false, transfers: [] },
                      { code: "PY14", name: "Jalan Ipoh", isInterchange: false, transfers: [] },
                      { code: "PY15", name: "Sentul Barat", isInterchange: false, transfers: [] },
                      { code: "PY16", name: "Titiwangsa", isInterchange: true, transfers: ["SP1","AG1","MR11"], tip: "Major hub — LRT & Monorail interchange." },
                      { code: "PY17", name: "Hospital Kuala Lumpur", isInterchange: false, transfers: [] },
                      { code: "PY18", name: "Raja Uda", isInterchange: false, transfers: [] },
                      { code: "PY19", name: "Ampang Park", isInterchange: true, transfers: ["KJ9"], tip: "Underground crossing to LRT." },
                      { code: "PY20", name: "Persiaran KLCC", isInterchange: false, transfers: [] },
                      { code: "PY21", name: "Conlay", isInterchange: false, transfers: [] },
                      { code: "PY22", name: "Tun Razak Exchange (TRX)", isInterchange: true, transfers: ["KG20"] },
                      { code: "PY23", name: "Chan Sow Lin", isInterchange: true, transfers: ["AG11","SP11"] },
                      { code: "PY24", name: "Kuchai", isInterchange: false, transfers: [] },
                      { code: "PY25", name: "Taman Naga Emas", isInterchange: false, transfers: [] },
                      { code: "PY26", name: "Sungai Besi", isInterchange: true, transfers: ["SP16"] },
                      { code: "PY27", name: "Serdang Raya Utara", isInterchange: false, transfers: [] },
                      { code: "PY28", name: "Serdang Raya Selatan", isInterchange: false, transfers: [] },
                      { code: "PY29", name: "Serdang Jaya", isInterchange: false, transfers: [] },
                      { code: "PY30", name: "UPM", isInterchange: false, transfers: [] },
                      { code: "PY31", name: "Taman Equine", isInterchange: false, transfers: [] },
                      { code: "PY32", name: "Putra Permai", isInterchange: false, transfers: [] },
                      { code: "PY33", name: "16 Sierra", isInterchange: false, transfers: [] },
                      { code: "PY34", name: "Cyberjaya Utara", isInterchange: false, transfers: [] },
                      { code: "PY35", name: "Cyberjaya City Centre", isInterchange: false, transfers: [] },
                      { code: "PY36", name: "Putrajaya Sentral", isInterchange: true, transfers: ["KE3"], tip: "Terminal. ERL link to Airport." },
                    ] : selectedNetworkLine === "Monorail 8" ? [
                      { code: "MR1", name: "KL Sentral Monorail", isInterchange: true, transfers: ["KJ15"], tip: "Walk through Nu Sentral Mall to main hub." },
                      { code: "MR2", name: "Tun Sambanthan", isInterchange: false, transfers: [], tip: "Brickfields Little India." },
                      { code: "MR3", name: "Maharajalela", isInterchange: false, transfers: [] },
                      { code: "MR4", name: "Hang Tuah Interchange", isInterchange: true, transfers: ["SP9","AG9"], tip: "Direct to LaLaport BBCC." },
                      { code: "MR5", name: "Imbi", isInterchange: false, transfers: [], tip: "Berjaya Times Square Mall." },
                      { code: "MR6", name: "Bukit Bintang", isInterchange: true, transfers: ["KG18A"], tip: "Walk down to MRT Kajang line." },
                      { code: "MR7", name: "Raja Chulan", isInterchange: false, transfers: [] },
                      { code: "MR8", name: "Bukit Nanas", isInterchange: true, transfers: ["KJ12"], tip: "5-min walk to Dang Wangi LRT." },
                      { code: "MR9", name: "Medan Tuanku", isInterchange: false, transfers: [] },
                      { code: "MR10", name: "Chow Kit", isInterchange: false, transfers: [] },
                      { code: "MR11", name: "Titiwangsa Terminus", isInterchange: true, transfers: ["SP1","PY17"] },
                    ] : selectedNetworkLine === "KTM 1" ? [
                      { code: "KC05", name: "Batu Caves", isInterchange: false, transfers: [], tip: "Gateway to Batu Caves Hindu shrines." },
                      { code: "KC04", name: "Taman Wahyu", isInterchange: false, transfers: [] },
                      { code: "KC03", name: "Kampung Batu", isInterchange: true, transfers: ["PY12"] },
                      { code: "KC02", name: "Batu Kentonmen", isInterchange: false, transfers: [] },
                      { code: "KC01", name: "Sentul", isInterchange: false, transfers: [] },
                      { code: "KA04", name: "Putra", isInterchange: true, transfers: ["KTM 2"] },
                      { code: "KA03", name: "Bank Negara", isInterchange: true, transfers: ["KJ12","KTM 2"] },
                      { code: "KA02", name: "Kuala Lumpur (Old Station)", isInterchange: true, transfers: ["KJ14"] },
                      { code: "KA01", name: "KL Sentral", isInterchange: true, transfers: ["KJ15"], tip: "Main hub connection." },
                      { code: "KB01", name: "Mid Valley", isInterchange: false, transfers: [], tip: "Bridge to Mid Valley Megamall." },
                      { code: "KB02", name: "Seputeh", isInterchange: false, transfers: [] },
                      { code: "KB03", name: "Salak Selatan", isInterchange: false, transfers: [] },
                      { code: "KB04", name: "Bandar Tasik Selatan", isInterchange: true, transfers: ["SP15","KE2"], tip: "TBS south-bound bus terminal." },
                      { code: "KB05", name: "Serdang", isInterchange: false, transfers: [] },
                      { code: "KB06", name: "Kajang", isInterchange: true, transfers: ["KG35"] },
                      { code: "KB07", name: "UKM", isInterchange: false, transfers: [] },
                      { code: "KB08", name: "Bangi", isInterchange: false, transfers: [] },
                      { code: "KB09", name: "Batang Benar", isInterchange: false, transfers: [] },
                      { code: "KB10", name: "Nilai", isInterchange: false, transfers: [] },
                      { code: "KB11", name: "Labu", isInterchange: false, transfers: [] },
                      { code: "KB12", name: "Tiroi", isInterchange: false, transfers: [] },
                      { code: "KB13", name: "Seremban", isInterchange: false, transfers: [] },
                      { code: "KB14", name: "Senawang", isInterchange: false, transfers: [] },
                      { code: "KB15", name: "Sungai Gadut", isInterchange: false, transfers: [] },
                      { code: "KB16", name: "Rembau", isInterchange: false, transfers: [] },
                      { code: "KB17", name: "Pulau Sebang / Tampin", isInterchange: false, transfers: [] },
                    ] : [
                      { code: "KE1", name: "KL Sentral Airport Hub", isInterchange: true, transfers: ["KJ15"], tip: "ERL gates inside concourse. Buy online 10% off." },
                      { code: "KE2", name: "Bandar Tasik Selatan (TBS)", isInterchange: true, transfers: ["SP15","KB04"] },
                      { code: "KE3", name: "Putrajaya Sentral", isInterchange: true, transfers: ["PY36"] },
                      { code: "KE4", name: "Salak Tinggi", isInterchange: false, transfers: [] },
                      { code: "KE5", name: "KLIA Terminal 1", isInterchange: false, transfers: [], tip: "Follow signs to airport check-in." },
                      { code: "KE6", name: "KLIA Terminal 2 (KLIA2)", isInterchange: false, transfers: [], tip: "Low-cost terminal. Under Gateway@KLIA2." },
                    ]);

                    const selIdx = stationList.findIndex(s => s.code === selectedStationCode);
                    const arrivingIdx = selIdx >= 0 ? selIdx : Math.floor(stationList.length / 3);

                    const getEta = (idx: number) => {
                      const diff = idx - arrivingIdx;
                      if (diff === 0) return { label: "ARRIVING", cls: "bg-emerald-500 text-white animate-pulse", dimmed: false };
                      if (diff === -1) return { label: "DEPARTED", cls: "bg-slate-300 dark:bg-zinc-600 text-slate-600 dark:text-zinc-400", dimmed: false };
                      if (diff < -1) return { label: "DEPARTED", cls: "bg-slate-100 dark:bg-zinc-800 text-slate-300 dark:text-zinc-600", dimmed: true };
                      if (diff === 1) return { label: "NEXT", cls: "bg-amber-400 text-slate-900 font-bold", dimmed: false };
                      return { label: `~${diff * 3}m`, cls: "bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400", dimmed: false };
                    };

                    const lineName = selectedNetworkLine === "LRT 5" ? "Kelana Jaya Line" : selectedNetworkLine === "MRT 9" ? "Kajang MRT" : selectedNetworkLine === "MRT 12" ? "Putrajaya MRT" : selectedNetworkLine === "Monorail 8" ? "KL Monorail" : selectedNetworkLine === "KTM 1" ? "KTM Seremban" : "KLIA Ekspres/Transit";

                    return (
                      <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl shadow-sm overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900">
                          <div className="w-3 h-3 rounded-full shrink-0 animate-pulse" style={{ backgroundColor: color }} />
                          <span className="font-bold text-sm text-slate-800 dark:text-white">{lineName}</span>
                          <span className="ml-auto text-[10px] text-slate-400 dark:text-zinc-500 font-mono">{stationList.length} stations · click to set arriving</span>
                        </div>
                        <div className="overflow-y-auto max-h-[500px]">
                          <div className="relative pl-10 py-3 pr-3 space-y-0">
                            <div className="absolute left-4 top-4 bottom-4 w-1.5 rounded" style={{ backgroundColor: color, opacity: 0.2 }} />
                            {stationList.map((st, idx) => {
                              const eta = getEta(idx);
                              const isArriving = eta.label === "ARRIVING";
                              return (
                                <div
                                  key={st.code}
                                  ref={isArriving ? (el) => { if (el) setTimeout(() => el.scrollIntoView({ block: "center", behavior: "smooth" }), 100); } : undefined}
                                  className={`relative flex items-center gap-2 px-2.5 py-2 rounded-xl cursor-pointer transition-all border ${
                                    selectedStationCode === st.code
                                      ? "bg-slate-100 dark:bg-zinc-900 border-slate-200 dark:border-zinc-700"
                                      : eta.dimmed
                                      ? "border-transparent opacity-35 hover:opacity-60"
                                      : "border-transparent hover:bg-slate-50 dark:hover:bg-zinc-900"
                                  }`}
                                  onClick={() => setSelectedStationCode(st.code)}
                                >
                                  <div className="absolute -left-[29px] w-4 h-4 rounded-full border-[3px] border-white dark:border-zinc-800 transition-all shrink-0"
                                    style={{ backgroundColor: isArriving ? color : eta.dimmed ? "#94a3b8" : "#cbd5e1", transform: isArriving ? "scale(1.3)" : "scale(1)" }} />
                                  <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded text-white shrink-0" style={{ backgroundColor: color }}>{st.code}</span>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1 flex-wrap">
                                      <span className={`font-bold text-xs text-slate-800 dark:text-slate-100 ${eta.dimmed ? "line-through" : ""}`}>{st.name}</span>
                                      {st.isInterchange && <span className="text-[8px] font-bold bg-sky-100 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 px-1 py-0.5 rounded">↔</span>}
                                    </div>
                                    {st.isInterchange && st.transfers.length > 0 && (
                                      <div className="flex gap-0.5 mt-0.5 flex-wrap">
                                        {st.transfers.slice(0, 4).map(tr => (
                                          <span key={tr} className="text-[8px] font-mono font-bold bg-slate-100 dark:bg-zinc-700 text-slate-500 dark:text-zinc-300 px-1 rounded">{tr}</span>
                                        ))}
                                      </div>
                                    )}
                                    {(st as any).tip && (isArriving || selectedStationCode === st.code) && (
                                      <p className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-0.5 leading-snug">💡 {(st as any).tip}</p>
                                    )}
                                  </div>
                                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg shrink-0 ${eta.cls}`}>{eta.label}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div className="px-4 py-2 border-t border-slate-100 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500">Green = Arriving · Amber = Next · Grey = Departed · Ask AI for platform details</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* ==================== 2. VISUAL TICKETING FLOWS (NO EXCESSIVE WORDS) ==================== */}
              {activeTab === "ticketing" && (
                <div className="space-y-6">
                  <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
                    {lang === "en" ? "Kuala Lumpur's public rail system suggests 3 simple payment options. Choose one below to see the precise visual process." :
                     lang === "bm" ? "Sistem rel kuala lumpur menyokong 3 kaedah utama bayaran. Sila pilih satu untuk melihat panduan langkah demi langkah visual." :
                     lang === "zh" ? "吉隆坡轨道交通系统推荐 3 种乘车支付方式。请在下方点击了解极其直观的乘车步骤。" :
                     "பயண டிக்கெட்டுகளுக்கான 3 எளிய வழிமுறைகள் கீழே விளக்கப்பட்டுள்ளன."}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    
                    {/* Ticketing Option A: TnG Smartcard */}
                    <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0 shadow-sm border border-blue-200/50">
                            <CreditCard size={20} />
                          </div>
                          <div>
                            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-blue-500">Option 01 • Dynamic Smartcard</span>
                            <h4 className="font-bold text-slate-800 dark:text-white text-sm sm:text-base -mt-0.5">Touch 'n Go</h4>
                          </div>
                        </div>

                        <div className="space-y-4 relative pl-5 border-l border-slate-100 dark:border-zinc-800">
                          {[
                            { num: "01", title: "Counter Buy", desc: "Purchase card at any LRT/MRT Customer Counter. Total cost: RM15.00 (Includes RM10.00 preloaded fund & RM5.00 card fee)." },
                            { num: "02", title: "Tap to Enter", desc: "Hold card close to the yellow circle reader on the turnstile gates when entering the platform." },
                            { num: "03", title: "Dynamic debit", desc: "Tap again at exit gates. Fare is calculated dynamically and subtracted automatically. Safe and saves 10%!" }
                          ].map((step, idx) => (
                            <div key={idx} className="relative">
                              <div className="absolute -left-[30px] top-1.5 w-4 h-4 bg-blue-500 text-white font-mono text-[9px] font-bold rounded-full flex items-center justify-center shadow">
                                {step.num}
                              </div>
                              <h5 className="font-bold text-xs text-slate-700 dark:text-zinc-200">{step.title}</h5>
                              <p className="text-[10.5px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{step.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-zinc-800 text-[10px] text-blue-500 font-bold bg-blue-50/50 p-2 rounded-xl border border-blue-100/40">
                        ⭐ Passenger TIP: Best for visitors doing 4+ rides. Widely accepted inside taxis, convenience shops, and cafes.
                      </div>
                    </div>

                    {/* Ticketing Option B: Single token red coin */}
                    <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0 shadow-sm border border-orange-200/50">
                            <Layers size={20} />
                          </div>
                          <div>
                            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-orange-500">Option 02 • Single Trip Cashless</span>
                            <h4 className="font-bold text-slate-800 dark:text-white text-sm sm:text-base -mt-0.5">Single-Trip Token</h4>
                          </div>
                        </div>

                        <div className="space-y-4 relative pl-5 border-l border-slate-100 dark:border-zinc-800">
                          {[
                            { num: "01", title: "Vending Screen", desc: "Visit the blue/red Ticket Vending Machine (TVM) kiosk in any station hall. Touch screen and choose your destination." },
                            { num: "02", title: "Retrieve Token", desc: "Pay with currency notes or coins. Retrieve the physical red plastic token from the tray below." },
                            { num: "03", title: "Tap & Exit Drop", desc: "Tap the token on the gates reader to enter. On arrival, simply drop the red token inside the slot at the exit gates!" }
                          ].map((step, idx) => (
                            <div key={idx} className="relative">
                              <div className="absolute -left-[30px] top-1.5 w-4 h-4 bg-orange-500 text-white font-mono text-[9px] font-bold rounded-full flex items-center justify-center shadow">
                                {step.num}
                              </div>
                              <h5 className="font-bold text-xs text-slate-700 dark:text-zinc-200">{step.title}</h5>
                              <p className="text-[10.5px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{step.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-zinc-800 text-[10px] text-orange-600 font-bold bg-orange-50/50 p-2 rounded-xl border border-orange-100/40">
                        ⭐ Passenger TIP: Best for single casual trips. Many machines do not accept RM20/RM50, try to carry small RM1 / RM5 notes.
                      </div>
                    </div>

                    {/* Ticketing Option C: MyCity Tourist Pass */}
                    <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0 shadow-sm border border-purple-200/50">
                            <Ticket size={20} />
                          </div>
                          <div>
                            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-purple-500">Option 03 • Unlimited Pass</span>
                            <h4 className="font-bold text-slate-800 dark:text-white text-sm sm:text-base -mt-0.5">MyCity Visitor Pass</h4>
                          </div>
                        </div>

                        <div className="space-y-4 relative pl-5 border-l border-slate-100 dark:border-zinc-800">
                          {[
                            { num: "01", title: "Counter Visit", desc: "Present your passport/ID to the officer at any RapidKL Customer Service Counter." },
                            { num: "02", title: "Choose Duration", desc: "Purchase 1-Day Pass (RM5.00) or 3-Day Pass (RM15.00). Card is loaded electronically instantly." },
                            { num: "03", title: "Unlimited Taps", desc: "Tap endlessly in and out across all RapidKL LRT, MRT, and Monorail lines. Zero travel charges apply!" }
                          ].map((step, idx) => (
                            <div key={idx} className="relative">
                              <div className="absolute -left-[30px] top-1.5 w-4 h-4 bg-purple-500 text-white font-mono text-[9px] font-bold rounded-full flex items-center justify-center shadow">
                                {step.num}
                              </div>
                              <h5 className="font-bold text-xs text-slate-700 dark:text-zinc-200">{step.title}</h5>
                              <p className="text-[10.5px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{step.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-zinc-800 text-[10px] text-purple-600 font-bold bg-purple-50/50 p-2 rounded-xl border border-purple-100/40">
                        ⭐ Passenger TIP: Absolute savings for active sightseeing routes. Does NOT cover KTM commuter railways or airport high systems.
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* ==================== 3. POLITE, FRIENDLY SMART TIPS (NO SCISSORING OR RED SCOLDING) ==================== */}
              {activeTab === "tips" && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-2xl leading-relaxed mb-1">
                    {lang === "en" ? "Here are some friendly local observations and commuter recommendation hacks to ensure your journey across Kuala Lumpur is entirely comfortable." :
                     lang === "bm" ? "Berikut adalah beberapa panduan mesra penduduk tempatan dan syor komuter bagi memastikan perjalanan anda di Kuala Lumpur berjalan lancar." :
                     lang === "zh" ? "以下为您汇总吉隆坡本地暖心的乘车观察与通勤小建议，助力实现极为顺畅的旅途。" :
                     "உங்கள் பயணம் பாதுகாப்பானதாகவும் எளிமையானதாகவும் அமைய சில அன்பான ஆலோசனைகள்."}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {TRANSIT_TIPS[lang]?.map((tip, idx) => {
                      const labels = tipLabels[lang] || tipLabels["en"];
                      return (
                        <div key={idx} className="p-4 bg-emerald-50/60 dark:bg-emerald-950/15 border border-emerald-150 dark:border-emerald-900/60 rounded-2xl flex gap-3.5 items-start transition hover:translate-y-[-1px] hover:shadow-sm min-w-0">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-300 shrink-0 font-bold">
                            💡
                          </div>
                          <div className="space-y-1.5 min-w-0 flex-1">
                            <h4 className="font-extrabold text-slate-800 dark:text-white text-xs sm:text-sm uppercase tracking-wider break-words leading-tight">
                              {tip.title}
                            </h4>
                            <div className="min-w-0">
                              <span className="text-[10px] text-emerald-700 dark:text-emerald-450 font-bold block mb-0.5 break-words">{labels.know}</span>
                              <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed break-words">{tip.warning}</p>
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] text-indigo-700 dark:text-indigo-400 font-bold block mb-0.5 break-words">{labels.advice}</span>
                              <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed font-medium break-words">{tip.solution}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ==================== 4. FARES & DETAILED PAYMENTS MATRIX ==================== */}
              {activeTab === "fares" && (
                <div className="space-y-5">
                  <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-2xl leading-relaxed mb-2">
                    {lang === "en" ? "Fares are calculated strictly based on the distance traversed. Check the visual options matrix below for payment compatibility details." :
                     lang === "bm" ? "Tambang dikira mengikut jarak perjalanan. Sila semak jadual keserasian pembayaran di bawah untuk persediaan kad." :
                     lang === "zh" ? "乘车票价严格基于行车里程计费。请务必参考下方的支付渠道兼容表，避免无法进站。" :
                     "ரயில் சேவை வாரியாக நீங்கள் பயன்படுத்தக்கூடிய கட்டண முறைகள் கீழே பட்டியலிடப்பட்டுள்ளன."}
                  </p>

                  {/* 4A. Travel Type Category badging */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 shrink-0">
                    {[
                      { icon: <Train size={15} />, color: "text-rose-500 bg-rose-50" },
                      { icon: <Train size={15} />, color: "text-amber-500 bg-amber-50" },
                      { icon: <Train size={15} />, color: "text-blue-500 bg-blue-50" },
                      { icon: <Train size={15} />, color: "text-purple-500 bg-purple-50" },
                      { icon: <Bus size={15} />, color: "text-emerald-500 bg-emerald-50" }
                    ].map((cat, idx) => {
                      const localized = travelCategories[lang][idx] || travelCategories["en"][idx];
                      return (
                        <div key={idx} className={`p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800 ${cat.color} dark:bg-zinc-800/40 flex flex-col justify-between min-h-[72px] h-auto`}>
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="font-bold text-[11px] leading-tight break-words">{localized.text}</span>
                            <div className="shrink-0">{cat.icon}</div>
                          </div>
                          <span className="text-[9px] text-slate-400 dark:text-zinc-500 leading-normal break-words mt-1">{localized.desc}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* 4B. Fare Ranges Table */}
                  <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl p-4 sm:p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3">
                      {lang === "en" ? "Estimated Fares & Coverage" :
                       lang === "bm" ? "Anggaran Tambang & Liputan" :
                       lang === "zh" ? "预估票价与服务范围" :
                       "மதிப்பீட்டு கட்டணங்கள்"}
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-zinc-700 text-slate-400 dark:text-zinc-500 uppercase font-mono tracking-wider">
                            <th className="pb-2 font-bold">{lang === "en" ? "Transit Category" : "Kategori Transit"}</th>
                            <th className="pb-2 font-bold">{lang === "en" ? "Fare Range" : "Kadar Tambang"}</th>
                            <th className="pb-2 font-bold">{lang === "en" ? "Quick Info / Policy" : "Polisi Tambang"}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-750">
                          {FARE_GUESTIMATION[lang]?.map((fare, idx) => (
                            <tr key={idx} className="text-slate-650 dark:text-zinc-300">
                              <td className="py-2.5 font-bold text-slate-800 dark:text-white">{fare.lineType}</td>
                              <td className="py-2.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">{fare.range}</td>
                              <td className="py-2.5 text-slate-500 dark:text-zinc-400 leading-relaxed">{fare.notes}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================== 5. STATION INDOOR NAVIGATION MAPS ==================== */}
              {activeTab === "maps" && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
                    {lang === "en" ? "Explore KL Sentral's 3 levels interactively. Drag the map to pan, scroll to zoom, and click any room to learn what's inside." :
                     lang === "bm" ? "Jelajahi 3 tingkat KL Sentral secara interaktif. Seret peta, tatal untuk zum, dan klik mana-mana bilik untuk maklumat lanjut." :
                     lang === "zh" ? "以3D交互方式探索KL Sentral的三层结构。拖动平移，滚动缩放，点击任意区域查看详情。" :
                     "KL Sentral-ன் 3 தளங்களை 3D வரைபடத்தில் ஆராயுங்கள். இழுக்கவும், சுவர்களை கிளிக் செய்யவும்."}
                  </p>

                  <KLSentralMap3D theme={theme} />

                </div>
              )}


          </div>
        </div>

      </div>

      {/* ==========================================
          MOBILE BOTTOM NAVIGATION TAB BAR
          ========================================== */}
      <nav id="mobile-tab-navigation" className="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-zinc-800 border-t border-slate-200 dark:border-zinc-700 h-[68px] flex items-center gap-1 overflow-x-auto scrollbar-none px-4 py-1 z-40 shadow-inner">
        {[
          { id: "arrivals", label: t.arrivalsTab, icon: <Clock size={18} /> },
          { id: "planner", label: t.plannerTab, icon: <Compass size={18} /> },
          { id: "network", label: t.routesTab, icon: <Network size={18} /> },
          { id: "ticketing", label: t.passesTab, icon: <Ticket size={18} /> },
          { id: "maps", label: t.mapsTab, icon: <Map size={18} /> },
          { id: "fares", label: t.faresTab, icon: <TrendingUp size={18} /> },
          { id: "tips", label: t.tipsTab, icon: <AlertCircle size={18} /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabId)}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-center min-w-[72px] shrink-0 min-h-[44px] ${
              activeTab === tab.id
                ? "text-malaysia-blue dark:text-blue-400 font-bold"
                : "text-slate-400 dark:text-zinc-500"
            }`}
          >
            {tab.icon}
            <span className="text-[10px] uppercase font-bold mt-1 tracking-tight">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* ==========================================
          AI CHAT FLOATING BUBBLE & WINDOW
          ========================================== */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-4 md:bottom-24 md:right-8 w-[calc(100vw-32px)] md:w-[400px] h-[550px] max-h-[75vh] bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-700 flex flex-col z-50 overflow-hidden"
          >
            {/* Chat header */}
            <div className="bg-malaysia-blue text-white p-3.5 flex items-center justify-between shadow-sm shrink-0">
              <div className="flex items-center gap-2">
                <MessageSquare size={18} />
                <span className="font-bold text-sm">TransitMY AI</span>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="p-1 hover:bg-white/20 rounded-full transition cursor-pointer">
                <X size={16} />
              </button>
            </div>

            {/* standard Chat conversation container */}
            <div className="flex-1 p-3 sm:p-5 overflow-y-auto space-y-4 sm:space-y-6">
              
              {messages.map((item) => {
                const isUser = item.role === "user";
                return (
                  <div
                    key={item.id}
                    className={`flex ${isUser ? "flex-row-reverse" : "flex-row"} gap-2 sm:gap-3 max-w-[90%] ${
                      isUser ? "ml-auto" : "mr-auto"
                    }`}
                  >
                    {/* Persona Avatar icons */}
                    <div
                      className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[10px] font-extrabold shadow-sm ${
                        isUser
                          ? "bg-slate-800 text-white"
                          : "bg-malaysia-blue text-white"
                      }`}
                    >
                      {isUser ? "YOU" : "T-MY"}
                    </div>

                    <div className="space-y-2">
                      <div
                        className={`p-3 sm:p-4 rounded-2xl text-sm leading-relaxed ${
                          isUser
                            ? "bg-malaysia-blue text-white rounded-tr-none shadow"
                            : item.isError
                            ? "bg-red-50 dark:bg-zinc-900/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-tl-none font-medium"
                            : "bg-slate-100 dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 rounded-tl-none shadow-sm"
                        }`}
                      >
                        {isUser ? (
                          item.text
                        ) : (
                          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-snug prose-li:my-0.5 max-w-full overflow-hidden break-words">
                            <ReactMarkdown>{item.text}</ReactMarkdown>
                          </div>
                        )}

                        {/* Rendering attached base64 image thumbnail if present in conversation bubble */}
                        {item.image && (
                          <div className="mt-2.5 max-w-[200px] rounded-lg overflow-hidden border border-slate-300 dark:border-zinc-700 shadow-sm bg-white dark:bg-zinc-800 p-1">
                            <img
                              src={item.image.data.startsWith("data:") ? item.image.data : `data:${item.image.mimeType};base64,${item.image.data}`}
                              alt="Uploaded signage attachment"
                              className="w-full h-auto object-cover max-h-40 rounded"
                            />
                            <p className="text-[10px] opacity-80 mt-1 italic text-center">
                              Sign / ticket photo attached
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <span className="block text-[10px] text-slate-400 dark:text-zinc-500 px-1 font-medium text-right">
                        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Server interaction Loading indicator */}
              {loading && (
                <div className="flex gap-3 max-w-[80%]">
                  <div className="w-8 h-8 rounded-full bg-malaysia-blue text-white shrink-0 flex items-center justify-center text-[10px] font-bold animate-pulse">
                    T-MY
                  </div>
                  <div className="bg-slate-50 dark:bg-zinc-900 p-4 rounded-2xl rounded-tl-none text-sm dark:text-zinc-300 flex items-center gap-2 shadow-sm border border-slate-200 dark:border-zinc-800">
                    <span className="w-2 h-2 rounded-full bg-malaysia-blue animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-malaysia-blue animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 rounded-full bg-malaysia-blue animate-bounce [animation-delay:0.4s]"></span>
                    <span className="text-xs text-slate-400 shrink-0 font-medium ml-1">Thinking...</span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Bottom Control Box containing suggestions row and inputs bar */}
            <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-zinc-700 bg-white dark:bg-zinc-800 shrink-0">
              
              {/* Suggester prompt chips area */}
              {messages.length <= 1 && (
                <div className="mb-3.5">
                  <p className="text-[10px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                    {t.starterPromptTitle}
                  </p>
                  <div className="flex gap-2 overflow-x-auto select-none py-1 scrollbar-hide">
                    {SUGGESTED_PROMPTS[lang].map((prompt, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => handleSuggestedPrompt(prompt)}
                        className="flex-shrink-0 text-left py-1.5 px-3 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-700/80 hover:scale-[1.01] transition border border-slate-200/85 dark:border-zinc-700/80 rounded-xl text-[11px] font-semibold text-slate-600 dark:text-zinc-300"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Dynamic Image upload attachment thumbnail panel */}
              {selectedImage && (
                <div className="mb-3 p-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl flex items-center justify-between gap-3 animate-fade-in animate-pulse">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 overflow-hidden shrink-0">
                      <img src={selectedImage.previewUrl} alt="Upload Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-700 dark:text-zinc-200 truncate">
                        Photo attached
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={removeSelectedImage}
                    className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Primary input toolbar */}
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-zinc-900 p-2 rounded-2xl border border-slate-200 dark:border-zinc-700">
                
                {/* Hidden File Input for photo recognition */}
                <input
                  type="file"
                  id="transitmy-photo-uploader"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />

                <button
                  type="button"
                  id="btn-upload-image"
                  onClick={triggerImageSelector}
                  className={`w-9 h-9 shrink-0 flex items-center justify-center rounded-xl cursor-pointer transition ${
                    selectedImage 
                      ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40" 
                      : "text-slate-400 dark:text-zinc-500 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-zinc-850"
                  }`}
                  title={t.cameraPrompt}
                >
                  <ImageIcon size={18} />
                </button>

                <textarea
                  id="chat-textarea-input"
                  rows={1}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t.chatPlaceholder}
                  className="flex-1 bg-transparent border-none text-slate-700 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 text-sm py-2 px-1 resize-none focus:outline-none focus:ring-0 min-h-[36px] max-h-[80px]"
                />

                <button
                  id="btn-submit-message"
                  onClick={() => sendMessage()}
                  disabled={!inputMessage.trim() && !selectedImage}
                  className={`w-9 h-9 shrink-0 rounded-xl text-sm font-bold shadow-md flex items-center justify-center cursor-pointer transition ${
                    inputMessage.trim() || selectedImage
                      ? "bg-malaysia-blue dark:bg-blue-600 text-white hover:opacity-90 shadow-blue-100 dark:shadow-none"
                      : "bg-slate-200 dark:bg-zinc-700 text-slate-400 dark:text-zinc-500 cursor-not-allowed"
                  }`}
                >
                  <Send size={14} className="shrink-0" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-20 right-4 md:bottom-8 md:right-8 w-14 h-14 bg-malaysia-blue hover:bg-blue-600 text-white rounded-full shadow-xl flex items-center justify-center z-50 transition-colors"
      >
        <MessageSquare size={24} />
      </motion.button>


    </div>
  );
}
