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

function getSpecificInsights(text: string, lang: "en" | "bm" | "zh" | "ta"): string {
  const query = text.toLowerCase();
  
  if (lang === "zh") {
    if (query.includes("ticket") || query.includes("token") || query.includes("票") || query.includes("买") || query.includes("支付") || query.includes("card") || query.includes("tng") || query.includes("touch")) {
      return `\n\n### 💡 您问到了关于【车票/支付】：
*   若您只单次搭乘，最简便的方法是使用**自动售票机**购买蓝色单程代币。售票机接受 1元、5元纸币和硬币。
*   极力推荐在站内柜台购买 **Touch 'n Go 实体卡**，既省去了排队买票的麻烦，乘车还能享受优惠！请确保内有最少 RM10。`;
    }
    if (query.includes("sentral") || query.includes("hub") || query.includes("中央") || query.includes("枢纽")) {
      return `\n\n### 💡 您问到了关于【KL Sentral 中央车站】：
*   KL Sentral 是全马最大的枢纽。LRT（5号线）、MRT 捷运（9号线）和 KTM 火车都在此交汇。
*   **注意**：吉隆坡单轨 (KL Monorail) 车站名为 "KL Sentral Monorail"，该站与主枢纽大楼不直接相连。您必须过十字路口或通过 Nu Sentral 购物中心步行约 5 分钟换乘。`;
    }
    if (query.includes("masjid jamek") || query.includes("jamek") || query.includes("占美")) {
      return `\n\n### 💡 您问到了关于【Masjid Jamek 站】：
*   该站是 LRT 格拉那再也线（红/5号线）与 LRT 安邦线/大城堡线（橘/3、4号线）的交汇枢纽。
*   两条换乘轨道高低错落，站内设有跨线扶梯，换乘仅需步行 1-2 分钟，**无需出站刷卡**。`;
    }
    if (query.includes("operating") || query.includes("hour") || query.includes("time") || query.includes("time table") || query.includes("timetable") || query.includes("时间") || query.includes("首班") || query.includes("末班") || query.includes("几点")) {
      return `\n\n### 💡 您问到了关于【运营时间与时刻表】：
*   全网轻快铁及捷运首班车于早上 **6:00 AM** 发车。
*   末班车通常在晚上 **11:30 PM - 12:00 AM** 之间发车。建议在主页顶部的 **实时列车到站倒计时面板** 查看具体车次到站，信息直接对接 RapidKL 实时传输！`;
    }
  } else if (lang === "bm") {
    if (query.includes("ticket") || query.includes("token") || query.includes("harga") || query.includes("tambang") || query.includes("card") || query.includes("tng") || query.includes("touch") || query.includes("beli")) {
      return `\n\n### 💡 Soalan anda mengenai 【Tiket & Tambang】：
*   Untuk satu perjalanan, anda boleh beli **Token Laluan Biru** di Mesin Jualan Tiket (TVM). Ia menerima RM1, RM5 dan duit syiling.
*   Kad **Touch 'n Go** amat dinasihatkan jika anda mahu perjalanan yang lancar tanpa beratur panjang. Pastikan baki kad tidak kurang dari RM10 untuk melepasi kaunter.`;
    }
    if (query.includes("sentral") || query.includes("hub") || query.includes("pusat")) {
      return `\n\n### 💡 Soalan anda mengenai 【KL Sentral】：
*   KL Sentral ialah hub transit utama rel di Selangor dan Kuala Lumpur.
*   **Awas**: Stesen KL Monorail KL Sentral terletak di luar bangunan utama. Anda perlu berjalan kaki selama 5 minit merentasi dalam kompleks membeli-belah Nu Sentral untuk membuat pertukaran.`;
    }
    if (query.includes("masjid jamek") || query.includes("jamek")) {
      return `\n\n### 💡 Soalan anda mengenai 【Stesen Masjid Jamek】：
*   Stesen ini menghubungkan LRT Laluan Kelana Jaya (Laluan 5) dengan LRT Laluan Ampang & Sri Petaling (Laluan 3 & 4).
*   Pertukaran adalah percuma dan boleh dibuat di dalam bangunan tanpa perlu tap keluar atau tap masuk semula.`;
    }
    if (query.includes("operating") || query.includes("hour") || query.includes("time") || query.includes("timetable") || query.includes("pukul") || query.includes("jam") || query.includes("jadual")) {
      return `\n\n### 💡 Soalan anda mengenai 【Waktu Operasi & Jadual Rel】：
*   Semua perkhidmatan tren mula beroperasi seawal jam **6:00 Pagi** setiap hari.
*   Tren terakhir bertolak antara jam **11:30 Malam hingga 12:00 Tengah Malam**. Sila semak tab **Jadual Waktu** (Timetable) di halaman utama kami untuk melihat kemas kini masa nyata RapidKL.`;
    }
  } else if (lang === "ta") {
    if (query.includes("ticket") || query.includes("token") || query.includes("card") || query.includes("tng") || query.includes("touch") || query.includes("pay") || query.includes("கட்டணம்") || query.includes("டிக்கெட்")) {
      return `\n\n### 💡 【டிக்கெட்டுகள் & கட்டணங்கள்】 பற்றிய தகவல்:
*   ஒரு முறை பயணிக்க நீல நிற **டோக்கன்** நாணயங்களை நிலையங்களில் வாங்கலாம்.
*   டச் என் கோ கார்டு வாங்குவதன் மூலம் நெரிசல் இல்லாமல் வேகமாக பயணிக்கலாம்.`;
    }
  } else {
    if (query.includes("ticket") || query.includes("token") || query.includes("fare") || query.includes("price") || query.includes("card") || query.includes("tng") || query.includes("touch") || query.includes("buy")) {
      return `\n\n### 💡 Your query about 【Ticketing & Fares】：
*   For single rides, buy a blue **Single-Journey Token** at English-supported Transit Vending Machines (TVMs) using RM1/RM5 notes or coins.
*   We strongly advocate getting a **Touch 'n Go Card** at service offices. This bypasses high queues and gives discounted rates. Remember: TnG gates require a **minimum balance of RM10.00** to open.`;
    }
    if (query.includes("sentral") || query.includes("hub") || query.includes("central")) {
      return `\n\n### 💡 Your query about 【KL Sentral Hub】：
*   KL Sentral connects almost all lines (LRT, MRT, KTM, ERL) smoothly inside one layout.
*   **Pro-Tip**: The KL Monorail station is actually across the street. You must walk for 5 minutes through the *Nu Sentral* mall inside the elevated pedestrian bridge to swap lines.`;
    }
    if (query.includes("masjid jamek") || query.includes("jamek")) {
      return `\n\n### 💡 Your query about 【Masjid Jamek Station Interchanging】：
*   It is an awesome integration station between LRT Kelana Jaya Line (Red/Line 5) and LRT Ampang/Sri Petaling lines (Orange/Lines 3 and 4).
*   You **do not need to tap out** of gates to change. Simply walk across the overhead pedestrian bridge / escalators.`;
    }
  }

  return "";
}

function getLocalFallbackText(messages: any[], lang: "en" | "bm" | "zh" | "ta"): string {
  const lastMessageText = messages[messages.length - 1]?.text || "";
  const specificInsight = getSpecificInsights(lastMessageText, lang);

  if (lang === "zh") {
    return `*(提示：由于AI服务当前流量过大，TransitMY 已自动启动高效本地备用导乘模式，为您提供极速、精准的吉隆坡轨道交通指引。)*

这里为您整理的吉隆坡轨道交通核心搭乘建议：

### 🎫 车票选择与乘车支付
*   **Touch 'n Go (一触即通卡):** 强烈推荐购买。进站时卡内须保持**最低 10.00 马币 (RM10.00)** 的余额。可于大站柜台购买。
*   **单程硬币型代币 (Single-Journey Token):** 适合单次临时出行，可在轻轨各站内自动售票机上使用现金购买。
*   **游客无限次通行卡:** 推荐购买 **MyCity 3日无限通票**（RM25），可在有效期内无限次搭乘 LRT, MRT, 和 Monorail。

### 🗺️ 主要轨道交通线路
*   **LRT 格拉那再也线 (红/5号线):** 格拉那再也至 Gombak 必乘线，途经双子塔（KLCC）、中央艺术坊（Pasar Seni）等。
*   **MRT 加影线 (绿/9号线):** 途经武吉免登、国家博物馆、默迪卡。
*   **KL Monorail 单轨电车 (橙/8号线):** 直达武吉免登金三角商业区。
*   **重要换乘枢纽:**
    *   **KL Sentral (中央车站):** 最大的换乘枢纽，但换乘**吉隆坡单轨 (Monorail)** 时需要步行约 5分钟穿越 *Nu Sentral* 购物商场。
    *   **Masjid Jamek (占美清真寺站):** 5号线与3、4号线轻松在此站内进行跨线换乘，无需出站刷卡。${specificInsight || "\n\n如果您需要了解特定车站、换乘路线或购票细节，请随时发消息，我会即刻为您解答！"}`;
  } else if (lang === "bm") {
    return `*(Nota: Berikutan permintaan perkhidmatan yang amat tinggi, TransitMY kini beroperasi dalam mod sandaran tempatan. Saya sedia membantu anda dengan panduan perjalanan yang tepat dan pantas!)*

Berikut adalah panduan penting transit rel Kuala Lumpur untuk memudahkan perjalanan anda:

### 🎫 Pembelian Tiket & Kad Tambang
*   **Kad Touch 'n Go (TnG):** Kaedah bayaran yang sangat disyorkan. Boleh dibeli di kaunter stesen utama. Pastikan **baki minimum ada RM10.00** sebelum masuk ke depoh pintu rel.
*   **Token Perjalanan Tunggal (Single-Journey Token):** Sesuai untuk perjalanan sekali sahaja. Beli di mesin layan diri (TVM) di mana-mana stesen menggunakan wang kertas (RM1/RM5) atau syiling.
*   **Pas MyCity:** Bagi pelancong, dapatkan **Pas MyCity 3-Hari** (RM25) atau **Pas 1-Hari** (RM15) untuk akses tanpa had ke rangkaian LRT, MRT, dan Monorel.

### 🗺️ Laluan Jalur Rel & Hub Pertukaran Utama
*   **LRT Laluan Kelana Jaya (Merah / Laluan 5):** Menghubungkan Gombak ke Putra Heights, melalui KLCC, Pasar Seni, dan KL Sentral.
*   **MRT Laluan Kajang (Hijau / Laluan 9):** Melalui Muzium Negara, Bukit Bintang, dan Merdeka.
*   **KL Monorel (Oren / Laluan 8):** Laluan khas melalui pusat segi tiga emas Bukit Bintang.
*   **Hub Pertukaran:**
    *   **KL Sentral:** Hub utama. Sila berjalan kaki sekitar 5 minit menerusi pusat beli-belah *Nu Sentral* untuk bertukar ke stesen KL Monorel.
    *   **Masjid Jamek:** Hub pertukaran LRT Laluan Kelana Jaya & Ampang/Sri Petaling dengan lancar tanpa tap out.${specificInsight || "\n\nAdakah anda memerlukan bantuan mengenai stesen, laluan tertentu, atau kaedah kad? Sila tulis soalan anda segera!"}`;
  } else if (lang === "ta") {
    return `*(அறிவிப்பு: AI சேவை தற்போது அதிக சுமையில் உள்ளதால், TransitMY உங்களுக்கு உதவ உள்ளூர் ஆஃப்லைன் பயன்முறையில் இயங்குகிறது. இருப்பினும் விரைவான வழிகாட்டலை நான் வழங்க முடியும்!)*

கோலாலம்பூர் பொதுப் போக்குவரத்து அமைப்பின் முக்கிய விபரங்கள்:

### 🎫 கட்டணம் மற்றும் டிக்கெட்டுகள:
*   **டச் என் கோ (Touch 'n Go Card):** மிகவும் பரிந்துரைக்கப்படும் கட்டண அட்டை. கார்டில் நுழையும் போது குறைந்தபட்சம் **RM10.00 பேலன்ஸ்** இருக்க வேண்டும்.
*   **சிங்கிள் டோக்கன் (Smart Token):** அனைத்து நிலையங்களிலும் உள்ள தானியங்கி இயந்திரங்கள் (TVM) மூலம் பணம் செலுத்தி வாங்கலாம்.
*   **MyCity அன்லிமிடெட் பாஸ்:** சுற்றுலாப் பயணிகளுக்கு **3-நாள் பாஸ்** (RM25) அல்லது **1-நாள் பாஸ்** (RM15) மூலம் LRT, MRT, Monorail ஆகியவற்றில் வரம்பற்ற பயணம் செய்யலாம்.

### 🗺️ முக்கிய ரயில் பாதைகள்:
*   **LRT கெலானா ஜெயா பாதை (சிவப்பு / பாதை 5):** Gombak முதல் Putra Heights வரை. KLCC மற்றும் Pasar Seni வழியாகச் செல்கிறது.
*   **MRT காஜாங் பாதை (பச்சை / பாதை 9):** Muzium Negara, Bukit Bintang வழியாகச் செல்கிறது.
*   **முக்கிய சந்திப்புகள்:**
    *   **KL Sentral (மைய நிலையம்):** அனைத்து ரயில்களும் சந்திக்கும் இடம். ஆனால் மோனோரயிலுக்கு மாற *Nu Sentral moolam* 5 நிமிடம் நடக்க வேண்டும்.
    *   **Masjid Jamek:** LRT சிவப்புக் கோடு மற்றும் மஞ்சள் கோடுகளை இணைக்கும் மிக எளிய சந்திப்பு. ${specificInsight || ""}`;
  } else {
    return `*(Notice: The TransitMY engine has entered high-performance local fallback mode to safeguard your journey. Rest assured, I can assist you with comprehensive public transit knowledge for Kuala Lumpur!)*

Here is the essential quick-start guideline for navigating KL's public rail system:

### 🎫 Smart Ticketing & Fares
*   **Touch 'n Go (TnG) Card:** This is the absolute best way to travel. You can acquire a card at major station customer service counters. Keep in mind that gates require a **minimum balance of RM10.00** to enter.
*   **Single-Journey Token:** For single trips, purchase a blue coin token at the Ticket Vending Machines (TVMs) at any station. They accept RM1/RM5 notes and coins.
*   **MyCity Unlimited Passes:** If you're a tourist, ask for the **MyCity 3-Day Pass** (RM25) or **1-Day Pass** (RM15) for unlimited travel on all LRT, MRT, and Monorail lines.

### 🗺️ Primary Transit Lines & Key Interchanges
*   **LRT Kelana Jaya Line (Red / Line 5):** Reaches from Gombak to Putra Heights. Stops at central tourist sites like KLCC (Twin Towers) and Pasar Seni (Central Market).
*   **MRT Kajang Line (Green / Line 9):** Serves Muzium Negara, Bukit Bintang, and Merdeka.
*   **KL Monorail (Orange / Line 8):** Travels past Hang Tuah, Bukit Bintang, and Chow Kit.
*   **Seamless Change Hubs:**
    *   **KL Sentral Interchange:** KL's premier transport hub. Note that swapping to the **KL Monorail** requires crossing through the *Nu Sentral* shopping mall (a short, well-marked 5-minute walk).
    *   **Masjid Jamek:** Direct physical walk between the Kelana Jaya Line and Ampang/Sri Petaling Lines. **Do not tap out** of the ticket gates — transfer internally!${specificInsight || "\n\nWould you like guidance regarding a specific route, station, or operation hours? Type your request below and I'll route you safely!"}`;
  }
}

export default function App() {
  const [lang, setLang] = useState<Language>("en");
  const [activeTab, setActiveTab] = useState<TabId>("arrivals"); // arrivals is the default landing page.
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [selectedMapStation, setSelectedMapStation] = useState<"kl-sentral" | "masjid-jamek">("kl-sentral");
  const [selectedMapLevel, setSelectedMapLevel] = useState<number>(1); // default level 1
  const [selectedNetworkLine, setSelectedNetworkLine] = useState<string>("LRT 5"); // default Kelana Jaya line
  const [selectedStationCode, setSelectedStationCode] = useState<string>("KJ15"); // default KL Sentral
  const [selectedMapNode, setSelectedMapNode] = useState<string>("lrt-gates"); // default map node
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
  const [mapViewMode, setMapViewMode] = useState<"guide" | "directory">("guide");

  // Sync theme with HTML class attribute
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
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
          <div className="hidden md:flex bg-slate-100 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 p-2 overflow-x-auto shrink-0 gap-1.5 scrollbar-thin select-none">
            {[
              { id: "arrivals", label: "Live Arrivals", icon: <Clock size={14} /> },
              { id: "planner", label: lang === "en" ? "Route Planner" : lang === "bm" ? "Perancang" : lang === "zh" ? "线路与票价" : lang === "ta" ? "பாதை" : "Route Planner", icon: <Compass size={14} /> },
              { id: "network", label: lang === "en" ? "Live Routes" : lang === "bm" ? "Stesen" : lang === "zh" ? "站点顺序" : lang === "ta" ? "நிலையங்கள்" : "Live Routes", icon: <Network size={14} /> },
              { id: "ticketing", label: lang === "en" ? "Pass & Card" : lang === "bm" ? "Tiket & Pas" : lang === "zh" ? "购票指南" : lang === "ta" ? "டிக்கெட்டுகள்" : "Pass & Card", icon: <Ticket size={14} /> },
              { id: "maps", label: lang === "en" ? "Station Maps" : lang === "bm" ? "Peta Hub" : lang === "zh" ? "枢纽层级" : lang === "ta" ? "வரைபடங்கள்" : "Station Maps", icon: <Map size={14} /> },
              { id: "fares", label: lang === "en" ? "Fares Matrix" : lang === "bm" ? "Kadar Tambang" : lang === "zh" ? "兼容矩阵" : lang === "ta" ? "கட்டணங்கள்" : "Fares Matrix", icon: <TrendingUp size={14} /> },
              { id: "tips", label: lang === "en" ? "Commuter Tips" : lang === "bm" ? "Syor Pintar" : lang === "zh" ? "避坑指南" : lang === "ta" ? "ஆலோசனைகள்" : "Commuter Tips", icon: <AlertCircle size={14} /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer border ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-zinc-800 shadow-sm text-malaysia-blue dark:text-blue-400 border-slate-200 dark:border-zinc-700 font-extrabold"
                    : "text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 border-transparent bg-transparent"
                }`}
              >
                <div className={`${activeTab === tab.id ? "text-malaysia-blue dark:text-sky-400 scale-110" : "text-slate-400"} shrink-0`}>
                  {tab.icon}
                </div>
                <span>{tab.label}</span>
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
                    <div className="mb-4 flex items-center justify-between text-sm">
                      <span className="text-slate-500 dark:text-zinc-400 font-medium">{t.currentStation}</span>
                      <select
                        value={stationFilter}
                        onChange={(e) => setStationFilter(e.target.value)}
                        className="bg-slate-100 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-lg px-3 py-1.5 border-none font-medium focus:ring-2 focus:ring-malaysia-blue pointer-events-auto"
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

                  {/* 1B. Two Column visual display: Vertical pipeline on left, Station Info popup on right */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                    
                    {/* Column 1: Vertical line track */}
                    <div className="md:col-span-7 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl p-4 sm:p-5 shadow-sm max-h-[480px] overflow-y-auto">
                      <div className="relative pl-10 space-y-7 py-3">
                        {/* Dynamic pipeline border */}
                        <div
                          className="absolute left-4 top-4 bottom-4 w-1.5 rounded"
                          style={{
                            backgroundColor: 
                              selectedNetworkLine === "LRT 5" ? "#EF4444" :
                              selectedNetworkLine === "MRT 9" ? "#10B981" :
                              selectedNetworkLine === "MRT 12" ? "#EC4899" :
                              selectedNetworkLine === "Monorail 8" ? "#84CC16" :
                              selectedNetworkLine === "KTM 1" ? "#3B82F6" : "#A855F7"
                          }}
                        ></div>

                        {(selectedNetworkLine === "LRT 5" ? [
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
                          { code: "KJ12", name: "Dang Wangi", isInterchange: false, transfers: [], tip: "Walking link (5 mins) to Bukit Nanas Monorail." },
                          { code: "KJ13", name: "Masjid Jamek", isInterchange: true, transfers: ["AG3", "SP3"], tip: "Upper levels connect to Ampang / Sri Petaling train lines." },
                          { code: "KJ14", name: "Pasar Seni", isInterchange: true, transfers: ["KG16"], tip: "Chinatown hub. Connects to MRT Kajang and KTM Kuala Lumpur station." },
                          { code: "KJ15", name: "KL Sentral", isInterchange: true, transfers: ["MR1", "KA1", "KE1", "KG15"], tip: "Transit core. Connected directly inside to Nu Sentral." },
                          { code: "KJ16", name: "Bangsar", isInterchange: false, transfers: [] },
                          { code: "KJ17", name: "Abdullah Hukum", isInterchange: true, transfers: ["KD01"], tip: "Walkway link to Mid Valley Megamall." },
                          { code: "KJ18", name: "Kerinchi", isInterchange: false, transfers: [] },
                          { code: "KJ19", name: "Universiti", isInterchange: false, transfers: [], tip: "University of Malaya (UM) gateway." },
                          { code: "KJ20", name: "Taman Jaya", isInterchange: false, transfers: [] },
                          { code: "KJ21", name: "Asia Jaya", isInterchange: false, transfers: [] },
                          { code: "KJ22", name: "Taman Paramount", isInterchange: false, transfers: [], tip: "Vibrant neighborhood with hip cafes." },
                          { code: "KJ23", name: "Taman Bahagia", isInterchange: false, transfers: [] },
                          { code: "KJ24", name: "Kelana Jaya", isInterchange: false, transfers: [] },
                          { code: "KJ25", name: "Lembah Subang", isInterchange: false, transfers: [] },
                          { code: "KJ26", name: "Ara Damansara", isInterchange: false, transfers: [], tip: "Links to Evolve Concept Mall." },
                          { code: "KJ27", name: "Glenmarie", isInterchange: false, transfers: [] },
                          { code: "KJ28", name: "Subang Jaya", isInterchange: true, transfers: ["KD09"], tip: "Interchange with KTM Port Klang Line." },
                          { code: "KJ29", name: "SS15", isInterchange: false, transfers: [], tip: "Student hub. Famous bubble tea street & cafes." },
                          { code: "KJ30", name: "SS18", isInterchange: false, transfers: [] },
                          { code: "KJ31", name: "USJ 7", isInterchange: true, transfers: ["SB7"], tip: "Interchange with BRT Sunway Line." },
                          { code: "KJ32", name: "Taipan", isInterchange: false, transfers: [], tip: "USJ business centre." },
                          { code: "KJ33", name: "Wawasan", isInterchange: false, transfers: [] },
                          { code: "KJ34", name: "USJ 21", isInterchange: false, transfers: [] },
                          { code: "KJ35", name: "Alam Megah", isInterchange: false, transfers: [] },
                          { code: "KJ36", name: "Subang Alam", isInterchange: false, transfers: [] },
                          { code: "KJ37", name: "Putra Heights", isInterchange: true, transfers: ["SP31"], tip: "Terminal. Direct platform cross-transfer to LRT Sri Petaling Line." }
                        ] : selectedNetworkLine === "MRT 9" ? [
                          { code: "KG04", name: "Kwasa Damansara", isInterchange: true, transfers: ["PY01"], tip: "Dual terminus. Platform-skip to swap lines." },
                          { code: "KG05", name: "Kwasa Sentral", isInterchange: false, transfers: [] },
                          { code: "KG06", name: "Kota Damansara", isInterchange: false, transfers: [] },
                          { code: "KG07", name: "Surian", isInterchange: false, transfers: [] },
                          { code: "KG08", name: "Mutiara Damansara", isInterchange: false, transfers: [], tip: "Direct link bridge to Ikea & The Curve." },
                          { code: "KG09", name: "Bandar Utama", isInterchange: false, transfers: [], tip: "Connected directly to 1 Utama Shopping Mall." },
                          { code: "KG10", name: "TTDI", isInterchange: false, transfers: [] },
                          { code: "KG12", name: "Phileo Damansara", isInterchange: false, transfers: [] },
                          { code: "KG13", name: "Pusat Bandar Damansara", isInterchange: false, transfers: [] },
                          { code: "KG14", name: "Semantan", isInterchange: false, transfers: [] },
                          { code: "KG15", name: "Muzium Negara", isInterchange: true, transfers: ["KJ15"], tip: "Linked via 250m air-con walkway tunnel to KL Sentral." },
                          { code: "KG16", name: "Pasar Seni", isInterchange: true, transfers: ["KJ14"], tip: "Chinatown hub. Integrated walkway to LRT Kelana Jaya Line." },
                          { code: "KG17", name: "Merdeka", isInterchange: true, transfers: ["AG4", "SP4"], tip: "Walkway link to Plaza Rakyat (LRT Ampang Line)." },
                          { code: "KG18A", name: "Bukit Bintang", isInterchange: true, transfers: ["MR6"], tip: "Exit A to Lot 10. Exit E into Pavilion KL mall." },
                          { code: "KG20", name: "Tun Razak Exchange (TRX)", isInterchange: true, transfers: ["PY23"], tip: "Deepest station. Direct cross-platform swap with MRT Putrajaya Line." },
                          { code: "KG21", name: "Cochrane", isInterchange: false, transfers: [], tip: "Connected directly to MyTown Mall and Ikea Cheras." },
                          { code: "KG22", name: "Maluri", isInterchange: true, transfers: ["AG2"], tip: "Interchange to LRT Ampang Line. Direct link to Aeon Maluri." },
                          { code: "KG23", name: "Taman Pertama", isInterchange: false, transfers: [] },
                          { code: "KG24", name: "Taman Midah", isInterchange: false, transfers: [] },
                          { code: "KG25", name: "Taman Mutiara", isInterchange: false, transfers: [], tip: "Links directly to Cheras LeisureMall." },
                          { code: "KG26", name: "Taman Connaught", isInterchange: false, transfers: [] },
                          { code: "KG27", name: "Taman Suntex", isInterchange: false, transfers: [] },
                          { code: "KG28", name: "Sri Raya", isInterchange: false, transfers: [] },
                          { code: "KG29", name: "Bandar Tun Hussein Onn", isInterchange: false, transfers: [] },
                          { code: "KG30", name: "Batu 11 Cheras", isInterchange: false, transfers: [] },
                          { code: "KG31", name: "Bukit Dukung", isInterchange: false, transfers: [] },
                          { code: "KG32", name: "Sungai Jernih", isInterchange: false, transfers: [] },
                          { code: "KG33", name: "Stadium Kajang", isInterchange: false, transfers: [], tip: "Next to Kajang stadium and famous Satay spots." },
                          { code: "KG34", name: "Sungai Kantan", isInterchange: false, transfers: [] },
                          { code: "KG35", name: "Kajang", isInterchange: true, transfers: ["KB06"], tip: "Eastern terminus. Merges with KTM Seremban Line." }
                        ] : selectedNetworkLine === "MRT 12" ? [
                          { code: "PY01", name: "Kwasa Damansara", isInterchange: true, transfers: ["KG04"] },
                          { code: "PY02", name: "Kampung Selamat", isInterchange: false, transfers: [] },
                          { code: "PY03", name: "Sungai Buloh", isInterchange: true, transfers: ["KA04"], tip: "Interchange with KTM Komuter Services." },
                          { code: "PY04", name: "Damansara Damai", isInterchange: false, transfers: [] },
                          { code: "PY05", name: "Sri Damansara Barat", isInterchange: false, transfers: [] },
                          { code: "PY06", name: "Sri Damansara Sentral", isInterchange: false, transfers: [] },
                          { code: "PY07", name: "Sri Damansara Timur", isInterchange: false, transfers: [] },
                          { code: "PY08", name: "Metro Prima", isInterchange: false, transfers: [] },
                          { code: "PY09", name: "Kepong Baru", isInterchange: false, transfers: [] },
                          { code: "PY10", name: "Jinjang", isInterchange: false, transfers: [] },
                          { code: "PY11", name: "Sri Delima", isInterchange: false, transfers: [] },
                          { code: "PY12", name: "Kampung Batu", isInterchange: true, transfers: ["KC03"], tip: "KTM Komuter link station." },
                          { code: "PY13", name: "Kentonmen", isInterchange: false, transfers: [] },
                          { code: "PY14", name: "Jalan Ipoh", isInterchange: false, transfers: [] },
                          { code: "PY15", name: "Sentul Barat", isInterchange: false, transfers: [] },
                          { code: "PY16", name: "Titiwangsa", isInterchange: true, transfers: ["SP1", "AG1", "MR11"], tip: "Major interchange hub with LRT & Monorail." },
                          { code: "PY17", name: "Hospital Kuala Lumpur", isInterchange: false, transfers: [], tip: "Direct access to HKL medical complex." },
                          { code: "PY18", name: "Raja Uda", isInterchange: false, transfers: [] },
                          { code: "PY19", name: "Ampang Park", isInterchange: true, transfers: ["KJ9"], tip: "Underground crossing. Follow signs to swap to LRT." },
                          { code: "PY20", name: "Persiaran KLCC", isInterchange: false, transfers: [], tip: "Access to KLCC east corporate zones." },
                          { code: "PY21", name: "Conlay", isInterchange: false, transfers: [], tip: "Near Kraftangan Malaysia & Bukit Bintang east." },
                          { code: "PY22", name: "Tun Razak Exchange (TRX)", isInterchange: true, transfers: ["KG20"], tip: "Deep underground exchange with Kajang MRT." },
                          { code: "PY23", name: "Chan Sow Lin", isInterchange: true, transfers: ["AG11", "SP11"], tip: "LRT Ampang Line cross-platform swap." },
                          { code: "PY24", name: "Kuchai", isInterchange: false, transfers: [] },
                          { code: "PY25", name: "Taman Naga Emas", isInterchange: false, transfers: [] },
                          { code: "PY26", name: "Sungai Besi", isInterchange: true, transfers: ["SP16"], tip: "Interchange to LRT Sri Petaling Line." },
                          { code: "PY27", name: "Serdang Raya Utara", isInterchange: false, transfers: [] },
                          { code: "PY28", name: "Serdang Raya Selatan", isInterchange: false, transfers: [] },
                          { code: "PY29", name: "Serdang Jaya", isInterchange: false, transfers: [] },
                          { code: "PY30", name: "UPM", isInterchange: false, transfers: [], tip: "Universiti Putra Malaysia gate." },
                          { code: "PY31", name: "Taman Equine", isInterchange: false, transfers: [] },
                          { code: "PY32", name: "Putra Permai", isInterchange: false, transfers: [] },
                          { code: "PY33", name: "16 Sierra", isInterchange: false, transfers: [] },
                          { code: "PY34", name: "Cyberjaya Utara", isInterchange: false, transfers: [] },
                          { code: "PY35", name: "Cyberjaya City Centre", isInterchange: false, transfers: [] },
                          { code: "PY36", name: "Putrajaya Sentral", isInterchange: true, transfers: ["KE3"], tip: "Terminal. ERL link to Airport." }
                        ] : selectedNetworkLine === "Monorail 8" ? [
                          { code: "MR1", name: "KL Sentral Monorail", isInterchange: true, transfers: ["KJ15"], tip: "Requires walking through Nu Sentral Mall." },
                          { code: "MR2", name: "Tun Sambanthan", isInterchange: false, transfers: [], tip: "Heart of Brickfields Little India." },
                          { code: "MR3", name: "Maharajalela", isInterchange: false, transfers: [] },
                          { code: "MR4", name: "Hang Tuah Interchange", isInterchange: true, transfers: ["SP9", "AG9"], tip: "Direct link to LaLaport BBCC." },
                          { code: "MR5", name: "Imbi", isInterchange: false, transfers: [], tip: "Direct link to Berjaya Times Square Mall." },
                          { code: "MR6", name: "Bukit Bintang", isInterchange: true, transfers: ["KG18A"], tip: "Walk down link walkway to MRT Kajang line." },
                          { code: "MR7", name: "Raja Chulan", isInterchange: false, transfers: [], tip: "Central commercial offices hub." },
                          { code: "MR8", name: "Bukit Nanas", isInterchange: true, transfers: ["KJ12"], tip: "Short walk link to Dang Wangi LRT (5 mins)." },
                          { code: "MR9", name: "Medan Tuanku", isInterchange: false, transfers: [], tip: "Access to Quill City Mall." },
                          { code: "MR10", name: "Chow Kit", isInterchange: false, transfers: [], tip: "Famous traditional wet market precinct." },
                          { code: "MR11", name: "Titiwangsa Terminus", isInterchange: true, transfers: ["SP1", "PY17"], tip: "Merges with Ampang LRT and Putrajaya MRT." }
                        ] : selectedNetworkLine === "KTM 1" ? [
                          { code: "KC05", name: "Batu Caves", isInterchange: false, transfers: [], tip: "Gateway to Batu Caves Hindu shrines." },
                          { code: "KC04", name: "Taman Wahyu", isInterchange: false, transfers: [] },
                          { code: "KC03", name: "Kampung Batu", isInterchange: true, transfers: ["PY12"] },
                          { code: "KC02", name: "Batu Kentonmen", isInterchange: false, transfers: [] },
                          { code: "KC01", name: "Sentul", isInterchange: false, transfers: [] },
                          { code: "KA04", name: "Putra", isInterchange: true, transfers: ["KTM 2"] },
                          { code: "KA03", name: "Bank Negara", isInterchange: true, transfers: ["KJ12", "KTM 2"], tip: "Short walk to Bandaraya LRT station." },
                          { code: "KA02", name: "Kuala Lumpur (Old Station)", isInterchange: true, transfers: ["KJ14"], tip: "Historic station. Connects to Pasar Seni LRT." },
                          { code: "KA01", name: "KL Sentral", isInterchange: true, transfers: ["KJ15"], tip: "Main hub connection." },
                          { code: "KB01", name: "Mid Valley", isInterchange: false, transfers: [], tip: "Direct bridge to Mid Valley Megamall." },
                          { code: "KB02", name: "Seputeh", isInterchange: false, transfers: [] },
                          { code: "KB03", name: "Salak Selatan", isInterchange: false, transfers: [] },
                          { code: "KB04", name: "Bandar Tasik Selatan", isInterchange: true, transfers: ["SP15", "KE2"], tip: "Connected to TBS south-bound bus terminal." },
                          { code: "KB05", name: "Serdang", isInterchange: false, transfers: [], tip: "Boats connection to The Mines Mall." },
                          { code: "KB06", name: "Kajang", isInterchange: true, transfers: ["KG35"] },
                          { code: "KB07", name: "UKM", isInterchange: false, transfers: [], tip: "National University of Malaysia." },
                          { code: "KB08", name: "Bangi", isInterchange: false, transfers: [] },
                          { code: "KB09", name: "Batang Benar", isInterchange: false, transfers: [] },
                          { code: "KB10", name: "Nilai", isInterchange: false, transfers: [], tip: "Terminal for buses to Sepang Circuit / KLIA." },
                          { code: "KB11", name: "Labu", isInterchange: false, transfers: [] },
                          { code: "KB12", name: "Tiroi", isInterchange: false, transfers: [] },
                          { code: "KB13", name: "Seremban", isInterchange: false, transfers: [], tip: "Negeri Sembilan capital stop." },
                          { code: "KB14", name: "Senawang", isInterchange: false, transfers: [] },
                          { code: "KB15", name: "Sungai Gadut", isInterchange: false, transfers: [] },
                          { code: "KB16", name: "Rembau", isInterchange: false, transfers: [] },
                          { code: "KB17", name: "Pulau Sebang / Tampin", isInterchange: false, transfers: [], tip: "Southern terminus near Melaka border." }
                        ] : [
                          { code: "KE1", name: "KL Sentral AirPort Hub", isInterchange: true, transfers: ["KJ15"], tip: "ERL Terminal gates inside main concourse." },
                          { code: "KE2", name: "Bandar Tasik Selatan (TBS)", isInterchange: true, transfers: ["SP15", "KB04"] },
                          { code: "KE3", name: "Putrajaya Sentral", isInterchange: true, transfers: ["PY36"], tip: "Gateway to Putrajaya administrative district." },
                          { code: "KE4", name: "Salak Tinggi", isInterchange: false, transfers: [] },
                          { code: "KE5", name: "KLIA Terminal 1 Airport", isInterchange: false, transfers: [], tip: "Airport platform level. Direct links to check-in counter." },
                          { code: "KE6", name: "KLIA Terminal 2 Airport", isInterchange: false, transfers: [], tip: "Airport low-cost terminal station. Underneath Gateway@KLIA2." }
                        ]).map((st) => (
                          <button
                            key={st.code}
                            onClick={() => setSelectedStationCode(st.code)}
                            className={`w-full text-left relative flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer ${
                              selectedStationCode === st.code
                                ? "bg-slate-100/80 dark:bg-zinc-800 shadow-sm border border-slate-200 dark:border-zinc-700/80"
                                : "hover:bg-slate-50 dark:hover:bg-zinc-800/40 border border-transparent"
                            }`}
                          >
                            {/* Track dot node indicator */}
                            <div
                              className={`absolute -left-[31px] w-5 h-5 rounded-full border-4 border-white dark:border-zinc-800 flex items-center justify-center transition-all ${
                                selectedStationCode === st.code
                                  ? "bg-[#EAB308] scale-125 shadow-md"
                                  : "bg-slate-400 dark:bg-zinc-500"
                              }`}
                            >
                              {selectedStationCode === st.code && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="font-mono text-[10.5px] font-bold px-1.5 py-0.5 rounded tracking-wide text-white" style={{
                                backgroundColor: 
                                  selectedNetworkLine === "LRT 5" ? "#EF4444" :
                                  selectedNetworkLine === "MRT 9" ? "#10B981" :
                                  selectedNetworkLine === "MRT 12" ? "#EC4899" :
                                  selectedNetworkLine === "Monorail 8" ? "#84CC16" :
                                  selectedNetworkLine === "KTM 1" ? "#3B82F6" : "#A855F7"
                              }}>
                                {st.code}
                              </span>
                              <div className="text-left">
                                <h5 className="font-extrabold text-xs sm:text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1">
                                  {st.name}
                                </h5>
                              </div>
                            </div>

                            {/* Interchanges labels */}
                            {st.isInterchange && (
                              <div className="flex gap-1 shrink-0">
                                {st.transfers.slice(0, 3).map((tr) => (
                                  <span key={tr} className="text-[8.5px] font-mono font-bold bg-slate-100 dark:bg-zinc-700 text-slate-500 dark:text-zinc-300 px-1 py-0.5 rounded border border-slate-200 dark:border-zinc-700">
                                    {tr}
                                  </span>
                                ))}
                                {st.transfers.length > 3 && (
                                  <span className="text-[8.5px] font-bold text-slate-400 font-mono">+{st.transfers.length - 3}</span>
                                )}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Column 2: Interactive detail display */}
                    <div className="md:col-span-5 flex flex-col justify-between bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl p-4 sm:p-5 shadow-sm">
                      <div>
                        <div className="flex items-center gap-2 mb-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 p-2.5 rounded-xl">
                          <CheckCircle2 size={16} className="text-amber-500 shrink-0" />
                          <h4 className="font-extrabold text-amber-800 dark:text-amber-300 text-xs uppercase tracking-wider">
                            Interactive Station Detail
                          </h4>
                        </div>
                        
                        {/* Selected info block */}
                        {(() => {
                          // Find st details using helper mapping or fall back gracefully
                          const getStationDetail = (code: string) => {
                            const detailsMap: Record<string, { lines: string; extra: string; eat: string; travel: string }> = {
                              // LRT 5
                              "KJ1": { lines: "LRT Kelana Jaya Line", extra: "Gombak is the northern terminus of the Kelana Jaya Line. It features a huge multi-story park-and-ride facility.", eat: "Local Malay food stalls inside the station and street food nearby.", travel: "Direct coach buses leave regularly from the station ground level to Awana Skyway, Genting Highlands." },
                              "KJ2": { lines: "LRT Kelana Jaya Line", extra: "Taman Melati is located close to the TAR UMT campus. Extremely popular among college students.", eat: "A wide range of cheap student-friendly cafes and local restaurants outside the station.", travel: "Feeder buses and shared taxis run frequently to surrounding residential areas." },
                              "KJ3": { lines: "LRT Kelana Jaya Line", extra: "Wangsa Maju is one of the oldest and busiest stations on the line. Serves a high density of student and commuter apartments.", eat: "Famous Wangsa Maju street burger stalls, Mamak shops, and local bubble tea chains.", travel: "Feeder bus T250 connects directly to Setapak Central Shopping Mall." },
                              "KJ4": { lines: "LRT Kelana Jaya Line", extra: "Sri Rampai is a partially underground station. Direct connection to Wangsa Walk Mall via walking paths.", eat: "Various local restaurants and food courts inside nearby Wangsa Walk Mall.", travel: "Feeder buses connect to Section 10 Wangsa Maju and Sri Rampai business area." },
                              "KJ9": { lines: "LRT Kelana Jaya & MRT Putrajaya Lines", extra: "Ampang Park is a central underground interchange station that links the LRT and MRT Putrajaya lines via a covered pedestrian linkway.", eat: "Intermark Mall food court and high-end dining options are a short walk away.", travel: "Located near many foreign embassies and corporate headquarters on Jalan Ampang." },
                              "KJ10": { lines: "LRT Kelana Jaya Line", extra: "KLCC is the premier tourist stop, located directly underneath the Suria KLCC shopping mall and Petronas Twin Towers.", eat: "Suria KLCC food courts (Signature Food Court and Rasa Food Arena) and premium restaurants.", travel: "Step outside to explore KLCC Park, or take the air-conditioned elevated walkway (15 mins walk) to Bukit Bintang." },
                              "KJ11": { lines: "LRT Kelana Jaya Line", extra: "Kampung Baru is a traditional Malay enclave in the heart of Kuala Lumpur, contrasting with the nearby modern skyscrapers.", eat: "Famous local Malay cuisine, including Nasi Lemak Wanjo and various grilled fish (Ikan Bakar) stalls.", travel: "Cross the beautiful Saloma Link pedestrian bridge to walk directly to KLCC in 10 minutes." },
                              "KJ12": { lines: "LRT Kelana Jaya Line", extra: "Dang Wangi is close to the Bukit Nanas forest reserve. Easy walking link to the KL Monorail line (Bukit Nanas station).", eat: "Local heritage coffee shops and trendy cafes along Jalan Capital.", travel: "Walk about 5 minutes to Bukit Nanas Monorail station to swap lines." },
                              "KJ13": { lines: "LRT Kelana Jaya & LRT Ampang/Sri Petaling Lines", extra: "Masjid Jamek is a major interchange. Seamless transfer between Kelana Jaya Line and Ampang/Sri Petaling lines without tapping out.", eat: "Traditional Indian-Muslim food, Murtabak, and street snacks around the Masjid India bazaar.", travel: "Steps away from the historic Masjid Jamek mosque, Merdeka Square, and River of Life confluence." },
                              "KJ14": { lines: "LRT Kelana Jaya & MRT Kajang Lines", extra: "Pasar Seni is adjacent to Kuala Lumpur's Chinatown. Direct integrated underground walkway to MRT Kajang line.", eat: "Chinatown street food, Petaling Street cafes, and Central Market food stalls.", travel: "Walk across the bridge to access the old KTM Kuala Lumpur railway station and the central RapidKL bus hub." },
                              "KJ15": { lines: "LRT Kelana Jaya, MRT, Monorail & ERL Lines", extra: "KL Sentral is the ultimate public transport hub of Malaysia, connecting LRT, MRT, Monorail, KTM Komuter, ETS, and airport rails.", eat: "Dozens of restaurants in Nu Sentral Mall (Levels 3 & 4), local food stalls, and Brickfields restaurants.", travel: "Express buses to Genting Highlands and KLIA Airport depart from the lower ground bus terminal." },
                              "KJ28": { lines: "LRT Kelana Jaya & KTM Komuter Lines", extra: "Subang Jaya connects the LRT line with KTM Komuter services. Very convenient for commuters traveling to Klang or Shah Alam.", eat: "Numerous eateries inside Subang Parade, Aeon Big, and Empire Shopping Gallery right next door.", travel: "Easy transfer to KTM trains. Direct walking links to nearby shopping complexes." },
                              "KJ29": { lines: "LRT Kelana Jaya Line", extra: "SS15 is a famous student and commercial hotspot in Subang Jaya. Highly active and vibrant neighborhood.", eat: "Famous bubble tea street, hipster cafes, SS15 wet market food court, and local burger joints.", travel: "Feeder buses serve nearby residential areas and university campuses." },
                              "KJ31": { lines: "LRT Kelana Jaya Line & BRT Sunway Line", extra: "USJ 7 is the interchange station to the BRT Sunway Line, which links directly to Sunway Lagoon and Sunway Pyramid.", eat: "Sunway Pyramid Mall food courts and restaurants are easily reachable via the BRT line.", travel: "Swap to the electric elevated BRT buses to navigate around Sunway resort city." },
                              "KJ37": { lines: "LRT Kelana Jaya & LRT Sri Petaling Lines", extra: "Putra Heights is a dual-terminus interchange station. Walk directly across the platform to transfer between lines.", eat: "Local suburban shops, bakeries, and cafes right outside the ticket barriers.", travel: "Buses connect to the southern parts of Shah Alam and Puchong." },
                              // MRT 9
                              "KG04": { lines: "MRT Kajang & MRT Putrajaya Lines", extra: "Kwasa Damansara is a dual-interchange terminus for the Kajang and Putrajaya MRT lines, featuring a massive park-and-ride facility.", eat: "Convenient snack kiosks inside the paid concourse area.", travel: "Change trains by walking directly across the platform (takes under 30 seconds)." },
                              "KG15": { lines: "MRT Kajang Line", extra: "Muzium Negara is located right next to the National Museum of Malaysia. Connected to KL Sentral via a 250m air-conditioned pedestrian tunnel.", eat: "Museum cafe, or walk through the underground tunnel to KL Sentral's massive food court.", travel: "Direct pedestrian entry to the National Museum. Follow underground signs for KL Sentral trains." },
                              "KG16": { lines: "MRT Kajang & LRT Lines", extra: "Pasar Seni is adjacent to Chinatown. Beautiful deep blue glazed tiles representing the heritage of KL.", eat: "Petaling Street night market stalls and modern hipster cafés.", travel: "Chinatown, Central Market and historic colonial structures are reachable instantly." },
                              "KG18A": { lines: "MRT Kajang & KL Monorail Lines", extra: "Bukit Bintang is the heart of KL's retail golden triangle. Massive underground escalators connect to multiple exits.", eat: "Lot 10 Hutong Food Court (famous local hawker brands), Jalan Alor food street, and high-end malls.", travel: "Exit D goes straight into Lot 10. Exit E goes into Pavilion. Follow overhead bridge signs to transfer to Monorail." },
                              "KG20": { lines: "MRT Kajang & MRT Putrajaya Lines", extra: "Tun Razak Exchange (TRX) is the deepest underground station in Malaysia. It is a major interchange between Kajang and Putrajaya MRT lines.", eat: "Numerous premium restaurants and dining options inside the connected Exchange TRX mall.", travel: "Direct underground access to the TRX corporate financial offices and mall corridors." },
                              "KG35": { lines: "MRT Kajang & KTM Komuter Lines", extra: "Kajang is the eastern terminus of the Kajang MRT line, merging directly with KTM Komuter and ETS rail services.", eat: "Famous Kajang Satay restaurants are a short walk or taxi ride away.", travel: "Transfer directly to KTM Komuter services heading south to Negeri Sembilan." },
                              // MRT 12
                              "PY16": { lines: "MRT Putrajaya & LRT Ampang/Sri Petaling Lines", extra: "Titiwangsa is a northern transport hub, connecting the MRT Putrajaya line, KL Monorail, and LRT lines.", eat: "Local Malay and Chinese street food stalls surrounding the Titiwangsa bus terminal.", travel: "Direct connection to the Pekeliling Bus Terminal for regional buses to Pahang and the East Coast." },
                              "PY19": { lines: "MRT Putrajaya & LRT Kelana Jaya Lines", extra: "Ampang Park connects the LRT and MRT lines via a covered pedestrian linkway.", eat: "Intermark Mall dining options and surrounding local food courts.", travel: "Conveniently located near Kuala Lumpur's financial center and embassies." },
                              "PY36": { lines: "MRT Putrajaya Line", extra: "Putrajaya Sentral is the terminal station for the Putrajaya MRT line, integrated with the ERL Airport Transit line.", eat: "Food court and quick-service dining inside the transport terminal building.", travel: "Take NadiPutra feeder buses to Prime Minister's office, Pink Mosque, and administrative offices." },
                              // Monorail
                              "MR1": { lines: "KL Monorail & LRT/MRT/ERL Lines", extra: "KL Sentral Monorail station is located outside the main station building. Connects to LRT via Nu Sentral Mall.", eat: "Nu Sentral food brands and Brickfields street food.", travel: "Walk through Nu Sentral level 1 and 2 to access the main KL Sentral transit hall." },
                              "MR4": { lines: "KL Monorail & LRT Ampang/Sri Petaling Lines", extra: "Hang Tuah is an interchange station. It is directly connected to the Mitsui Shopping Park LaLaport BBCC.", eat: "Japanese food street and trendy restaurants inside LaLaport mall.", travel: "Direct walking access to BBCC development and historic Stadium Merdeka." },
                              // KTM
                              "KC05": { lines: "KTM Komuter Line 1", extra: "Batu Caves is the northern terminus of the KTM line. Located right at the base of the holy Batu Caves hills.", eat: "Traditional Indian vegetarian restaurants serving banana leaf rice and snacks outside the temple.", travel: "2-minute walk to the entrance of the Batu Caves temple and the giant Lord Murugan statue." },
                              "KB01": { lines: "KTM Komuter Line 1", extra: "Mid Valley station is directly linked to the Mid Valley Megamall and The Gardens Mall via a covered overhead walkway.", eat: "Hundreds of dining options inside Mid Valley Megamall and local food courts.", travel: "Walk straight from the platform into the mall entrance. Very convenient for shopping." },
                              "KB04": { lines: "KTM, LRT Sri Petaling & ERL Lines", extra: "Bandar Tasik Selatan is a massive integrated hub. Interconnects KTM Komuter, LRT Sri Petaling Line, ERL, and TBS Terminal.", eat: "Food courts and fast food inside the Terminal Bersepadu Selatan (TBS).", travel: "TBS is the primary express bus terminal for southern-bound cross-state coaches (to Melaka, Johor, Singapore)." },
                              // ERL
                              "KE1": { lines: "ERL Airport Link & LRT/MRT Lines", extra: "KL Sentral Airport Hub features separate check-in counters and baggage facilities for travelers using the ERL Express trains.", eat: "Various international food chains and cafes inside the transit terminal.", travel: "Board the high-speed airport express for a direct 28-minute trip to KLIA Airport." }
                            };

                            if (detailsMap[code]) return detailsMap[code];

                            // Generic fallback description based on line code
                            let lineName = "Kuala Lumpur Transit Network";
                            if (code.startsWith("KJ")) lineName = "LRT Kelana Jaya Line";
                            else if (code.startsWith("KG")) lineName = "MRT Kajang Line";
                            else if (code.startsWith("PY")) lineName = "MRT Putrajaya Line";
                            else if (code.startsWith("MR")) lineName = "KL Monorail Line";
                            else if (code.startsWith("KC") || code.startsWith("KA") || code.startsWith("KB")) lineName = "KTM Komuter Line";
                            else if (code.startsWith("KE")) lineName = "ERL Airport Rail Link";

                            return {
                              lines: lineName,
                              extra: `Station ${code} is a key stop along the ${lineName}, serving local commuters and tourists daily.`,
                              eat: `Local dining spots, Mamak shops, or light snack kiosks are available nearby.`,
                              travel: `Feeder bus transit points, e-hailing waiting zones, or taxi stands are located outside this station's primary street exits.`
                            };
                          };

                          const activeInfo = getStationDetail(selectedStationCode);
                          
                          // Determine station name from current selected line list or fall back
                          const getSelectedStationName = () => {
                            const activeLineCode = selectedNetworkLine;
                            const findInList = (list: any[]) => {
                              const found = list.find(s => s.code === selectedStationCode);
                              return found ? found.name : null;
                            };
                            
                            let name = "";
                            if (activeLineCode === "LRT 5") name = findInList([
                              { code: "KJ1", name: "Gombak" }, { code: "KJ2", name: "Taman Melati" }, { code: "KJ3", name: "Wangsa Maju" }, { code: "KJ4", name: "Sri Rampai" }, { code: "KJ5", name: "Setiawangsa" }, { code: "KJ6", name: "Jelatek" }, { code: "KJ7", name: "Dato' Keramat" }, { code: "KJ8", name: "Damai" }, { code: "KJ9", name: "Ampang Park" }, { code: "KJ10", name: "KLCC" }, { code: "KJ11", name: "Kampung Baru" }, { code: "KJ12", name: "Dang Wangi" }, { code: "KJ13", name: "Masjid Jamek" }, { code: "KJ14", name: "Pasar Seni" }, { code: "KJ15", name: "KL Sentral" }, { code: "KJ16", name: "Bangsar" }, { code: "KJ17", name: "Abdullah Hukum" }, { code: "KJ18", name: "Kerinchi" }, { code: "KJ19", name: "Universiti" }, { code: "KJ20", name: "Taman Jaya" }, { code: "KJ21", name: "Asia Jaya" }, { code: "KJ22", name: "Taman Paramount" }, { code: "KJ23", name: "Taman Bahagia" }, { code: "KJ24", name: "Kelana Jaya" }, { code: "KJ25", name: "Lembah Subang" }, { code: "KJ26", name: "Ara Damansara" }, { code: "KJ27", name: "Glenmarie" }, { code: "KJ28", name: "Subang Jaya" }, { code: "KJ29", name: "SS15" }, { code: "KJ30", name: "SS18" }, { code: "KJ31", name: "USJ 7" }, { code: "KJ32", name: "Taipan" }, { code: "KJ33", name: "Wawasan" }, { code: "KJ34", name: "USJ 21" }, { code: "KJ35", name: "Alam Megah" }, { code: "KJ36", name: "Subang Alam" }, { code: "KJ37", name: "Putra Heights" }
                            ]) || "";
                            else if (activeLineCode === "MRT 9") name = findInList([
                              { code: "KG04", name: "Kwasa Damansara" }, { code: "KG05", name: "Kwasa Sentral" }, { code: "KG06", name: "Kota Damansara" }, { code: "KG07", name: "Surian" }, { code: "KG08", name: "Mutiara Damansara" }, { code: "KG09", name: "Bandar Utama" }, { code: "KG10", name: "TTDI" }, { code: "KG12", name: "Phileo Damansara" }, { code: "KG13", name: "Pusat Bandar Damansara" }, { code: "KG14", name: "Semantan" }, { code: "KG15", name: "Muzium Negara" }, { code: "KG16", name: "Pasar Seni" }, { code: "KG17", name: "Merdeka" }, { code: "KG18A", name: "Bukit Bintang" }, { code: "KG20", name: "Tun Razak Exchange (TRX)" }, { code: "KG21", name: "Cochrane" }, { code: "KG22", name: "Maluri" }, { code: "KG23", name: "Taman Pertama" }, { code: "KG24", name: "Taman Midah" }, { code: "KG25", name: "Taman Mutiara" }, { code: "KG26", name: "Taman Connaught" }, { code: "KG27", name: "Taman Suntex" }, { code: "KG28", name: "Sri Raya" }, { code: "KG29", name: "Bandar Tun Hussein Onn" }, { code: "KG30", name: "Batu 11 Cheras" }, { code: "KG31", name: "Bukit Dukung" }, { code: "KG32", name: "Sungai Jernih" }, { code: "KG33", name: "Stadium Kajang" }, { code: "KG34", name: "Sungai Kantan" }, { code: "KG35", name: "Kajang" }
                            ]) || "";
                            else if (activeLineCode === "MRT 12") name = findInList([
                              { code: "PY01", name: "Kwasa Damansara" }, { code: "PY02", name: "Kampung Selamat" }, { code: "PY03", name: "Sungai Buloh" }, { code: "PY04", name: "Damansara Damai" }, { code: "PY05", name: "Sri Damansara Barat" }, { code: "PY06", name: "Sri Damansara Sentral" }, { code: "PY07", name: "Sri Damansara Timur" }, { code: "PY08", name: "Metro Prima" }, { code: "PY09", name: "Kepong Baru" }, { code: "PY10", name: "Jinjang" }, { code: "PY11", name: "Sri Delima" }, { code: "PY12", name: "Kampung Batu" }, { code: "PY13", name: "Kentonmen" }, { code: "PY14", name: "Jalan Ipoh" }, { code: "PY15", name: "Sentul Barat" }, { code: "PY16", name: "Titiwangsa" }, { code: "PY17", name: "Hospital HKL" }, { code: "PY18", name: "Raja Uda" }, { code: "PY19", name: "Ampang Park" }, { code: "PY20", name: "Persiaran KLCC" }, { code: "PY21", name: "Conlay" }, { code: "PY22", name: "Tun Razak Exchange (TRX)" }, { code: "PY23", name: "Chan Sow Lin" }, { code: "PY24", name: "Kuchai" }, { code: "PY25", name: "Taman Naga Emas" }, { code: "PY26", name: "Sungai Besi" }, { code: "PY27", name: "Serdang Raya Utara" }, { code: "PY28", name: "Serdang Raya Selatan" }, { code: "PY29", name: "Serdang Jaya" }, { code: "PY30", name: "UPM" }, { code: "PY31", name: "Taman Equine" }, { code: "PY32", name: "Putra Permai" }, { code: "PY33", name: "16 Sierra" }, { code: "PY34", name: "Cyberjaya Utara" }, { code: "PY35", name: "Cyberjaya City Centre" }, { code: "PY36", name: "Putrajaya Sentral" }
                            ]) || "";
                            else if (activeLineCode === "Monorail 8") name = findInList([
                              { code: "MR1", name: "KL Sentral Monorail" }, { code: "MR2", name: "Tun Sambanthan" }, { code: "MR3", name: "Maharajalela" }, { code: "MR4", name: "Hang Tuah" }, { code: "MR5", name: "Imbi" }, { code: "MR6", name: "Bukit Bintang" }, { code: "MR7", name: "Raja Chulan" }, { code: "MR8", name: "Bukit Nanas" }, { code: "MR9", name: "Medan Tuanku" }, { code: "MR10", name: "Chow Kit" }, { code: "MR11", name: "Titiwangsa" }
                            ]) || "";
                            else if (activeLineCode === "KTM 1") name = findInList([
                              { code: "KC05", name: "Batu Caves" }, { code: "KC04", name: "Taman Wahyu" }, { code: "KC03", name: "Kampung Batu" }, { code: "KC02", name: "Batu Kentonmen" }, { code: "KC01", name: "Sentul" }, { code: "KA04", name: "Putra" }, { code: "KA03", name: "Bank Negara" }, { code: "KA02", name: "Kuala Lumpur (Old)" }, { code: "KA01", name: "KL Sentral" }, { code: "KB01", name: "Mid Valley" }, { code: "KB02", name: "Seputeh" }, { code: "KB03", name: "Salak Selatan" }, { code: "KB04", name: "Bandar Tasik Selatan" }, { code: "KB05", name: "Serdang" }, { code: "KB06", name: "Kajang" }, { code: "KB07", name: "UKM" }, { code: "KB08", name: "Bangi" }, { code: "KB09", name: "Batang Benar" }, { code: "KB10", name: "Nilai" }, { code: "KB11", name: "Labu" }, { code: "KB12", name: "Tiroi" }, { code: "KB13", name: "Seremban" }, { code: "KB14", name: "Senawang" }, { code: "KB15", name: "Sungai Gadut" }, { code: "KB16", name: "Rembau" }, { code: "KB17", name: "Pulau Sebang / Tampin" }
                            ]) || "";
                            else name = findInList([
                              { code: "KE1", name: "KL Sentral Airport Hub" }, { code: "KE2", name: "Bandar Tasik Selatan (TBS)" }, { code: "KE3", name: "Putrajaya Sentral" }, { code: "KE4", name: "Salak Tinggi" }, { code: "KE5", name: "KLIA Terminal 1" }, { code: "KE6", name: "KLIA Terminal 2" }
                            ]) || "";
                            
                            return name || selectedStationCode;
                          };
                          
                          const stationName = getSelectedStationName();
                          return (
                            <div className="space-y-3.5 mt-2 animate-fade-in text-xs">
                              <div>
                                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 dark:text-zinc-500">Active Station Selected</span>
                                <h4 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white -mt-1">{stationName}</h4>
                                <span className="inline-block mt-1 font-mono text-[10px] font-semibold bg-sky-50 dark:bg-zinc-800 text-sky-600 dark:text-sky-400 px-2 py-0.5 rounded">
                                  {activeInfo.lines}
                                </span>
                              </div>

                              <div className="p-3 bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-xl space-y-2 text-[11px] text-slate-600 dark:text-zinc-300 leading-relaxed">
                                <p><strong>ℹ️ Station Context:</strong> {activeInfo.extra}</p>
                                <p><strong>🍲 Dining Scene:</strong> {activeInfo.eat}</p>
                                <p><strong>🗺️ Tourist Guide:</strong> {activeInfo.travel}</p>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      <div className="mt-4 p-3 bg-blue-50/60 border border-blue-100 dark:bg-zinc-900 dark:border-zinc-800 rounded-xl leading-relaxed shrink-0">
                        <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Interchange Reminder</p>
                        <p className="text-[11px] text-slate-600 dark:text-zinc-300 mt-0.5">
                          At combined transit stations (e.g. Majid Jamek and Pasar Seni), follow the colorful floor stickers on the pedestrian ground to swap lines without tapping out.
                        </p>
                      </div>
                    </div>

                  </div>
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
                    {TRANSIT_TIPS[lang]?.map((tip, idx) => (
                      <div key={idx} className="p-4 bg-emerald-50/60 dark:bg-emerald-950/15 border border-emerald-150 dark:border-emerald-900/60 rounded-2xl flex gap-3.5 items-start transition hover:translate-y-[-1px] hover:shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-300 shrink-0 font-bold">
                          💡
                        </div>
                        <div className="space-y-1.5 min-w-0">
                          <h4 className="font-extrabold text-slate-800 dark:text-white text-xs sm:text-sm uppercase tracking-wider">
                            {tip.title}
                          </h4>
                          <div>
                            <span className="text-[10px] text-emerald-700 dark:text-emerald-450 font-bold">💡 What you should know:</span>
                            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed -mt-0.5">{tip.warning}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-indigo-700 dark:text-indigo-400 font-bold">⭐ Guest Advice Guideline:</span>
                            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed -mt-0.5 font-medium">{tip.solution}</p>
                          </div>
                        </div>
                      </div>
                    ))}
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
                      { icon: <Train size={15} />, text: "LRT / MRT lines", desc: "Urban Heavy Rail", color: "text-rose-500 bg-rose-50" },
                      { icon: <Train size={15} />, text: "Monorail Line", desc: "Central Elevated", color: "text-amber-500 bg-amber-50" },
                      { icon: <Train size={15} />, text: "KTM Railways", desc: "Suburban Regional", color: "text-blue-500 bg-blue-50" },
                      { icon: <Train size={15} />, text: "Airport Rails", desc: "Direct Gateway Link", color: "text-purple-500 bg-purple-50" },
                      { icon: <Bus size={15} />, text: "BRT Sunway", desc: "Electric Elevated Bus", color: "text-emerald-500 bg-emerald-50" }
                    ].map((cat, idx) => (
                      <div key={idx} className={`p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800 ${cat.color} dark:bg-zinc-800/40 flex flex-col justify-between h-[64px]`}>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[11px]">{cat.text}</span>
                          {cat.icon}
                        </div>
                        <span className="text-[9px] text-slate-400 dark:text-zinc-500">{cat.desc}</span>
                      </div>
                    ))}
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
                    {lang === "en" ? "Kuala Lumpur's terminal hubs can be confusing to navigate. Choose a station below and select either the interactive guide or the official floor directory map." :
                     lang === "bm" ? "Stesen utama Kuala Lumpur kadangkala agak mengelirukan. Pilih stesen dan pilih sama ada panduan interaktif atau peta direktori tingkat rasmi." :
                     lang === "zh" ? "吉隆坡交通枢纽内部路线十分繁杂。请在下方选择车站，并切换查看交互导览或官方楼层图。" :
                     "ரயில் நிலையங்களின் வழிகாட்டிகள் மற்றும் உட்புற வரைபடங்கள் கீழே இணைக்கப்பட்டுள்ளன."}
                  </p>

                  {/* 5A. Station selectors */}
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        setSelectedMapStation("kl-sentral");
                        setSelectedMapLevel(1);
                        setSelectedMapNode("lrt-gates");
                      }}
                      className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                        selectedMapStation === "kl-sentral"
                          ? "bg-white dark:bg-zinc-850 border-slate-350 dark:border-zinc-700 shadow-sm text-malaysia-blue dark:text-blue-400"
                          : "bg-slate-100/75 dark:bg-zinc-900 border-transparent text-slate-500 dark:text-zinc-400"
                      }`}
                    >
                      <MapPin size={14} />
                      KL Sentral Hub 🚉
                    </button>
                    <button
                      onClick={() => {
                        setSelectedMapStation("masjid-jamek");
                        setSelectedMapLevel(0);
                        setSelectedMapNode("mj-l0-gates");
                      }}
                      className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                        selectedMapStation === "masjid-jamek"
                          ? "bg-white dark:bg-zinc-850 border-slate-350 dark:border-zinc-700 shadow-sm text-malaysia-blue dark:text-blue-400"
                          : "bg-slate-100/75 dark:bg-zinc-900 border-transparent text-slate-500 dark:text-zinc-400"
                      }`}
                    >
                      <MapPin size={14} />
                      Masjid Jamek Interchange 🕌
                    </button>
                  </div>

                  {/* 5B. Map View Mode Selector (Interactive Concourse vs Official Directory) */}
                  <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-bold self-start gap-1 w-fit select-none">
                    <button
                      onClick={() => setMapViewMode("guide")}
                      className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                        mapViewMode === "guide"
                          ? "bg-white dark:bg-zinc-700 text-malaysia-blue dark:text-blue-400 shadow-sm"
                          : "text-slate-500 dark:text-zinc-400 hover:text-slate-700"
                      }`}
                    >
                      🗺️ Interactive Floor Guide
                    </button>
                    <button
                      onClick={() => setMapViewMode("directory")}
                      className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                        mapViewMode === "directory"
                          ? "bg-white dark:bg-zinc-700 text-malaysia-blue dark:text-blue-400 shadow-sm"
                          : "text-slate-500 dark:text-zinc-400 hover:text-slate-700"
                      }`}
                    >
                      📷 Official Directory Map Image
                    </button>
                  </div>

                  {/* 5C. Floor Level selector tabs - ONLY SHOW IF INTERACTIVE GUIDE is chosen */}
                  {mapViewMode === "guide" && (
                    <div className="flex bg-slate-100/70 dark:bg-zinc-850 p-1 rounded-xl text-xs font-bold self-start max-w-sm">
                      {selectedMapStation === "kl-sentral" ? (
                        [
                          { lvl: 2, label: "L2 (Nu Sentral Mall Link)" },
                          { lvl: 1, label: "L1 (LRT Concourse & Gates)" },
                          { lvl: 0, label: "L0 (Heavy Rail - Ground)" }
                        ].map((item) => (
                          <button
                            key={item.lvl}
                            onClick={() => {
                              setSelectedMapLevel(item.lvl);
                              if (item.lvl === 2) setSelectedMapNode("l2-nusentral-bridge");
                              else if (item.lvl === 1) setSelectedMapNode("lrt-gates");
                              else setSelectedMapNode("l0-ktm-gates");
                            }}
                            className={`flex-1 px-3 py-2 rounded-lg text-center transition cursor-pointer ${
                              selectedMapLevel === item.lvl
                                ? "bg-white dark:bg-zinc-700 text-malaysia-blue dark:text-blue-400 shadow-xs"
                                : "text-slate-500 dark:text-zinc-400 hover:text-slate-800"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))
                      ) : (
                        [
                          { lvl: 1, label: "L1 (Elevated Platforms)" },
                          { lvl: 0, label: "L0 (Street & Ticket Concourse)" },
                          { lvl: -1, label: "L-1 (Kelana Jaya LRT Deep)" }
                        ].map((item) => (
                          <button
                            key={item.lvl}
                            onClick={() => {
                              setSelectedMapLevel(item.lvl);
                              if (item.lvl === 1) setSelectedMapNode("mj-l1-ampang");
                              else if (item.lvl === 0) setSelectedMapNode("mj-l0-gates");
                              else setSelectedMapNode("mj-l-1-kelanajaya");
                            }}
                            className={`flex-1 px-3 py-2 rounded-lg text-center transition cursor-pointer ${
                              selectedMapLevel === item.lvl
                                ? "bg-white dark:bg-zinc-700 text-malaysia-blue dark:text-blue-400 shadow-xs"
                                : "text-slate-500 dark:text-zinc-400 hover:text-slate-800"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))
                      )}
                    </div>
                  )}

                  {/* 5D. Layout render based on Map View Mode */}
                  {mapViewMode === "directory" ? (
                    /* Directory Image Render */
                    selectedMapStation === "kl-sentral" ? (
                      <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-mono font-bold tracking-wider">KL Sentral Station Directory Map</span>
                          <a
                            href="https://i0.wp.com/www.klsentral.info/wp-content/uploads/2018/06/KL-Sentral-Station-Directory-Map.png?fit=1200%2C1200&ssl=1"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-malaysia-blue dark:text-blue-400 font-bold hover:underline"
                          >
                            Open High-Res ↗
                          </a>
                        </div>
                        <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-zinc-700 bg-slate-50 shadow-sm flex items-center justify-center p-2 max-h-[550px]">
                          <img
                            src="https://i0.wp.com/www.klsentral.info/wp-content/uploads/2018/06/KL-Sentral-Station-Directory-Map.png?fit=1200%2C1200&ssl=1"
                            alt="KL Sentral Station Directory Map"
                            className="w-full h-auto max-h-[500px] object-contain hover:scale-[1.02] transition duration-300 cursor-zoom-in rounded-lg"
                            onClick={() => window.open("https://i0.wp.com/www.klsentral.info/wp-content/uploads/2018/06/KL-Sentral-Station-Directory-Map.png?fit=1200%2C1200&ssl=1", "_blank")}
                          />
                        </div>
                        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-xl leading-relaxed text-[11px] text-amber-800 dark:text-amber-300">
                          <strong>🗺️ Level Map Guide:</strong> Ground level houses the KTM and ETS platforms, as well as the KLIA Airport Express boarding area. Escalators in the central lobby lead to Level 1, where the LRT Kelana Jaya Line gates are situated. Go up to Level 2 to cross the skywalk bridge directly into the Nu Sentral Shopping Mall to access the KL Monorail line.
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-mono font-bold tracking-wider">Masjid Jamek Layout Diagram</span>
                        <div className="p-6 bg-slate-50 dark:bg-zinc-900 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl space-y-3">
                          <h4 className="font-bold text-slate-800 dark:text-white text-sm">Masjid Jamek Station Interchange Platform Guide:</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-center font-bold">
                            <div className="p-3 bg-amber-550/10 border border-amber-500/20 text-amber-600 rounded-lg dark:bg-amber-500/5">
                              <span className="block text-[10px] opacity-75">LEVEL L1</span>
                              LRT Ampang Line Elevated Platforms
                            </div>
                            <div className="p-3 bg-slate-100 dark:bg-zinc-800 border border-slate-200 text-slate-700 dark:text-zinc-300 rounded-lg flex items-center justify-center">
                              ⬇️ Concourse Stairs / Escalators ⬇️
                            </div>
                            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-lg dark:bg-red-500/5">
                              <span className="block text-[10px] opacity-75">LEVEL L-1</span>
                              LRT Kelana Jaya Underground platforms
                            </div>
                          </div>
                          <p className="text-xs text-slate-650 dark:text-zinc-300 leading-relaxed pt-2">
                            The transfer lobby connects both lines at <strong>Level 0 (Street Level)</strong>. Follow the large hanging signboards. You walk down to the underground platform for Kelana Jaya line trains (KJ), or take the escalator up to the elevated platform for Ampang/Sri Petaling line trains (AG/SP). Transfer takes about <strong>1-2 minutes</strong> and is completely inside the ticket barriers, so you do not tap out of the station.
                          </p>
                        </div>
                      </div>
                    )
                  ) : (
                    /* Two-Panel Interactive Guide */
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                      
                      {/* Panel Left: Interactive schematics of chosen level */}
                      <div className="md:col-span-7 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between min-h-[300px]">
                        <div>
                          <div className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-mono font-bold tracking-wider mb-2">Concourse blueprint layout</div>
                          
                          {/* Blueprint Container Box */}
                          <div className="bg-dashed bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-2xl relative min-h-[260px] flex overflow-hidden">
                            {selectedMapStation === "kl-sentral" && (
                              <div className="flex flex-col w-full h-full">
                                
                                {/* Level 2 */}
                                <div className={`p-4 border-b border-slate-200 dark:border-zinc-700 flex flex-col sm:flex-row sm:items-center gap-3 transition-colors ${selectedMapLevel === 2 ? 'bg-amber-100/50 dark:bg-amber-900/10' : 'bg-white dark:bg-zinc-800'}`}>
                                  <div className="font-black text-2xl text-slate-300 dark:text-zinc-600 w-12 text-center">L2</div>
                                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {[
                                      { id: "l2-nusentral-bridge", label: "Nu Sentral Link Bridge", detail: "Skywalk escalators linking directly inside the mall. Walk straight this way towards Monorail gates." },
                                      { id: "l2-foodcourt", label: "Food Concourse & Retail", detail: "Over 20 eateries, bubble teas, coffee shops, and bakeries. Departure Hall for ETS." }
                                    ].map(node => (
                                      <button
                                        key={node.id}
                                        onClick={() => { setSelectedMapLevel(2); setSelectedMapNode(node.id); }}
                                        className={`p-2.5 border rounded-lg text-left text-xs cursor-pointer transition ${
                                          selectedMapNode === node.id ? "bg-amber-100 dark:bg-amber-900/20 border-amber-400 font-bold shadow-sm ring-1 ring-amber-300" : "bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-700 font-medium border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300"
                                        }`}
                                      >
                                        {node.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* Level 1 */}
                                <div className={`p-4 border-b border-slate-200 dark:border-zinc-700 flex flex-col sm:flex-row sm:items-center gap-3 transition-colors ${selectedMapLevel === 1 ? 'bg-amber-100/50 dark:bg-amber-900/10' : 'bg-white dark:bg-zinc-800'}`}>
                                  <div className="font-black text-2xl text-slate-300 dark:text-zinc-600 w-12 text-center">L1</div>
                                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {[
                                      { id: "lrt-gates", label: "LRT & Main Concourse", detail: "Connecting hub. LRT Kelana Jaya gates, KTM Komuter ticketing, and ERL Ticketing." },
                                      { id: "l1-tng-refund", label: "Ticketing & Touch 'n Go", detail: "Customer service counters, self-service kiosks, and transit police station." }
                                    ].map(node => (
                                      <button
                                        key={node.id}
                                        onClick={() => { setSelectedMapLevel(1); setSelectedMapNode(node.id); }}
                                        className={`p-2.5 border rounded-lg text-left text-xs cursor-pointer transition ${
                                          selectedMapNode === node.id ? "bg-amber-100 dark:bg-amber-900/20 border-amber-400 font-bold shadow-sm ring-1 ring-amber-300" : "bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-700 font-medium border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300"
                                        }`}
                                      >
                                        {node.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* Level 0 */}
                                <div className={`p-4 flex flex-col sm:flex-row sm:items-center gap-3 transition-colors ${selectedMapLevel === 0 ? 'bg-amber-100/50 dark:bg-amber-900/10' : 'bg-white dark:bg-zinc-800'}`}>
                                  <div className="font-black text-2xl text-slate-300 dark:text-zinc-600 w-12 text-center">L0</div>
                                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {[
                                      { id: "l0-ktm-gates", label: "KTM & Rail Platforms", detail: "Ground floor boarding platforms for KTM Komuter and intercity ETS trains." },
                                      { id: "l0-erl-gates", label: "KLIA Transit & Express", detail: "Fast trains to KLIA T1 & T2. Dedicated waiting areas and baggage drop-off." }
                                    ].map(node => (
                                      <button
                                        key={node.id}
                                        onClick={() => { setSelectedMapLevel(0); setSelectedMapNode(node.id); }}
                                        className={`p-2.5 border rounded-lg text-left text-xs cursor-pointer transition ${
                                          selectedMapNode === node.id ? "bg-amber-100 dark:bg-amber-900/20 border-amber-400 font-bold shadow-sm ring-1 ring-amber-300" : "bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-700 font-medium border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300"
                                        }`}
                                      >
                                        {node.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                              </div>
                            )}

                            {selectedMapStation === "masjid-jamek" && (
                              <div className="grid grid-cols-2 gap-3 w-full p-5">
                              {/* MASJID JAMEK FLOWS */}
                              {selectedMapLevel === 1 && [
                                { id: "mj-l1-ampang", label: "Ampang elevated platform", detail: "Spans towards Sentul East or Ampang/Putra Heights. Open-air format. Elevators are accessible." }
                              ].map(node => (
                                <button
                                  key={node.id}
                                  onClick={() => setSelectedMapNode(node.id)}
                                  className={`p-4 border rounded-xl text-left cursor-pointer transition duration-200 ${
                                    selectedMapNode === node.id
                                      ? "bg-amber-100/90 dark:bg-amber-900/20 border-amber-400 text-slate-800 dark:text-white font-extrabold shadow-sm ring-2 ring-amber-300"
                                      : "bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 font-bold"
                                  }`}
                                >
                                  {node.label}
                                </button>
                              ))}

                              {selectedMapStation === "masjid-jamek" && selectedMapLevel === 0 && [
                                { id: "mj-l0-gates", label: "Main Unified Ticket Gates", detail: "Universal barrier gates. Seamless walk-through to transfer from LRT Ampang to LRT Kelana Jaya." },
                                { id: "mj-l0-street", label: "Street Level historic exits", detail: "Leads straight to the scenic Jamek Mosque, Colonial arches district, and traditional market bazaar." }
                              ].map(node => (
                                <button
                                  key={node.id}
                                  onClick={() => setSelectedMapNode(node.id)}
                                  className={`p-4 border rounded-xl text-left cursor-pointer transition duration-200 ${
                                    selectedMapNode === node.id
                                      ? "bg-amber-100/90 dark:bg-amber-900/20 border-amber-400 text-slate-800 dark:text-white font-extrabold shadow-sm ring-2 ring-amber-300"
                                      : "bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 border-slate-200 dark:border-zinc-700 text-slate-650 dark:text-zinc-300 font-bold"
                                  }`}
                                >
                                  {node.label}
                                </button>
                              ))}

                              {selectedMapStation === "masjid-jamek" && selectedMapLevel === -1 && [
                                { id: "mj-l-1-kelanajaya", label: "Kelana Jaya underground platform", detail: "Subterranean heavy rails towards KLCC / Gombak, or south to KL Sentral. Fully air-conditioned block with shield gates." }
                              ].map(node => (
                                <button
                                  key={node.id}
                                  onClick={() => setSelectedMapNode(node.id)}
                                  className={`p-4 border rounded-xl text-left cursor-pointer transition duration-200 ${
                                    selectedMapNode === node.id
                                      ? "bg-amber-100/90 dark:bg-amber-900/20 border-amber-400 text-slate-800 dark:text-white font-extrabold shadow-sm ring-2 ring-amber-300"
                                      : "bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 font-bold"
                                  }`}
                                >
                                  {node.label}
                                </button>
                              ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Panel Right: Explanation box */}
                      <div className="md:col-span-5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 mb-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                            <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-xs sm:text-sm uppercase tracking-wider">
                              Location Guidelines
                            </h4>
                          </div>

                          {(() => {
                            const nodesList = [
                              { id: "l2-nusentral-bridge", name: "Nu Sentral Link Bridge", desc: "A modern covered escalator bridge. Allows direct walk-through into Nu Sentral retail complex level 1. Safe from rainfall and traffic noise." },
                              { id: "l2-foodcourt", name: "Nu Sentral Food Concourse", desc: "Located at Level 2/3 of Nu Sentral. Houses a diverse selection of cheap local noodle spots, fast food, tea counters, and bakery shops." },
                              { id: "l2-elevators", name: "Main Core Elevator Towers", desc: "Vertical high-capacity smart elevators, linking Level 2 directly downwards to primary transit gates and suburban train halls." },
                              { id: "lrt-gates", name: "LRT Kelana Jaya Turnstiles", desc: "LRT terminal entryways. Tapping physical Touch 'n Go card or blue tokens opens gates. Make sure to tap at the red glowing arrow paths." },
                              { id: "lrt-office", name: "RapidKL Customer Counter", desc: "Staffed cashier and helper booth right before the turnstile row. Purchase fresh Touch 'n Go magnetic cards, top-up balances, or request student discount registrations." },
                              { id: "l1-tng-refund", name: "TnG Self-Service Kiosks", desc: "Digital vending box. Insert banking cards or mobile cards to refill TnG balances. Standard processing incorporates 0% service fees." },
                              { id: "l1-tvm-kiosks", name: "Ticket Vending Machines (TVM)", desc: "Row of large screens. Select destinations to buy single journey physical reddish coin tokens. Accept RM1, RM5 notes and coins." },
                              { id: "l0-ktm-gates", name: "KTM Heavy Rail Gates", desc: "Ticket turnstiles positioned at Level 0 concourse towards commuter suburban carriages. Highly distinct from LRT lines." },
                              { id: "l0-erl-gates", name: "KLIA Airport Express Gates", desc: "Direct ticket gate area leading to non-stop airport rail platform. Requires separate premium tickets or online booking vounchers." },
                              { id: "l0-baggage", name: "Baggage Storage Counter", desc: "A physical counter offering secure temporary storage for luggage. Highly accessible for tourists having late departures." },
                              { id: "mj-l1-ampang", name: "Ampang elevated platform", desc: "Located elevated on Level 1. Direct cross-platform links to travel north or south. Hot and breezy." },
                              { id: "mj-l0-gates", name: "Main Unified Ticket Gates", desc: "Integrated gate lobby at Masjid Jamek ground level. Completely unified, enabling smooth LRT swaps." },
                              { id: "mj-l0-street", name: "Street Level historic exits", desc: "Exiting gates brings you straight in front of Masjid Jamek mosque structures, adjacent markets, and old heritage buildings." },
                              { id: "mj-l-1-kelanajaya", name: "Kelana Jaya underground platform", desc: "Fully underground, air-conditioned subway platform with glass platform shield doors. Direct trains to KLCC and KL Sentral." }
                            ];
                            const activeNode = nodesList.find(n => n.id === selectedMapNode) || nodesList[3];
                            return (
                              <div className="space-y-3 mt-1.5 text-xs animate-fade-in">
                                <h5 className="font-extrabold text-[13px] text-slate-800 dark:text-white">{activeNode.name}</h5>
                                <p className="text-slate-650 dark:text-zinc-300 leading-relaxed text-[11px] bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-850 p-3 rounded-xl">
                                  {activeNode.desc}
                                </p>
                              </div>
                            );
                          })()}
                        </div>

                        <div className="mt-4 p-2 bg-amber-50/75 border border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/40 rounded-xl leading-normal text-[10.5px] text-amber-800 dark:text-amber-350 shrink-0">
                          📌 Navigation Tip: Spot the large hanging signs overhead inside stations. Blue labels point towards LRT, Green towards MRT, Yellow towards Monorail, and Orange towards KTM Komuter.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

          </div>
        </div>

      </div>

      {/* ==========================================
          MOBILE BOTTOM NAVIGATION TAB BAR
          ========================================== */}
      <nav id="mobile-tab-navigation" className="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-zinc-800 border-t border-slate-200 dark:border-zinc-700 h-[68px] flex items-center justify-around px-2 py-1 z-40 shadow-inner">
        
        <button
          onClick={() => setActiveTab("arrivals")}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-center flex-1 min-h-[44px] ${
            activeTab === "arrivals"
              ? "text-malaysia-blue dark:text-blue-400 font-bold"
              : "text-slate-400 dark:text-zinc-500"
          }`}
        >
          <Clock size={18} />
          <span className="text-[10px] uppercase font-bold mt-1">Arrivals</span>
        </button>

        <button
          onClick={() => setActiveTab("planner")}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-center flex-1 min-h-[44px] ${
            activeTab === "planner"
              ? "text-malaysia-blue dark:text-blue-400 font-bold"
              : "text-slate-400 dark:text-zinc-500"
          }`}
        >
          <Compass size={18} />
          <span className="text-[10px] uppercase font-bold mt-1">Planner</span>
        </button>

        <button
          onClick={() => setActiveTab("network")}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-center flex-1 min-h-[44px] ${
            activeTab === "network"
              ? "text-malaysia-blue dark:text-blue-400 font-bold"
              : "text-slate-400 dark:text-zinc-500"
          }`}
        >
          <Network size={18} />
          <span className="text-[10px] uppercase font-bold mt-1">Routes</span>
        </button>

        <button
          onClick={() => setActiveTab("ticketing")}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-center flex-1 min-h-[44px] ${
            activeTab === "ticketing"
              ? "text-malaysia-blue dark:text-blue-400 font-bold"
              : "text-slate-400 dark:text-zinc-500"
          }`}
        >
          <Ticket size={18} />
          <span className="text-[10px] uppercase font-bold mt-1">Passes</span>
        </button>

        <button
          onClick={() => setActiveTab("maps")}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-center flex-1 min-h-[44px] ${
            activeTab === "maps"
              ? "text-malaysia-blue dark:text-blue-400 font-bold"
              : "text-slate-400 dark:text-zinc-500"
          }`}
        >
          <Map size={18} />
          <span className="text-[10px] uppercase font-bold mt-1">Maps</span>
        </button>

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
