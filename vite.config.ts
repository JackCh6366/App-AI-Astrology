import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

// ─── Dev-time API middleware (emulates the Vercel serverless function) ──────
function devApiPlugin(env: Record<string, string>) {
  return {
    name: 'dev-api-divine',
    configureServer(server: any) {
      server.middlewares.use(
        '/api/astrology/divine',
        async (req: any, res: any) => {
          // Helper — always sends JSON, guards against double-write
          const sendJson = (status: number, payload: object) => {
            if (res.headersSent) return;
            const json = JSON.stringify(payload);
            res.writeHead(status, {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(json),
            });
            res.end(json);
          };

          // ── Everything inside ONE try/catch so any crash → JSON error ──
          try {
            if (req.method !== 'POST') {
              return sendJson(405, { error: 'Method Not Allowed' });
            }

            // Read raw body
            const chunks: Buffer[] = [];
            await new Promise<void>((resolve, reject) => {
              req.on('data', (c: Buffer) => chunks.push(c));
              req.on('end', resolve);
              req.on('error', reject);
            });
            const parsed = JSON.parse(Buffer.concat(chunks).toString('utf-8'));
            const { name, birthdate, birthtime, gender, sign, category, question, provider } = parsed;

            const systemInstruction = `你是一位精通西方星盤占星學、靈數學的老靈魂占卜大師，筆名「奧秘星域主宰」。
求問者：${name || '尋求指引的靈魂'}，星座：${sign}，性別：${gender}，詢問：${category}。
出生日期：${birthdate || '未提供'}，出生時間：${birthtime || '未提供'}。
具體疑惑：${question || '無特定，希望獲得近期宇宙能量分析'}。
請依據以下結構分析並使用繁體中文（台灣用法），語氣神秘而有深度，每個段落至少150字：
1. 【星軌指引與宇宙共鳴】深度解析當前星象對求問者的影響
2. 【星盤能量剖析】結合星座特質與當前天象，細述能量流向
3. 【具體疑惑解答 / 智慧神諭】針對求問者的困惑給予明確指引
4. 【幸運之鑰】幸運色、幸運水晶、幸運數字、靈魂叮嚀`;

            const userPrompt = `大師，我是 ${name || '一個迷茫的靈魂'}。請為我占卜近期的【${category}】運勢。${question ? `我的困惑是：${question}` : ''}`;

            if (provider === 'nvidia') {
              const nvKey = env.NVIDIA_API_KEY;
              if (!nvKey) {
                return sendJson(500, { success: false, error: '請在 .env.local 填入有效的 NVIDIA_API_KEY' });
              }
              if (!nvKey.startsWith('nvapi-')) {
                return sendJson(500, { success: false, error: `NVIDIA_API_KEY 格式無效（應以 nvapi- 開頭）。請至 https://build.nvidia.com 重新取得金鑰。` });
              }
              const resp = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${nvKey}` },
                body: JSON.stringify({
                  model: 'nvidia/llama-3.3-nemotron-super-49b-v1.5',
                  messages: [
                    { role: 'system', content: systemInstruction },
                    { role: 'user', content: userPrompt },
                  ],
                  temperature: 0.7,
                  max_tokens: 2000,
                }),
              });
              const rawText = await resp.text();
              let nvData: any;
              try {
                nvData = JSON.parse(rawText);
              } catch {
                throw new Error(`NVIDIA 回應非 JSON（HTTP ${resp.status}）：${rawText.slice(0, 200)}`);
              }
              if (!resp.ok) throw new Error(nvData.error?.message || `NVIDIA API 錯誤 (HTTP ${resp.status})`);
              return sendJson(200, { success: true, insight: nvData.choices[0].message.content, timestamp: new Date().toISOString() });

            } else {
              const gemKey = env.GEMINI_API_KEY;
              if (!gemKey) {
                return sendJson(500, { success: false, error: '請在 .env.local 填入有效的 GEMINI_API_KEY' });
              }
              if (!gemKey.startsWith('AIzaSy')) {
                return sendJson(500, { success: false, error: `GEMINI_API_KEY 格式無效（應以 AIzaSy 開頭，目前為「${gemKey.slice(0, 6)}...」）。請至 https://aistudio.google.com/apikey 重新取得正式金鑰。` });
              }
              const { GoogleGenAI } = await import('@google/genai');
              const ai = new GoogleGenAI({ apiKey: gemKey });
              let result: any;
              try {
                result = await ai.models.generateContent({
                  model: 'gemini-2.0-flash-lite',
                  config: { systemInstruction, temperature: 0.9, maxOutputTokens: 2048 },
                  contents: userPrompt,
                });
              } catch (gemErr: any) {
                const msg = gemErr?.message || '';
                if (msg.includes('limit: 0') || msg.includes('RESOURCE_EXHAUSTED')) {
                  throw new Error('您的 Gemini API Key 無免費配額（limit: 0）。請至 https://aistudio.google.com/apikey 重新取得以 AIzaSy 開頭的正式金鑰。');
                }
                throw gemErr;
              }
              return sendJson(200, { success: true, insight: result.text ?? '', timestamp: new Date().toISOString() });
            }

          } catch (err: any) {
            console.error('[Dev API] Error:', err.message);
            // Always respond with JSON — never let the middleware crash silently
            return sendJson(500, { success: false, error: err.message || '宇宙能量傳遞中斷' });
          }
        }
      );
    },
  };
}

export default defineConfig(({ mode }) => {
  // loadEnv with '' prefix loads ALL env vars (not just VITE_-prefixed)
  // This is how we access GEMINI_API_KEY and NVIDIA_API_KEY server-side
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss(), devApiPlugin(env)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
