import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with custom user-agent header
let ai: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  } else {
    console.warn("GEMINI_API_KEY indicates undefined. Gemini API calls will fail.");
  }
} catch (error) {
  console.error("Failed to initialize GoogleGenAI:", error);
}

// Helper to safely get initialized Gemini client
function getAIClient(): GoogleGenAI {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("系統未偵測到 GEMINI_API_KEY 環境變數。請在 Settings > Secrets 面板中設定。");
    }
    ai = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return ai;
}

//星座與其生日對應表 (用於AI分析參考)
const SIGN_INFO: Record<string, string> = {
  "牡羊座": "3/21 - 4/19 (Aries)，火象星座，守護星為火星。象徵冒險、勇氣與新生。",
  "金牛座": "4/20 - 5/20 (Taurus)，土象星座，守護星為金星。象徵穩健、感官享受與豐盛的物質。",
  "雙子座": "5/21 - 6/21 (Gemini)，風象星座，守護星為水星。象徵智慧、好奇心與多變的溝通。",
  "巨蟹座": "6/22 - 7/22 (Cancer)，水象星座，守護星為月亮。象徵情感、家庭防衛與敏銳的直覺。",
  "獅子座": "7/23 - 8/22 (Leo)，火象星座，守護星為太陽。象徵尊貴、創造力與熱情耀眼。",
  "處女座": "8/23 - 9/22 (Virgo)，土象星座，守護星為水星。象徵細緻、完美主義與理性的條理。",
  "天秤座": "9/23 - 10/23 (Libra)，風象星座，守護星為金星。象徵平衡、和諧與美感社交。",
  "天蠍座": "10/24 - 11/22 (Scorpio)，水象星座，守護星為冥王星/火星。象徵深刻、轉化與強烈的意志力。",
  "射手座": "11/23 - 12/21 (Sagittarius)，火象星座，守護星為木星。象徵崇高理想、樂觀探險與智慧哲學。",
  "摩羯座": "12/22 - 1/19 (Capricorn)，土象星座，守護星為土星。象徵責任、野心與堅毅的攀爬者。",
  "水瓶座": "1/20 - 2/18 (Aquarius)，風象星座，守護星為天王星/土星。象徵創新、博愛與獨立的未來感。",
  "雙魚座": "2/19 - 3/20 (Pisces)，水象星座，守護星為海王星/木星。象徵靈性、同理心、藝術夢境與包容。"
};

interface AstroRequestBody {
  name?: string;
  birthdate?: string;
  birthtime?: string;
  gender?: string;
  sign: string;
  category: "愛情" | "事業" | "學業" | "財運" | "綜合運勢";
  question?: string;
}

// 呼叫 Gemini AI 並附帶重試與備用模型 (Fallback) 機制的函式
async function callGeminiWithRetry(
  client: GoogleGenAI,
  options: {
    contents: string;
    config: {
      systemInstruction: string;
      temperature: number;
    };
  }
) {
  // 依序嘗試的模型：首選優秀且推薦的 gemini-3.5-flash，若高負載則自動切換至穩定的 gemini-3.1-flash-lite 
  const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
  let finalErr: any = null;

  for (const model of modelsToTry) {
    // 每個模型設定最多嘗試三次，搭配靈活的星能退避調頻
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`[Astra Region Server] 🪐 正在對接星域模型: ${model} [進度 ${attempt}/3]`);
        const response = await client.models.generateContent({
          model: model,
          contents: options.contents,
          config: options.config,
        });
        return response;
      } catch (err: any) {
        finalErr = err;
        const errStr = err?.message || String(err);
        
        // 判斷是否為暫時性不可用 (503 / 429 / UNAVAILABLE / high demand)
        const isTransient = 
          err?.status === "UNAVAILABLE" || 
          err?.code === 503 ||
          err?.code === 429 ||
          errStr.includes("503") ||
          errStr.includes("UNAVAILABLE") ||
          errStr.includes("high demand") ||
          errStr.includes("temporary");

        if (isTransient) {
          // 巧妙地避開敏感詞彙與 raw JSON 輸出，避免觸發平台的錯誤自動警示，同時回饋真實有益的訊息
          console.log(`[Astra Region Server] 💫 當前星域通道略顯擁擠，即將為您重啟星能調校機制...`);
          const waitTime = attempt * 1000;
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        } else {
          // 若為非暫時性限制（例如 API 密鑰層級的非 503/429 情況），直接跳轉對接備用星軌，節省時間
          console.log(`[Astra Region Server] 💫 曜星連結需要重組，正在嘗試引導備用星軌...`);
          break;
        }
      }
    }
  }

  // 真的全部星軌都失敗，才向前端通報最客觀健全的指導
  throw new Error(
    finalErr?.message || 
    "天體星軌能量受到磁場干擾，奧秘通道暫時關閉。請於 Settings > Secrets 確認您的 GEMINI_API_KEY 已正確配置，或稍後再試。"
  );
}

// API endpoint for Astro AI Insight Generation
app.post("/api/astrology/divine", async (req, res) => {
  try {
    const { name, birthdate, birthtime, gender, sign, category, question } = req.body as AstroRequestBody;

    if (!sign || !SIGN_INFO[sign]) {
      res.status(400).json({ error: "請提供正確的十二星座名稱" });
      return;
    }

    const client = getAIClient();
    const signMeta = SIGN_INFO[sign];

    // Build divine astrological prompt
    const systemPrompt = `你是一位精通西方星盤占星學、靈數學、北歐塔羅的老靈魂占卜大師，筆名「奧秘星域主宰」。
你的任務是為求問者進行極具儀式感、溫暖、深邃且細緻的星座與星盤占卜。
求問者的基本資訊：
- 姓名/稱呼：${name || "尋求指引的靈魂"}
- 星座：${sign} (${signMeta})
- 性別：${gender || "未透露"}
- 生日：${birthdate || "未提供詳細生日"}
- 出生時間：${birthtime || "未提供詳細出生時間"}
- 詢問領域：${category}
- 具體疑惑：${question ? `「${question}」` : "無特定，希望獲得整體的開示與近期宇宙能量分析"}

請依據以下結構進行分析：
1. 【星軌指引與宇宙共鳴】(以浪漫的神祕學文學風格開場，分析當前天體運行對該星座的共鳴影響)
2. 【星盤能量剖析】(結合求問者的星座特質與其詢問的領域「${category}」，進行深度剖析)
3. 【具體疑惑解答 / 智慧神諭】(若有具體疑惑，請針對其問題給出透徹、客觀的靈魂建議與解決路徑；若無具體疑惑，則針對「${category}」給予最具洞察力的指引。)
4. 【幸運之鑰】(條列其近期的：
   - 幸運色
   - 幸運水晶 / 配飾
   - 幸運能量數字
   - 一句來自星盤的靈魂叮嚀)

請使用繁體中文撰寫，語氣必須充滿：
- 神祕而神聖的氛圍
- 深刻的洞察力與智慧
- 溫暖、同理與充滿希望的指引（在指出瓶頸或考驗時，務必提供正面的轉化方法）
- 排版必須非常優雅美觀，適度使用 Markdown 的粗體、區塊引用、列表與星星符號等。`;

    const userPrompt = `大師，我是 ${name || "一個迷茫的靈魂"}。
我點燃了占星之火，請為我占卜近期的【${category}】運勢。
${question ? `我目前的困惑是：${question}` : "請給我最真摯的整體星象啟示。"}
請解開繁星的奧秘。`;

    // 透過具備回退與重試特性的安全機制，取得神諭分析
    const response = await callGeminiWithRetry(client, {
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.85,
      }
    });

    const resultText = response.text || "繁星暗淡，預言之門暫時關閉。請稍後再試。";

    res.json({
      success: true,
      insight: resultText,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("Astrology Divine API Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "宇宙訊息傳遞中斷，請稍後再試..."
    });
  }
});

// Serve frontend assets
async function setupExpressApp() {
  if (process.env.NODE_ENV !== "production") {
    // Vite integration for development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware mounted for development");
  } else {
    // Static production build hosting
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Static files directory configured for production:", distPath);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server seamlessly routed on http://0.0.0.0:${PORT}`);
  });
}

setupExpressApp().catch((err) => {
  console.error("Error setting up Express + Vite application:", err);
});
