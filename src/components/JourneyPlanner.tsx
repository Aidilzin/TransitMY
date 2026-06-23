import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PLANNER_STATIONS, calculateRoute, getTransferAdvice, RouteResult, PlannerStation } from "../utils/planner";
import { Language } from "../types";
import { 
  ArrowRight, 
  MapPin, 
  Clock, 
  CreditCard, 
  Coins, 
  Milestone, 
  Shuffle, 
  Compass, 
  HelpCircle, 
  Navigation,
  Sparkles,
  Info
} from "lucide-react";

interface JourneyPlannerProps {
  lang: Language;
}

export default function JourneyPlanner({ lang }: JourneyPlannerProps) {
  const [startStationId, setStartStationId] = useState<string>("kl-sentral");
  const [endStationId, setEndStationId] = useState<string>("bukit-bintang");
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [selectedHopStation, setSelectedHopStation] = useState<PlannerStation | null>(null);

  // Auto-calculate route on changes
  useEffect(() => {
    if (startStationId !== endStationId) {
      const res = calculateRoute(startStationId, endStationId);
      setRouteResult(res);
      // Reset selected detail to default end station or null
      setSelectedHopStation(null);
    } else {
      setRouteResult(null);
    }
  }, [startStationId, endStationId]);

  // Dictionary translations for UI elements in planner
  const lText = {
    en: {
      header: "Interactive Route & Fare Tool",
      subheader: "Calculate precise tourist routes, interchange stations, travel time, and cash vs. Smartcard ticket pricing instantly across Kuala Lumpur.",
      from: "Pick Departure Station",
      to: "Pick Destination Station",
      swap: "Swap Stations",
      popular: "Recommended Sightseeing Routes",
      duration: "Travel Duration",
      min: "mins",
      stops: "stops",
      transfers: "transfers",
      cashToken: "Single Cash Token",
      tngPrice: "Touch 'n Go Price",
      save10: "Saves 10%",
      stopsRoute: "Journey Path Stops",
      transferNote: "Transfer Connection Guide",
      clickPrompt: "💡 Interactive: Tap any station node in the path below to reveal dining tips, local transit advises and sightseeing hacks!",
      selectDiff: "Kindly select distinct starting and ending stations to display pathing directions.",
      ktmWarning: "⚠️ KTM Suburban Train Notice: Trains arrive every 30-45 minutes. Please align arrival plans with the digital timetable board in the left column.",
      airportExpress: "⚡ ERL Airport Express: High-speed premium direct train. Runs directly with zero intermediate street stops.",
      stationDetails: "Active Station Highlight",
      guidelines: "Tourist Guidelines & local dining hacks:"
    },
    bm: {
      header: "Kalkulator Laluan & Tambang",
      subheader: "Kira laluan pelancong, stesen pertukaran, masa perjalanan, dan perbezaan tambang tunai lwn. Touch 'n Go dengan pantas.",
      from: "Stesen Pelepasan",
      to: "Stesen Destinasi",
      swap: "Tukar Hala",
      popular: "Syor Laluan Pelancong Terkemuka",
      duration: "Tempoh Perjalanan",
      min: "minit",
      stops: "stesen",
      transfers: "pertukaran alir",
      cashToken: "Token Tunai Tunggal",
      tngPrice: "Harga Touch 'n Go",
      save10: "Jimat 10%",
      stopsRoute: "Stesen Laluan Perjalanan",
      transferNote: "Panduan Hub Pertukaran",
      clickPrompt: "💡 Interaktif: Sentuh mana-mana stesen di bawah untuk tips makanan tempatan & panduan pelancongan!",
      selectDiff: "Sila pilih stesen pelepasan dan destinasi berbeza untuk arah perjalanan.",
      ktmWarning: "⚠️ Amaran Komuter KTM: Tren tiba selang 30-45 minit. Sila rancang mengikut papan waktu ketibaan di lajur kiri.",
      airportExpress: "⚡ Landasan Airport ERL: Tren ekspres premium lurus tanpa henti dengan keselesaan kelas tinggi.",
      stationDetails: "Butiran Station Aktif",
      guidelines: "Panduan Pelancong & cadangan makanan:"
    },
    zh: {
      header: "观光线路与票价智能规划器",
      subheader: "即时计算吉隆坡最佳旅游换乘路线、站数里程、预计时间，并为您对比单程纸币购票与 Touch 'n Go 交通卡扣款金额差异。",
      from: "请选择出发车站",
      to: "请选择目的车站",
      swap: "互换起止 stesen",
      popular: "吉隆坡经典观光捷径 (点击即刻查询)",
      duration: "预计时间",
      min: "分钟",
      stops: "站",
      transfers: "次换乘",
      cashToken: "现金单次 Token 口票",
      tngPrice: "Touch 'n Go 储值卡",
      save10: "立享 9 折",
      stopsRoute: "行车路线站点明细",
      transferNote: "换乘通道指南",
      clickPrompt: "💡 交互玩法：在下方路线链条上点击任何一个车站圆点，即可解开该站著名的本地美食爆料与观光防坑常识！",
      selectDiff: "请选择不同的出发和到达站，我们将立即为您智能绘制推荐线路表。",
      ktmWarning: "⚠️ KTM 郊区火车提醒：此车次通常需要等待 30-45 分钟，建议配合屏幕左侧实时到站看板估算等车时间。",
      airportExpress: "⚡ ERL 机场特快线：高端极速专线，点对点静音飞行直通机场，不经过繁杂路段。",
      stationDetails: "车站深度卡片",
      guidelines: "当地食玩秘籍与出游注意："
    },
    ta: {
      header: "இருவழிப் பாதை & கட்டணக் கணிப்பான்",
      subheader: "கோலாலம்பூரின் ரயில் பாதைகள், மாற்று நிலையங்கள், பயண நேரம், மற்றும் ரொக்கம் vs. ஸ்மார்ட் கார்டு கட்டண வேறுபாடுகளைக் கணக்கிடுங்கள்.",
      from: "புறப்படும் நிலையம்",
      to: "சென்றடையும் நிலையம்",
      swap: "நிலையங்களை மாற்று",
      popular: "பரிந்துரைக்கப்படும் சுற்றுலாப் பாதைகள்",
      duration: "பயண நேரம்",
      min: "நிமிடங்கள்",
      stops: "நிலையங்கள்",
      transfers: "மாற்றங்கள்",
      cashToken: "ரொக்க டோக்கன் கட்டணம்",
      tngPrice: "டச் 'என் கோ கட்டணம்",
      save10: "10% சேமிப்பு",
      stopsRoute: "பயண நிலைய பட்டியல்",
      transferNote: "இடைமாற்று நிலைய வழிகாட்டி",
      clickPrompt: "💡 வழிக்குறிப்பு: கீழே உள்ள ஏதேனும் ஒரு நிலையத்தைத் தொட்டு, அங்குள்ள உள்ளூர் உணவுகள் & சுற்றுலா ஆலோசனைகளைக் காணுங்கள்!",
      selectDiff: "வித்தியாசமான தொடக்க மற்றும் இறுதி நிலையங்களைத் தேர்ந்தெடுக்கவும்.",
      ktmWarning: "⚠️ கேடிஎம் ரயில் எச்சரிக்கை: ரயில்கள் 30-45 நிமிடங்களுக்கு ஒருமுறை மட்டுமே வரும். இடதுபுறம் உள்ள அலகைப் பார்க்கவும்.",
      airportExpress: "⚡ விமான ரயில் பாதை: அதிவேக பிரீமியம் இடைநில்லா ரயில் சேவை.",
      stationDetails: "நிலையம் பற்றி",
      guidelines: "சுற்றுலாப் பயணிகளுக்கான உள்ளூர் வழிகாட்டுதல்:"
    }
  }[lang];

  // Quick preset tourist routes
  const sightseeingRoutes = [
    { title: "Batu Caves Expedition", start: "kl-sentral", end: "batu-caves", icon: "🐒" },
    { title: "Suria KLCC Sightseeing", start: "kl-sentral", end: "klcc", icon: "🏙️" },
    { title: "Golden Triangle Shopping", start: "klcc", end: "bukit-bintang", icon: "🛍️" },
    { title: "Historic Chinatown Walk", start: "bukit-bintang", end: "pasar-seni", icon: "🏮" },
    { title: "Putrajaya Capital Visit", start: "kl-sentral", end: "putrajaya-sentral", icon: "🏛️" },
    { title: "Airport Flight Departure", start: "kl-sentral", end: "klia-t1", icon: "✈️" }
  ];

  const handlePresetSelect = (start: string, end: string) => {
    setStartStationId(start);
    setEndStationId(end);
    setSelectedHopStation(null);
  };

  const handleSwap = () => {
    const temp = startStationId;
    setStartStationId(endStationId);
    setEndStationId(temp);
    setSelectedHopStation(null);
  };

  const handleHopClick = (stationId: string) => {
    const found = PLANNER_STATIONS.find(s => s.id === stationId);
    if (found) {
      setSelectedHopStation(found);
    }
  };

  // Find info helper
  const renderStartStation = PLANNER_STATIONS.find(s => s.id === startStationId);
  const renderEndStation = PLANNER_STATIONS.find(s => s.id === endStationId);

  return (
    <div id="interactive-journey-planner" className="space-y-6">
      
      {/* Visual Header Banner */}
      <div className="bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-inner">
        <div className="flex gap-3 items-start">
          <div className="w-10 h-10 rounded-xl bg-malaysia-blue flex items-center justify-center text-white shrink-0 shadow-md">
            <Compass size={22} className="animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              {lText.header}
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
              {lText.subheader}
            </p>
          </div>
        </div>
      </div>

      {/* Primary Pickers Card */}
      <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800/80 p-4 sm:p-5 rounded-2xl shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
          
          {/* Departure block */}
          <div className="md:col-span-5 space-y-1.5 text-left">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1">
              <MapPin size={11} />
              {lText.from}
            </span>
            <div className="relative">
              <select
                id="planner-origin-select"
                value={startStationId}
                onChange={(e) => setStartStationId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-malaysia-blue cursor-pointer"
              >
                {PLANNER_STATIONS.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.emoji} {st.name[lang]} [{st.id.toUpperCase()}]
                  </option>
                ))}
              </select>
            </div>
            {renderStartStation && (
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 line-clamp-1 italic">
                {renderStartStation.description[lang]}
              </p>
            )}
          </div>

          {/* Swap action button */}
          <div className="md:col-span-1 flex justify-center">
            <button
              onClick={handleSwap}
              className="p-3 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-700/80 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 transition-all hover:scale-110 cursor-pointer shadow-sm"
              title={lText.swap}
            >
              <Shuffle size={14} className="md:rotate-90 shrink-0" />
            </button>
          </div>

          {/* Destination Block */}
          <div className="md:col-span-5 space-y-1.5 text-left">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1">
              <MapPin size={11} />
              {lText.to}
            </span>
            <div className="relative">
              <select
                id="planner-destination-select"
                value={endStationId}
                onChange={(e) => setEndStationId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-malaysia-blue cursor-pointer"
              >
                {PLANNER_STATIONS.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.emoji} {st.name[lang]} [{st.id.toUpperCase()}]
                  </option>
                ))}
              </select>
            </div>
            {renderEndStation && (
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 line-clamp-1 italic">
                {renderEndStation.description[lang]}
              </p>
            )}
          </div>

        </div>
      </div>

      {/* Dynamic Results Presentation */}
      <AnimatePresence mode="wait">
        {routeResult ? (
          <motion.div
            key={`${startStationId}-${endStationId}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-5"
          >
            
            {/* Visual Route Stepper Column */}
            <div className="lg:col-span-7 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-4 sm:p-5 rounded-2xl shadow-sm text-xs">
              
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 dark:border-zinc-700">
                <h4 className="font-mono font-extrabold text-[11px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-1.5">
                  <Milestone size={13} className="text-malaysia-blue" />
                  {lText.stopsRoute}
                </h4>
                <span className="text-[10px] text-slate-400 italic">
                  {routeResult.path.length} {routeResult.path.length > 1 ? "links" : "link"}
                </span>
              </div>

              <div className="p-3.5 bg-sky-50/50 dark:bg-zinc-900 border border-sky-100 dark:border-zinc-800 rounded-xl text-[11px] text-sky-800 dark:text-zinc-300 leading-snug mb-5">
                {lText.clickPrompt}
              </div>

              {/* Start element */}
              <div className="relative pl-8 pb-5 text-left select-none">
                {/* Visual marker pole */}
                <div className="absolute left-[8px] top-6 bottom-0 w-[4px] bg-slate-200 dark:bg-zinc-700"></div>
                
                {/* Station dot indicator */}
                <button
                  onClick={() => handleHopClick(startStationId)}
                  className="absolute left-0 top-0.5 w-[20px] h-[20px] rounded-full bg-rose-500 border-4 border-white dark:border-zinc-800 flex items-center justify-center cursor-pointer shadow-md transform hover:scale-125 transition-all"
                >
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </button>

                <div>
                  <h5 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-1.5">
                    {renderStartStation?.name[lang]} {renderStartStation?.emoji}
                    <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">
                      ORIGIN
                    </span>
                  </h5>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {renderStartStation?.lines.join(" • ")}
                  </p>
                </div>
              </div>

              {/* Traversed nodes stepper */}
              {routeResult.path.map((step, idx) => {
                const isTarget = idx === routeResult.path.length - 1;
                const hopStation = PLANNER_STATIONS.find(s => s.id === step.stationId);
                const prevStep = idx > 0 ? routeResult.path[idx - 1] : null;
                const isTransfer = prevStep && prevStep.lineCode !== step.lineCode;

                return (
                  <div key={idx} className="relative pl-8 pb-5 text-left select-none">
                    {/* Visual marker pole */}
                    {!isTarget && (
                      <div className="absolute left-[8px] top-6 bottom-0 w-[4px] bg-slate-200 dark:bg-zinc-700"></div>
                    )}

                    {/* Line connection banner decoration */}
                    <div className="absolute -left-16 top-1 text-[9px] font-mono font-bold tracking-wider uppercase text-slate-400 dark:text-zinc-500 text-right w-20 pr-4 mt-1 hidden sm:block">
                      <span className="px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: step.lineColor }}>
                        {step.lineCode}
                      </span>
                    </div>

                    {/* Step node dot indicator */}
                    <button
                      onClick={() => handleHopClick(step.stationId)}
                      className="absolute left-0 top-0.5 w-[20px] h-[20px] rounded-full border-4 border-white dark:border-zinc-800 flex items-center justify-center cursor-pointer shadow-md transform hover:scale-125 transition-all"
                      style={{ backgroundColor: isTarget ? "#10B981" : step.lineColor }}
                    >
                      {step.stopsTraversed > 1 && !isTarget ? (
                        <span className="text-[8.5px] text-white font-black">{step.stopsTraversed}</span>
                      ) : (
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      )}
                    </button>

                    <div>
                      {/* Inter-line transfer callout card before print */}
                      {isTransfer && prevStep && (
                        <div className="my-2 p-2.5 bg-amber-50/75 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/40 rounded-xl leading-relaxed text-[11px] text-amber-800 dark:text-amber-300">
                          <p className="font-extrabold text-[10px] uppercase tracking-wide mb-1 flex items-center gap-1">
                            <Navigation size={11} className="text-amber-500 spin-slow" />
                            {lText.transferNote}
                          </p>
                          <p>{getTransferAdvice(prevStep.lineCode, step.lineCode, lang)}</p>
                        </div>
                      )}

                      <h5 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-1.5">
                        {hopStation?.name[lang]} {hopStation?.emoji}
                        {isTarget ? (
                          <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-450">
                            DESTINATION
                          </span>
                        ) : (
                          <span className="font-mono text-[9.5px] text-slate-400 font-bold">
                            (+{step.stopsTraversed} {step.stopsTraversed > 1 ? "stops" : "stop"})
                          </span>
                        )}
                      </h5>
                      <span className="sm:hidden inline-block text-[9px] font-mono font-bold uppercase text-white px-1 ml-0.5 mt-0.5 rounded" style={{ backgroundColor: step.lineColor }}>
                        {step.lineCode}
                      </span>
                      {!isTarget && (
                        <p className="text-[10px] text-slate-400">
                          {hopStation?.lines.join(" • ")}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}

            </div>

            {/* Travel Analytics & Hop Info Column */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Trip duration scoreboard card */}
              <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-4 sm:p-5 rounded-2xl shadow-sm space-y-4">
                
                {/* Visual duration estimate */}
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 shadow-inner">
                    <Clock size={24} className="animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 dark:text-zinc-500">
                      {lText.duration}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white -mt-1 flex items-baseline gap-1">
                      ~ {routeResult.totalTimeMinutes}
                      <span className="text-xs font-bold text-slate-400 uppercase">{lText.min}</span>
                    </h3>
                  </div>
                </div>

                {/* Grid micro figures */}
                <div className="grid grid-cols-2 gap-3.5 border-t border-b border-slate-100 dark:border-zinc-700 py-3.5">
                  <div className="text-center p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800">
                    <h4 className="text-[9.5px] uppercase font-mono font-bold text-slate-400 dark:text-zinc-500 mb-0.5">Route Distance</h4>
                    <span className="text-sm font-extrabold text-slate-800 dark:text-zinc-200">{routeResult.totalStops} {lText.stops}</span>
                  </div>
                  <div className="text-center p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800">
                    <h4 className="text-[9.5px] uppercase font-mono font-bold text-slate-400 dark:text-zinc-500 mb-0.5">System Transfers</h4>
                    <span className="text-sm font-extrabold text-slate-800 dark:text-zinc-200">{routeResult.transfersCount} {lText.transfers}</span>
                  </div>
                </div>

                {/* Fare Compare Block */}
                <div className="space-y-3 pt-1">
                  
                  {/* TnG Card Fare */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/10 border border-blue-200/70 dark:border-blue-900/30 text-left">
                    <div className="flex gap-2.5 items-center">
                      <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center">
                        <CreditCard size={16} />
                      </div>
                      <div>
                        <h5 className="font-extrabold text-xs text-blue-900 dark:text-sky-300">
                          {lText.tngPrice}
                        </h5>
                        <span className="text-[9px] font-bold text-blue-500 uppercase tracking-tight block">
                          {lText.save10}
                        </span>
                      </div>
                    </div>
                    <span className="text-base sm:text-lg font-black text-blue-700 dark:text-sky-400">
                      RM {routeResult.tngFareValue.toFixed(2)}
                    </span>
                  </div>

                  {/* Cash Fare */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800/80 text-left">
                    <div className="flex gap-2.5 items-center">
                      <div className="w-8 h-8 rounded-lg bg-slate-400 text-white flex items-center justify-center">
                        <Coins size={16} />
                      </div>
                      <div>
                        <h5 className="font-extrabold text-xs text-slate-700 dark:text-zinc-300">
                          {lText.cashToken}
                        </h5>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight block">
                          At station TVM
                        </span>
                      </div>
                    </div>
                    <span className="text-sm sm:text-base font-black text-slate-600 dark:text-slate-300">
                      RM {routeResult.cashFareValue.toFixed(2)}
                    </span>
                  </div>

                </div>

                {/* KTM Wait warnings notice */}
                {routeResult.isKtmSpecial && (
                  <div className="p-3 bg-rose-50/50 dark:bg-zinc-900 border border-rose-100 dark:border-zinc-800 rounded-xl leading-relaxed text-[11px] text-rose-800 dark:text-rose-400 flex items-start gap-2 text-left">
                    <Info size={14} className="text-rose-500 shrink-0 mt-0.5" />
                    <p>{lText.ktmWarning}</p>
                  </div>
                )}

                {/* ERL Line helper */}
                {routeResult.isAirportSpecial && (
                  <div className="p-3 bg-purple-50/50 dark:bg-zinc-900 border border-purple-100 dark:border-zinc-800 rounded-xl leading-relaxed text-[11px] text-purple-800 dark:text-purple-400 flex items-start gap-2 text-left">
                    <Info size={14} className="text-purple-500 shrink-0 mt-0.5" />
                    <p>{lText.airportExpress}</p>
                  </div>
                )}

              </div>

              {/* Hop Station Interactive Spotlight Details CARD */}
              <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-4 sm:p-5 rounded-2xl shadow-sm text-left">
                <div className="flex items-center gap-2 mb-3">
                  <Compass className="text-malaysia-blue shrink-0 animate-pulse" size={15} />
                  <h4 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[11px]">
                    {lText.stationDetails}
                  </h4>
                </div>

                {(() => {
                  const focal = selectedHopStation || renderEndStation || renderStartStation;
                  if (!focal) return null;

                  // Find hardcoded extra guides based on station name/id matching
                  const extraMap: Record<string, { eat: string; tips: string }> = {
                    "kl-sentral": {
                      eat: "Nu Sentral Food Court (Level 3) features premium local choices; basement level sells direct RM15 bus boarding tickets to Genting Highlands.",
                      tips: "Interchanges with KLIA airports rails and KTM commuter railways directly inside. Keep track of overhead neon signage lines."
                    },
                    "bukit-bintang": {
                      eat: "Lot 10 Hutong Food Court gathers legendary Malaysian heritage family brand stalls; Jalan Alor night street starts adjacent to Exit D from 6pm.",
                      tips: "Super busy evenings. MRT Exit E leads straight inside Pavilion mall's lower atrium without getting wet in rain."
                    },
                    "klcc": {
                      eat: "Nasi Kandar inside Suria mall's level 4 food center has great spice profiles. Also features fine dining halls overlooking the park.",
                      tips: "Hop onto the internal, air-conditioned elevated walk tunnel deck (15 mins walk) straight to reach Pavilion KL shopping boulevard."
                    },
                    "pasar-seni": {
                      eat: "Central Market food stalls (traditional local delicacies, laksa broth), Chinatown Claypot rice, and legendary local coffee shop alleys.",
                      tips: "Perfect interchange between MRT (Green) and LRT (Red). Exit A takes you 200m away to Petaling Street markets entrance."
                    },
                    "masjid-jamek": {
                      eat: "Savor Indian Muslim Murtabak, local curries, and traditional Malay kueh at historical street vendor carts.",
                      tips: "Follow the painted ground path labels to transfer between platform floors without exiting ticketing barriers."
                    },
                    "batu-caves": {
                      eat: "South Indian pure vegetarian meals (curry thali platters) and sweet warm masala milk teas right near the entrance gates.",
                      tips: "Be highly careful about macaques on the colorful steps; avoid displaying plastic bags or drinking plastic bottles."
                    },
                    "trx": {
                      eat: "High-end luxury eateries inside TRX Exchange Mall floor basements or premium local fast casual dining decks.",
                      tips: "Malaysia's deepest tube rail station. Excellent dual levels to skip within 20s to Putrajaya rail lines."
                    },
                    "ampang-park": {
                      eat: "Intermark Building food zone or surrounding high-rise business quick bites cafe outlets.",
                      tips: "Walk across the high-tech subterranean platform tube tunnel to switch lines. Fully accessible for suitcases."
                    },
                    "hang-tuah": {
                      eat: "LaLaport BBCC's Japanese Gourmet Street features premier katsu and matcha shops, local food hall centers.",
                      tips: "Direct doors connectivity to the Japanese Mitsui Mall BBCC entrance gates. Quiet and easy transfers."
                    },
                    "mid-valley": {
                      eat: "Standard food courts inside Mid Valley Megamall Level 3, or premium garden eateries inside The Gardens Mall wing.",
                      tips: "KTM ticket gates connects inside the mall main pathway on the ground floor. Have Touch 'n Go ready."
                    },
                    "putrajaya-sentral": {
                      eat: "Quick terminal bites and takeaway kiosks inside the transit terminal building halls.",
                      tips: "Board city commuter feeder buses from the platform below to visit the Federal Pink Mosque and iconic bridges."
                    },
                    "klia-t1": {
                      eat: "Direct airport food halls, international coffee brands, and duty-free dining spots across the lounges.",
                      tips: "ERL Airport Express departs starting at Platform 1. High frequency. Check bags at KL Sentral in advance if flying Malaysia Airlines."
                    }
                  };

                  const guides = extraMap[focal.id] || { eat: "Fabulous local street dining spots surrounding the main streets.", tips: "Simply follow station color codes to travel anywhere safely." };

                  return (
                    <div className="space-y-3.5 mt-2 animate-fade-in text-xs">
                      <div>
                        <h4 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5">
                          {focal.emoji} {focal.name[lang]}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-normal mt-1">
                          {focal.description[lang]}
                        </p>
                      </div>

                      <div className="p-3 bg-slate-50/65 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-xl space-y-2 text-[11.5px] text-slate-600 dark:text-zinc-300 leading-relaxed">
                        <p><strong>🍲 Local Dining Spotlight:</strong> {guides.eat}</p>
                        <p><strong>🗺️ Tourist Commuter Tip:</strong> {guides.tips}</p>
                      </div>
                    </div>
                  );
                })()}

              </div>

            </div>

          </motion.div>
        ) : (
          <div className="p-10 text-center bg-white dark:bg-zinc-800 border border-dashed border-slate-300 dark:border-zinc-700/80 rounded-2xl text-slate-400 dark:text-zinc-500 animate-pulse text-xs">
            <Milestone size={28} className="mx-auto mb-2 opacity-60 text-slate-400" />
            <p className="font-extrabold uppercase tracking-wide">{lText.selectDiff}</p>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
