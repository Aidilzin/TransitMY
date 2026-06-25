import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// High limit for base64 image uploads
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Initialize the Gemini SDK Client securely server-side.
// We set user-agent to 'aistudio-build' for telemetry as required by the skill.
const getGoogleGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("Warning: GEMINI_API_KEY is not defined in the environment.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
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

// ── Route knowledge base for offline fallback ────────────────────────────────
const ROUTE_KB: Array<{ keys: string[]; answer: string }> = [
  {
    keys: ["seremban", "nilai", "pulau sebang", "tampin"],
    answer: `### 🚆 KL Sentral → Seremban (KTM Komuter)

1. Go to the **KTM Komuter** section inside KL Sentral (lower level, follow blue KTM signs).
2. **Buy a ticket** at the counter or TVM — Touch 'n Go is accepted.
3. Board the **KTM Seremban Line** (brown / Line 2) towards **Pulau Sebang/Tampin**.
4. Seremban is a major stop — journey takes about **1 h 30 min – 2 h**.
5. **Tap out** at Seremban gate when you arrive.

> ⚠️ KTM runs less frequently than LRT/MRT — check the schedule first. Operating hours: ~6 AM – midnight.`
  },
  {
    keys: ["klcc", "twin tower", "petronas", "suria"],
    answer: `### 🏙️ Getting to KLCC / Petronas Twin Towers

1. Take the **LRT Kelana Jaya Line (Red / Line 5)**.
2. Board any train towards **Gombak** direction.
3. Alight at **KLCC station** (2 stops from Masjid Jamek, 3 stops from KL Sentral).
4. Exit via **Exit A** — the towers are directly above the station.

> 💡 Touch 'n Go or single-journey token both work. RM2–4 depending on origin.`
  },
  {
    keys: ["bukit bintang", "bintang", "pavilion", "bb"],
    answer: `### 🛍️ Getting to Bukit Bintang / Pavilion

**Option 1 — MRT (Recommended):**
1. Take the **MRT Kajang Line (Green / Line 9)**.
2. Alight at **Bukit Bintang MRT** station — connected underground to Pavilion.

**Option 2 — KL Monorail:**
1. Take the **KL Monorail (Orange / Line 8)**.
2. Alight at **Bukit Bintang Monorail** station.

> 💡 Both options are valid. MRT is faster from most interchange stations.`
  },
  {
    keys: ["klia", "airport", "terminal", "klia2", "flight"],
    answer: `### ✈️ KL Sentral → KLIA / KLIA2 (ERL)

1. Go to the **ERL (Express Rail Link)** counter at KL Sentral basement.
2. **KLIA Ekspres** — non-stop, takes **28 minutes**, ~RM55.
3. **KLIA Transit** — stops at Salak Tinggi, takes ~35 min, cheaper.
4. For **KLIA2** (AirAsia terminal): take KLIA Transit or the free KLIA2 shuttle bus from KLIA.

> ⏰ ERL runs every 15–20 min. First train ~5 AM, last ~1 AM.`
  },
  {
    keys: ["batu cave", "batu caves"],
    answer: `### 🕌 Getting to Batu Caves

1. Take the **KTM Komuter Batu Caves Line** (grey).
2. Board at **KL Sentral** or **Bank Negara** KTM station.
3. Alight at the terminal stop: **Batu Caves** station.
4. The famous staircase is right outside the station (~3-min walk).

> ⏰ Journey ~30–40 min from KL Sentral. Runs daily; last train around 10:30 PM.`
  },
  {
    keys: ["port klang", "klang", "pelabuhan"],
    answer: `### ⚓ KL Sentral → Port Klang (KTM Komuter)

1. Go to the **KTM Komuter** section at KL Sentral.
2. Take the **KTM Port Klang Line** (blue / Line 1) towards **Port Klang**.
3. Journey takes approximately **1 hour**.
4. **Tap out** at Port Klang station.

> 💡 Trains run every 20–30 min during peak hours.`
  },
  {
    keys: ["midvalley", "mid valley", "gardens"],
    answer: `### 🏬 Getting to Mid Valley Megamall / The Gardens

1. Take the **KTM Komuter** from KL Sentral (Port Klang Line or Seremban Line).
2. Alight at **Mid Valley KTM** station — directly connected to Mid Valley Megamall via covered walkway.

> ⏱️ Only 1 stop from KL Sentral (~5 min). Very convenient!`
  },
  {
    keys: ["subang", "subang jaya", "sunway", "petaling jaya"],
    answer: `### 🏘️ Getting to Subang / Sunway / Petaling Jaya

**For Subang Jaya (USJ, Sunway):**
1. Take the **LRT Kelana Jaya Line (Red)** from KL Sentral or Masjid Jamek.
2. Alight at **Subang Jaya**, **USJ 7**, or **Alam Sutera** depending on your destination.

**For BRT Sunway** (Sunway Pyramid, Sunway Lagoon):
1. Ride LRT to **Subang Jaya** station.
2. Transfer to **BRT Sunway Line** (green elevated bus) — free within BRT zone.

> 💡 Sunway Pyramid stop: **SJ11** on LRT then BRT to Sunway Pyramid.`
  },
  {
    keys: ["pudu", "pasar seni", "central market", "chinatown"],
    answer: `### 🏮 Getting to Pasar Seni / Central Market / Chinatown

1. Take the **LRT Kelana Jaya Line (Red / Line 5)**.
2. Alight at **Pasar Seni** station.
3. Central Market is a 2-minute walk from Exit A.
4. For Petaling Street (Chinatown), walk ~5 minutes south.

> 💡 Also reachable via LRT Ampang Line — same Pasar Seni station.`
  },
  {
    keys: ["titiwangsa", "jalan ampang", "ampang"],
    answer: `### 🌆 Getting to Titiwangsa / Ampang

**To Titiwangsa:**
1. Take **LRT Kelana Jaya Line** or **KL Monorail** to **Titiwangsa** station.

**To Ampang:**
1. Take **LRT Ampang Line (Orange / Line 3)** from Masjid Jamek or Chan Sow Lin.
2. Alight at your desired Ampang stop.

> 💡 Masjid Jamek is the best interchange point between Kelana Jaya and Ampang lines.`
  },
  {
    keys: ["gombak", "zoo negara", "zoo"],
    answer: `### 🦁 Getting to Gombak / Zoo Negara

1. Take the **LRT Kelana Jaya Line (Red / Line 5)** all the way to **Gombak** (terminal station).
2. From Gombak LRT, take a **Rapid bus or Grab** to Zoo Negara (~10 min away).

> ⏱️ From KL Sentral to Gombak: ~40 minutes.`
  },
  {
    keys: ["putrajaya", "cyberjaya", "putrajaya sentral"],
    answer: `### 🏛️ Getting to Putrajaya / Cyberjaya

**Option 1 — MRT (Recommended):**
1. Take the **MRT Putrajaya Line (Blue / Line 12)** from KL Sentral or Pasar Seni.
2. Alight at **Putrajaya Sentral** or **Cyberjaya Utara** station.

**Option 2 — ERL KLIA Transit:**
1. Board KLIA Transit at KL Sentral.
2. Alight at **Putrajaya & Cyberjaya** station (~20 min).

> 💡 MRT is cheaper; ERL is faster. Both accessible from KL Sentral.`
  },
  {
    keys: ["bangsar", "bangsar south"],
    answer: `### 🌿 Getting to Bangsar

1. Take the **LRT Kelana Jaya Line (Red)** from KL Sentral.
2. Alight at **Bangsar LRT** station (1 stop from KL Sentral).
3. From there, walk or take a feeder bus into Bangsar village.

> ⏱️ Only ~3 minutes from KL Sentral!`
  },
  {
    keys: ["chow kit", "chowkit"],
    answer: `### 🍜 Getting to Chow Kit

1. Take the **KL Monorail (Orange / Line 8)** from any Monorail station.
2. Alight at **Chow Kit** station.
3. The market is directly below the station.

> 💡 Alternatively, take **LRT Kelana Jaya Line** to Dang Wangi then walk north.`
  },
  {
    keys: ["kepong", "metro prima", "kepong baru"],
    answer: `### 🏡 Getting to Kepong

1. Take the **MRT Putrajaya Line** or **KTM Komuter**.
2. For Kepong Sentral, board the **KTM Kepong** station (Port Klang line).
3. Alternatively, LRT Kelana Jaya to **Sri Damansara** area then feeder bus.

> 💡 KTM Kepong is the most direct option from KL Sentral.`
  },
  {
    keys: ["operating hour", "opening hour", "when does", "what time", "first train", "last train", "schedule", "timetable"],
    answer: `### ⏰ Transit Operating Hours

| Line | First Train | Last Train |
|------|-------------|------------|
| LRT Kelana Jaya | ~6:00 AM | ~11:50 PM |
| LRT Ampang/Sri Petaling | ~6:00 AM | ~11:45 PM |
| MRT Kajang | ~6:00 AM | ~11:50 PM |
| MRT Putrajaya | ~6:00 AM | ~11:50 PM |
| KL Monorail | ~6:00 AM | ~11:45 PM |
| KTM Komuter | ~5:30 AM | ~11:00 PM |
| ERL (KLIA) | ~5:00 AM | ~1:00 AM |

> ⚠️ Schedules may vary on public holidays. Check the Arrivals tab for live data.`
  },
  {
    keys: ["ticket", "token", "fare", "price", "cost", "how much", "tng", "touch n go", "touch 'n go", "card", "buy"],
    answer: `### 🎫 Ticketing & Fares

*   **Touch 'n Go (TnG) Card** — Best option. Buy at major station counters (RM10 card + RM10 minimum load). Accepted on all rail lines.
*   **Single-Journey Token** — Blue coin token from TVMs. Cash only (RM1/RM5 notes or coins).
*   **MyCity Pass** — Tourist unlimited-ride pass: 1-Day (RM15) or 3-Day (RM25) for all LRT, MRT, Monorail lines.

> 💡 Gates require minimum **RM10.00 balance** on TnG to open. Top up at station kiosks or 7-Eleven.`
  },
  {
    keys: ["bag", "luggage", "backpack", "baggage", "suitcase"],
    answer: `### 🎒 Bags & Luggage on Transit

*   **Backpacks/carry-on bags** — Allowed on all lines.
*   **Large suitcases** — Allowed but must not block doors or aisles; use the designated luggage areas near doors.
*   **Oversized items** — May be refused; check with station staff.
*   **Priority seats** — Reserved for elderly, disabled, and pregnant passengers — please give them up.`
  },
];

function getSpecificInsights(text: string, lang: "en" | "bm" | "zh" | "ta"): string {
  const query = text.toLowerCase();

  // First try the route knowledge base (English answers work for all — Gemini would localise but in fallback we keep English)
  for (const entry of ROUTE_KB) {
    if (entry.keys.some(k => query.includes(k))) {
      return "\n\n" + entry.answer;
    }
  }

  // Language-specific fallback hints when no specific route matched
  if (lang === "zh") {
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
  } else if (lang === "bm") {
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
  } else if (lang === "ta") {
    // Generic Tamil hint for now
  } else {
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

// API routes first
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages payload. Must be an array." });
    }

    const ai = getGoogleGenAI();

    // Map client messages to Gemini's expected multi-turn format
    const contents = messages.map((m: any) => {
      // If message has inlineData (image upload), parse it
      if (m.image) {
        // m.image contains base64 data and mimeType
        const parts: any[] = [
          {
            inlineData: {
              data: m.image.data,          // pure base64 characters without data:image/png;base64,
              mimeType: m.image.mimeType || "image/png"
            }
          }
        ];
        if (m.text) {
          parts.push({ text: m.text });
        }
        return {
          role: m.role || "user",
          parts: parts
        };
      } else {
        return {
          role: m.role || "user",
          parts: [{ text: m.text || "" }]
        };
      }
    });

    try {
      // Call Gemini API using 'gemini-2.5-flash' for fast responses
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      const replyText = response.text || "I am sorry, I could not generate a response.";
      return res.json({ text: replyText });
    } catch (apiError: any) {
      console.warn("Gemini API call failed, entering TransitMY local fallback mode:", apiError.message);
      
      const lang = detectLanguage(messages);
      const lastMessageText = messages[messages.length - 1]?.text || "";
      const specificInsight = getSpecificInsights(lastMessageText, lang);

      let fallbackText = "";
      if (lang === "zh") {
        fallbackText = `*(提示：由于AI服务当前流量过大，TransitMY 已自动启动高效本地备用导乘模式，为您提供极速、精准的吉隆坡轨道交通指引。)*

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
        fallbackText = `*(Nota: Berikutan permintaan perkhidmatan yang amat tinggi, TransitMY kini beroperasi dalam mod sandaran tempatan. Saya sedia membantu anda dengan panduan perjalanan yang tepat dan pantas!)*

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
        fallbackText = `*(அறிவிப்பு: AI சேவை தற்போது அதிக சுமையில் உள்ளதால், TransitMY உங்களுக்கு உதவ உள்ளூர் ஆஃப்லைன் பயன்முறையில் இயங்குகிறது. இருப்பினும் விரைவான வழிகாட்டலை நான் வழங்க முடியும்!)*

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
        // If we have a specific insight (route answer), lead with it — don't dump generic info
        if (specificInsight) {
          fallbackText = `*(Note: AI service is temporarily busy. Showing cached transit knowledge.)*

${specificInsight.trim()}`;
        } else {
          fallbackText = `*(Note: AI service is temporarily busy. Here's essential KL transit info.)*

### 🗺️ Key Lines
*   **LRT Kelana Jaya (Red/5):** Gombak ↔ Putra Heights via KLCC, Pasar Seni, KL Sentral
*   **LRT Ampang/Sri Petaling (Orange/3&4):** Interchange at Masjid Jamek & Chan Sow Lin
*   **MRT Kajang (Green/9):** Muzium Negara, Bukit Bintang, Merdeka
*   **MRT Putrajaya (Blue/12):** KL Sentral to Putrajaya/Cyberjaya
*   **KL Monorail (Orange/8):** Bukit Bintang, Chow Kit *(board at Nu Sentral side of KL Sentral)*
*   **KTM Komuter:** Seremban, Port Klang, Batu Caves, Mid Valley
*   **ERL:** KL Sentral → KLIA in 28 min (RM55)

### 🎫 Payment
*   Touch 'n Go Card (min RM10 balance) — best option
*   Single-Journey Token — from TVM at any station

**Try asking me again with your specific origin and destination!**`;
        }
      }

      return res.json({ text: fallbackText });
    }
  } catch (error: any) {
    console.error("Gemini API Error in /api/chat:", error);
    return res.status(500).json({
      error: "Failed to communicate with transit assistant. Please check your API key config.",
      details: error.message
    });
  }
});

// Real-time timetable initial data
const INITIAL_TIMETABLES = [
  { id: "kj-lrt-gombak", line: "Kelana Jaya LRT", color: "#EF4444", destination: "Gombak", station: "KL Sentral", minutes: 3, status: "On Time" },
  { id: "kj-lrt-putra", line: "Kelana Jaya LRT", color: "#EF4444", destination: "Putra Heights", station: "KL Sentral", minutes: 5, status: "On Time" },
  { id: "kj-mrt-kwasa", line: "Kajang MRT", color: "#10B981", destination: "Kwasa Damansara", station: "Bukit Bintang", minutes: 6, status: "On Time" },
  { id: "kj-mrt-kajang", line: "Kajang MRT", color: "#10B981", destination: "Kajang", station: "Bukit Bintang", minutes: 8, status: "On Time" },
  { id: "ktm-komuter-batu-caves", line: "KTM Komuter (Batu Caves Line)", color: "#3B82F6", destination: "Batu Caves", station: "KL Sentral", minutes: 14, status: "Minor Delay" },
  { id: "monorail-titiwangsa", line: "KL Monorail", color: "#F59E0B", destination: "Titiwangsa", station: "Hang Tuah", minutes: 2, status: "On Time" },
  { id: "putra-mrt-putrajaya", line: "Putrajaya MRT", color: "#EC4899", destination: "Putrajaya Sentral", station: "Ampang Park", minutes: 7, status: "On Time" }
];

const GENERAL_ANNOUNCEMENTS = [
  { id: 1, text: "⚠️ KTM Komuter Batu Caves Line experiencing minor scheduling delays (+5 mins) due to track maintenance near Sentul.", type: "warning" },
  { id: 2, text: "🎫 Save queueing time: Tourists can purchase the 'MyCity 3-Day Pass' for unlimited rides on LRT, MRT, and Monorail for RM25!", type: "info" }
];

app.get("/api/timetable", (req, res) => {
  res.json({
    timetables: INITIAL_TIMETABLES,
    announcements: GENERAL_ANNOUNCEMENTS
  });
});

// Dynamic Moovit-Style Simulated Telemetry engine
interface LiveTrain {
  id: string;
  direction: "southbound" | "northbound";
  currentStationCode: string;
  nextStationCode: string;
  progress: number;
}

interface StationETA {
  southbound: number | null;
  northbound: number | null;
}

function getLiveTracking(lineCode: string) {
  const lineStations: Record<string, string[]> = {
    "LRT 5": ["KJ1", "KJ2", "KJ3", "KJ4", "KJ5", "KJ6", "KJ7", "KJ8", "KJ9", "KJ10", "KJ11", "KJ12", "KJ13", "KJ14", "KJ15", "KJ16", "KJ17", "KJ18", "KJ19", "KJ20", "KJ21", "KJ22", "KJ23", "KJ24", "KJ25", "KJ26", "KJ27", "KJ28", "KJ29", "KJ30", "KJ31", "KJ32", "KJ33", "KJ34", "KJ35", "KJ36", "KJ37"],
    "MRT 9": ["KG04", "KG05", "KG06", "KG07", "KG08", "KG09", "KG10", "KG12", "KG13", "KG14", "KG15", "KG16", "KG17", "KG18A", "KG20", "KG21", "KG22", "KG23", "KG24", "KG25", "KG26", "KG27", "KG28", "KG29", "KG30", "KG31", "KG32", "KG33", "KG34", "KG35"],
    "MRT 12": ["PY01", "PY02", "PY03", "PY04", "PY05", "PY06", "PY07", "PY08", "PY09", "PY10", "PY11", "PY12", "PY13", "PY14", "PY15", "PY16", "PY17", "PY18", "PY19", "PY20", "PY21", "PY22", "PY23", "PY24", "PY25", "PY26", "PY27", "PY28", "PY29", "PY30", "PY31", "PY32", "PY33", "PY34", "PY35", "PY36"],
    "Monorail 8": ["MR1", "MR2", "MR3", "MR4", "MR5", "MR6", "MR7", "MR8", "MR9", "MR10", "MR11"],
    "KTM 1": ["KC05", "KC04", "KC03", "KC02", "KC01", "KA04", "KA03", "KA02", "KA01", "KB01", "KB02", "KB03", "KB04", "KB05", "KB06", "KB07", "KB08", "KB09", "KB10", "KB11", "KB12", "KB13", "KB14", "KB15", "KB16", "KB17"],
    "ERL 6": ["KE1", "KE2", "KE3", "KE4", "KE5", "KE6"]
  };

  const stations = lineStations[lineCode] || lineStations["LRT 5"];
  const N = stations.length;
  
  // Cycle time per station: 95 seconds travel + 25 seconds dwell = 120 seconds
  const stationCycle = 120;
  const roundTripCycles = 2 * N;
  
  // Spacing: one train every 5 stations
  const spacingCycles = 5;
  const maxTrains = Math.ceil(roundTripCycles / spacingCycles);
  
  const epoch = Math.floor(Date.now() / 1000);
  
  const trains: LiveTrain[] = [];
  
  for (let i = 0; i < maxTrains; i++) {
    const rawProgress = (epoch / stationCycle + i * spacingCycles) % roundTripCycles;
    
    let direction: "southbound" | "northbound" = "southbound";
    let currentIdx = 0;
    let nextIdx = 0;
    let progressInLeg = 0;
    
    if (rawProgress < N) {
      direction = "southbound";
      currentIdx = Math.floor(rawProgress);
      nextIdx = Math.min(currentIdx + 1, N - 1);
      progressInLeg = rawProgress - currentIdx;
    } else {
      direction = "northbound";
      const northProgress = rawProgress - N;
      currentIdx = (N - 1) - Math.floor(northProgress);
      nextIdx = Math.max(currentIdx - 1, 0);
      progressInLeg = northProgress - Math.floor(northProgress);
    }
    
    trains.push({
      id: `t-${lineCode}-${i}`,
      direction,
      currentStationCode: stations[currentIdx],
      nextStationCode: stations[nextIdx],
      progress: progressInLeg
    });
  }

  const etas: Record<string, StationETA> = {};
  stations.forEach((code) => {
    etas[code] = { southbound: null, northbound: null };
  });

  stations.forEach((stationCode, idx) => {
    // 1. Southbound ETA
    let minSouthboundEta: number | null = null;
    trains.forEach((t) => {
      if (t.direction === "southbound") {
        const tIdx = stations.indexOf(t.currentStationCode);
        if (tIdx <= idx) {
          const dist = idx - (tIdx + t.progress);
          const eta = Math.round(dist * stationCycle);
          if (eta >= 0) {
            if (minSouthboundEta === null || eta < minSouthboundEta) {
              minSouthboundEta = eta;
            }
          }
        }
      }
    });
    etas[stationCode].southbound = minSouthboundEta;

    // 2. Northbound ETA
    let minNorthboundEta: number | null = null;
    trains.forEach((t) => {
      if (t.direction === "northbound") {
        const tIdx = stations.indexOf(t.currentStationCode);
        if (tIdx >= idx) {
          const dist = (tIdx - t.progress) - idx;
          const eta = Math.round(dist * stationCycle);
          if (eta >= 0) {
            if (minNorthboundEta === null || eta < minNorthboundEta) {
              minNorthboundEta = eta;
            }
          }
        }
      }
    });
    etas[stationCode].northbound = minNorthboundEta;
  });

  return {
    lineCode,
    trains,
    etas
  };
}

app.get("/api/live-tracking", (req, res) => {
  const line = (req.query.line as string) || "LRT 5";
  const trackingData = getLiveTracking(line);
  res.json(trackingData);
});

// Vite middleware setup for Development or Static assets for Production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TransitMY Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start transit server:", err);
});
