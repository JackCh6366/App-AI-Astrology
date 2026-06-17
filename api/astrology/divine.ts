import { GoogleGenAI } from "@google/genai";

export const config = {
  maxDuration: 60, // Vercel Pro/Enterprise; Hobby is capped at 10s
};

// Abort helper — resolves to a signal that fires after `ms` milliseconds
function timeoutSignal(ms: number): AbortSignal {
  return AbortSignal.timeout ? AbortSignal.timeout(ms) : new AbortController().signal;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const {
    name,
    birthdate,
    birthtime,
    gender,
    sign,
    category,
    question,
    provider,
  } = req.body;

  const systemInstruction = `你是占卜大師「奧秘星域主宰」，精通西洋占星與靈數學。
求問者：${name || "靈魂"}，星座：${sign}，性別：${gender}，主題：${category}。
生日：${birthdate || "未知"}，時間：${birthtime || "未知"}。
困惑：${question || "近期宇宙能量"}。
請以繁體中文（台灣用法）、神秘深邃語氣，依下列四段簡潔回答（每段約80字）：
1.【星軌指引】當前星象影響
2.【星盤能量】星座特質與能量流向
3.【神諭解答】針對困惑的指引
4.【幸運之鑰】幸運色・水晶・數字・靈魂叮嚀`;

  const userPrompt = `大師，我是 ${name || "一個迷茫的靈魂"}。請為我占卜近期的【${category}】運勢。${
    question ? `我的困惑是：${question}` : ""
  }`;

  try {
    if (provider === "nvidia") {
      const nvApiKey = process.env.NVIDIA_API_KEY;
      if (!nvApiKey) {
        throw new Error("NVIDIA_API_KEY 尚未配置於環境設定中");
      }

      const response = await fetch(
        "https://integrate.api.nvidia.com/v1/chat/completions",
        {
          method: "POST",
          signal: timeoutSignal(8000), // 8s hard cut-off (Vercel Hobby = 10s)
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${nvApiKey}`,
          },
          body: JSON.stringify({
            model: "nvidia/llama-3.3-nemotron-super-49b-v1.5",
            messages: [
              { role: "system", content: systemInstruction },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.7,
            max_tokens: 1200, // reduced to fit within timeout
            stream: false,
          }),
        }
      );

      const rawText = await response.text();
      let data: any;
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(`NVIDIA 回應解析失敗：${rawText.slice(0, 200)}`);
      }

      if (!response.ok) {
        throw new Error(
          data.error?.message ||
            `NVIDIA API 軌域連結失敗 (HTTP ${response.status})`
        );
      }

      return res.status(200).json({
        success: true,
        insight: data.choices[0].message.content,
        timestamp: new Date().toISOString(),
      });
    } else {
      // Google Gemini via @google/genai v2 SDK
      const geminiKey = process.env.GEMINI_API_KEY;
      if (!geminiKey) {
        throw new Error("GEMINI_API_KEY 尚未配置於環境設定中");
      }

      const ai = new GoogleGenAI({ apiKey: geminiKey });

      // Use a short-lived AbortController so we don't exceed the 10s Vercel Hobby wall
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      let result: any;
      try {
        result = await ai.models.generateContent({
          model: "gemini-2.0-flash-lite",
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.9,
            maxOutputTokens: 1200, // reduced to stay within timeout
          },
          contents: userPrompt,
        });
      } finally {
        clearTimeout(timer);
      }

      const text = result.text ?? "";

      return res.status(200).json({
        success: true,
        insight: text,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error: any) {
    console.error("Divine Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "宇宙能量傳遞中斷，請確認秘鑰配置。",
    });
  }
}
