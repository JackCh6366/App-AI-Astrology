import React, { useState, useEffect } from "react";
import { 
  Sparkles, Moon, Sun, Compass, Heart, Activity, 
  User, RefreshCw, Copy, Calendar, Clock, Award, 
  Flame, Gem, HelpCircle, Send, Check, Eye, HeartHandshake,
  BookOpen, Compass as CompassIcon, Coins, TrendingUp, AlertCircle, Star
} from "lucide-react";
import { CONSTELLATIONS, generateDailyFortune, getHoroscopeByBirthdate, calculateMatch } from "./data";
import { Constellation, FortuneResult, MatchResult, DivineResponse } from "./types";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from "recharts";

// 豪華星曜懸浮提示卡 (Custom Tooltip)
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#09090d]/95 border border-[#c5a47e]/50 p-3.5 rounded-sm shadow-2xl backdrop-blur-md">
        <p className="text-xs text-[#c5a47e] font-semibold mb-2 flex items-center gap-1.5 font-mystic-serif">
          <span>🪐</span> {label} 星曜能率走走趨勢
        </p>
        <div className="space-y-1.5 border-b border-[#1f1f23] pb-2">
          {payload.map((entry: any, index: number) => {
            let labelText = entry.name;
            return (
              <div key={index} className="flex items-center justify-between gap-6 text-[11px]">
                <span className="flex items-center gap-1.5" style={{ color: entry.stroke || entry.color }}>
                  <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: entry.stroke || entry.color }} />
                  {labelText}
                </span>
                <span className="font-bold text-white text-right">{Math.round(entry.value)}%</span>
              </div>
            );
          })}
        </div>
        <div className="mt-2 text-[10px] text-[#8e8e93] flex flex-col gap-1">
          <div>🎨 靈魂幸運色: <span className="text-white font-medium">{payload[0].payload.luckyColor}</span></div>
          <div>💎 星際幸運石: <span className="text-white font-medium">{payload[0].payload.luckyGem}</span></div>
          <div>🔮 幸運能率數: <span className="text-[#ffd700] font-bold font-mono">{payload[0].payload.luckyNumber}</span></div>
        </div>
      </div>
    );
  }
  return null;
};

export default function App() {
  // 當前選擇的星座
  const [selectedSign, setSelectedSign] = useState<Constellation>(CONSTELLATIONS[4]); // 預設獅子座
  const [currentDate, setCurrentDate] = useState<string>("");
  const [fortune, setFortune] = useState<FortuneResult | null>(null);

  // 每日星運提醒懸浮元件顯示狀態
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);

  // 網頁載入後，1.5 秒自動彈出日常星運提醒亮點一次
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAlertOpen(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // 選單 Tab：insight (星座日運與特質), match (雙星配合度), divine (AI星盤神諭)
  const [activeTab, setActiveTab] = useState<"insight" | "match" | "divine">("insight");

  // 雙星配對 state
  const [matchSignA, setMatchSignA] = useState<string>("獅子座");
  const [matchSignB, setMatchSignB] = useState<string>("射手座");
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);

  // AI 星盤占卜輸入欄位
  const [aiName, setAiName] = useState<string>("");
  const [aiBirthdate, setAiBirthdate] = useState<string>("");
  const [aiBirthtime, setAiBirthtime] = useState<string>("");
  const [aiGender, setAiGender] = useState<string>("未透露");
  const [aiCategory, setAiCategory] = useState<"愛情" | "事業" | "學業" | "財運" | "綜合運勢">("綜合運勢");
  const [aiProvider, setAiProvider] = useState<"gemini" | "nvidia">("nvidia");
  const [aiQuestion, setAiQuestion] = useState<string>("");
  
  // AI 占卜狀態管理
  const [isDivining, setIsDivining] = useState<boolean>(false);
  const [mysticStep, setMysticStep] = useState<string>("");
  const [divineResult, setDivineResult] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // 生日快速推算星座
  const [quickBirthDate, setQuickBirthDate] = useState<string>("");
  const [calculatedSignResult, setCalculatedSignResult] = useState<string>("");
  const [chartFocus, setChartFocus] = useState<"all" | "overall" | "love" | "career" | "wealth">("overall");

  // 四大元素篩選器："all" | "火" | "土" | "風" | "水"
  const [selectedElement, setSelectedElement] = useState<"all" | "火" | "土" | "風" | "水">("all");

  // 篩選後的星座
  const filteredConstellations = React.useMemo(() => {
    if (selectedElement === "all") return CONSTELLATIONS;
    return CONSTELLATIONS.filter((sign) => sign.element === selectedElement);
  }, [selectedElement]);

  // 能量趨勢預測：運算該星座未來 7 天的運勢走勢
  const sevenDayTrendData = React.useMemo(() => {
    const data = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const dateVal = String(d.getDate()).padStart(2, "0");
      const dateStrYMD = `${year}-${month}-${dateVal}`;
      
      const fortuneRes = generateDailyFortune(selectedSign.name, dateStrYMD);
      
      const showDate = d.toLocaleDateString("zh-TW", {
        month: "numeric",
        day: "numeric",
        weekday: "short"
      });
      
      data.push({
        date: showDate,
        dateKey: dateStrYMD,
        "綜合運勢": (fortuneRes.overall / 5) * 100,
        "感情運勢": (fortuneRes.love / 5) * 100,
        "事業運勢": (fortuneRes.career / 5) * 100,
        "財富運勢": (fortuneRes.wealth / 5) * 100,
        luckyColor: fortuneRes.luckyColor,
        luckyNumber: fortuneRes.luckyNumber,
        luckyGem: fortuneRes.luckyGem
      });
    }
    return data;
  }, [selectedSign]);

  // 計算今日速配星座前三名
  const topThreeMatches = React.useMemo(() => {
    if (!selectedSign) return [];
    return CONSTELLATIONS
      .filter((c) => c.name !== selectedSign.name)
      .map((c) => {
        const matchResult = calculateMatch(selectedSign.name, c.name);
        return {
          constellation: c,
          match: matchResult,
        };
      })
      .sort((a, b) => b.match.score - a.match.score)
      .slice(0, 3);
  }, [selectedSign]);

  // 性格特質五維能譜：領導力、感性、創造力、理性、執行力
  const radarData = React.useMemo(() => {
    const scores: Record<string, { [key: string]: number }> = {
      "牡羊座": { "領導力": 90, "感性": 65, "創造力": 80, "理性": 50, "執行力": 95 },
      "金牛座": { "領導力": 60, "感性": 75, "創造力": 70, "理性": 85, "執行力": 90 },
      "雙子座": { "領導力": 70, "感性": 60, "創造力": 95, "理性": 80, "執行力": 65 },
      "巨蟹座": { "領導力": 65, "感性": 95, "創造力": 75, "理性": 60, "執行力": 80 },
      "獅子座": { "領導力": 95, "感性": 75, "創造力": 85, "理性": 55, "執行力": 85 },
      "處女座": { "領導力": 60, "感性": 65, "創造力": 75, "理性": 95, "執行力": 95 },
      "天秤座": { "領導力": 75, "感性": 80, "創造力": 85, "理性": 80, "執行力": 70 },
      "天蠍座": { "領導力": 85, "感性": 90, "創造力": 80, "理性": 85, "執行力": 85 },
      "射手座": { "領導力": 80, "感性": 70, "創造力": 90, "理性": 65, "執行力": 75 },
      "摩羯座": { "領導力": 85, "感性": 55, "創造力": 70, "理性": 95, "執行力": 95 },
      "水瓶座": { "領導力": 70, "感性": 65, "創造力": 95, "理性": 90, "執行力": 75 },
      "雙魚座": { "領導力": 55, "感性": 95, "創造力": 90, "理性": 55, "執行力": 70 },
    };
    const currentScores = scores[selectedSign.name] || { "領導力": 70, "感性": 70, "創造力": 70, "理性": 70, "執行力": 70 };
    return Object.entries(currentScores).map(([subject, value]) => ({
      subject,
      value,
      fullMark: 100,
    }));
  }, [selectedSign]);

  // 排行榜切換週期：本日榜、本週榜、本月榜
  const [rankingPeriod, setRankingPeriod] = useState<"day" | "week" | "month">("day");

  // 計算星曜能率排行榜
  const astraRankings = React.useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const formattedDate = `${year}-${String(month).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    
    // 計算 ISO 週
    const getWeekNumber = (d: Date) => {
      const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      const dayNum = date.getUTCDay() || 7;
      date.setUTCDate(date.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
      return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    };
    const weekNum = getWeekNumber(today);

    // 隨機數輔助
    const getSeedRandom = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      const x = Math.sin(hash) * 10000;
      return x - Math.floor(x);
    };

    const dayBlessings = [
      "日輪拱照，諸曜大吉",
      "水星親和，思路如泉",
      "金曜眷顧，魅力勃發",
      "月相安寧，靈覺敏銳",
      "火星乘旺，魄力非凡",
      "木星加冕，神契擁護"
    ];

    const weekBlessings = [
      "本週星運順行，能率持續攀高",
      "本週勢如破竹，機運遍地綻放",
      "主曜特別守護，踏上全新里程",
      "命德交會本曜，事事稱心圓滿",
      "星塵凝聚貴人，暗中化解滯礙"
    ];

    const monthBlessings = [
      "本月主星入廟，迎來年度重磅解鎖",
      "本月歲星照臨，開拓生活與事業新版圖",
      "月德金輿同會，諸事皆能在溫和中致勝",
      "星能引力大盛，綻放無可忽視的靈魂光華",
      "命盤祥瑞漫天，迎來高維蛻變的關鍵旬日"
    ];

    const mapped = CONSTELLATIONS.map((sign) => {
      let score = 0;
      let blessing = "";
      
      if (rankingPeriod === "day") {
        const seedStr = `rank-day-${sign.name}-${formattedDate}`;
        const rand = getSeedRandom(seedStr);
        score = Math.floor(rand * 16) + 85; 
        blessing = dayBlessings[Math.floor(rand * dayBlessings.length)];
      } else if (rankingPeriod === "week") {
        const seedStr = `rank-week-${sign.name}-${year}-W${weekNum}`;
        const rand = getSeedRandom(seedStr);
        score = Math.floor(rand * 16) + 85; 
        blessing = weekBlessings[Math.floor(rand * weekBlessings.length)];
      } else {
        const seedStr = `rank-month-${sign.name}-${year}-M${month}`;
        const rand = getSeedRandom(seedStr);
        score = Math.floor(rand * 16) + 85; 
        blessing = monthBlessings[Math.floor(rand * monthBlessings.length)];
      }

      return {
        constellation: sign,
        score,
        blessing
      };
    });

    return mapped.sort((a, b) => b.score - a.score).slice(0, 3);
  }, [rankingPeriod]);

  // 初始化今日日期與預設運勢
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    setCurrentDate(formattedDate);
    
    // 生成運勢
    const signFortune = generateDailyFortune(selectedSign.name, today.toISOString().slice(0, 10));
    setFortune(signFortune);
  }, [selectedSign]);

  // 當選擇配對星座 or 切換配對時
  useEffect(() => {
    const res = calculateMatch(matchSignA, matchSignB);
    setMatchResult(res);
  }, [matchSignA, matchSignB]);

  // 星座快速推算處理
  const handleQuickCalculate = (dateStr: string) => {
    setQuickBirthDate(dateStr);
    if (!dateStr) return;
    const [, month, day] = dateStr.split("-").map(Number);
    const sign = getHoroscopeByBirthdate(month, day);
    if (sign) {
      setCalculatedSignResult(sign);
      const foundSign = CONSTELLATIONS.find(c => c.name === sign);
      if (foundSign) {
        setSelectedSign(foundSign);
      }
    }
  };

  // 啟動 AI 星盤神諭占卜的非同步請求
  const handleDivine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDivining) return;

    setIsDivining(true);
    setErrorMsg("");
    setDivineResult("");

    const steps = [
      "✡️ 正在引導水晶磁場，校準您的靈魂星盤定位...",
      "🌌 正在聯絡『奧秘星域主宰』，開啟星位羅盤...",
      "🌙 解讀您的出生星位圖與天體相位共振角...",
      "✍️ 正在將繁星的脈動，轉寫為專屬您的命運開示..."
    ];

    // 做個儀式感的逼真倒數步驟，提升十倍占卜體驗
    for (let i = 0; i < steps.length; i++) {
      setMysticStep(steps[i]);
      await new Promise(resolve => setTimeout(resolve, i === 0 ? 1200 : 1000));
    }

    try {
      const response = await fetch("/api/astrology/divine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: aiName,
          birthdate: aiBirthdate,
          birthtime: aiBirthtime,
          gender: aiGender,
          sign: selectedSign.name,
          category: aiCategory,
          question: aiQuestion,
          provider: aiProvider
        })
      });

      const data = await response.json() as DivineResponse;

      if (data.success && data.insight) {
        setDivineResult(data.insight);
      } else {
        setErrorMsg(data.error || "傳輸通道在星軌間遺失了，請再度嘗試點亮星座火之引導。");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "連結天界阻端。請確認 .env.local 內的 API 金鑰是否正確填入，並重新啟動 npm run dev。");
    } finally {
      setIsDivining(false);
    }
  };

  // 輔助將 Markdown 改寫為簡單但富有格式細節的 HTML Element 呈現
  const renderFormattedResult = (text: string) => {
    if (!text) return null;
    
    // 依據換行將文字拆分，逐行分析並賦予樣式，不依賴複雜的外部 Markdown parser，確保穩定性與安全
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      
      // 標題 1
      if (trimmed.startsWith("###") || trimmed.startsWith("##") || trimmed.startsWith("#")) {
        const titleText = trimmed.replace(/^#+\s*/, "");
        return (
          <h3 key={idx} className="text-lg md:text-xl font-mystic-serif text-[#c5a47e] font-semibold mt-6 mb-3 border-b border-[#1f1f23] pb-1 flex items-center gap-2 glow-gold">
            <Sparkles className="w-4 h-4 text-[#c5a47e] shrink-0" />
            {titleText}
          </h3>
        );
      }

      // 區塊引用
      if (trimmed.startsWith(">")) {
        return (
          <blockquote key={idx} className="border-l-2 border-[#c5a47e] bg-[#c5a47e]/5 px-4 py-2 my-4 rounded-r text-[#a1a1aa] italic text-sm leading-relaxed">
            {trimmed.slice(1).trim()}
          </blockquote>
        );
      }

      // 條列式列清單
      if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
        const content = trimmed.slice(1).trim();
        // 替換 **粗體**
        const parts = content.split(/\*\*(.*?)\*\*/g);
        return (
          <li key={idx} className="ml-4 mb-2 text-sm leading-relaxed text-[#d4d4d8] list-disc">
            {parts.map((part, pIdx) => (
              pIdx % 2 === 1 ? <strong key={pIdx} className="text-[#c5a47e] font-semibold">{part}</strong> : part
            ))}
          </li>
        );
      }

      // 包含粗體的普通段落
      if (trimmed === "") {
        return <div key={idx} className="h-2" />;
      }

      const boldParts = trimmed.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={idx} className="text-sm leading-relaxed text-[#d4d4d8] mb-3">
          {boldParts.map((part, pIdx) => (
            pIdx % 2 === 1 ? <strong key={pIdx} className="text-white bg-[#c5a47e]/10 px-1 rounded">{part}</strong> : part
          ))}
        </p>
      );
    });
  };

  // 複製預言
  const handleCopy = () => {
    if (!divineResult) return;
    navigator.clipboard.writeText(divineResult);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // 取得四大星相分類圖標
  const getElementBadge = (element: "火" | "土" | "風" | "水") => {
    switch (element) {
      case "火":
        return <span className="bg-red-950/40 text-red-400 border border-red-800/50 px-2.5 py-0.5 rounded text-[10px] tracking-wider uppercase font-semibold">火象星座 Fire</span>;
      case "土":
        return <span className="bg-amber-950/40 text-amber-400 border border-amber-800/50 px-2.5 py-0.5 rounded text-[10px] tracking-wider uppercase font-semibold">土象星座 Earth</span>;
      case "風":
        return <span className="bg-indigo-950/40 text-indigo-400 border border-indigo-800/50 px-2.5 py-0.5 rounded text-[10px] tracking-wider uppercase font-semibold">風象星座 Air</span>;
      case "水":
        return <span className="bg-sky-950/40 text-sky-400 border border-sky-800/50 px-2.5 py-0.5 rounded text-[10px] tracking-wider uppercase font-semibold">水象星座 Water</span>;
    }
  };

  // 取得星座對應的符號
  const getSignSymbol = (signName: string) => {
    const found = CONSTELLATIONS.find(c => c.name === signName);
    return found ? found.symbol : "🔮";
  };

  return (
    <div className="min-h-screen bg-[#050508] bg-radial-[circle_at_top_right,_var(--tw-gradient-stops)] from-[#120f1c] via-[#050508] to-[#040406] text-[#d4d4d8] font-mystic-sans flex flex-col relative overflow-hidden selection:bg-[#c5a47e]/30 selection:text-[#fff]">
      
      {/* 炫麗的背景繁星、亮點與星盤旋轉裝飾線 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        {/* 背景旋轉星盤線條 */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] border border-[#c5a47e]/10 rounded-full animate-slow-rotate" />
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] border border-dashed border-[#c5a47e]/5 rounded-full animate-slow-rotate-reverse" />
        
        {/* 發光星雲與極光背景 */}
        <div className="absolute top-[20%] right-[10%] w-[350px] h-[350px] rounded-full bg-purple-900/10 mix-blend-screen filter blur-[80px] animate-nebula-pulse" />
        <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full bg-indigo-950/10 mix-blend-screen filter blur-[90px] animate-nebula-pulse" />

        {/* 點點星塵 */}
        <div className="absolute top-12 left-[30%] w-1 h-1 bg-white rounded-full opacity-60 animate-ping" />
        <div className="absolute top-48 right-[25%] w-1.5 h-1.5 bg-[#c5a47e] rounded-full opacity-40 animate-pulse" />
        <div className="absolute bottom-32 right-[45%] w-1 h-1 bg-white rounded-full opacity-80 animate-ping" />
        <div className="absolute bottom-64 left-[15%] w-2 h-2 bg-indigo-400 rounded-full opacity-30 animate-pulse" />
      </div>

      {/* 網頁頂部 header 區塊 */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <header className="flex flex-col md:flex-row justify-between items-center border-b border-[#1f1f23] py-6 mb-8 gap-4">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Sparkles className="w-6 h-6 text-[#c5a47e] animate-pulse" />
              <h1 className="text-[#c5a47e] font-mystic-serif text-3xl md:text-4xl tracking-widest uppercase">
                Astra Region
              </h1>
            </div>
            <p className="text-[11px] tracking-[0.25em] text-[#71717a] mt-1.5 uppercase font-medium">
              奧秘星域 • 星命開示與靈魂契合占卜
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-end text-center md:text-right">
            <div className="text-lg md:text-xl font-light text-white tracking-wide font-mystic-serif flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#c5a47e]/80" />
              {currentDate || "宇宙永恆時空"}
            </div>
            <div className="text-[10px] tracking-[0.15em] text-[#c5a47e] font-semibold uppercase mt-1 flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 animate-pulse" />
              當前星象軌域：月亮拱合金星 (良好共鳴)
            </div>
          </div>
        </header>

        {/* 頂部中央的星座快速換算與尋找工具 (提高使用者操作體驗) */}
        <div className="p-4 bg-[#0d0d12]/90 border border-[#1f1f23] rounded-sm mb-6 flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-[#c5a47e]/10 border border-[#c5a47e]/20 text-[#c5a47e]">
              <Compass className="w-5 h-5 animate-spin-slow animate-slow-rotate" />
            </div>
            <div>
              <p className="text-xs text-[#a1a1aa]">不知道自己或朋友的星座是什麼嗎？</p>
              <p className="text-sm text-white font-medium">輸入出生生日，下方將自動為您對焦該本命星座與專屬運勢：</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <input 
              type="date"
              className="bg-[#050508] border border-[#1f1f23] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#c5a47e]/60 w-full sm:w-auto text-center"
              value={quickBirthDate}
              onChange={(e) => handleQuickCalculate(e.target.value)}
            />
            {calculatedSignResult && (
              <div className="flex items-center gap-2 bg-[#d4af37]/20 text-[#f1c40f] border border-[#d4af37]/30 px-3 py-1.5 rounded text-xs tracking-wider animate-pulse">
                ✨ 已鎖定本命：<strong>{calculatedSignResult}</strong> (下方已同步對焦)
              </div>
            )}
          </div>
        </div>

        {/* 功能分頁 Tab 控制項 (具有完美的古老羊皮紙/暗金神聖切換美感) */}
        <div className="flex justify-center mb-8 border-b border-[#1f1f23]">
          <div className="flex space-x-2 md:space-x-4">
            <button
              onClick={() => setActiveTab("insight")}
              className={`pb-4 px-4 text-sm md:text-base tracking-widest font-mystic-serif font-semibold border-b-2 transition-all duration-300 flex items-center gap-2 ${
                activeTab === "insight"
                  ? "border-[#c5a47e] text-[#c5a47e] glow-gold"
                  : "border-transparent text-[#71717a] hover:text-white"
              }`}
            >
              <CompassIcon className="w-4 h-4" />
              星象特質與日運
            </button>
            <button
              onClick={() => setActiveTab("match")}
              className={`pb-4 px-4 text-sm md:text-base tracking-widest font-mystic-serif font-semibold border-b-2 transition-all duration-300 flex items-center gap-2 ${
                activeTab === "match"
                  ? "border-[#c5a47e] text-[#c5a47e] glow-gold"
                  : "border-transparent text-[#71717a] hover:text-white"
              }`}
            >
              <HeartHandshake className="w-4 h-4" />
              雙星合盤默契度
            </button>
            <button
              onClick={() => setActiveTab("divine")}
              className={`pb-4 px-4 text-sm md:text-base tracking-widest font-mystic-serif font-semibold border-b-2 transition-all duration-300 flex items-center gap-2 ${
                activeTab === "divine"
                  ? "border-[#c5a47e] text-[#c5a47e] glow-gold"
                  : "border-transparent text-[#71717a] hover:text-white"
              }`}
            >
              <Sparkles className="w-4 h-4 animate-bounce" />
              AI 靈魂星盤占卜大師
            </button>
          </div>
        </div>

        {/* TAB 內容 1 : 星座日運與特質 */}
        {activeTab === "insight" && (
          <div className="space-y-8 fade-slide-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* 左側：精美的高質感 12 星座星軌選擇盤 */}
            <div className="lg:col-span-3 flex flex-col gap-4">
              <h2 className="text-xs tracking-[0.15em] text-[#71717a] font-bold uppercase border-b border-[#1f1f23] pb-2 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#c5a47e]" />
                選擇主曜星座
              </h2>

              {/* 四大元素屬性篩選器 */}
              <div className="bg-[#050508] p-1 border border-[#1f1f23] rounded flex justify-between gap-1">
                {(["all", "火", "土", "風", "水"] as const).map((el) => {
                  const label = el === "all" ? "全部" : `${el}象`;
                  const isCurEl = selectedElement === el;
                  
                  // 各個元素象的裝飾配色
                  let badgeColorStyle = "text-[#71717a] hover:text-white";
                  if (isCurEl) {
                    if (el === "all") badgeColorStyle = "bg-[#c5a47e] text-[#050508] font-extrabold shadow-sm shadow-[#c5a47e]/10";
                    else if (el === "火") badgeColorStyle = "bg-red-500/20 text-red-400 border border-red-500/30 font-extrabold";
                    else if (el === "土") badgeColorStyle = "bg-amber-600/20 text-amber-500 border border-amber-600/30 font-extrabold";
                    else if (el === "風") badgeColorStyle = "bg-teal-500/20 text-teal-400 border border-teal-500/30 font-extrabold";
                    else if (el === "水") badgeColorStyle = "bg-blue-500/20 text-blue-400 border border-blue-500/30 font-extrabold";
                  }

                  return (
                    <button
                      key={el}
                      type="button"
                      onClick={() => setSelectedElement(el)}
                      className={`flex-1 py-1 text-[11px] font-bold tracking-wider rounded text-center transition-all cursor-pointer ${badgeColorStyle}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-2 gap-2.5">
                {filteredConstellations.length > 0 ? (
                  filteredConstellations.map((sign) => {
                    const isCur = selectedSign.name === sign.name;
                    return (
                      <button
                        key={sign.name}
                        onClick={() => setSelectedSign(sign)}
                        className={`p-3 rounded-sm border flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${
                          isCur
                            ? "bg-[#1c1c24] border-[#c5a47e] text-[#c5a47e] shadow-[0_0_15px_rgba(197,164,126,0.15)] scale-[1.03]"
                            : "bg-[#0d0d12]/60 border-[#1f1f23] text-[#71717a] hover:bg-[#0d0d12] hover:border-[#c5a47e]/40 hover:text-white"
                        }`}
                      >
                        <div className={`text-2xl md:text-3xl font-mystic-serif ${isCur ? "text-[#c5a47e]" : "text-[#71717a] group-hover:text-[#c5a47e]"}`}>
                          {sign.symbol}
                        </div>
                        <div className="text-[11px] font-semibold mt-1 tracking-wider">{sign.name}</div>
                        <div className="text-[8px] opacity-60 tracking-tighter mt-0.5">{sign.dateRange}</div>
                      </button>
                    );
                  })
                ) : (
                  <div className="col-span-full py-6 text-center text-xs text-stone-600 italic">
                    此屬性下尚無觀測星曜
                  </div>
                )}
              </div>

              {/* 性格特質微筆記 */}
              <div className="bg-[#0d0d12]/90 border border-[#1f1f23] rounded-sm p-4 mt-2 shadow-xl">
                <p className="text-[10px] text-[#c5a47e] uppercase tracking-widest font-semibold mb-3 border-b border-[#1f1f23] pb-1.5">
                  ✦ 星座性格透視鏡
                </p>
                <div className="space-y-3.5">
                  <div>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-1.5 py-0.5 rounded mr-2">優勢</span>
                    <span className="text-xs text-[#a1a1aa] leading-relaxed">
                      {selectedSign.strengths.join("、")}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-red-400 bg-red-950/40 border border-red-900/50 px-1.5 py-0.5 rounded mr-2">盲點</span>
                    <span className="text-xs text-[#a1a1aa] leading-relaxed">
                      {selectedSign.weaknesses.join("、")}
                    </span>
                  </div>
                </div>
              </div>

              {/* 本命星宿五維能譜圖 */}
              <div className="bg-[#0d0d12]/90 border border-[#1f1f23] rounded-sm p-4 mt-4 shadow-xl">
                <p className="text-[10px] text-[#c5a47e] uppercase tracking-widest font-semibold mb-3 border-b border-[#1f1f23] pb-1.5 flex items-center gap-1.5">
                  🪐 {selectedSign.name} • 魂魄特質五維能譜
                </p>
                <div className="h-52 w-full mt-2 font-mono text-[10px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="#1f1f23" />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 500 }}
                      />
                      <PolarRadiusAxis 
                        angle={30} 
                        domain={[0, 100]} 
                        tick={{ fill: '#4b5563', fontSize: 8 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Radar
                        name="特質傾向"
                        dataKey="value"
                        stroke="#c5a47e"
                        fill="#c5a47e"
                        fillOpacity={0.25}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 text-[9px] text-[#71717a] text-center leading-relaxed">
                  各星宿天生本魄特質分佈（極限值為 100 滿率能量峰值）
                </div>
              </div>
            </div>

            {/* 中間：今日星曜主面板 (卡片放大) */}
            <div className="lg:col-span-6 bg-[#0d0d12] border border-[#1f1f23] rounded-sm relative p-6 md:p-8 flex flex-col items-center shadow-2xl justify-between min-h-[500px]">
              
              {/* 星環背景 */}
              <div className="absolute top-4 right-4 p-2">
                {getElementBadge(selectedSign.element)}
              </div>
              
              {/* 中央巨大閃耀星徽 */}
              <div className="w-28 h-28 border border-[#c5a47e]/40 rounded-full flex items-center justify-center mb-4 mt-6 relative shadow-[0_0_25px_rgba(197,164,126,0.06)] group">
                {/* 旋轉外光圈 */}
                <div className="absolute inset-0 border border-dashed border-[#c5a47e]/20 rounded-full animate-slow-rotate" />
                <div className="text-6xl text-[#c5a47e] font-mystic-serif select-none drop-shadow-[0_0_8px_rgba(197,164,126,0.3)]">
                  {selectedSign.symbol}
                </div>
              </div>

              <div className="text-center mb-6">
                <h2 className="text-3xl md:text-4xl font-mystic-serif text-white tracking-widest font-bold">
                  {selectedSign.name} <span className="text-lg md:text-xl font-light text-[#c5a47e] ml-1">{selectedSign.enName}</span>
                </h2>
                <p className="text-[#71717a] text-[11px] tracking-[0.4em] mt-1.5 font-semibold uppercase">
                  🪐 守護曜星：{selectedSign.planet} | 幸運色系：{selectedSign.color}
                </p>
                <p className="text-xs text-[#c5a47e]/90 italic max-w-sm mx-auto mt-4 px-3 py-1 bg-[#1a1a24]/40 border border-[#c5a47e]/10 rounded-sm">
                  {selectedSign.motto}
                </p>
                {/* 今日整體運勢評星 (1-5 顆星，最低 1 顆) */}
                <div className="flex items-center justify-center gap-1.5 mt-4">
                  <span className="text-[10px] text-[#71717a] uppercase tracking-widest font-bold">今日整體運勢：</span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const starValue = i + 1;
                      const rating = fortune?.overall ?? 3;
                      return (
                        <Star
                          key={i}
                          className={`w-4 h-4 transition-all duration-300 ${
                            starValue <= rating
                              ? "fill-[#ffd700] text-[#ffd700] drop-shadow-[0_0_8px_rgba(255,215,0,0.6)] scale-110"
                              : "text-stone-700 fill-stone-800"
                          }`}
                        />
                      );
                    })}
                  </div>
                  <span className="text-xs text-[#ffd700] font-bold font-mono ml-1">({fortune?.overall ?? 3}/5)</span>
                </div>
              </div>

              {/* 今日運勢解析 */}
              <div className="w-full space-y-5 flex-1 flex flex-col justify-center border-t border-[#1f1f23] pt-6 my-2">
                <div>
                  <h3 className="text-[#c5a47e] text-xs uppercase font-bold tracking-widest mb-2.5 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    今日運勢大綱 (Daily Vibe)
                  </h3>
                  <p className="text-xs md:text-sm leading-relaxed text-[#a1a1aa]">
                    {fortune?.summary}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-3 bg-red-950/10 border border-red-950/40 rounded">
                    <div className="text-[10px] text-red-400 font-bold tracking-wider mb-1 uppercase flex items-center gap-1">
                      <Heart className="w-3 h-3 shrink-0" />
                      心靈情緣
                    </div>
                    <p className="text-[11px] text-[#a1a1aa] leading-relaxed">
                      {fortune?.loveAdvice}
                    </p>
                  </div>
                  <div className="p-3 bg-teal-950/10 border border-teal-950/40 rounded">
                    <div className="text-[10px] text-teal-400 font-bold tracking-wider mb-1 uppercase flex items-center gap-1">
                      <BookOpen className="w-3 h-3 shrink-0" />
                      創生事業
                    </div>
                    <p className="text-[11px] text-[#a1a1aa] leading-relaxed">
                      {fortune?.careerAdvice}
                    </p>
                  </div>
                  <div className="p-3 bg-amber-950/10 border border-amber-950/40 rounded">
                    <div className="text-[10px] text-amber-400 font-bold tracking-wider mb-1 uppercase flex items-center gap-1">
                      <Coins className="w-3 h-3 shrink-0" />
                      豐盛物質
                    </div>
                    <p className="text-[11px] text-[#a1a1aa] leading-relaxed">
                      {fortune?.wealthAdvice}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 右側：四大能量雷達指數 & 今日幸運開示 */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* 能級指數 */}
              <div className="bg-[#0d0d12] border border-[#1f1f23] rounded-sm p-5 shadow-2xl">
                <h3 className="text-xs text-[#c5a47e] font-bold uppercase tracking-widest mb-6 border-b border-[#1f1f23] pb-2 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 shrink-0" />
                  今天星象能量指數
                </h3>
                <div className="space-y-4">
                  {/* 綜合運勢 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] tracking-wider uppercase">
                      <span className="text-white flex items-center gap-1"><Sparkles className="w-3 h-3 text-[#c5a47e]" />綜合振頻</span>
                      <span className="text-[#c5a47e] font-semibold">{((fortune?.overall || 4) / 5 * 100)}%</span>
                    </div>
                    <div className="h-1 bg-[#1f1f23] w-full rounded">
                      <div 
                        className="h-full bg-[#c5a47e] shadow-[0_0_8px_rgba(197,164,126,0.6)] transition-all duration-700 rounded" 
                        style={{ width: `${((fortune?.overall || 4) / 5 * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* 愛情能量 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] tracking-wider uppercase">
                      <span className="text-white flex items-center gap-1"><Heart className="w-3 h-3 text-red-400" />心靈情意</span>
                      <span className="text-red-400 font-semibold">{((fortune?.love || 4) / 5 * 100)}%</span>
                    </div>
                    <div className="h-1 bg-[#1f1f23] w-full rounded">
                      <div 
                        className="h-full bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.6)] transition-all duration-700 rounded" 
                        style={{ width: `${((fortune?.love || 4) / 5 * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* 事業能量 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] tracking-wider uppercase">
                      <span className="text-white flex items-center gap-1"><TrendingUp className="w-3 h-3 text-teal-400" />事業創造</span>
                      <span className="text-teal-400 font-semibold">{((fortune?.career || 4) / 5 * 100)}%</span>
                    </div>
                    <div className="h-1 bg-[#1f1f23] w-full rounded">
                      <div 
                        className="h-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.6)] transition-all duration-700 rounded" 
                        style={{ width: `${((fortune?.career || 4) / 5 * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* 財富能量 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] tracking-wider uppercase">
                      <span className="text-white flex items-center gap-1"><Coins className="w-3 h-3 text-amber-400" />物質豐饒</span>
                      <span className="text-amber-400 font-semibold">{((fortune?.wealth || 3) / 5 * 100)}%</span>
                    </div>
                    <div className="h-1 bg-[#1f1f23] w-full rounded">
                      <div 
                        className="h-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)] transition-all duration-700 rounded" 
                        style={{ width: `${((fortune?.wealth || 3) / 5 * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 每日幸運秘鑰卡 */}
              <div className="bg-[#0d0d12] border border-[#1f1f23] rounded-sm p-5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#c5a47e]/5 rounded-bl-full pointer-events-none" />
                
                <h3 className="text-xs text-[#c5a47e] font-bold uppercase tracking-widest mb-4 border-b border-[#1f1f23] pb-2 flex items-center gap-1.5">
                  <Gem className="w-4 h-4 shrink-0" />
                  今天宇宙幸運密鑰
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs pb-1 border-b border-[#1f1f23]">
                    <span className="text-[#71717a]">靈魂幸運色</span>
                    <span className="text-white font-medium">{fortune?.luckyColor}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pb-1 border-b border-[#1f1f23]">
                    <span className="text-[#71717a]">神聖能率數</span>
                    <span className="text-[#c5a47e] font-bold font-mono">{fortune?.luckyNumber}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pb-1 border-b border-[#1f1f23]">
                    <span className="text-[#71717a]">吉星方向</span>
                    <span className="text-white font-medium">{fortune?.luckyDirection}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pb-1 border-b border-[#1f1f23]">
                    <span className="text-[#71717a]">能量時段</span>
                    <span className="text-white font-mono">{fortune?.luckyTime}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#71717a]">守護御石</span>
                    <span className="text-white font-medium flex items-center gap-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-[#c5a47e]" />
                      {fortune?.luckyGem}
                    </span>
                  </div>
                </div>
              </div>

              {/* 🌟 運勢能量排行榜 (Astra Rankings) */}
              <div className="bg-[#0d0d12] border border-[#1f1f23] rounded-sm p-5 shadow-2xl relative overflow-hidden animate-fade-in">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#c5a47e]/5 rounded-bl-full pointer-events-none" />
                
                <div className="flex justify-between items-center mb-4 border-b border-[#1f1f23] pb-2">
                  <h3 className="text-xs text-[#c5a47e] font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <Award className="w-4 h-4 shrink-0 text-[#c5a47e]" />
                    星曜能率排行榜
                  </h3>
                  
                  {/* 切換週期 */}
                  <div className="flex bg-[#050508] p-0.5 border border-[#1f1f23] rounded text-[9px] font-bold">
                    <button
                      type="button"
                      onClick={() => setRankingPeriod("day")}
                      className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${rankingPeriod === "day" ? "bg-[#c5a47e] text-[#050508]" : "text-[#71717a] hover:text-white"}`}
                    >
                      本日
                    </button>
                    <button
                      type="button"
                      onClick={() => setRankingPeriod("week")}
                      className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${rankingPeriod === "week" ? "bg-[#c5a47e] text-[#050508]" : "text-[#71717a] hover:text-white"}`}
                    >
                      本週
                    </button>
                    <button
                      type="button"
                      onClick={() => setRankingPeriod("month")}
                      className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${rankingPeriod === "month" ? "bg-[#c5a47e] text-[#050508]" : "text-[#71717a] hover:text-white"}`}
                    >
                      本月
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {astraRankings.map(({ constellation, score, blessing }, index) => {
                    const medals = ["🥇", "🥈", "🥉"];
                    const scoreColors = ["text-[#ffd700]", "text-stone-300", "text-amber-600"];
                    return (
                      <button
                        key={constellation.name}
                        type="button"
                        onClick={() => setSelectedSign(constellation)}
                        className="w-full flex items-center justify-between p-2 rounded-sm border border-[#1f1f23] bg-[#1a1a24]/30 hover:border-[#c5a47e]/30 hover:bg-[#1a1a24]/60 transition-all duration-300 cursor-pointer group text-left"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{medals[index]}</span>
                          <span className="text-lg font-mystic-serif text-[#c5a47e]">{constellation.symbol}</span>
                          <div>
                            <div className="text-xs font-bold text-white group-hover:text-[#c5a47e] transition-colors flex items-center gap-1">
                              {constellation.name}
                              <span className="text-[8px] px-1 py-0.1 bg-[#1f1f23] text-[#71717a] rounded-sm font-normal">
                                {constellation.element}
                              </span>
                            </div>
                            <div className="text-[9px] text-[#71717a] font-light truncate max-w-[130px] sm:max-w-[180px] lg:max-w-[100px] xl:max-w-[130px]">
                              {blessing}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-[11px] font-bold font-mono ${scoreColors[index]}`}>
                            {score}
                          </span>
                          <span className="text-[8px] text-[#8e8e93] block leading-none">能率</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 text-[9px] text-[#71717a] text-center italic">
                  🔮 點擊星座，直接切換觀測其專屬盤曜與走向
                </div>
              </div>

              {/* 本日星軌大吉速配 (速配前三名) */}
              <div className="bg-[#0d0d12] border border-[#1f1f23] rounded-sm p-5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#ffb900]/5 rounded-bl-full pointer-events-none" />
                <h3 className="text-xs text-[#c5a47e] font-bold uppercase tracking-widest mb-4 border-b border-[#1f1f23] pb-2 flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4 shrink-0 text-[#ffd700]" />
                  今日大吉契合星曜
                </h3>
                <div className="space-y-2.5">
                  {topThreeMatches.map(({ constellation, match }, index) => {
                    const rankIcons = ["🥇", "🥈", "🥉"];
                    const percentColors = ["text-[#ffd700]", "text-stone-300", "text-amber-600"];
                    return (
                      <button
                        key={constellation.name}
                        type="button"
                        onClick={() => setSelectedSign(constellation)}
                        className="w-full flex items-center justify-between p-2 rounded-sm border border-[#1f1f23] bg-[#1a1a24]/30 hover:border-[#c5a47e]/30 hover:bg-[#1a1a24]/60 transition-all duration-300 cursor-pointer group text-left"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs">{rankIcons[index]}</span>
                          <span className="text-lg font-mystic-serif text-[#c5a47e]">{constellation.symbol}</span>
                          <div>
                            <div className="text-xs font-bold text-white group-hover:text-[#c5a47e] transition-colors">
                              {constellation.name}
                            </div>
                            <div className="text-[9px] text-stone-500 font-mono">
                              {constellation.enName} • {constellation.element}象
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <span className={`text-xs font-bold font-mono ${percentColors[index]}`}>
                            {match.score}%
                          </span>
                          <span className="text-[9px] text-[#a1a1aa] truncate max-w-[80px]">
                            {match.title}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 text-[9px] text-[#71717a] text-center italic">
                  🔮 點擊星座卡片，可直接對焦切換視角
                </div>
              </div>

              {/* 宇宙叮嚀箴言 */}
              <div className="bg-[#15151e] p-4 rounded-sm text-center border-t-2 border-[#c5a47e] shadow-xl">
                <p className="text-[10px] text-[#c5a47e] uppercase tracking-[0.2em] font-bold mb-1.5 flex items-center justify-center gap-1">
                  ✦ 星靈叮嚀
                </p>
                <p className="text-[11px] text-[#a1a1aa] leading-relaxed italic">
                  「天體運轉不息，而你的信念是唯一的錨。只要不落盲動，繁星必在暗夜為期引路。」
                </p>
              </div>

            </div> {/* Closes Right Column */}
          </div> {/* Closes Grid container */}

          {/* 未來 7 天綜合運勢走勢圖 (Recharts) */}
          <div className="bg-[#0d0d12] border border-[#1f1f23] rounded-sm p-5 md:p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a47e]/5 rounded-bl-full pointer-events-none" />
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-[#1f1f23] pb-4">
                <div>
                  <h3 className="text-sm md:text-base text-[#c5a47e] font-mystic-serif font-bold tracking-widest flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#c5a47e]" />
                    {selectedSign.name} • 未來 7 天命運能量軌域走勢
                  </h3>
                  <p className="text-xs text-[#71717a] mt-1">
                    動態對接星曜宿命引力，觀察各能率屬性之交錯演化，助您預先調校個人頻率。
                  </p>
                </div>
                
                {/* 能量偏好開關 */}
                <div className="flex flex-wrap gap-1 bg-[#050508] p-1 border border-[#1f1f23] rounded">
                  <button
                    type="button"
                    onClick={() => setChartFocus("overall")}
                    className={`px-3 py-1.5 text-[11px] font-bold tracking-wider rounded transition-all cursor-pointer ${
                      chartFocus === "overall"
                        ? "bg-[#c5a47e] text-[#050508] font-extrabold"
                        : "text-[#71717a] hover:text-white"
                    }`}
                  >
                    綜合能量
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartFocus("love")}
                    className={`px-3 py-1.5 text-[11px] font-bold tracking-wider rounded transition-all cursor-pointer ${
                      chartFocus === "love"
                        ? "bg-red-500/20 text-red-400 border border-red-500/30 font-extrabold"
                        : "text-[#71717a] hover:text-[#ef4444]"
                    }`}
                  >
                    情感緣分
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartFocus("career")}
                    className={`px-3 py-1.5 text-[11px] font-bold tracking-wider rounded transition-all cursor-pointer ${
                      chartFocus === "career"
                        ? "bg-teal-500/20 text-teal-400 border border-teal-500/30 font-extrabold"
                        : "text-[#71717a] hover:text-[#14b8a6]"
                    }`}
                  >
                    事業創造
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartFocus("wealth")}
                    className={`px-3 py-1.5 text-[11px] font-bold tracking-wider rounded transition-all cursor-pointer ${
                      chartFocus === "wealth"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 font-extrabold"
                        : "text-[#71717a] hover:text-[#f59e0b]"
                    }`}
                  >
                    物質豐饒
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartFocus("all")}
                    className={`px-3 py-1.5 text-[11px] font-bold tracking-wider rounded transition-all cursor-pointer ${
                      chartFocus === "all"
                        ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-extrabold"
                        : "text-[#71717a] hover:text-indigo-400"
                    }`}
                  >
                    星曜全覽
                  </button>
                </div>
              </div>

              {/* 圖表渲染 */}
              <div className="h-64 md:h-80 w-full mt-2 font-mono text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={sevenDayTrendData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorOverall" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#c5a47e" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#c5a47e" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="colorLove" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="colorCareer" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="colorWealth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" vertical={false} />
                    
                    <XAxis 
                      dataKey="date" 
                      stroke="#4b5563" 
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: "#1f1f23" }}
                    />
                    
                    <YAxis 
                      stroke="#4b5563" 
                      fontSize={10}
                      domain={[0, 100]}
                      tickCount={6}
                      tickLine={false}
                      axisLine={false}
                      unit="%"
                    />
                    
                    <Tooltip content={<CustomTooltip />} />
                    
                    <Legend 
                      verticalAlign="top" 
                      height={36} 
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: 11, paddingBottom: 15 }}
                    />

                    {(chartFocus === "overall" || chartFocus === "all") && (
                      <Area
                        type="monotone"
                        name="綜合運勢"
                        dataKey="綜合運勢"
                        stroke="#c5a47e"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorOverall)"
                        activeDot={{ r: 6, stroke: '#0d0d12', strokeWidth: 2 }}
                        dot={{ r: 3, strokeWidth: 1 }}
                      />
                    )}

                    {(chartFocus === "love" || chartFocus === "all") && (
                      <Area
                        type="monotone"
                        name="感情運勢"
                        dataKey="感情運勢"
                        stroke="#ef4444"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorLove)"
                        activeDot={{ r: 5, stroke: '#0d0d12', strokeWidth: 2 }}
                        dot={{ r: 3, strokeWidth: 1 }}
                      />
                    )}

                    {(chartFocus === "career" || chartFocus === "all") && (
                      <Area
                        type="monotone"
                        name="事業運勢"
                        dataKey="事業運勢"
                        stroke="#14b8a6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorCareer)"
                        activeDot={{ r: 5, stroke: '#0d0d12', strokeWidth: 2 }}
                        dot={{ r: 3, strokeWidth: 1 }}
                      />
                    )}

                    {(chartFocus === "wealth" || chartFocus === "all") && (
                      <Area
                        type="monotone"
                        name="財富運勢"
                        dataKey="財富運勢"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorWealth)"
                        activeDot={{ r: 5, stroke: '#0d0d12', strokeWidth: 2 }}
                        dot={{ r: 3, strokeWidth: 1 }}
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* 下方細節說明 */}
              <div className="mt-4 pt-4 border-t border-[#1f1f23] flex flex-col md:flex-row justify-between items-start md:items-center gap-2 text-xs text-[#a1a1aa] leading-relaxed">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>星位解鎖百分比即代表當日能量飽和度（百分比越高，代表該專屬領域的能量越為豐沛吉曜）。</span>
                </div>
                <div className="text-[#c5a47e] text-[11px] font-semibold italic">
                  🔮 點擊或滑動至特定日期星軌，即可透視該日的幸運色、幸運石、與幸運密鑰能率數！
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 內容 2 : 雙星默契配對 */}
        {activeTab === "match" && (
          <div className="max-w-4xl mx-auto fade-slide-in">
            <div className="text-center mb-8">
              <h2 className="text-[#c5a47e] font-mystic-serif text-2xl md:text-3xl tracking-widest uppercase">
                雙星軌跡和諧度
              </h2>
              <p className="text-xs text-[#71717a] mt-1 tracking-wider uppercase">
                Dual Stars Synergy & Compatibility Search
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* 靈魂 A 選擇 */}
              <div className="bg-[#0d0d12] border border-[#1f1f23] rounded-sm p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs text-[#c5a47e] font-bold tracking-wider uppercase mb-4 border-b border-[#1f1f23] pb-2">
                    <User className="w-3.5 h-3.5 text-red-400" />
                    主觀點：靈魂 A
                  </div>
                  <label className="block text-xs text-[#71717a] mb-2 uppercase tracking-wide">選擇星座</label>
                  <select
                    value={matchSignA}
                    onChange={(e) => setMatchSignA(e.target.value)}
                    className="w-full bg-[#050508] border border-[#1f1f23] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#c5a47e]"
                  >
                    {CONSTELLATIONS.map(c => (
                      <option key={c.name} value={c.name} className="bg-[#0d0d12] text-white">
                        {c.symbol} {c.name} ({c.dateRange})
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* 星座特徵預覽 */}
                {(() => {
                  const s = CONSTELLATIONS.find(c => c.name === matchSignA);
                  return s ? (
                    <div className="mt-5 p-3.5 bg-[#14141d]/50 rounded border border-[#1f1f23] text-center">
                      <div className="text-4xl text-[#c5a47e] mb-1 font-serif">{s.symbol}</div>
                      <p className="font-mystic-serif text-white font-semibold text-sm">{s.name} ({s.element}象)</p>
                      <p className="text-[10px] text-[#71717a] mt-1">「{s.motto.replace(/[「」]/g, "")}」</p>
                    </div>
                  ) : null;
                })()}
              </div>

              {/* 靈魂 B 選擇 */}
              <div className="bg-[#0d0d12] border border-[#1f1f23] rounded-sm p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs text-[#c5a47e] font-bold tracking-wider uppercase mb-4 border-b border-[#1f1f23] pb-2">
                    <User className="w-3.5 h-3.5 text-[#818cf8]" />
                    配對方：靈魂 B
                  </div>
                  <label className="block text-xs text-[#71717a] mb-2 uppercase tracking-wide">選擇星座</label>
                  <select
                    value={matchSignB}
                    onChange={(e) => setMatchSignB(e.target.value)}
                    className="w-full bg-[#050508] border border-[#1f1f23] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#c5a47e]"
                  >
                    {CONSTELLATIONS.map(c => (
                      <option key={c.name} value={c.name} className="bg-[#0d0d12] text-white">
                        {c.symbol} {c.name} ({c.dateRange})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 星座特徵預覽 */}
                {(() => {
                  const s = CONSTELLATIONS.find(c => c.name === matchSignB);
                  return s ? (
                    <div className="mt-5 p-3.5 bg-[#14141d]/50 rounded border border-[#1f1f23] text-center">
                      <div className="text-4xl text-[#c5a47e] mb-1 font-serif">{s.symbol}</div>
                      <p className="font-mystic-serif text-white font-semibold text-sm">{s.name} ({s.element}象)</p>
                      <p className="text-[10px] text-[#71717a] mt-1">「{s.motto.replace(/[「」]/g, "")}」</p>
                    </div>
                  ) : null;
                })()}
              </div>
            </div>

            {/* 配對運算結果卡 */}
            {matchResult && (
              <div className="bg-[#0d0d12] border border-[#1f1f23] rounded-sm p-6 md:p-8 shadow-2xl relative overflow-hidden text-center">
                {/* 邊邊角裝飾線 */}
                <div className="absolute top-0 left-0 w-32 h-1 bg-[#c5a47e] glow-gold" />
                
                <div className="inline-flex items-center justify-center p-4 bg-[#c5a47e]/5 border border-[#c5a47e]/25 rounded-full mb-4">
                  <div className="text-center">
                    <p className="text-[11px] text-[#c5a47e] uppercase tracking-[0.25em] font-semibold">
                      和諧契合指數
                    </p>
                    <p className="text-4xl md:text-5xl font-extrabold text-white mt-1 font-mono tracking-tight drop-shadow-[0_0_12px_rgba(197,164,126,0.3)]">
                      {matchResult.score}%
                    </p>
                  </div>
                </div>

                <div className="max-w-2xl mx-auto space-y-6">
                  <div>
                    <h3 className="text-[#c5a47e] font-mystic-serif text-xl font-bold tracking-wider flex items-center justify-center gap-1.5">
                      {matchResult.title}
                    </h3>
                    <p className="text-xs md:text-sm text-[#d4d4d8] leading-relaxed max-w-lg mx-auto mt-2">
                      {matchResult.brief}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left pt-4 border-t border-[#1f1f23]/60">
                    <div className="bg-[#15151e]/60 p-4 rounded border border-[#1f1f23] relative">
                      <span className="absolute top-2 right-3 text-[9px] bg-emerald-950/50 text-emerald-400 border border-emerald-800/40 px-1.5 py-0.5 rounded uppercase">
                        和諧優勢
                      </span>
                      <h4 className="text-xs text-white uppercase font-bold tracking-wider mb-2 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        魂魄共振契合
                      </h4>
                      <p className="text-xs text-[#a1a1aa] leading-relaxed">
                        {matchResult.harmony}
                      </p>
                    </div>
                    
                    <div className="bg-[#15151e]/60 p-4 rounded border border-[#1f1f23] relative">
                      <span className="absolute top-2 right-3 text-[9px] bg-amber-950/50 text-amber-500 border border-amber-800/40 px-1.5 py-0.5 rounded uppercase">
                        引力磨合
                      </span>
                      <h4 className="text-xs text-white uppercase font-bold tracking-wider mb-2 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                        潛在摩擦考驗
                      </h4>
                      <p className="text-xs text-[#a1a1aa] leading-relaxed">
                        {matchResult.friction}
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#1b1b24]/40 p-4 rounded-sm border border-[#c5a47e]/15 italic max-w-xl mx-auto text-center mt-4">
                    <p className="text-[10px] text-[#c5a47e] uppercase tracking-[0.2em] font-bold mb-1">
                      ✦ 星海共築對策 / 神聖建議
                    </p>
                    <p className="text-[11.5px] text-[#d4d4d8] leading-relaxed">
                      「{matchResult.tip}」
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 內容 3 : AI 星盤神諭占卜 */}
        {activeTab === "divine" && (
          <div className="max-w-4xl mx-auto fade-slide-in">
            <div className="text-center mb-8">
              <h2 className="text-[#c5a47e] font-mystic-serif text-2xl md:text-3xl tracking-widest uppercase">
                奧秘星軌 AI 靈魂諮商
              </h2>
              <p className="text-xs text-[#71717a] mt-1 tracking-wider uppercase">
                AI Astrological Celestial Reading & Divine Channeling
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
              
              {/* 左側：求問資訊 input 區 */}
              <div className="lg:col-span-5 bg-[#0d0d12] border border-[#1f1f23] rounded-sm p-6 shadow-xl h-fit">
                <form onSubmit={handleDivine} className="space-y-4">
                  <div className="flex items-center gap-2 text-xs text-[#c5a47e] font-bold tracking-wider uppercase mb-4 border-b border-[#1f1f23] pb-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#c5a47e]" />
                    點亮占星之火：基本投射
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#71717a] uppercase mb-1.5 tracking-wider font-semibold">您當前選擇的主星座</label>
                    <div className="p-2.5 bg-[#050508] border border-[#1f1f23] rounded flex justify-between items-center">
                      <span className="text-sm font-semibold text-white flex items-center gap-2">
                        <span className="text-lg text-[#c5a47e]">{selectedSign.symbol}</span>
                        {selectedSign.name}
                      </span>
                      <button 
                        type="button"
                        onClick={() => setActiveTab("insight")}
                        className="text-[10px] text-[#c5a47e] bg-[#c5a47e]/10 border border-[#c5a47e]/20 px-2 py-0.5 rounded hover:bg-[#c5a47e]/20 transition-all font-semibold"
                      >
                        切換星座
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-[#71717a] uppercase mb-1.5 tracking-wider font-semibold">靈魂姓名 / 稱呼</label>
                      <input
                        type="text"
                        placeholder="例：伊莉莎白"
                        className="w-full bg-[#050508] border border-[#1f1f23] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c5a47e]"
                        value={aiName}
                        onChange={(e) => setAiName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#71717a] uppercase mb-1.5 tracking-wider font-semibold">世俗生理性別</label>
                      <select
                        className="w-full bg-[#050508] border border-[#1f1f23] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c5a47e]"
                        value={aiGender}
                        onChange={(e) => setAiGender(e.target.value)}
                      >
                        <option value="神秘性靈">神秘性靈</option>
                        <option value="陽剛/男性">陽剛/男性</option>
                        <option value="陰柔/女性">陰柔/女性</option>
                        <option value="未透露">不願被物質性別定義</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-[#71717a] uppercase mb-1.5 tracking-wider font-semibold">陽曆出生日期</label>
                      <input
                        type="date"
                        className="w-full bg-[#050508] border border-[#1f1f23] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c5a47e] text-center"
                        value={aiBirthdate}
                        onChange={(e) => setAiBirthdate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#71717a] uppercase mb-1.5 tracking-wider font-semibold">對焦出生時間 (可選)</label>
                      <input
                        type="time"
                        className="w-full bg-[#050508] border border-[#1f1f23] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c5a47e] text-center"
                        value={aiBirthtime}
                        onChange={(e) => setAiBirthtime(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#71717a] uppercase mb-1.5 tracking-wider font-semibold">專注提問領域 (Vibe Focus)</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["綜合運勢", "愛情", "事業", "學業", "財運"].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setAiCategory(cat as any)}
                          className={`py-1.5 px-2 text-[11px] rounded transition-all font-semibold ${
                            aiCategory === cat
                              ? "bg-[#c5a47e]/15 border border-[#c5a47e] text-[#c5a47e]"
                              : "bg-[#050508] border border-[#1f1f23] text-[#71717a] hover:text-white hover:border-[#71717a]/50"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#71717a] uppercase mb-1.5 tracking-wider font-semibold">對接 AI 靈魂星軌</label>
                    <div className="flex gap-2">
                      {(["gemini", "nvidia"] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setAiProvider(p)}
                          className={`flex-1 py-2 text-[10px] rounded border transition-all font-bold uppercase ${
                            aiProvider === p ? "border-[#c5a47e] text-[#c5a47e] bg-[#c5a47e]/10" : "border-[#1f1f23] text-[#71717a]"
                          }`}
                        >
                          {p === "gemini" ? "Google Gemini" : "NVIDIA Llama"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#71717a] uppercase mb-1.5 tracking-wider font-semibold">向天體求問的具體疑惑 (3-120字)</label>
                    <textarea
                      placeholder="例如：「我目前剛換新工作遇到瓶頸，同事間有些隔闔，想知道近三個月的事業天體能量與化解建議...」"
                      rows={3}
                      className="w-full bg-[#050508] border border-[#1f1f23] rounded p-3 text-xs text-white focus:outline-none focus:border-[#c5a47e] placeholder-[#52525b] resize-none"
                      value={aiQuestion}
                      onChange={(e) => setAiQuestion(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isDivining}
                    className="w-full bg-gradient-to-r from-[#ffd700] via-[#ffb900] to-[#ff8c00] text-[#050508] hover:brightness-110 font-mystic-serif font-black tracking-widest text-[13px] py-4 rounded-sm uppercase transition-all duration-300 shadow-[0_0_25px_rgba(255,215,0,0.55)] hover:shadow-[0_0_35px_rgba(255,185,0,0.85)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer font-extrabold border border-[#ffe44d] animate-pulse"
                  >
                    <Send className="w-4 h-4 text-[#050508] shrink-0" />
                    {isDivining ? "正在對接天界星軌中..." : "🔮 啟動星軌占卜 • 傾聽神諭 🔮"}
                  </button>
                </form>
              </div>

              {/* 右側：占卜結果 / 水晶球占卜動畫展示區 */}
              <div className="lg:col-span-7 bg-[#0d0d12]/95 border border-[#1f1f23] rounded-sm p-6 shadow-2xl relative flex flex-col justify-between min-h-[500px]">
                
                {/* 占卜等待狀態 */}
                {isDivining && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 z-10">
                    {/* 精美的旋轉太極與多層星盤 */}
                    <div className="w-32 h-32 relative flex items-center justify-center mb-6">
                      <div className="absolute inset-x-0 inset-y-0 border-2 border-dashed border-[#c5a47e]/40 rounded-full animate-slow-rotate" />
                      <div className="absolute inset-4 border border-indigo-400/40 rounded-full animate-slow-rotate-reverse" />
                      <div className="absolute inset-8 border border-sky-400/20 rounded-full animate-slow-rotate" />
                      <div className="absolute w-12 h-12 rounded-full bg-gradient-to-tr from-[#c5a47e]/40 to-indigo-500/30 filter blur-sm animate-pulse" />
                      <Sparkles className="w-6 h-6 text-[#c5a47e] absolute animate-ping" />
                    </div>
                    
                    <p className="text-[#c5a47e] font-mystic-serif text-base tracking-widest font-semibold mb-2 animate-pulse">
                      神諭調律中
                    </p>
                    <p className="text-xs text-[#a1a1aa] leading-relaxed max-w-sm">
                      {mysticStep}
                    </p>
                  </div>
                )}

                {/* 初始無動作 & 無結果狀態 */}
                {!isDivining && !divineResult && !errorMsg && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-75">
                    <div className="w-24 h-24 border border-[#1f1f23] rounded-full flex items-center justify-center mb-6 bg-[#050508]/60 relative">
                      <div className="absolute inset-2 border border-dashed border-[#c5a47e]/15 rounded-full animate-slow-rotate" />
                      <Moon className="w-8 h-8 text-[#c5a47e]/60" />
                    </div>
                    <h3 className="text-sm font-mystic-serif text-white tracking-widest mb-1.5 font-bold">
                      星宿之鏡靜待點亮
                    </h3>
                    <p className="text-xs text-[#71717a] max-w-sm leading-relaxed">
                      請在左側面板填妥稱呼、時間或特定疑惑，隨後點選「啟動星軌占卜」。「奧秘星域主宰」將透過雙曜宮位調研，解譯屬於您的天啟預言。
                    </p>
                  </div>
                )}

                {/* API 錯誤提示區 */}
                {!isDivining && errorMsg && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-full text-red-400 mb-4 animate-bounce">
                      <AlertCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-sm font-mystic-serif text-red-400 font-bold mb-2">天啟通訊失調</h3>
                    <p className="text-xs text-[#a1a1aa] max-w-md leading-relaxed whitespace-pre-line bg-[#050508]/50 p-4 border border-[#1f1f23] rounded">
                      {errorMsg}
                    </p>
                    
                    <p className="text-[10px] text-amber-500/70 mt-4 leading-normal max-w-xs">
                      提示：請在專案根目錄的 <code className="bg-[#1f1f23] px-1 rounded">.env.local</code> 填入有效的 GEMINI_API_KEY 或 NVIDIA_API_KEY，並重新啟動 <code className="bg-[#1f1f23] px-1 rounded">npm run dev</code>。
                    </p>
                  </div>
                )}

                {/* 占卜大師解讀結果展示 */}
                {!isDivining && divineResult && (
                  <div className="flex-1 flex flex-col z-10">
                    <div className="border-b border-[#1f1f23] pb-3 mb-4 flex justify-between items-center bg-[#0d0d12]/50">
                      <div>
                        <span className="text-[10px] bg-[#c5a47e]/15 text-[#c5a47e] border border-[#c5a47e]/20 px-2.5 py-0.5 rounded uppercase font-semibold">
                          星雲解譯完成
                        </span>
                        <h4 className="text-[11px] text-[#71717a] mt-1.5">
                          占卜大師 奧秘星域主宰 • 留下的手札開示
                        </h4>
                      </div>
                      <button
                        onClick={handleCopy}
                        className="p-1.5 hover:bg-[#1f1f23] rounded text-[#71717a] hover:text-white transition-all text-xs flex items-center gap-1 border border-transparent hover:border-[#1f1f23]"
                        title={copySuccess ? "複製成功" : "複製星盤內容"}
                      >
                        {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span className="text-[10px]">{copySuccess ? "已複製" : "複製開示"}</span>
                      </button>
                    </div>

                    {/* 滾動內容面板 */}
                    <div className="flex-1 overflow-y-auto pr-1 max-h-[460px] text-justify markdown-content scrollbar-thin">
                      {renderFormattedResult(divineResult)}
                    </div>
                  </div>
                )}

                {/* 底部神聖印章與聲明 */}
                {divineResult && (
                  <div className="mt-6 pt-4 border-t border-[#1f1f23]/60 flex flex-col sm:flex-row justify-between items-center gap-2">
                    <p className="text-[9px] text-[#52525b] italic">
                      「命運非固定之實體，星盤係靈魂之投影。星座內容與解析僅供參考，無法作為決策之全部依據，相關內容請謹慎參酌。」
                    </p>
                    <div className="flex items-center gap-1.5 text-[9px] text-[#c5a47e] tracking-widest uppercase font-semibold bg-[#c5a47e]/5 px-2 py-0.5 border border-[#c5a47e]/15 rounded-sm">
                      <Award className="w-3 h-3 text-[#c5a47e]" />
                      奧秘星域印記 (Astra Oracle Certified)
                    </div>
                  </div>
                )}
                
              </div>

            </div>

          </div>
        )}

      </div>

      {/* 網頁頁腳 */}
      <footer className="mt-auto border-t border-[#1f1f23] bg-[#030305]/95 py-6 text-center z-10 w-full">
        <div className="max-w-7xl mx-auto px-4 text-[10px] text-[#52525b] tracking-wider space-y-2">
          <p>© 2026 奧秘星域 Astra Region • 匠心雕琢之西方古典天體占星術</p>
          <p className="max-w-md mx-auto leading-normal">
            本應用完美契合「Elegant Dark」之古雅炭黑與金芒風格。結合 Gemini 智慧星腦，為您編制當下星空引力之合聲。本站不收集您的出生數據，亦請理性詮釋星宿玄妙之語。
          </p>
          <p className="max-w-xl mx-auto text-[#a1a1aa]/60 text-[9px] mt-2 border-t border-[#1f1f23]/40 pt-2 leading-relaxed">
            ※ 占星提醒：星座之內容僅供參考，無法作為全部判斷依據，相關內容請謹慎參酌。
          </p>
        </div>
      </footer>

      {/* 🔮 每日星運提醒懸浮元件 (Astra Daily Alert Floating Widget) */}
      {isAlertOpen ? (
        <div className="fixed bottom-6 right-6 z-50 w-[310px] bg-[#09090d]/95 border border-[#c5a47e]/60 rounded-sm shadow-[0_8px_32px_rgba(0,0,0,0.85),0_0_25px_rgba(197,164,126,0.3)] p-4.5 backdrop-blur-md animate-fade-in flex flex-col gap-3 text-left">
          {/* 星砂粒子金色背景飾條 */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#c5a47e]/5 rounded-bl-full pointer-events-none" />
          
          {/* 抬頭與關閉按鈕 */}
          <div className="flex justify-between items-center border-b border-[#1f1f23] pb-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[#ffd700] text-sm animate-pulse">✨</span>
              <h4 className="text-xs font-mystic-serif font-black tracking-widest text-[#c5a47e] uppercase">
                當日星輝關鍵啟示
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setIsAlertOpen(false)}
              className="text-stone-500 hover:text-white transition-colors p-1 rounded-full hover:bg-stone-800/40 cursor-pointer"
              title="收合視窗"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 星座簡述與能率星等 */}
          <div className="flex items-center gap-3.5 bg-[#111119]/75 p-2 px-2.5 border border-[#1f1f23]/80 rounded-sm">
            <span className="text-3.5xl font-mystic-serif text-[#ffd700] leading-none select-none">
              {selectedSign.symbol}
            </span>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                {selectedSign.name}
                <span className="text-[9px] text-[#71717a] font-normal font-mono">
                  ({selectedSign.dateRange})
                </span>
              </div>
              
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[9px] text-stone-500 font-bold uppercase tracking-wider">整體能率：</span>
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={`w-3 h-3 ${idx < (fortune?.overall ?? 3) ? "text-[#ffd700] fill-[#ffd700] drop-shadow-[0_0_3px_rgba(255,215,0,0.5)]" : "text-stone-700 fill-stone-800"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 今日亮點金句 (Summary) */}
          <div className="text-[11.5px] text-[#e4e4e7] leading-relaxed italic bg-[#050508]/80 p-3 rounded border border-[#1a1a24] text-justify relative">
            🔮 「{fortune?.summary || "群星正在調律其引力磁場，今日必有玄妙指派..."}」
          </div>

          {/* 幸運密碼與星曜秘語 */}
          <div className="grid grid-cols-2 gap-2 text-[10px] text-stone-400 font-mono">
            <div className="flex items-center gap-1 bg-[#15151e]/60 p-1.5 border border-[#1f1f23]/40 rounded-sm">
              <span className="text-[#c5a47e] font-bold">🎨 幸運色:</span> 
              <span className="text-white font-semibold truncate">{fortune?.luckyColor || "金色"}</span>
            </div>
            <div className="flex items-center gap-1 bg-[#15151e]/60 p-1.5 border border-[#1f1f23]/40 rounded-sm">
              <span className="text-[#c5a47e] font-bold">💎 水晶石:</span> 
              <span className="text-white font-semibold truncate">{fortune?.luckyGem || "黃水晶"}</span>
            </div>
          </div>

          {/* 立即查看跳轉按鈕 */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("insight");
              setIsAlertOpen(false);
              // 平滑滾動至網頁頂部（星座運勢區）
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="w-full text-center py-2 px-3 text-xs bg-gradient-to-r from-[#ffd700] via-[#ffb900] to-[#ff8c00] text-[#050508] font-black rounded uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all font-mystic-serif flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-[#ffd700]/10 border border-[#ffe44d]"
          >
            <Sparkles className="w-3.5 h-3.5 text-black shrink-0" />
            立即查看星曜特寫
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsAlertOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-4 bg-[#0d0d12]/95 hover:bg-[#1a1a24] border border-[#c5a47e]/60 hover:border-[#c5a47e] text-[#c5a47e] hover:text-[#ffd700] rounded-full shadow-[0_4px_24px_rgba(197,164,126,0.35)] hover:shadow-[0_4px_30px_rgba(255,215,0,0.55)] transition-all duration-300 group flex items-center justify-center cursor-pointer"
          title="開展今日星運提醒"
        >
          {/* 小提示紅點呼吸燈 */}
          <span className="absolute top-0.5 right-0.5 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ffd700] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#ffd700] border border-black shadow"></span>
          </span>
          <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        </button>
      )}
    </div>
  );
}
