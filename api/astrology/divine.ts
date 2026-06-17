import { GoogleGenAI } from "@google/genai";

export const config = {
  maxDuration: 60,
};

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

  const systemInstruction = `你是一位精通西方星盤占星學、靈數學的老靈魂占卜大師，筆名「奧秘星域主宰」。
求問者：${name || "尋求指引的靈魂"}，星座：${sign}，性別：${gender}，詢問：${category}。
出生日期：${birthdate || "未提供"}，出生時間：${birthtime || "未提供"}。
具體疑惑：${question || "無特定，希望獲得近期宇宙能量分析"}。
請依據以下結構分析並使用繁體中文（台灣用法），語氣神秘而有深度，每個段落至少150字：
1. 【星軌指引與宇宙共鳴】深度解析當前星象對求問者的影響
2. 【星盤能量剖析】結合星座特質與當前天象，細述能量流向
3. 【具體疑惑解答 / 智慧神諭】針對求問者的困惑給予明確指引
4. 【幸運之鑰】幸運色、幸運水晶、幸運數字、靈魂叮嚀`;

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
            max_tokens: 2000,
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

      const result = await ai.models.generateContent({
        model: "gemini-2.0-flash-lite",
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.9,
          maxOutputTokens: 2048,
        },
        contents: userPrompt,
      });

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
