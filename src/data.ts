import { Constellation, FortuneResult, MatchResult } from "./types";

export const CONSTELLATIONS: Constellation[] = [
  {
    name: "牡羊座",
    enName: "Aries",
    symbol: "♈",
    dateRange: "3/21 - 4/19",
    element: "火",
    planet: "火星",
    motto: "「只要我想，沒有什麼能阻擋我全速前進的腳步。」",
    strengths: ["熱情直率", "勇往直前", "具領導魄力", "樂觀慷慨"],
    weaknesses: ["容易衝動", "缺乏耐心", "過度自我", "有時暴躁"],
    color: "火紅色",
    accentClass: "border-red-500/50 bg-red-950/20 text-red-400 hover:border-red-400",
    glowingClass: "shadow-[0_0_15px_rgba(239,68,68,0.2)]"
  },
  {
    name: "金牛座",
    enName: "Taurus",
    symbol: "♉",
    dateRange: "4/20 - 5/20",
    element: "土",
    planet: "金星",
    motto: "「美好的事物值得等待，耐力是通往卓越的必經之路。」",
    strengths: ["沉穩踏實", "極具耐心", "審美天賦高", "忠誠可靠"],
    weaknesses: ["固執己見", "害怕變動", "佔有慾強", "偶爾怠惰"],
    color: "翡翠綠",
    accentClass: "border-emerald-500/50 bg-emerald-950/20 text-emerald-400 hover:border-emerald-400",
    glowingClass: "shadow-[0_0_15px_rgba(16,185,129,0.2)]"
  },
  {
    name: "雙子座",
    enName: "雙子座",
    symbol: "♊",
    dateRange: "5/21 - 6/21",
    element: "風",
    planet: "水星",
    motto: "「生活是一場盛大的探索，永遠保持對萬物的好奇心。」",
    strengths: ["機智靈巧", "口才絕佳", "適應力強", "風趣幽默"],
    weaknesses: ["缺乏專注", "情緒多變", "有些浮躁", "流於表面"],
    color: "亮黃色",
    accentClass: "border-amber-500/50 bg-amber-950/20 text-amber-400 hover:border-amber-400",
    glowingClass: "shadow-[0_0_15px_rgba(245,158,11,0.2)]"
  },
  {
    name: "巨蟹座",
    enName: "Cancer",
    symbol: "♋",
    dateRange: "6/22 - 7/22",
    element: "水",
    planet: "月亮",
    motto: "「溫柔有著撫慰世間的力量，守護所愛是我一生的執著。」",
    strengths: ["充滿同理", "溫柔顧家", "直覺敏銳", "重情重義"],
    weaknesses: ["多愁善感", "防衛心重", "容易糾結", "逃避現實"],
    color: "銀白色",
    accentClass: "border-sky-500/50 bg-sky-950/20 text-sky-400 hover:border-sky-400",
    glowingClass: "shadow-[0_0_15px_rgba(14,165,233,0.2)]"
  },
  {
    name: "獅子座",
    enName: "Leo",
    symbol: "♌",
    dateRange: "7/23 - 8/22",
    element: "火",
    planet: "太陽",
    motto: "「活得坦蕩、愛得淋漓，在生命的主舞台綻放最耀眼的光芒。」",
    strengths: ["慷慨大方", "自信陽光", "極重承諾", "義氣十足"],
    weaknesses: ["愛慕虛榮", "唯我獨尊", "自尊心過強", "難接忠告"],
    color: "琥珀金",
    accentClass: "border-orange-500/50 bg-orange-950/20 text-orange-400 hover:border-orange-400",
    glowingClass: "shadow-[0_0_15px_rgba(249,115,22,0.2)]"
  },
  {
    name: "處女座",
    enName: "Virgo",
    symbol: "♍",
    dateRange: "8/23 - 9/22",
    element: "土",
    planet: "水星",
    motto: "「細節凝聚完美，每一次打磨都是對靈魂的極致淬鍊。」",
    strengths: ["細心嚴謹", "條理分明", "求知若渴", "謙虛負責"],
    weaknesses: ["愛挑剔碎唸", "容易焦慮", "過度計較", "不善放鬆"],
    color: "澄粉或米白",
    accentClass: "border-stone-400/50 bg-stone-900/40 text-stone-300 hover:border-stone-300",
    glowingClass: "shadow-[0_0_15px_rgba(168,162,158,0.2)]"
  },
  {
    name: "天秤座",
    enName: "Libra",
    symbol: "♎",
    dateRange: "9/23 - 10/23",
    element: "風",
    planet: "金星",
    motto: "「美與和諧是生命的終極追求，在優雅中尋找天平的平衡點。」",
    strengths: ["舉止優雅", "善於社交", "追求公正", "美感非凡"],
    weaknesses: ["優柔寡斷", "迎合他人", "害怕孤獨", "好爭辯客氣"],
    color: "粉藍色",
    accentClass: "border-indigo-400/50 bg-indigo-950/20 text-indigo-400 hover:border-indigo-300",
    glowingClass: "shadow-[0_0_15px_rgba(129,140,248,0.2)]"
  },
  {
    name: "天蠍座",
    enName: "Scorpio",
    symbol: "♏",
    dateRange: "10/24 - 11/22",
    element: "水",
    planet: "冥王星",
    motto: "「不經徹底涅槃，怎懂靈魂最澎湃、最真摯的純度？」",
    strengths: ["意志深沉", "極具神祕感", "敢愛敢恨", "洞察入微"],
    weaknesses: ["疑心病重", "好勝復仇", "情感極端", "佔有欲強"],
    color: "神祕紫",
    accentClass: "border-purple-500/50 bg-purple-950/20 text-purple-400 hover:border-purple-400",
    glowingClass: "shadow-[0_0_15px_rgba(168,85,247,0.2)]"
  },
  {
    name: "射手座",
    enName: "Sagittarius",
    symbol: "♐",
    dateRange: "11/23 - 12/21",
    element: "火",
    planet: "木星",
    motto: "「身體在跋涉，靈魂在朝聖，永遠嚮往地平線外的崇高自由。」",
    strengths: ["樂觀開朗", "熱愛自由", "胸襟寬廣", "哲思敏銳"],
    weaknesses: ["粗心大意", "心直口快", "缺乏耐心", "好高騖遠"],
    color: "青晶藍",
    accentClass: "border-cyan-500/50 bg-cyan-950/20 text-cyan-400 hover:border-cyan-400",
    glowingClass: "shadow-[0_0_15px_rgba(6,182,212,0.2)]"
  },
  {
    name: "摩羯座",
    enName: "Capricorn",
    symbol: "♑",
    dateRange: "12/22 - 1/19",
    element: "土",
    planet: "土星",
    motto: "「唯有腳踏實地，才能在歲月長河中築起無可搖撼的帝國。」",
    strengths: ["穩健剛毅", "極具野心", "紀律嚴明", "大器晚成"],
    weaknesses: ["嚴肅古板", "壓抑沉重", "有些現實", "容易悲觀"],
    color: "岩深灰",
    accentClass: "border-teal-600/50 bg-teal-950/20 text-teal-400 hover:border-teal-400",
    glowingClass: "shadow-[0_0_15px_rgba(13,148,136,0.2)]"
  },
  {
    name: "水瓶座",
    enName: "Aquarius",
    symbol: "♒",
    dateRange: "1/20 - 2/18",
    element: "風",
    planet: "天王星",
    motto: "「不做任何人的複製品，我是宇宙中獨一無二的奇異星體。」",
    strengths: ["思想前衛", "獨立特行", "樂於利他", "求知若渴"],
    weaknesses: ["特立獨行", "忽冷忽熱", "缺乏同情", "過度叛逆"],
    color: "極光藍",
    accentClass: "border-blue-400/50 bg-blue-950/20 text-blue-400 hover:border-blue-300",
    glowingClass: "shadow-[0_0_15px_rgba(59,130,246,0.2)]"
  },
  {
    name: "雙魚座",
    enName: "Pisces",
    symbol: "♓",
    dateRange: "2/19 - 3/20",
    element: "水",
    planet: "海王星",
    motto: "「大海包容一切流淌的情感，夢境是靈魂最真實的避風港。」",
    strengths: ["同理心強", "想像力非凡", "浪漫溫柔", "具有藝術天賦"],
    weaknesses: ["優柔寡斷", "意志薄弱", "容易受騙", "愛幻想逃避"],
    color: "海藍色",
    accentClass: "border-fuchsia-500/50 bg-fuchsia-950/20 text-fuchsia-400 hover:border-fuchsia-400",
    glowingClass: "shadow-[0_0_15px_rgba(217,70,239,0.2)]"
  }
];

// 透過種子（星座名字 + 日期）計算出一個偽隨機數，確保同一星座當天運勢不變，但天天在變
function getSeedRandom(seedStr: string): () => number {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function() {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

const LUCK_COLORS = ["粉月季色", "櫻桃紅", "松石綠", "薰衣草紫", "金盞花黃", "香檳金", "極光藍", "琥珀黑", "珍珠白", "珊瑚橙", "羅蘭紫", "焦糖色"];
const LUCK_DIRECTIONS = ["東南方", "正西方", "西北偏北", "正南方", "東北方", "西南偏南", "正東方", "正北方"];
const LUCK_GEMS = ["紫水晶", "拉長石", "青金石", "紅瑪瑙", "黑曜石", "橄欖石", "月光石", "黃水晶", "粉碧璽", "海藍寶", "白水晶", "綠幽靈"];

const FORTUNE_TEMP_POOL = {
  overall: [
    "今日星象呈現和諧的三合拱照相位，暗示你的身邊正悄然凝聚一股溫和而強大的貴人能量。凡事不急躁、按部就班，方能順流承接星光的禮讚。",
    "守護星今天與水星發生短暫親和，代表你的覺察敏銳度達到高峰。今天適合重新規劃那些已被擱置的一周代辦，思緒比平時更形專注。",
    "今日月亮進入了你的隱密宮位，你的第六感被強烈放大。在面對重要決擇時，不妨靜下心來傾聽直覺的呼喚，往往比纯理性分析更能一語中的。",
    "天相雖有些許浮動，但對你而言卻是一次打破僵局、釋放能量的絕佳機會。大膽推廣你的想法，群星正為你的創意點亮明燈。",
    "今日星軌交織著一股蓄勢待發的力量。或許步伐有些滯礙，但這其實是宇宙在提醒你要深呼吸、回歸本心，整理被雜音干擾的靈魂核心。"
  ],
  love: [
    "愛神金星將微光輕柔灑在你的情感宮位，單身者有機會在平常不常去的安靜咖啡廳或轉角遇見合拍的頻率；有伴侶者則能享受一次溫度的深度對談。",
    "感情宮位今天受水星的活潑灌注，互動上多了一點孩子般的俏皮與趣味。幽默感將會是修補任何小小誤解最棒的萬靈藥，大膽分享你的快樂吧。",
    "星流有些澎湃，情感上不要落入「過度預設立場」的怪圈。多聽聽伴侶的心聲，有時候不給建議的安靜陪伴，勝過千言萬語的說教。",
    "今日在交往關係裡適合作出溫馨的承諾，一些儀式感（例如共同烹飪一頓晚餐、寫張小卡片）能大幅拉近彼此的磁場深度。單身者也開始散發神祕的自信。",
    "群星正在引導你回歸自愛。不管是單身還是有伴，先溫柔照料自己敏感的內心，你的情感磁場自然會散發出溫和迷人的吸引力。"
  ],
  career: [
    "木星的慷慨餘暉微微照耀。在職場或學業上，以往的踏實累積今天將看見雛形。若是遇到新方案的提案，主動發言能幫你收穫大批支持。",
    "思維格外縝密，對繁複的報表、代碼或文字排版具有驚人的捕捉力。適合攻克那些最燒腦、最具難度的專業項目，效率相當高。",
    "天王星的創意震盪為你帶來新點子。別害怕不期而遇的計畫變更，這正是向團隊展現你驚人應變能力與獨特創意的奇蹟時刻。",
    "此時宜守不宜攻，適合退居幕後做策略性的全局重盤。不要急著跳入是非與風波，中立與旁觀的視角能幫你避開不必要的繁瑣鬥爭。",
    "如果感受到來自進度或主管的壓力，這是不斷微調精進的信號。放低姿態積極求教，前輩的一兩句點撥會讓你茅塞頓開、雲開月明。"
  ],
  wealth: [
    "財帛宮有溫和星芒閃爍。可能會有一筆意外的小額理財回報，或者一直渴望的某樣高單價物品今天剛好有不錯的入手時機，適合做小額累積。",
    "財氣藏而不露。今天在日常消費上特別理智，能精準挑出拿捏得當的性價比方案。對於投資研究，今日能保持極高的洞察與冷靜。",
    "星軌顯示今日宜留意「瑣碎的隱形支出」，例如外送、訂閱制或盲目跟風。在做財務決策前，默數十秒，理性能保住你的荷包儲蓄。",
    "偏財運悄然上揚。今天你的第六感極適用於尋找新穎、小眾的副業發想中。若有人與你探討長遠的合作項目，不妨抱著開放態度聊聊看。",
    "在金錢或資源調配上，今天需要多一點「流通性」概念。多看專業財經指引或看一本書，理財思路的拓寬將為你在下半月賺取更多回報。"
  ]
};

export function generateDailyFortune(signName: string, dateStr: string): FortuneResult {
  const seed = `${signName}-${dateStr}`;
  const rand = getSeedRandom(seed);

  // Calculate scores between 3 and 5 so the fortune is always decent but variable
  const overall = Math.floor(rand() * 3) + 3; // 3, 4, 5
  const love = Math.floor(rand() * 3) + 3;
  const career = Math.floor(rand() * 3) + 3;
  const wealth = Math.floor(rand() * 3) + 3;

  const luckyNumber = Math.floor(rand() * 10) + 1;
  const luckyColor = LUCK_COLORS[Math.floor(rand() * LUCK_COLORS.length)];
  const luckyDirection = LUCK_DIRECTIONS[Math.floor(rand() * LUCK_DIRECTIONS.length)];
  const luckyGem = LUCK_GEMS[Math.floor(rand() * LUCK_GEMS.length)];

  const startHour = Math.floor(rand() * 12) + 8; // 8:00 AM to 8:00 PM
  const luckyTime = `${startHour}:00 - ${startHour + 2}:00`;

  // Pick descriptions from the pool based on pseudo-random indexes
  const overallIndex = Math.floor(rand() * FORTUNE_TEMP_POOL.overall.length);
  const loveIndex = Math.floor(rand() * FORTUNE_TEMP_POOL.love.length);
  const careerIndex = Math.floor(rand() * FORTUNE_TEMP_POOL.career.length);
  const wealthIndex = Math.floor(rand() * FORTUNE_TEMP_POOL.wealth.length);

  return {
    overall,
    love,
    career,
    wealth,
    luckyNumber,
    luckyColor,
    luckyDirection,
    luckyTime,
    luckyGem,
    summary: FORTUNE_TEMP_POOL.overall[overallIndex],
    loveAdvice: FORTUNE_TEMP_POOL.love[loveIndex],
    careerAdvice: FORTUNE_TEMP_POOL.career[careerIndex],
    wealthAdvice: FORTUNE_TEMP_POOL.wealth[wealthIndex]
  };
}

export function getHoroscopeByBirthdate(month: number, day: number): string {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "牡羊座";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "金牛座";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) return "雙子座";
  if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) return "巨蟹座";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "獅子座";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "處女座";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 23)) return "天秤座";
  if ((month === 10 && day >= 24) || (month === 11 && day <= 22)) return "天蠍座";
  if ((month === 11 && day >= 23) || (month === 12 && day <= 21)) return "射手座";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "摩羯座";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "水瓶座";
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return "雙魚座";
  return "";
}

export function calculateMatch(sign1: string, sign2: string): MatchResult {
  const s1 = CONSTELLATIONS.find(c => c.name === sign1);
  const s2 = CONSTELLATIONS.find(c => c.name === sign2);

  if (!s1 || !s2) {
    return {
      score: 50,
      title: "渾然未知",
      brief: "兩顆遙遠的恆星，暫時還未偵測到軌道交集。",
      harmony: "各自在星系中寂靜漫遊。",
      friction: "不曾了解，便沒有碰撞。",
      tip: "多一些日常聊天，給予星流交匯的機會。"
    };
  }

  // 12 星座兩兩組合評分 (基於星盤元素交互：土+水、火+風 佳，同象極高，同名互相吸引或排斥。我們可以設計一個規則：
  let score = 70; // 基礎值
  if (s1.element === s2.element) {
    score = s1.name === s2.name ? 85 : 95; // 同象同星座 85，同象不同星座 95 (天作之合)
  } else if (
    (s1.element === "火" && s2.element === "風") ||
    (s1.element === "風" && s2.element === "火") ||
    (s1.element === "土" && s2.element === "水") ||
    (s1.element === "水" && s2.element === "土")
  ) {
    score = 88; // 互補生旺 (火旺風、水潤土)
  } else if (
    (s1.element === "火" && s2.element === "水") ||
    (s1.element === "水" && s2.element === "火")
  ) {
    score = 55; // 水火不容
  } else if (
    (s1.element === "土" && s2.element === "風") ||
    (s1.element === "風" && s2.element === "土")
  ) {
    score = 65; // 風塵飛揚，有些隔閡
  } else {
    score = 75; // 其它火土、水風組合
  }

  // 再依據星座特性微調個 1-5 分，使其更有趣
  const seed = `${sign1}-${sign2}`;
  const rand = getSeedRandom(seed);
  score += Math.floor(rand() * 10) - 5; // -5 到 +5
  if (score > 100) score = 100;
  if (score < 30) score = 30;

  // 取得評語細節
  let title = "星相平穩";
  let brief = "你們像兩軌悠閒並行的微光，相處時平淡沉靜，需要更多浪漫火花點綴。";
  let harmony = "共同話題切入輕鬆，不帶給對方強烈壓迫感，彼此都有各自充足的空間。";
  let friction = "有時候過於客氣或冷靜，容易讓關係漸漸變成普通朋友。";
  let tip = "試著分享一次深度的冒險，或共同克服一個生活小難關，感情才能迅速升温。";

  if (score >= 90) {
    title = "靈魂靈犀 🌟";
    brief = `極高頻的天作之合！你們的「${s1.element}象」與「${s2.element}象」能量完美交融。在相遇的瞬間，靈魂的波長就產生了令人顫慄的共鳴。`;
    harmony = "無需過多言語，眼神交匯處即是無盡的默契。對方的思維習慣與你的行為模式高度契合。";
    friction = "可能因為過於相似（或過度互補），有時候容易忽視對方也需要獨處的世界。";
    tip = "保持對生活細節的珍惜。向對方表達具體的感謝，這份金子般的緣分會更加牢固！";
  } else if (score >= 80) {
    title = "天造地設 💞";
    brief = `強烈的吸引力與互補性！「${s1.element}」與「${s2.element}」的元素交互，為你們提供了源源不絕的生命樂趣與成長養分。`;
    harmony = "能在對方的缺點裡看見可愛的一面。彼此欣賞、互相扶植，是生活與事業上的最佳拍檔。";
    friction = "在偶發的觀念分歧上，双方自尊心可能會微微發癢，需要有一方先報以軟化微笑。";
    tip = "在周末進行一場說走就走的微旅行，在新的場域解鎖彼此更多幽默可愛的面貌。";
  } else if (score >= 60) {
    title = "和諧共振 💫";
    brief = "中規中矩的和諧關係。你們的磁場既有可以深交的契機，也保有各自獨立的精神荒原，是非常健康的組合。";
    harmony = "在日常瑣事上能達成高度共識。理解大於挑剔，雙方都願意為維持關係付出相應的努力。";
    friction = "有時會因為步伐快慢不一而感到些微疲憊，例如一方熱切期待突破，另一方卻想守著安穩。";
    tip = "多多交流彼此的未來願望，把對方的藍圖也納進自己的未來，生活會更有凝聚力。";
  } else {
    title = "星軌磨合 ⚡";
    brief = `「${s1.element}」與「${s2.element}」屬於反差極大的元素碰撞，這段關係是一場對靈魂耐性的偉大試煉，也是一場刻骨銘心的相遇。`;
    harmony = "反差帶來的性吸引力極度致命。能強烈激發出你平時未曾展現的狂野或深沉面。";
    friction = "思維溝通有如雞同鴨講，一個講求邏輯效率，一個注重情感直覺。極易因細碎小事燃起戰火。";
    tip = "放下用「我的標準」去改造對方的企圖。學會像觀賞異星奇觀一樣去欣賞對方的不同，退一步海闊天空。";
  }

  return {
    score,
    title,
    brief,
    harmony,
    friction,
    tip
  };
}
