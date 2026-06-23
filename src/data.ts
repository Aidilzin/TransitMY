import { Language, TransitLine, TicketingGuide, TransitTip, FareRange } from "./types";

export const UI_TRANSLATIONS: Record<Language, {
  tagline: string;
  assistantName: string;
  chatPlaceholder: string;
  send: string;
  cameraPrompt: string;
  chooseImage: string;
  starterPromptTitle: string;
  networkTitle: string;
  ticketingTitle: string;
  tipsTitle: string;
  faresTitle: string;
  backToChat: string;
  timetableTitle: string;
  onTime: string;
  delay: string;
  refreshBtn: string;
  currentStation: string;
  allStations: string;
  disclaimer: string;
  realtimeAlertTitle: string;
  mapsTitle: string;
}> = {
  en: {
    tagline: "Your Malaysia Transit Companion",
    assistantName: "TransitMY Assistant",
    chatPlaceholder: "Ask me anything about KL transit, routes, or ticketing...",
    send: "Send",
    cameraPrompt: "Upload a photo of a station sign, map, or ticket machine for an explanation",
    chooseImage: "Photo Guide",
    starterPromptTitle: "Suggested Questions:",
    networkTitle: "Network Route Guide",
    ticketingTitle: "Ticketing & TnG",
    tipsTitle: "Rider Smart Tips",
    faresTitle: "Fares & Payments",
    backToChat: "Return to Chat",
    timetableTitle: "Live Trains Arrival Countdown",
    onTime: "On Time",
    delay: "Delay",
    refreshBtn: "Refresh",
    currentStation: "Filter Station:",
    allStations: "All Interchange Hubs",
    disclaimer: "Real-time updates provided by RapidKL & KTMB telemetry protocols.",
    realtimeAlertTitle: "Network Alert Banner",
    mapsTitle: "Station Hub Layouts"
  },
  bm: {
    tagline: "Teman Transit Malaysia Anda",
    assistantName: "Pembantu TransitMY",
    chatPlaceholder: "Tanya saya apa-apa tentang transit KL, laluan, atau tiket...",
    send: "Hantar",
    cameraPrompt: "Muat naik foto papan tanda stesen, peta, atau mesin tiket untuk penjelasan",
    chooseImage: "Panduan Gambar",
    starterPromptTitle: "Cadangan Soalan:",
    networkTitle: "Panduan Laluan Rangkaian",
    ticketingTitle: "Panduan Tiket & TnG",
    tipsTitle: "Panduan Pintar Pengembara",
    faresTitle: "Kadar Tambang & Pembayaran",
    backToChat: "Kembali ke Sembang AI",
    timetableTitle: "Waktu Ketibaan Tren Masa Nyata",
    onTime: "Tepat Masa",
    delay: "Lewat",
    refreshBtn: "Segarkan",
    currentStation: "Tapis Stesen:",
    allStations: "Semua Hub Pertukaran",
    disclaimer: "Kemas kini masa nyata disediakan oleh protokol telemetri RapidKL & KTMB.",
    realtimeAlertTitle: "Pemberitahuan Segera Laluan",
    mapsTitle: "Pelan Stesen Hub"
  },
  zh: {
    tagline: "您的马来西亚出行小助手",
    assistantName: "TransitMY 助手",
    chatPlaceholder: "向我提问关于吉隆坡轻快铁/地铁交通、路线或购票咨询...",
    send: "发送",
    cameraPrompt: "上传车站指示牌、地图或自动售票机的照片，我将为您解答",
    chooseImage: "拍照指南",
    starterPromptTitle: "推荐问题：",
    networkTitle: "轨道线路指南",
    ticketingTitle: "购票与 Touch 'n Go",
    tipsTitle: "观光避坑指南",
    faresTitle: "票价与支付方式",
    backToChat: "返回聊天",
    timetableTitle: "实时列车到站倒计时",
    onTime: "准点",
    delay: "延误",
    refreshBtn: "刷新",
    currentStation: "筛选车站:",
    allStations: "所有换乘站",
    disclaimer: "实时更新数据由 RapidKL & KTMB 电信数据传输生成。",
    realtimeAlertTitle: "交通网突发通告",
    mapsTitle: "换乘枢纽层级图"
  },
  ta: {
    tagline: "மலேசியாவின் போக்குவரத்து வழிகாட்டி",
    assistantName: "டிரான்சிட்எம்ஒய் உதவியாளர்",
    chatPlaceholder: "கோலாலம்பூர் ரயில் சேவைகள், வழிகள் அல்லது கட்டணம் பற்றி கேளுங்கள்...",
    send: "அனுப்பு",
    cameraPrompt: "விளக்கத்தைப் பெற நிலையத்தின் அடையாளம், வரைபடம் அல்லது டிக்கெட் இயந்திரத்தின் புகைப்படத்தை பதிவேற்றவும்",
    chooseImage: "புகைப்பட வழிகாட்டி",
    starterPromptTitle: "பரிந்துரைக்கப்பட்ட கேள்விகள்:",
    networkTitle: "நிலைய வழிகாட்டி",
    ticketingTitle: "டிக்கெட்டுகள் & டச் என் கோ",
    tipsTitle: "பயண வழிகாட்டி குறிப்புகள்",
    faresTitle: "கட்டண விவரங்கள்",
    backToChat: "அரட்டைக்குத் திரும்பு",
    timetableTitle: "நேரடி ரயில் வருகை கவுண்ட்டவுன்",
    onTime: "சரியான நேரம்",
    delay: "தாமதம்",
    refreshBtn: "புதுப்பி",
    currentStation: "நிலையத்தை வடிகட்டவும்:",
    allStations: "அனைத்து பரிமாற்ற நிலையங்கள்",
    disclaimer: "RapidKL & KTMB டெலிமெட்ரி நெறிமுறைகளால் வழங்கப்பட்ட நிகழ்நேர புதுப்பிப்புகள்.",
    realtimeAlertTitle: "நெட்வொர்க் எச்சரிக்கை பேனர்",
    mapsTitle: "பெரிய ரயில் நிலைய வரைபடங்கள்"
  }
};

export const TRANSIT_LINES: Record<Language, TransitLine[]> = {
  en: [
    { name: "Kelana Jaya Line", code: "LRT 5", color: "#EF4444", type: "LRT", keyStops: ["Gombak", "Wangsa Maju", "Ampang Park", "KLCC", "Masjid Jamek", "Pasar Seni", "KL Sentral", "Bangsar", "Subang Jaya", "Putra Heights"] },
    { name: "Ampang & Sri Petaling Lines", code: "LRT 3/4", color: "#F59E0B", type: "LRT", keyStops: ["Sentul Timur", "Titiwangsa", "Chan Sow Lin", "Masjid Jamek", "Hang Tuah", "Ampang", "Sri Petaling", "Putra Heights"] },
    { name: "Kajang Line", code: "MRT 9", color: "#10B981", type: "MRT", keyStops: ["Kwasa Damansara", "Mutiara Damansara", "Bandar Utama", "Phileo Damansara", "Muzium Negara", "Pasar Seni", "Merdeka", "Bukit Bintang", "TRX", "Cochrane", "Kajang"] },
    { name: "Putrajaya Line", code: "MRT 12", color: "#EC4899", type: "MRT", keyStops: ["Kwasa Damansara", "Kampung Baru (North)", "Titiwangsa", "Ampang Park", "Tun Razak Exchange (TRX)", "Chan Sow Lin", "Sungai Besi", "Cyberjaya Utara", "Putrajaya Sentral"] },
    { name: "KL Monorail Line", code: "MRL 8", color: "#84CC16", type: "Monorail", keyStops: ["KL Sentral", "Tun Sambanthan", "Maharajalela", "Hang Tuah", "Imbi", "Bukit Bintang", "Raja Chulan", "Bukit Nanas", "Titiwangsa"] },
    { name: "KTM Komuter Lines", code: "KTM 1/2", color: "#3B82F6", type: "Commuter", keyStops: ["Batu Caves (Line 1)", "KL Sentral", "Tanjung Malim", "Port Klang (Line 2)", "Subang Jaya", "Seremban", "Pulau Sebang"] },
    { name: "KLIA Express & Transit", code: "ERL 6/7", color: "#A855F7", type: "Airport Rail", keyStops: ["KL Sentral", "Bandar Tasik Selatan", "Putrajaya Sentral", "Salak Tinggi", "KLIA T1 (Terminal 1)", "KLIA T2 (Terminal 2)"] }
  ],
  bm: [
    { name: "Laluan Kelana Jaya", code: "LRT 5", color: "#EF4444", type: "LRT", keyStops: ["Gombak", "Wangsa Maju", "Ampang Park", "KLCC", "Masjid Jamek", "Pasar Seni", "KL Sentral", "Bangsar", "Subang Jaya", "Putra Heights"] },
    { name: "Laluan Ampang & Sri Petaling", code: "LRT 3/4", color: "#F59E0B", type: "LRT", keyStops: ["Sentul Timur", "Titiwangsa", "Chan Sow Lin", "Masjid Jamek", "Hang Tuah", "Ampang", "Sri Petaling", "Putra Heights"] },
    { name: "Laluan Kajang", code: "MRT 9", color: "#10B981", type: "MRT", keyStops: ["Kwasa Damansara", "Mutiara Damansara", "Bandar Utama", "Phileo Damansara", "Muzium Negara", "Pasar Seni", "Merdeka", "Bukit Bintang", "TRX", "Cochrane", "Kajang"] },
    { name: "Laluan Putrajaya", code: "MRT 12", color: "#EC4899", type: "MRT", keyStops: ["Kwasa Damansara", "Kampung Baru Utara", "Titiwangsa", "Ampang Park", "TRX", "Chan Sow Lin", "Sungai Besi", "Cyberjaya Utara", "Putrajaya Sentral"] },
    { name: "Laluan KL Monorail", code: "MRL 8", color: "#84CC16", type: "Monorel", keyStops: ["KL Sentral", "Tun Sambanthan", "Maharajalela", "Hang Tuah", "Imbi", "Bukit Bintang", "Raja Chulan", "Bukit Nanas", "Titiwangsa"] },
    { name: "Tren KTM Komuter", code: "KTM 1/2", color: "#3B82F6", type: "Komuter", keyStops: ["Batu Caves (Laluan 1)", "KL Sentral", "Tanjung Malim", "Port Klang (Laluan 2)", "Subang Jaya", "Seremban", "Pulau Sebang"] },
    { name: "KLIA Express & Transit", code: "ERL 6/7", color: "#A855F7", type: "Laluan Lapangan Terbang", keyStops: ["KL Sentral", "Bandar Tasik Selatan", "Putrajaya Sentral", "Salak Tinggi", "KLIA T1 (Terminal 1)", "KLIA T2 (Terminal 2)"] }
  ],
  zh: [
    { name: "格拉那再也线 (红线)", code: "LRT 5", color: "#EF4444", type: "轻快铁", keyStops: ["鹅唛 (Gombak)", "旺沙玛朱", "安邦公园", "双峰塔 (KLCC)", "占美清真寺", "中央艺术坊", "吉隆坡中央车站 (KL Sentral)", "孟沙", "梳邦再也", "布特拉高原"] },
    { name: "安邦与大城堡线 (黄/橙线)", code: "LRT 3/4", color: "#F59E0B", type: "轻快铁", keyStops: ["冼都东部", "蒂蒂旺沙", "陈秀连", "占美清真寺", "汉都亚", "安邦", "大城堡", "布特拉高原"] },
    { name: "加影线 (绿线)", code: "MRT 9", color: "#10B981", type: "捷运", keyStops: ["桂沙白沙罗", "珍珠白沙罗", "万达广场 (Bandar Utama)", "菲丽亚白沙罗", "国家博物馆", "中央艺术坊", "默迪卡", "武吉免登 (Bukit Bintang)", "敦拉萨国际贸易中心 (TRX)", "葛京 (Cochrane)", "加影"] },
    { name: "布城线 (黄褐/金线)", code: "MRT 12", color: "#EC4899", type: "捷运", keyStops: ["桂沙白沙罗", "甘榜峇鲁北", "蒂蒂旺沙", "安邦公园", "敦拉萨港 (TRX)", "陈秀连", "新街场", "赛城北部", "布城中央车站"] },
    { name: "吉隆坡单轨火车 (黄绿线)", code: "MRL 8", color: "#84CC16", type: "单轨", keyStops: ["吉隆坡中央车站", "敦善班丹", "马哈拉惹里拉", "汉都亚", "燕美 (Imbi)", "武吉免登", "拉惹朱兰", "咖啡山", "蒂蒂旺沙"] },
    { name: "KTM 通勤铁路 (蓝线)", code: "KTM 1/2", color: "#3B82F6", type: "通勤", keyStops: ["黑风洞 (Batu Caves)", "吉隆坡中央车站", "丹绒马林", "巴生港", "梳邦再也", "芙蓉 (Seremban)", "普罗士邦"] },
    { name: "机场快铁 (ERL 紫线)", code: "ERL 6/7", color: "#A855F7", type: "机场快线", keyStops: ["吉隆坡中央车站", "南湖镇 (TBS)", "布城中央车站", "沙拉克丁宜", "KLIA 第一航站楼", "KLIA 第二航站楼"] }
  ],
  ta: [
    { name: "கிளானா ஜெயா வழித்தடம்", code: "LRT 5", color: "#EF4444", type: "எல்ஆர்டி", keyStops: ["கோம்பாக்", "வங்சா மாஜு", "அம்பாங் பார்க்", "கேஎல்சிசி", "மஸ்ஜித் ஜமெக்", "பாசார் செனி", "கேஎல் செண்ட்ரல்", "பங்சார்", "சுபாங் ஜெயா", "புத்ரா ஹைட்ஸ்"] },
    { name: "அம்பாங் & ஸ்ரீ பெட்டாலிங் வழித்தடங்கள்", code: "LRT 3/4", color: "#F59E0B", type: "எல்ஆர்டி", keyStops: ["செந்தூல் தீமூர்", "தித்திவங்சா", "சான் சோ லின்", "மஸ்ஜித் ஜமெக்", "ஹாங் துவா", "அம்பாங்", "ஸ்ரீ பெட்டாலிங்", "புத்ரா ஹைட்ஸ்"] },
    { name: "காஜாங் வழித்தடம்", code: "MRT 9", color: "#10B981", type: "எம்ஆர்டி", keyStops: ["க்வாசா தமன்சாரா", "முத்தியாரா தமன்சாரா", "பண்டார் உத்தாமா", "பிலியோ தமன்சாரா", "மியூசியம் நெகாரா", "பாசார் செனி", "மெர்டேகா", "புக்கிட் பிந்தாங்", "டிஆர்எக்ஸ்", "காக்ரேன்", "காஜாங்"] },
    { name: "புத்ராஜெயா வழித்தடம்", code: "MRT 12", color: "#EC4899", type: "எம்ஆர்டி", keyStops: ["க்வாசா தமன்சாரா", "கம்பங் பாரு", "தித்திவங்சா", "அம்பாங் பார்க்", "டிஆர்எக்ஸ்", "சான் சோ லின்", "சுங்காய் பெசி", "சைபர்ஜெயா உத்தாரா", "புத்ராஜெயா செண்ட்ரல்"] },
    { name: "கேஎல் மோனோரயில் வழித்தடம்", code: "MRL 8", color: "#84CC16", type: "மோனோரயில்", keyStops: ["கேஎல் செண்ட்ரல்", "துன் சம்பந்தன்", "மகாராஜலேலா", "ஹாங் துவா", "இம்பி", "புக்கிட் பிந்தாங்", "ராஜா சூலன்", "புக்கிட் நானாஸ்", "தித்திவங்சா"] },
    { name: "கேடிஎம் கோமுட்டர் வழித்தடங்கள்", code: "KTM 1/2", color: "#3B82F6", type: "கோமுட்டர்", keyStops: ["பத்து குகை (பத்து கேவ்ஸ்)", "கேஎல் செண்ட்ரல்", "தஞ்சோங் மாலிம்", "கிள்ளான் துறைமுகம்", "சுபாங் ஜெயா", "சிரம்பான்", "புலாவ் செபாங்"] },
    { name: "கேஎல்ஐஏ எக்ஸ்பிரஸ் & டிரான்சிட்", code: "ERL 6/7", color: "#A855F7", type: "விமான ரயில்", keyStops: ["கேஎல் செண்ட்ரல்", "பண்டார் தாசிக் செலாத்தான்", "புத்ராஜெயா செண்ட்ரல்", "சாலக் திங்கி", "KLIA T1", "KLIA T2"] }
  ]
};

export const TICKETING_GUIDE: Record<Language, TicketingGuide[]> = {
  en: [
    {
      title: "Touch 'n Go (TnG) Card",
      description: "Nearest equivalent to London's Oyster or Singapore's EZ-Link. Highly recommended for tourists.",
      steps: [
        "📌 Purchase: Available at KL Sentral, major LRT Customer Service counters, or partner retail outlets (Watsons, 7-Eleven). Ready-to-use card costs about RM25 (includes RM15 non-refundable card price + RM10 initial credit).",
        "💵 Topping Up: Can be topped up at LRT & MRT Ticket Vending Machines, Customer Service offices, or at convenience stores/petrol stations (small RM0.50 surcharge may apply).",
        "🚶 How to Use: Tap the card on the circular blue reader at the turnstile gate entry, and tap out on the exit. Do not try to bypass turnstiles or double tap."
      ]
    },
    {
      title: "Single-Journey Tokens",
      description: "Best if you plan to travel rarely and do not want to purchase a reusable transit card.",
      steps: [
        "🎫 Ticket Vending Machine: Select your language, choose 'Single Journey Token', input your destination station from the interactive touchscreen map.",
        "🪙 Payment: Pay using coins (RM0.10, RM0.20, RM0.50) or banknotes (RM1, RM5). Collect the red or blue physical token and any due change.",
        "🚉 Boarding: Tap the token on the reader at the entrance turnstile to enter. Keep it safe during your journey!",
        "🏁 Alighting: Insert the token directly into the designated slot on the turnstile exit gate to open the gates."
      ]
    },
    {
      title: "Concession Passes (Tourists)",
      description: "MyCity 1-Day or 3-Day Unlimited Pass.",
      steps: [
        "🏷️ Cost: 1-Day Pass is RM15, and the 3-Day Pass is RM25.",
        "🛂 Availability: Purchase directly at any RapidKL (LRT, MRT, Monorail) Customer Service counter.",
        "⚠️ Important: You must present your physical passport/ID as a tourist. This pass requires a standard Touch 'n Go card to load it on!"
      ]
    }
  ],
  bm: [
    {
      title: "Kad Touch 'n Go (TnG)",
      description: "Pilihan terbaik untuk penduduk dan pelancong. Sangat disyorkan.",
      steps: [
        "📌 Pembelian: Boleh didapati di KL Sentral, Kaunter Khidmat Pelanggan LRT, atau rangkaian runcit (Watsons, 7-Eleven). Harga kad sedia ada sekitar RM25 (RM15 harga kad + RM10 kredit sedia ada).",
        "💵 Tambah Nilai: Boleh ditambah nilai di Mesin Layan Diri tiket LRT & MRT, Pejabat Khidmat Pelanggan, atau kedai serbaneka (caj RM0.50 mungkin dikenakan).",
        "🚶 Cara Guna: Sentuh kad pada pembaca biru di laluan masuk palang, dan sentuh sekali lagi semasa keluar stesen."
      ]
    },
    {
      title: "Token Perjalanan Tunggal",
      description: "Paling sesuai jika anda menaiki tren sekali-sekala.",
      steps: [
        "🎫 Mesin Tiket (TVM): Pilih bahasa anda, pilih 'Token Perjalanan Tunggal', kemudian klik stesen destinasi anda di atas skrin.",
        "🪙 Bayaran: Masukkan syiling atau wang kertas. Sila ambil token merah/biru berserta wang baki.",
        "🚶 Kemasukan & Keluar: Sentuh token untuk masuk di palang tiket. Semasa keluar stesen di destinasi, masukkan token ke dalam slot yang disediakan."
      ]
    },
    {
      title: "Pas MyCity (Pelancong)",
      description: "Pas perjalanan tanpa had 1-hari atau 3-hari di rangkaian LRT, MRT & Monorel.",
      steps: [
        "🏷️ Kos: Pas 1-Hari berharga RM15, manakala Pas 3-Hari berharga RM25.",
        "🛂 Lokasi: Beli terus di kaunter perkhidmatan stesen RapidKL.",
        "⚠️ Nota: Pembelian memerlukan pendaftaran pasport fizikal dan dimuatkan ke dalam kad Touch 'n Go."
      ]
    }
  ],
  zh: [
    {
      title: "Touch 'n Go (TnG 卡)",
      description: "类似于伦敦的 Oyster 或新加坡的 EZ-Link，推荐所有来马游客购买。",
      steps: [
        "📌 购买点: 吉隆坡中央车站 (KL Sentral)、轻快铁客服柜台或 7-Eleven、Watsons。卡片工本费 RM15（不退还）+ 内含额度，整张起步购买通常需 RM25。",
        "💵 充值: 可在轻快铁/地铁自动售票机、人工服务窗口或指定连锁店充值（部分外包网点收 RM0.50 手续费）。",
        "🚶 使用方法: 进站时在蓝色圆形刷卡区触碰刷卡，出站时再次触碰刷卡即可。"
      ]
    },
    {
      title: "单程硬币币/塑料 Token",
      description: "如果不常坐地铁或没买卡，可单独买单程代币。",
      steps: [
        "🎫 售票机购买: 选择语言，在屏幕上选择目的车站，确认票价。",
        "🪙 支付: 放入纸币（RM1 或 RM5）或硬币。取得一颗红色或蓝色塑料代币及找零。",
        "🚶 使用流程: 进站时用代币‘滴’一下感应区，出站时必须把代币‘投币’送入闸机的收币口中以打开闸门。"
      ]
    },
    {
      title: "MyCity 旅游无限通行证",
      description: "一日或三日无限次轻快铁、地铁和单轨火车通用卡。",
      steps: [
        "🏷️ 价格: 1日无限票 RM15，3日无限票 RM25。",
        "🛂 如何购买: 携带护照直接前往任何 RapidKL 车站的客服窗口办理并充值加载。"
      ]
    }
  ],
  ta: [
    {
      title: "டச் 'என் கோ (TnG) அட்டை",
      description: "கோலாலம்பூரில் பயணம் செய்ய மிகவும் பரிந்துரைக்கப்படும் ஸ்மார்ட் கார்டு.",
      steps: [
        "📌 வாங்குதல்: கேஎல் செண்ட்ரல், எல்ஆர்டி வாடிக்கையாளர் சேவை கவுண்டர்கள் அல்லது செவன்-இலவன் கடைகளில் கிடைக்கும். விலை தோராயமாக RM25 (அட்டையின் கட்டணம் RM15 + பயண கடன் RM10).",
        "💵 டாப் அப்: டிக்கெட் இயந்திரங்கள் அல்லது எல்ஆர்டி நிலைய கவுண்டர்களில் டாப் அப் செய்யலாம்.",
        "🚶 பயன்படுத்துவது எப்படி: நுழைவாயிலில் அட்டையைத் தொடவும், வெளியேறும் போதும் அதேபோல் தொடவும்."
      ]
    },
    {
      title: "ஒற்றை வழி பயண டோக்கன்கள்",
      description: "குறைவாகப் பயணிக்கும் பயணிகளுக்கு உகந்தது.",
      steps: [
        "🎫 டிக்கெட் இயந்திரம்: மொழியைத் தேர்ந்தெடுத்து, இலக்கு நிலையத்தைக் குறிப்பிடவும்.",
        "🪙 கட்டணம்: நாணயங்கள் அல்லது ரூபாய் நோட்டுகளை செலுத்தி டோக்கனைப் பெறவும்.",
        "🚶 பயணம்: நிலையத்திற்குள் நுழைய கார்டு போல டோக்கனை தொடவும். வெளியேறும் கதவில் டோக்கனை உள்ளே செலுத்தி வெளியேறவும்."
      ]
    },
    {
      title: "இலவச தள்ளுபடி பாஸ்கள் (சுற்றுலாப் பயணிகள்)",
      description: "MyCity 1-நாள் அல்லது 3-நாள் வரம்பற்ற பயண பாஸ்.",
      steps: [
        "🏷️ கட்டணம்: 1-நாள் அட்டை RM15, 3-நாள் அட்டை RM25.",
        "🛂 கிடைக்கும் இடம்: எந்த RapidKL வாடிக்கையாளர் மையத்திலும் பாஸ்போர்ட்டை காண்பித்து பெற்றுக்கொள்ளலாம்."
      ]
    }
  ]
};

export const TRANSIT_TIPS: Record<Language, TransitTip[]> = {
  en: [
    { title: "Avoid Platform Mix-Ups", warning: "Boarding train going in the wrong direction.", solution: "Always read the signboard showing the END-STATION of the platform (e.g. platform heading to 'Gombak' vs 'Putra Heights'), not just the line name." },
    { title: "No Eating/Drinking", warning: "Strict fine of RM500 for drinking water or chewing chewing gum inside trains or behind ticketing gates.", solution: "Do not open any water bottles or snacks until you fully tap out and leave the rail facilities." },
    { title: "Inter-Line Transfers", warning: "Tapping out during transfers.", solution: "At interchange stations like Pasar Seni (MRT/LRT) or Masjid Jamek (Kelana/Ampang LRT), you can transfer lines WITHOUT tapping out of the gates. Just follow the covered pedestrian walkway signs." },
    { title: "Interchange Hub exceptions", warning: "Walking out and paying twice.", solution: "Some interchanges require tapping out to change operators (e.g. KTM Komuter to LRT). If using Touch 'n Go, the system automatically gives an integrated transfer discount if done within 10 minutes." },
    { title: "Peak Hour Congestion", warning: "Getting stuck during 7:30-9am and 5:30-7:30pm weekdays.", solution: "KL Monorail and Kelana Jaya LRT become extremely packed. Try adjusting your times or wait for subsequent trains." },
    { title: "Mind the Monorail Gap", warning: "Level difference and safety doors.", solution: "KL Monorail has platforms raised high above streets. Stand firmly behind yellow line/screen doors and step cautiously over the broad gap." },
    { title: "KTM Wait Times", warning: "KTM Komuter trains arrive only every 30-45 minutes.", solution: "Always check the digital schedules beforehand; do not expect immediate arrivals like the LRT/MRT which run every 3-5 mins." },
    { title: "Ladies Only Coaches", warning: "Accidentally entering pink-decorated Coaches.", solution: "MRT, LRT, and KTM lines feature dedicated women-only coaches (indicated by large pink flower stickers). Men are strictly prohibited from entering these zones." },
    { title: "Escalator Courtesy", warning: "Blocking commuters on stairs/escalators.", solution: "Always stand on the LEFT of the escalators, and let hurried people pass on the RIGHT side." },
    { title: "Cash Top-Ups Limits", warning: "Machines don't accept large RM50 or RM100 bills.", solution: "Carry RM1, RM5, or RM10 notes. Cash top-ups at ticketing terminals do not accept major banknotes." }
  ],
  bm: [
    { title: "Elak Silap Platform", warning: "Menaiki kereta api yang bertentangan hala.", solution: "Sila rujuk nama stesen akhir yang terpapar pada skrin platfom stesen (cth: menghala ke Gombak lwn Putra Heights)." },
    { title: "Dilarang Makan/Minum", warning: "Denda berat RM500 untuk makan/minum di dalam stesen atau tren.", solution: "Sila simpan semula makanan dan minuman sehingga anda keluar sepenuhnya dari stesen." },
    { title: "Pertukaran Tanpa Tap Keluar", warning: "Keluar stesen secara silap semasa penukaran.", solution: "Di stesen pertukaran seperti Pasar Seni atau Masjid Jamek, anda boleh tukar laluan tanpa keluar pagar tiket." },
    { title: "Waktu Puncak", warning: "Kesesakan luar biasa pada 7:30-9 pagi & 5:30-7:30 malam.", solution: "Kelana Jaya LRT dan Monorel sangat padat. Rancang perjalanan anda di luar waktu puncak." },
    { title: "KTM Ambil Masa Lama", warning: "Tren KTM Komuter mempunyai selang masa ketibaan 30-45 minit.", solution: "Sentiasa semak waktu perjalanan di telefon sebelum datang ke stesen." },
    { title: "Koc Wanita Merah Jambu", warning: "Lelaki tersilap masuk ke dalam koc wanita.", solution: "Sila elakkan masuk ke koc hiasan merah jambu bercorak bunga khas untuk wanita sahaja." }
  ],
  zh: [
    { title: "分辨乘车方向", warning: "坐错相反方向的列车。", solution: "务必留意指示牌上注明的“终点站”名字（例如：往鹅唛 Gombak 方向，还是往布特拉高原 Putra Heights 方向）。" },
    { title: "严禁饮食", warning: "进闸后或在列车上饮水或吃零食，最高罚款 RM500。", solution: "进闸口前把饮料食品收起，出站前请勿在站内哺乳或开瓶饮水。" },
    { title: "站内无需出闸换乘", warning: "换乘线时错走闸机出口，导致被重复计费。", solution: "在占美清真寺 (Masjid Jamek) 或中央艺术坊 (Pasar Seni) 等主换乘站，遵循通道指示牌换乘即可，千万不要刷卡出关。" },
    { title: "错峰出行", warning: "工作日上下班高峰拥堵不堪。", solution: "上午 7:30-9:00 及傍晚 5:30-7:30，轻快铁及单轨列车人流量极大。建议避开这段时间。" },
    { title: "KTM 班次较少", warning: "KTM 通勤列车通常需要等待 30-45 分钟甚至更久。", solution: "千万不要盲目去等！建议先下下载应用或查看电子大屏幕的准确对应班次。" },
    { title: "粉色女性专用车厢", warning: "男士误入女性车厢。", solution: "MRT 和 KTM 设有一些车身及地面贴满粉色标签的女性专用车厢。男士若误入会遭到工作人员劝离或乘客提醒。" }
  ],
  ta: [
    { title: "எதிர் திசையில் பயணம்", warning: "தவறான திசையில் செல்லும் ரயிலில் ஏறுதல்.", solution: "எப்பொழுதும் நிலையத்தின் இறுதி நிலையத்தின் பெயரைப் பார்க்கவும்." },
    { title: "உண்ணவும் பருகவும் தடை", warning: "நிலையத்தில் அல்லது ரயிலுக்குள் உணவு உண்பதற்கு RM500 அபராதம்.", solution: "டிக்கெட் வாசலைத் தாண்டும் வரை சாப்பிடுவதையோ நீர் குடிப்பதையோ தவிர்க்கவும்." },
    { title: "இணைப்பு நிலையங்கள்", warning: "இடைமாற்றத்தின் போது வெளியேறி மீண்டும் பணம் செலுத்துதல்.", solution: "பாசார் செனி அல்லது மஸ்ஜித் ஜமெக் நிலையங்களில் கார்டை டாப் அவுட் செய்யாமல் நேரடியாக நடந்து செல்லலாம்." }
  ]
};

export const FARE_GUESTIMATION: Record<Language, FareRange[]> = {
  en: [
    { lineType: "LRT / MRT lines", range: "RM1.20 - RM6.40", notes: "Depends strictly on the distance. Integrated transfer discounts are calculated on a single journey." },
    { lineType: "KL Monorail line", range: "RM1.20 - RM4.10", notes: "Typically slightly higher cost per kilometer due to capacity limitations." },
    { lineType: "KTM Komuter lines", range: "RM1.20 - RM8.50", notes: "Cheap for long-distance suburban travel across Greater Kuala Lumpur/Selangor." },
    { lineType: "KLIA Non-stop Express", range: "RM55.00 (One-way)", notes: "Fastest way (28 mins) from KL Sentral to KLIA Airport. Buying online in advance gets a 10% discount." },
    { lineType: "KLIA Transit (Stop-over)", range: "RM2.00 - RM55.00", notes: "Stops at Bandar Tasik Selatan, Putrajaya, Salak Tinggi along airport rails." }
  ],
  bm: [
    { lineType: "Aliran LRT / MRT", range: "RM1.20 - RM6.40", notes: "Mengikut jarak perjalanan anda. Diskaun pertukaran bersepadu aktif secara automatik." },
    { lineType: "Aliran KL Monorel", range: "RM1.20 - RM4.10", notes: "Tambang per kilometer sedikit tinggi berikutan kapasiti tren yang terhad." },
    { lineType: "Aliran KTM Komuter", range: "RM1.20 - RM8.50", notes: "Sangat menjimatkan untuk perjalanan jauh ke luar bandar merentasi Lembah Klang." },
    { lineType: "ERL KLIA Ekspres", range: "RM55.00 (Satu hala)", notes: "Cara terpantas ke Lapangan Terbang (28 minit) dari KL Sentral. Pembelian secara dalam talian menjimatkan 10%." }
  ],
  zh: [
    { lineType: "LRT / MRT 轻铁捷运", range: "RM1.20 - RM6.40", notes: "按乘坐区间里程计费，使用 Touch 'n Go 触卡有轻微折扣。" },
    { lineType: "KL Monorail 单轨火车", range: "RM1.20 - RM4.10", notes: "因车载客量有限，单日每公里平均费率会略贵一两钱。" },
    { lineType: "KTM 通勤火车", range: "RM1.20 - RM8.50", notes: "横跨吉隆坡郊区与邻省极为划算的长距离交通选择。" },
    { lineType: "吉隆坡机场快线 (KLIA Ekspres)", range: "RM55.00 (单程)", notes: "28分钟点对点极速直达吉隆坡国际机场，线上购票打九折。" }
  ],
  ta: [
    { lineType: "LRT / MRT சேவைகள்", range: "RM1.20 - RM6.40", notes: "தூரத்தின் அடிப்படையில் கட்டணம் கணக்கிடப்படுகிறது." },
    { lineType: "கேஎல் மோனோரயில்", range: "RM1.20 - RM4.10", notes: "மற்ற ரயில்களை விட சற்று கூடுதல் கட்டணம்." },
    { lineType: "கேடிஎம் கோமுட்டர்", range: "RM1.20 - RM8.50", notes: "நெடுந்தூர பயணத்திற்கு மிகவும் மலிவானது." },
    { lineType: "KLIA எக்ஸ்பிரஸ் விமான சேவை", range: "RM55.00 (ஒரு வழி)", notes: "கேஎல் செண்ட்ரல் முதல் விமானநிலையம் வரை 28 நிமிட பயணம்." }
  ]
};

export const SUGGESTED_PROMPTS: Record<Language, string[]> = {
  en: [
    "How do I get from KL Sentral to Bukit Bintang? 🚉",
    "What is a Touch 'n Go card and where do I buy one? 💳",
    "Which train goes to KLCC (Twin Towers)? 🏙️",
    "What's the difference between LRT and MRT? 🚄",
    "How do I travel to Batu Caves via KTM? 🐒"
  ],
  bm: [
    "Bagaimanakah saya hendak pergi dari KL Sentral ke Bukit Bintang? 🚉",
    "Apakah itu kad Touch 'n Go dan di mana saya boleh beli? 💳",
    "Kereta api yang mana satu ke KLCC (Twin Towers)? 🏙️",
    "Apakah perbezaan antara LRT dan MRT? 🚄",
    "Bagaimana saya pergi ke Batu Caves menaiki KTM? 🐒"
  ],
  zh: [
    "如何从吉隆坡中央车站 (KL Sentral) 到武吉免登 (Bukit Bintang)？🚉",
    "什么是 Touch 'n Go 卡？在哪里可以买到？💳",
    "哪条轨道线路可以到达双峰塔 (KLCC)？🏙️",
    "LRT 轻快铁和 MRT 捷运有什么区别？🚄",
    "如何乘坐 KTM 火车去黑风洞 (Batu Caves)？🐒"
  ],
  ta: [
    "கேஎல் செண்ட்ரல் முதல் புக்கிட் பிந்தாங் வரை நான் எப்படி செல்வது? 🚉",
    "டச் 'என் கோ அட்டை என்றால் என்ன, அதை எங்கு வாங்குவது? 💳",
    "KLCC (இரட்டை கோபுரங்கள்) செல்ல எந்த ரயில் பாதை உதவும்? 🏙️",
    "LRT மற்றும் MRT நிலையங்களுக்கு என்ன வித்தியாசம்? 🚄",
    "கேடிஎம் ரயில் மூலம் பத்து குகைக்கு எவ்வாறு செல்வது? 🐒"
  ]
};
