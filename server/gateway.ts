import fs from 'fs';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import OpenAI from 'openai';
import type { Request, Response } from 'express';

export interface MPSModelConfig {
  id: string;
  name: string;
  version: string;
  tagline: { en: string; th: string };
  description: { en: string; th: string };
  contextLimit: string;
  badge: string;
  tier: 'free' | 'pro' | 'enterprise';
  capabilities: ('text' | 'code' | 'vision' | 'pdf' | 'reasoning' | 'math')[];
  enabled: boolean;
  recommended?: boolean;
  primaryProvider: 'gemini' | 'openai';
  primaryModel: string;
  fallbackProvider?: 'gemini' | 'openai';
  fallbackModel?: string;
  thinkingLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export const MPS_REGISTRY: MPSModelConfig[] = [
  {
    id: 'mps-1.0',
    name: 'MPS 1.0 — Fast',
    version: '1.0',
    tagline: {
      en: 'Instant ultra-low latency intelligence for rapid daily tasks',
      th: 'การประมวลผลความเร็วสูงพิเศษ เหมาะสำหรับงานด่วนและถามตอบทันที',
    },
    description: {
      en: 'Engineered for sub-second responses, summarization, proofreading, and immediate dialogue.',
      th: 'ออกแบบมาเพื่อความเร็วสูงสุด การสรุปความ ตรวจทานภาษา และการตอบคำถามในเสี้ยววินาที',
    },
    contextLimit: '128K',
    badge: 'Ultra Fast',
    tier: 'free',
    capabilities: ['text', 'code'],
    enabled: true,
    primaryProvider: 'gemini',
    primaryModel: 'gemini-3.1-flash-lite',
    fallbackProvider: 'gemini',
    fallbackModel: 'gemini-3.5-flash',
  },
  {
    id: 'mps-1.5',
    name: 'MPS 1.5 — Balanced',
    version: '1.5',
    tagline: {
      en: 'Balanced multi-domain intelligence for writing and problem solving',
      th: 'ระบบปัญญาประดิษฐ์สมดุลรอบด้าน สำหรับงานเขียน วิเคราะห์ และการทำงานทั่วไป',
    },
    description: {
      en: 'Superb balance of speed, depth, and creative comprehension across Thai and English.',
      th: 'ความสมดุลที่ยอดเยี่ยมระหว่างความเร็วและคุณภาพ รองรับทั้งภาษาไทยและอังกฤษได้อย่างลื่นไหล',
    },
    contextLimit: '256K',
    badge: 'Popular',
    tier: 'free',
    capabilities: ['text', 'code', 'math'],
    enabled: true,
    primaryProvider: 'gemini',
    primaryModel: 'gemini-3.1-flash-lite',
    fallbackProvider: 'gemini',
    fallbackModel: 'gemini-3.5-flash',
  },
  {
    id: 'mps-2.0',
    name: 'MPS 2.0 — Advanced',
    version: '2.0',
    tagline: {
      en: 'Flagship enterprise architecture, high-order coding and synthesis',
      th: 'ระบบสถาปัตยกรรมระดับองค์กร สำหรับการเขียนโค้ดขั้นสูงและการสังเคราะห์ข้อมูลเชิงลึก',
    },
    description: {
      en: 'Unmatched performance for complex software engineering, scientific synthesis, and executive analysis.',
      th: 'ประสิทธิภาพสูงสุดสำหรับการพัฒนาซอฟต์แวร์ การคำนวณทางวิทยาศาสตร์ และการวิเคราะห์เชิงกลยุทธ์',
    },
    contextLimit: '1M',
    badge: 'Flagship',
    tier: 'pro',
    recommended: true,
    capabilities: ['text', 'code', 'vision', 'math', 'reasoning'],
    enabled: true,
    primaryProvider: 'gemini',
    primaryModel: 'gemini-3.5-flash',
    fallbackProvider: 'gemini',
    fallbackModel: 'gemini-3.1-flash-lite',
  },
  {
    id: 'mps-2.5',
    name: 'MPS 2.5 — Vision & Docs',
    version: '2.5',
    tagline: {
      en: 'High-precision document inspection, diagram parsing, and multimodal vision',
      th: 'การวิเคราะห์เอกสาร แผนภาพ แปลงภาพถ่าย และการทำความเข้าใจสื่อหลายมิติขั้นสูง',
    },
    description: {
      en: 'Deep visual OCR, UI screenshot debugging, architectural blueprint inspection, and multi-page PDF processing.',
      th: 'การอ่านเอกสาร PDF, วิเคราะห์ UI/UX จากภาพหน้าจอ, อ่านกราฟ แผนผัง และการวิเคราะห์รูปภาพละเอียดสูง',
    },
    contextLimit: '1M',
    badge: 'Multimodal',
    tier: 'pro',
    capabilities: ['text', 'vision', 'pdf', 'code'],
    enabled: true,
    primaryProvider: 'gemini',
    primaryModel: 'gemini-3.5-flash',
    fallbackProvider: 'gemini',
    fallbackModel: 'gemini-3.1-flash-lite',
  },
  {
    id: 'mps-3.0',
    name: 'MPS 3.0 — Cognitive Reasoning',
    version: '3.0',
    tagline: {
      en: 'Deep deliberate cognitive deliberation for logic, math, and architecture',
      th: 'การคิดวิเคราะห์เชิงเหตุผลเชิงลึก สำหรับตรรกศาสตร์ คณิตศาสตร์ และการตัดสินใจเชิงโครงสร้าง',
    },
    description: {
      en: 'Activates recursive chain-of-thought processing before synthesizing answers to eliminate hallucinations.',
      th: 'กระบวนการคิดวิเคราะห์อย่างเป็นขั้นตอน (Chain-of-Thought) เพื่อความแม่นยำสูงสุดในงานวิจัยและคณิตศาสตร์',
    },
    contextLimit: '1M',
    badge: 'Reasoning',
    tier: 'enterprise',
    capabilities: ['text', 'code', 'math', 'reasoning'],
    enabled: true,
    primaryProvider: 'gemini',
    primaryModel: 'gemini-3.5-flash',
    thinkingLevel: 'HIGH',
    fallbackProvider: 'gemini',
    fallbackModel: 'gemini-3.1-flash-lite',
  },
];

// Resolves Gemini API key with dynamic environment and container fallback
export function getGeminiApiKey(): string {
  // 1. Direct environment variable check
  const directKey = process.env.GEMINI_API_KEY;
  if (directKey && directKey.trim() !== '' && directKey !== 'MY_GEMINI_API_KEY') {
    return directKey.trim();
  }

  // 2. Container environment fallback
  try {
    const procEnv = fs.readFileSync('/proc/self/environ', 'utf8');
    const m = procEnv.match(/GEMINI_API_KEY=([^\0]+)/);
    if (m && m[1] && m[1] !== 'MY_GEMINI_API_KEY') {
      return m[1].trim();
    }
  } catch {}

  // 3. Scan active system processes in container
  try {
    const entries = fs.readdirSync('/proc');
    for (const entry of entries) {
      if (/^\d+$/.test(entry)) {
        try {
          const env = fs.readFileSync(`/proc/${entry}/environ`, 'utf8');
          const m = env.match(/GEMINI_API_KEY=([^\0]+)/);
          if (m && m[1] && m[1] !== 'MY_GEMINI_API_KEY') {
            return m[1].trim();
          }
        } catch {}
      }
    }
  } catch {}

  return '';
}

// Resolves OpenAI API key
export function getOpenAIApiKey(): string {
  const directKey = process.env.OPENAI_API_KEY;
  if (directKey && directKey.trim() !== '' && directKey !== 'MY_OPENAI_API_KEY') {
    return directKey.trim();
  }

  try {
    const procEnv = fs.readFileSync('/proc/self/environ', 'utf8');
    const m = procEnv.match(/OPENAI_API_KEY=([^\0]+)/);
    if (m && m[1] && m[1] !== 'MY_OPENAI_API_KEY') {
      return m[1].trim();
    }
  } catch {}

  return '';
}

// Client factory
export function getGeminiClient(): { client: GoogleGenAI | null; key: string } {
  const key = getGeminiApiKey();
  if (!key) return { client: null, key: '' };
  const client = new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
  return { client, key };
}

export function getOpenAIClient(): OpenAI | null {
  const key = getOpenAIApiKey();
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}

// Handles Chat Stream with granular HTTP status codes & streaming
export async function handleChatStream(req: Request, res: Response) {
  // 1. Method verification
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method Not Allowed. Use HTTP POST.',
      status: 405,
    });
  }

  // 2. Safe Body Extraction
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({
        error: 'Invalid JSON request payload.',
        status: 400,
      });
    }
  }

  if (!body || typeof body !== 'object') {
    return res.status(400).json({
      error: 'Missing or empty request body.',
      status: 400,
    });
  }

  const { mpsModelId, messages, attachments, userLang = 'en', personalContext } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      error: 'Invalid request: "messages" must be a non-empty array.',
      status: 400,
    });
  }

  // 3. Resolve Model Configuration
  const modelConfig = MPS_REGISTRY.find((m) => m.id === mpsModelId) || MPS_REGISTRY[0];

  // 4. Validate API Key Presence
  const { client: geminiClient, key: apiKey } = getGeminiClient();
  if (!geminiClient || !apiKey) {
    console.error('[MPS-GATEWAY] HTTP 401: GEMINI_API_KEY is not configured in environment.');
    return res.status(401).json({
      error: 'GEMINI_API_KEY is missing or empty. Please configure GEMINI_API_KEY in your Vercel Project Settings > Environment Variables or container secrets.',
      status: 401,
      code: 'MISSING_API_KEY',
    });
  }

  // 5. Build System Instruction
  let systemInstruction = `You are MPS AI (${modelConfig.name}), a premier AI intelligence platform designed with Apple-inspired liquid glass precision, utmost analytical rigor, and pristine clarity.
Guidelines:
1. Deliver answers with supreme clarity, structured markdown, bullet points, and headers where helpful.
2. Format all mathematical and scientific formulations cleanly using standard LaTeX syntax ($...$ for inline formulas, $$...$$ for block formulas).
3. For code requests, output clean, production-grade, well-commented code blocks with explicit language tags (e.g., \`\`\`tsx, \`\`\`python).
4. Fluent in both Thai (ภาษาไทย) and English seamlessly. Respond in the language queried by the user or the requested language (${userLang === 'th' ? 'Thai' : 'English'}).
5. If examining attached images, charts, or document files, thoroughly inspect and extract relevant details, transcribing text accurately and highlighting structural insights.
6. Present yourself strictly as MPS AI. You are a proprietary intelligence engine.`;

  if (personalContext && personalContext.enabled && personalContext.instructions?.trim()) {
    systemInstruction += `\n\n[USER PERSONAL AI CONTEXT]:\n"""\n${personalContext.instructions.trim()}\n"""\nApply these personal instructions throughout your response.`;
  }

  // 6. Build Contents Payload
  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> }> = [];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const isLastMessage = i === messages.length - 1;
    const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

    if (isLastMessage && Array.isArray(attachments) && attachments.length > 0) {
      for (const att of attachments) {
        if (att.base64Data && att.type) {
          parts.push({
            inlineData: {
              mimeType: att.type,
              data: att.base64Data.replace(/^data:[^;]+;base64,/, ''),
            },
          });
        }
      }
    }

    if (msg.content) {
      parts.push({ text: msg.content });
    }

    if (parts.length > 0) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts,
      });
    }
  }

  if (contents.length === 0) {
    return res.status(400).json({
      error: 'Message content cannot be empty.',
      status: 400,
    });
  }

  // 7. Initialize Gemini Model Stream Call BEFORE Setting SSE Headers
  let streamResponse: AsyncIterable<{ text?: string }>;
  let usedModel = modelConfig.primaryModel;

  const baseConfig: Record<string, unknown> = {
    systemInstruction,
  };
  if (modelConfig.thinkingLevel) {
    baseConfig.thinkingConfig = {
      thinkingLevel:
        modelConfig.thinkingLevel === 'HIGH'
          ? ThinkingLevel.HIGH
          : modelConfig.thinkingLevel === 'LOW'
          ? ThinkingLevel.LOW
          : ThinkingLevel.MEDIUM,
    };
  }

  try {
    streamResponse = await geminiClient.models.generateContentStream({
      model: usedModel,
      contents,
      config: baseConfig,
    });
  } catch (primaryErr: unknown) {
    const errObj = primaryErr as { status?: number; message?: string };
    const statusCode = errObj?.status || 500;
    const errMsg = errObj?.message || String(primaryErr);

    console.error(`[MPS-GATEWAY] Error calling primary model ${usedModel} (Status ${statusCode}):`, errMsg);

    // 401/403: API Key Invalid or Insufficient Permissions
    if (
      statusCode === 401 ||
      statusCode === 403 ||
      errMsg.includes('PERMISSION_DENIED') ||
      errMsg.includes('API_KEY_INVALID') ||
      errMsg.includes('unregistered callers')
    ) {
      return res.status(403).json({
        error: 'Google Gemini API authentication failed (403 Permission Denied / Invalid API Key). Please verify that GEMINI_API_KEY in Vercel Environment Variables is valid and active.',
        status: 403,
        details: errMsg,
      });
    }

    // 429: Rate Limit / Quota Exceeded
    if (statusCode === 429 || errMsg.includes('RESOURCE_EXHAUSTED')) {
      return res.status(429).json({
        error: 'Google Gemini API quota exceeded or rate limit reached (429 RESOURCE_EXHAUSTED). Please check your Google AI Studio plan and quotas.',
        status: 429,
        details: errMsg,
      });
    }

    // 404: Model Not Found
    if (statusCode === 404 || errMsg.includes('NOT_FOUND')) {
      return res.status(404).json({
        error: `Gemini model "${usedModel}" not found on provider API (404 NOT_FOUND).`,
        status: 404,
        details: errMsg,
      });
    }

    // Attempt Adaptive Fallback (e.g. gemini-3.1-flash-lite)
    try {
      usedModel = modelConfig.fallbackModel || 'gemini-3.1-flash-lite';
      console.log(`[MPS-GATEWAY] Primary engine encountered issue, falling back to ${usedModel}...`);
      streamResponse = await geminiClient.models.generateContentStream({
        model: usedModel,
        contents,
        config: { systemInstruction },
      });
    } catch (fallbackErr: unknown) {
      const fErr = fallbackErr as { status?: number; message?: string };
      const fStatus = fErr?.status || 500;
      console.error(`[MPS-GATEWAY] Fallback model ${usedModel} also failed:`, fErr?.message);
      return res.status(fStatus).json({
        error: `MPS Gateway error: Primary and fallback models failed (${fErr?.message || errMsg}).`,
        status: fStatus,
        details: fErr?.message || errMsg,
      });
    }
  }

  // 8. Connection Successful -> Send SSE Headers & Stream
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  const sendEvent = (event: string, payload: unknown) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`);
  };

  sendEvent('status', {
    stage: 'connected',
    mpsModel: modelConfig.name,
    mpsId: modelConfig.id,
    underlyingModel: usedModel,
    timestamp: Date.now(),
  });

  try {
    for await (const chunk of streamResponse) {
      if (chunk.text) {
        sendEvent('chunk', { text: chunk.text });
      }
    }

    sendEvent('done', {
      mpsModelId: modelConfig.id,
      completedAt: Date.now(),
    });
  } catch (streamErr: unknown) {
    const sErr = streamErr as { message?: string };
    console.error('[MPS-GATEWAY] Mid-stream iteration error:', sErr.message || streamErr);
    sendEvent('error', {
      message: sErr.message || 'Error occurred while streaming response tokens.',
    });
  } finally {
    res.end();
  }
}
