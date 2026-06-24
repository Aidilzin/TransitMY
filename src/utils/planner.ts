import { Language } from "../types";

export interface PlannerStation {
  id: string;
  name: Record<Language, string>;
  emoji: string;
  description: Record<Language, string>;
  lines: string[];
}

export const PLANNER_STATIONS: PlannerStation[] = [
  {
    id: "kl-sentral",
    name: {
      en: "KL Sentral Hub",
      bm: "Hub KL Sentral",
      zh: "吉隆坡中央车站 (KL Sentral)",
      ta: "கேஎல் செண்ட்ரல் ஹப்"
    },
    emoji: "🚉",
    description: {
      en: "The primary integrated transit hub of Kuala Lumpur. Merges LRT, MRT, Monorail, KTM Komuter, and Airport Express lines.",
      bm: "Hub transit bersepadu utama Kuala Lumpur. Menghubungkan LRT, MRT, Monorel, KTM Komuter dan perkhidmatan KLIA Express.",
      zh: "吉隆坡核心轨道交通枢纽，汇集了轻快铁、地铁、单轨火车、KTM 通勤铁路和机场快铁线。",
      ta: "கோலாலம்பூரின் முக்கிய போக்குவரத்து மையம். எல்ஆர்டி, எம்ஆர்டி, மோனோரயில், கேடிஎம் மற்றும் விமான ரயில் சேவைகள் இணையும் இடம்."
    },
    lines: ["LRT Kelana Jaya", "MRT Kajang", "KL Monorail", "KTM Komuter", "ERL Airport Link"]
  },
  {
    id: "bukit-bintang",
    name: {
      en: "Bukit Bintang (Golden Triangle)",
      bm: "Bukit Bintang (Segitiga Emas)",
      zh: "武吉免登 (Bukit Bintang • 黄金三角区)",
      ta: "புக்கிட் பிந்தாங் (கோல்டன் ட்ரையாங்கிள்)"
    },
    emoji: "🛍️",
    description: {
      en: "Kuala Lumpur's shopping, entertainment, and fashion epicenter. Direct indoor street walkways to Pavilion KL and Lot 10.",
      bm: "Pusat membeli-belah, hiburan dan fesyen terkemuka KL. Sambungan jejantas pejalan kaki ke Pavilion KL dan Lot 10.",
      zh: "吉隆坡最繁华的购物、娱乐与流行时尚中心。可直接步行前往 Pavilion KL（柏威年）和 Lot 10（乐天）等大型商场。",
      ta: "கோலாலம்பூரின் முக்கிய தங்குமிடம் மற்றும் வணிகப்பகுதி. பெவிலியன் மற்றும் லாட் 10 போன்ற வணிக வளாகங்களை எளிதாக அடையலாம்."
    },
    lines: ["MRT Kajang", "KL Monorail"]
  },
  {
    id: "klcc",
    name: {
      en: "KLCC (Twin Towers)",
      bm: "KLCC (Menara Berkembar)",
      zh: "双峰塔 (KLCC • Petronas Twin Towers)",
      ta: "கேஎல்சிசி (இரட்டை கோபுரங்கள்)"
    },
    emoji: "🏙️",
    description: {
      en: "The icon of Malaysia. Home to the Petronas Twin Towers, Suria KLCC Mall, and the beautiful lush KLCC Park.",
      bm: "Mercu tanda kedaulatan Malaysia. Lokasi Menara Berkembar Petronas, Suria KLCC dan Taman Rekreasi KLCC.",
      zh: "马来西亚的世界级地标。著名双峰塔、Suria KLCC 购物广场及宽阔清新的城中城公园所在地。",
      ta: "மலேசியாவின் உலகப் புகழ்பெற்ற இரட்டைக் கோபுரம் மற்றும் சுரியா கேஎல்சிசி வணிக வளாகம் அமைந்துள்ள பகுதி."
    },
    lines: ["LRT Kelana Jaya"]
  },
  {
    id: "pasar-seni",
    name: {
      en: "Pasar Seni (Chinatown)",
      bm: "Pasar Seni (Chinatown)",
      zh: "中央艺术坊 / 唐人街 (Pasar Seni)",
      ta: "பாசார் செனி (சைனாடவுன்)"
    },
    emoji: "🏮",
    description: {
      en: "The historic heritage quarter. Direct gateway to Chinatown (Petaling Street), Central Market arts bazaar, and central regional bus hubs.",
      bm: "Kawasan warisan bersejarah. Laluan utama ke Petaling Street (Chinatown), Pasar Seni, dan hab utama bas RapidKL.",
      zh: "浓缩吉隆坡近代人文历史的文创与遗产街区。直通唐人街（茨厂街）、中央艺术文创集市以及庞大的日班巴士枢纽站。",
      ta: "கோலாலம்பூரின் பாரம்பரிய சைனாடவுன் பகுதி. செண்ட்ரல் மார்க்கெட் கைவினைப் பொருட்கள் சந்தைக்கு எளிதாக செல்லலாம்."
    },
    lines: ["LRT Kelana Jaya", "MRT Kajang"]
  },
  {
    id: "masjid-jamek",
    name: {
      en: "Masjid Jamek Interchange",
      bm: "Pertukaran Masjid Jamek",
      zh: "占美清真寺 (Masjid Jamek Interchange)",
      ta: "மஸ்ஜித் ஜமெக் சந்திப்பு"
    },
    emoji: "🕌",
    description: {
      en: "Historic landmark convergence station. Allows direct seamless transfers between Kelana Jaya Line and Ampang/Sri Petaling LRT lines.",
      bm: "Stesen pertukaran mercu tanda bersejarah. Membolehkan penukaran tanpa had antara LRT Kelana Jaya dan LRT Ampang/Sri Petaling.",
      zh: "坐落在吉隆坡发源地——巴生河与鹅唛河交汇处的百年清真寺旁。进闸后无需出关即可实现红线与橙黄金浅铁的线级转换。",
      ta: "வரலாற்றுப் பின்னணி கொண்ட சந்திப்பு நிலையம். எல்ஆர்டி கிளானா ஜெயா மற்றும் அம்பாங் வழித்தடங்களை இணைக்கிறது."
    },
    lines: ["LRT Kelana Jaya", "LRT Ampang/Sri Petaling"]
  },
  {
    id: "batu-caves",
    name: {
      en: "Batu Caves Temple",
      bm: "Kuil Batu Caves",
      zh: "黑风洞景区 (Batu Caves)",
      ta: "பத்து குகை திருத்தலம்"
    },
    emoji: "🐒",
    description: {
      en: "Famous limestone caves and Hindu shrine temple complex. Features the massive golden Lord Murugan deity monument.",
      bm: "Gua batu kapur yang terkenal dan kompleks kuil Hindu. Menampilkan monumen emas Dewa Murugan yang agung.",
      zh: "世界知名的石灰岩洞穴与印度教朝圣圣地。拥有耀眼夺目的金色室外大宝森节穆鲁干神巨像以及 272 级彩色天梯。",
      ta: "உலகப் புகழ்பெற்ற 272 வண்ணமயமான படிகள் கொண்ட முருகன் திருத்தலம் மற்றும் வரலாற்று குகைக் கோயில்."
    },
    lines: ["KTM Komuter"]
  },
  {
    id: "trx",
    name: {
      en: "TRX Financial District",
      bm: "Distrik Kewangan TRX",
      zh: "敦拉萨国际贸易中心 (Tun Razak Exchange)",
      ta: "டிஆர்எக்ஸ் நிதி மாவட்டம்"
    },
    emoji: "🏦",
    description: {
      en: "The ultra-modern corporate business district. Home to Exchange 106 skyscraper and the spectacular Exchange TRX mall.",
      bm: "Daerah perniagaan korporat bertaraf antarabangsa. Lokasi bagi menara mercu Exchange 106 dan pusat beli-belah mewah TRX Exchange.",
      zh: "全马最尖端的国际金融与商业特区。座拥 Exchange 106 摩天大楼以及吉隆坡绝对瞩目的 The Exchange 奢华商场。",
      ta: "கோலாலம்பூரின் நவீன உலகளாவிய நிதி மையம். பிரம்மாண்டமான எக்ஸ்சேஞ்ச் 106 கோபுரம் மற்றும் புதிய வணிக வளாகம் இங்கே உள்ளது."
    },
    lines: ["MRT Kajang", "MRT Putrajaya"]
  },
  {
    id: "ampang-park",
    name: {
      en: "Ampang Park",
      bm: "Ampang Park",
      zh: "安邦公园 (Ampang Park)",
      ta: "அம்பாங் பார்க்"
    },
    emoji: "🌲",
    description: {
      en: "Embassy and business hub. Connects LRT Kelana Jaya line with MRT Putrajaya line via a beautiful high-tech subterranean walkway.",
      bm: "Hab perniagaan dan kedutaan asing. Menghubungkan LRT Kelana Jaya dengan MRT Putrajaya melalui laluan bawah tanah serba canggih.",
      zh: "使馆区与跨国企业集群中心。轻快铁红线与地铁粉色线在此通过设计精美的全空调地下走廊无缝合一。",
      ta: "வெளிநாட்டு தூதரகங்கள் மற்றும் வணிகர்கள் நிறைந்த பகுதி. எல்ஆர்டி மற்றும் எமஆர்டி புத்ராஜெயா பாதையை இணைக்கிறது."
    },
    lines: ["LRT Kelana Jaya", "MRT Putrajaya"]
  },
  {
    id: "hang-tuah",
    name: {
      en: "Hang Tuah (Lalaport)",
      bm: "Hang Tuah (Lalaport)",
      zh: "汉都亚 / 啦啦宝都 (Hang Tuah • Lalaport)",
      ta: "ஹாங் துவா (லாலாபோர்ட்)"
    },
    emoji: "🛍️",
    description: {
      en: "Direct connection to Mitsui Shopping Park LaLaport BBCC (Japanese themed mall) and historic Stadium Merdeka points.",
      bm: "Sambungan terus ke Mitsui Shopping Park LaLaport BBCC dan berhampiran tempat bersejarah Stadium Merdeka.",
      zh: "直通日系轻奢百货 Mitsui LaLaport（啦啦宝都）商场，步行即可探访大马独立史诗地标“默迪卡体育场”。",
      ta: "லாலாபோர்ட் ஜப்பானிய வணிக வளாக உள்கட்டமைப்பு மற்றும் மெர்டேகா பாரம்பரிய விளையாட்டு மைதானத்திற்கு அருகில் உள்ளது."
    },
    lines: ["LRT Ampang/Sri Petaling", "KL Monorail"]
  },
  {
    id: "mid-valley",
    name: {
      en: "Mid Valley Megamall",
      bm: "Mid Valley Megamall",
      zh: "谷中城美佳广场 (Mid Valley Megamall)",
      ta: "மிட் வேலி மெகாமால்"
    },
    emoji: "🏬",
    description: {
      en: "One of Southeast Asia's largest megamalls. KTM Komuter stop connects directly inside the shopping wings via covered pedestrian links.",
      bm: "Salah satu pusat beli-belah terbesar Asia Tenggara. KTM Komuter disambungkan terus ke dalam tingkat beli-belah utama.",
      zh: "东南亚最巨无霸型购物中心之一。出站后通过遮阳步行天桥 1 分钟拉开大门直连商场的黄金走廊。",
      ta: "தென்கிழக்கு ஆசியாவின் மிகப்பெரிய வணிக வளாகங்களில் ஒன்று. கேடிஎம் ரயில் நிலையம் நேரடியாக வணிகப் பகுதியுடன் இணைகிறது."
    },
    lines: ["KTM Komuter"]
  },
  {
    id: "putrajaya-sentral",
    name: {
      en: "Putrajaya Sentral",
      bm: "Putrajaya Sentral",
      zh: "布城中央车站 (Putrajaya Sentral)",
      ta: "புத்ராஜெயா செண்ட்ரல்"
    },
    emoji: "🏛️",
    description: {
      en: "Gateway to Malaysia's administrative capital city Putrajaya. Feeder buses connect to the Grand Pink Mosque and Prime Minister's office.",
      bm: "Pintu masuk ke pusat pentadbiran kerajaan persekutuan Putrajaya. Bas pengantara sedia membawa anda ke Masjid Putra dan Pejabat PM.",
      zh: "前往马来西亚联邦行政首都“布城”的门户大本营。出站即可换乘城市巴士直达粉红水上清真寺及首相署等宏伟景点。",
      ta: "மலேசியாவின் அரசு நிர்வாகத் தலைநகரான புத்ராஜெயாவின் நுழைவாயில். பிங்க் பள்ளிவாசலுக்கு இங்கிருந்து பேருந்துகள் செல்கின்றன."
    },
    lines: ["MRT Putrajaya", "ERL Airport Link"]
  },
  {
    id: "klia-t1",
    name: {
      en: "KLIA Terminal 1",
      bm: "KLIA Terminal 1",
      zh: "吉隆坡国际机场 T1 (KLIA Terminal 1)",
      ta: "கேஎல்ஐஏ முனையம் 1"
    },
    emoji: "✈️",
    description: {
      en: "The primary international gateway for foreign travelers. Connected directly by high-speed ERL Airport Express/Transit rails.",
      bm: "Pintu masuk penerbangan antarabangsa utama Malaysia. Dihubungkan terus melalui rel transit terpantas ERL Airport Express.",
      zh: "马来西亚首要的国际空中门户航站楼。通过时速高达 160 公里的机场捷运 ERL 实现吉隆坡中环至此的瞬息直达。",
      ta: "மலேசியாவின் முதன்மை சர்வதேச விமான நிலையம். கேஎல் செண்ட்ரல் சந்திப்பில் இருந்து அதிவேக ரயில்கள் நேரடியாக இணைகின்றன."
    },
    lines: ["ERL Airport Link"]
  }
];

export interface RouteLink {
  fromId: string;
  toId: string;
  line: string;
  lineCode: string; // "LRT 5", "MRT 9", "MRT 12", "Monorail 8", "KTM 1", "ERL 6/7"
  color: string;
  stops: number;
}

// Simple direct edges to represent our simplified sub-network graph
export const NETWORK_LINKS: RouteLink[] = [
  // Kelana Jaya line (Red)
  { fromId: "ampang-park", toId: "klcc", line: "Kelana Jaya Line", lineCode: "LRT 5", color: "#EF4444", stops: 1 },
  { fromId: "klcc", toId: "masjid-jamek", line: "Kelana Jaya Line", lineCode: "LRT 5", color: "#EF4444", stops: 2 },
  { fromId: "masjid-jamek", toId: "pasar-seni", line: "Kelana Jaya Line", lineCode: "LRT 5", color: "#EF4444", stops: 1 },
  { fromId: "pasar-seni", toId: "kl-sentral", line: "Kelana Jaya Line", lineCode: "LRT 5", color: "#EF4444", stops: 1 },

  // Kajang line (Green)
  { fromId: "kl-sentral", toId: "pasar-seni", line: "Kajang MRT Line", lineCode: "MRT 9", color: "#10B981", stops: 1 },
  { fromId: "pasar-seni", toId: "bukit-bintang", line: "Kajang MRT Line", lineCode: "MRT 9", color: "#10B981", stops: 2 },
  { fromId: "bukit-bintang", toId: "trx", line: "Kajang MRT Line", lineCode: "MRT 9", color: "#10B981", stops: 1 },

  // Putrajaya line (Pink)
  { fromId: "ampang-park", toId: "trx", line: "Putrajaya MRT Line", lineCode: "MRT 12", color: "#EC4899", stops: 2 },
  { fromId: "trx", toId: "putrajaya-sentral", line: "Putrajaya MRT Line", lineCode: "MRT 12", color: "#EC4899", stops: 10 },

  // Monorail (Lime)
  { fromId: "kl-sentral", toId: "hang-tuah", line: "KL Monorail Line", lineCode: "MRL 8", color: "#84CC16", stops: 3 },
  { fromId: "hang-tuah", toId: "bukit-bintang", line: "KL Monorail Line", lineCode: "MRL 8", color: "#84CC16", stops: 2 },

  // KTM Komuter (Blue)
  { fromId: "batu-caves", toId: "kl-sentral", line: "KTM Komuter Line 1", lineCode: "KTM 1", color: "#3B82F6", stops: 6 },
  { fromId: "kl-sentral", toId: "mid-valley", line: "KTM Komuter Line 1", lineCode: "KTM 1", color: "#3B82F6", stops: 1 },

  // Ampang line (Yellow/Orange)
  { fromId: "masjid-jamek", toId: "hang-tuah", line: "Ampang LRT Line", lineCode: "LRT 3/4", color: "#F59E0B", stops: 2 },

  // ERL Airport Line (Purple)
  { fromId: "kl-sentral", toId: "putrajaya-sentral", line: "KLIA Transit ERL", lineCode: "ERL 6/7", color: "#A855F7", stops: 1 },
  { fromId: "putrajaya-sentral", toId: "klia-t1", line: "KLIA Transit ERL", lineCode: "ERL 6/7", color: "#A855F7", stops: 2 },
  { fromId: "kl-sentral", toId: "klia-t1", line: "KLIA Express ERL (Non-stop)", lineCode: "ERL 6/7", color: "#A855F7", stops: 1 }
];

export interface PathStep {
  stationId: string;
  lineCode: string;
  lineColor: string;
  stopsTraversed: number;
}

export interface RouteResult {
  startId: string;
  endId: string;
  path: PathStep[];
  totalStops: number;
  totalTimeMinutes: number;
  cashFareValue: number;
  tngFareValue: number;
  transfersCount: number;
  isKtmSpecial: boolean;
  isAirportSpecial: boolean;
  isMonorailSpecial: boolean;
}

/**
 * Calculates a route from a source key station to a destination key station using Dijkstra's algorithm on our transit graph.
 */
export function calculateRoute(startId: string, endId: string): RouteResult | null {
  if (startId === endId) return null;

  // Build adjacent list map dynamically
  const graph: Record<string, { to: string; link: RouteLink }[]> = {};
  
  PLANNER_STATIONS.forEach(st => {
    graph[st.id] = [];
  });

  NETWORK_LINKS.forEach(link => {
    if (graph[link.fromId]) {
      graph[link.fromId].push({ to: link.toId, link });
    }
    if (graph[link.toId]) {
      graph[link.toId].push({ to: link.fromId, link: { ...link, fromId: link.toId, toId: link.fromId } });
    }
  });

  const getLinesForStation = (stationId: string): string[] => {
    const linesSet = new Set<string>();
    const neighbors = graph[stationId] || [];
    neighbors.forEach(edge => {
      linesSet.add(edge.link.lineCode);
    });
    return Array.from(linesSet);
  };

  interface DijkstraState {
    stationId: string;
    lineCode: string;
    path: PathStep[];
    totalStops: number;
    transfersCount: number;
    totalTime: number;
  }

  const startLines = getLinesForStation(startId);
  const queue: DijkstraState[] = [];
  const minTime: Record<string, number> = {};

  startLines.forEach(line => {
    const key = `${startId}::${line}`;
    queue.push({
      stationId: startId,
      lineCode: line,
      path: [],
      totalStops: 0,
      transfersCount: 0,
      totalTime: 0
    });
    minTime[key] = 0;
  });

  let bestResult: DijkstraState | null = null;

  while (queue.length > 0) {
    // Sort queue by totalTime ascending to pop the minimum time state
    queue.sort((a, b) => a.totalTime - b.totalTime);
    const curr = queue.shift()!;

    const key = `${curr.stationId}::${curr.lineCode}`;
    if (curr.totalTime > (minTime[key] ?? Infinity)) {
      continue;
    }

    if (curr.stationId === endId) {
      bestResult = curr;
      break;
    }

    // 1. Move along the same line
    const neighbors = graph[curr.stationId] || [];
    neighbors.forEach(edge => {
      if (edge.link.lineCode === curr.lineCode) {
        const nextTime = curr.totalTime + (edge.link.stops * 3.2);
        const nextKey = `${edge.to}::${curr.lineCode}`;
        if (nextTime < (minTime[nextKey] ?? Infinity)) {
          minTime[nextKey] = nextTime;
          queue.push({
            stationId: edge.to,
            lineCode: curr.lineCode,
            path: [
              ...curr.path,
              {
                stationId: edge.to,
                lineCode: curr.lineCode,
                lineColor: edge.link.color,
                stopsTraversed: edge.link.stops
              }
            ],
            totalStops: curr.totalStops + edge.link.stops,
            transfersCount: curr.transfersCount,
            totalTime: nextTime
          });
        }
      }
    });

    // 2. Transfer to another line at the same station
    const otherLines = getLinesForStation(curr.stationId).filter(l => l !== curr.lineCode);
    otherLines.forEach(otherLine => {
      const nextTime = curr.totalTime + 6.0; // transfer penalty
      const nextKey = `${curr.stationId}::${otherLine}`;
      if (nextTime < (minTime[nextKey] ?? Infinity)) {
        minTime[nextKey] = nextTime;
        queue.push({
          stationId: curr.stationId,
          lineCode: otherLine,
          path: curr.path,
          totalStops: curr.totalStops,
          transfersCount: curr.transfersCount + 1,
          totalTime: nextTime
        });
      }
    });
  }

  if (!bestResult) {
    return null;
  }

  // Calculate special flags based on the path
  let isKtmSpecial = false;
  let isAirportSpecial = false;
  let isMonorailSpecial = false;

  bestResult.path.forEach(step => {
    if (step.lineCode === "KTM 1") isKtmSpecial = true;
    if (step.lineCode === "ERL 6/7") isAirportSpecial = true;
    if (step.lineCode === "MRL 8") isMonorailSpecial = true;
  });

  // Calculate fares
  let cashFareValue = 0;
  let tngFareValue = 0;

  if (isAirportSpecial) {
    const hasSentral = startId === "kl-sentral" || endId === "kl-sentral";
    const hasAirport = startId === "klia-t1" || endId === "klia-t1";

    if (hasSentral && hasAirport) {
      cashFareValue = 55.00;
      tngFareValue = 49.50;
    } else if (hasAirport) {
      cashFareValue = 35.00;
      tngFareValue = 31.50;
    } else {
      cashFareValue = 14.00;
      tngFareValue = 12.60;
    }
  } else {
    const baseFare = isKtmSpecial ? 2.20 : isMonorailSpecial ? 1.60 : 1.20;
    const ratePerStop = isMonorailSpecial ? 0.30 : 0.15;
    cashFareValue = baseFare + (bestResult.totalStops * ratePerStop);
    tngFareValue = cashFareValue * 0.90;
  }

  return {
    startId,
    endId,
    path: bestResult.path,
    totalStops: bestResult.totalStops,
    totalTimeMinutes: Math.round(bestResult.totalTime),
    cashFareValue: parseFloat(cashFareValue.toFixed(2)),
    tngFareValue: parseFloat(tngFareValue.toFixed(2)),
    transfersCount: bestResult.transfersCount,
    isKtmSpecial,
    isAirportSpecial,
    isMonorailSpecial
  };
}

/**
 * Returns tourist transit micro-copy for specific transfer actions in various languages.
 */
export function getTransferAdvice(lineFrom: string, lineTo: string, lang: Language): string {
  const advices: Record<string, Record<Language, string>> = {
    "LRT 5->MRT 9": {
      en: "🔄 Pasar Seni Link: Walk through the indoor, fully-sheltered passenger linkway. Walk takes 2-3 mins and does not require exiting the main fare gates.",
      bm: "🔄 Jambatan Pasar Seni: Berjalan mengikut laluan bertutup penghawa dingin stesen. Ambil masa 2-3 minit tanpa perlu tap-out keluar.",
      zh: "🔄 快捷换乘：中央艺术坊内建全封闭冷气联络天桥，只需步行 2 分钟，进闸状态下无须出闸即可换乘。",
      ta: "🔄 இணைப்பு: பாசார் செனி சந்திப்பில் உள்ள குளிரூட்டப்பட்ட நடைபாதை வழியாக தடையின்றி மற்றொரு ரயில் பாதைக்குச் செல்லலாம்."
    },
    "MRT 9->LRT 5": {
      en: "🔄 Pasar Seni Link: Walk through the beautiful elevated connecting escalators to switch between lines. Direct transfer, no gate exits required.",
      bm: "🔄 Pertukaran Pasar Seni: Gunakan eskalator dan jambatan bersambung di dalam stesen tanpa tap-out semula.",
      zh: "🔄 快捷换乘：从 MRT 出口乘坐扶梯穿过中央玻璃天桥，可快速直抵 LRT 轻轨区域，全程处于闸内，极为便捷。",
      ta: "🔄 இணைப்பு: பாசார் செனி எல்ஆர்டி-எம்ஆர்டி பாதையை இணைக்கும் நடைபாதை வசதியாகும்."
    },
    "LRT 5->LRT 3/4": {
      en: "🔄 Masjid Jamek Transfer: Walk down the stairs to the lower level platforms. Look at the overhead dynamic sign boards pointing to 'Ampang' or 'Sentul East'.",
      bm: "🔄 Pertukaran Masjid Jamek: Rujuk papan tanda gantung bertulis LRT Ampang/Sri Petaling. Tukar platform di bawah jambatan stesen.",
      zh: "🔄 占美清真寺换乘：根据高悬指示牌下楼梯，直接跨线进入大城堡线/安邦线侧式站台，无须重新打卡扣费。",
      ta: "🔄 மஸ்ஜித் ஜமெக் சந்திப்பு: வழித்தட பலகைகளைப் பின்பற்றி கீழ் தளத்திற்குச் செல்லவும்."
    },
    "LRT 3/4->LRT 5": {
      en: "🔄 Masjid Jamek Transfer: Head up to the underground platform bridge. Simply tap/transfer over the pedestrian crossing directly.",
      bm: "🔄 Masjid Jamek: Naiki eskalator ke jejantas atas stesen untuk mengakses laluan Kelana Jaya Keluar/Masuk.",
      zh: "🔄 占美清真寺换乘：上自动扶梯至换乘天桥上，顺着指示标步行至地下 Kelana Jaya 轻轨专属月台即可。",
      ta: "🔄 மஸ்ஜித் ஜமெக் சந்திப்பு: மேலே உள்ள நடைமேடை வழியே கிளானா ஜெயா ரயில் பாதைக்குச் செல்லலாம்."
    },
    "MRT 9->MRT 12": {
      en: "🔄 Tun Razak Exchange (TRX): Deep subterranean dual-level tracks. Walk down one flight of escalators to find Putrajaya Line trains on platforms directly below.",
      bm: "🔄 Hub TRX: Stesen bawah tanah hibrid dalam. Hanya perlu menuruni eskalator satu tingkat ke platform Putrajaya di tingkat bawah.",
      zh: "🔄 TRX 双铁枢纽换乘：全马最深的双层十字站台。只需搭乘一截自动扶梯下到下层站台，即可极其丝滑地登上布城线捷运。",
      ta: "🔄 டிஆர்எக்ஸ் சந்திப்பு: கீழ் மட்ட பிளாட்பாரத்திற்குச் சென்று எளிதாக அடுத்த ரயிலில் ஏறலாம்."
    },
    "default": {
      en: "🔄 Multi-modal Interchange: Follow the distinct color-coded hanging transit arrows inside the station concourse.",
      bm: "🔄 Pertukaran Aliran: Sila ikut papan petunjuk arah gantung yang berwarna-warni di dalam laluan stesen.",
      zh: "🔄 跨线转换：请紧随车站大厅内高挂的彩色导航指示箭头步行换乘。",
      ta: "🔄 வழித்தட சந்திப்பு: நிலையத் தளத்தில் உள்ள குறிப்பிட்ட வண்ண அம்புக்குறிகளைப் பின்தொடரவும்."
    }
  };

  const key = `${lineFrom}->${lineTo}`;
  return (advices[key] || advices["default"])[lang];
}
