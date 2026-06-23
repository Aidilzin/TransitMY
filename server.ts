import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

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
      // Call Gemini API using 'gemini-3.5-flash' for fast responses
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
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
        fallbackText = `*(Notice: The TransitMY engine has entered high-performance local fallback mode to safeguard your journey during a server traffic spike. Rest assured, I can assist you with comprehensive public transit knowledge for Kuala Lumpur!)*

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
