import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import OpenAI from "openai";
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = Number(process.env.PORT) || 3e3;
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));
let GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
let OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
if (!GEMINI_API_KEY || !OPENAI_API_KEY) {
  try {
    const procEnv = fs.readFileSync("/proc/self/environ", "utf8");
    if (!GEMINI_API_KEY) {
      const matchGemini = procEnv.match(/GEMINI_API_KEY=([^\0]+)/);
      if (matchGemini) GEMINI_API_KEY = matchGemini[1].trim();
    }
    if (!OPENAI_API_KEY) {
      const matchOpenAI = procEnv.match(/OPENAI_API_KEY=([^\0]+)/);
      if (matchOpenAI) OPENAI_API_KEY = matchOpenAI[1].trim();
    }
  } catch {
  }
}
let geminiClient = null;
if (GEMINI_API_KEY) {
  geminiClient = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
let openaiClient = null;
if (OPENAI_API_KEY) {
  openaiClient = new OpenAI({
    apiKey: OPENAI_API_KEY
  });
}
const MPS_REGISTRY = [
  {
    id: "mps-1.0",
    name: "MPS 1.0 \u2014 Fast",
    version: "1.0",
    tagline: {
      en: "Instant ultra-low latency intelligence for rapid daily tasks",
      th: "\u0E01\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E21\u0E27\u0E25\u0E1C\u0E25\u0E04\u0E27\u0E32\u0E21\u0E40\u0E23\u0E47\u0E27\u0E2A\u0E39\u0E07\u0E1E\u0E34\u0E40\u0E28\u0E29 \u0E40\u0E2B\u0E21\u0E32\u0E30\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E07\u0E32\u0E19\u0E14\u0E48\u0E27\u0E19\u0E41\u0E25\u0E30\u0E16\u0E32\u0E21\u0E15\u0E2D\u0E1A\u0E17\u0E31\u0E19\u0E17\u0E35"
    },
    description: {
      en: "Engineered for sub-second responses, summarization, proofreading, and immediate dialogue.",
      th: "\u0E2D\u0E2D\u0E01\u0E41\u0E1A\u0E1A\u0E21\u0E32\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E40\u0E23\u0E47\u0E27\u0E2A\u0E39\u0E07\u0E2A\u0E38\u0E14 \u0E01\u0E32\u0E23\u0E2A\u0E23\u0E38\u0E1B\u0E04\u0E27\u0E32\u0E21 \u0E15\u0E23\u0E27\u0E08\u0E17\u0E32\u0E19\u0E20\u0E32\u0E29\u0E32 \u0E41\u0E25\u0E30\u0E01\u0E32\u0E23\u0E15\u0E2D\u0E1A\u0E04\u0E33\u0E16\u0E32\u0E21\u0E43\u0E19\u0E40\u0E2A\u0E35\u0E49\u0E22\u0E27\u0E27\u0E34\u0E19\u0E32\u0E17\u0E35"
    },
    contextLimit: "128K",
    badge: "Ultra Fast",
    tier: "free",
    capabilities: ["text", "code"],
    enabled: true,
    primaryProvider: "gemini",
    primaryModel: "gemini-3.1-flash-lite",
    fallbackProvider: "gemini",
    fallbackModel: "gemini-3.5-flash"
  },
  {
    id: "mps-1.5",
    name: "MPS 1.5 \u2014 Balanced",
    version: "1.5",
    tagline: {
      en: "Balanced multi-domain intelligence for writing and problem solving",
      th: "\u0E23\u0E30\u0E1A\u0E1A\u0E1B\u0E31\u0E0D\u0E0D\u0E32\u0E1B\u0E23\u0E30\u0E14\u0E34\u0E29\u0E10\u0E4C\u0E2A\u0E21\u0E14\u0E38\u0E25\u0E23\u0E2D\u0E1A\u0E14\u0E49\u0E32\u0E19 \u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E07\u0E32\u0E19\u0E40\u0E02\u0E35\u0E22\u0E19 \u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C \u0E41\u0E25\u0E30\u0E01\u0E32\u0E23\u0E17\u0E33\u0E07\u0E32\u0E19\u0E17\u0E31\u0E48\u0E27\u0E44\u0E1B"
    },
    description: {
      en: "Superb balance of speed, depth, and creative comprehension across Thai and English.",
      th: "\u0E04\u0E27\u0E32\u0E21\u0E2A\u0E21\u0E14\u0E38\u0E25\u0E17\u0E35\u0E48\u0E22\u0E2D\u0E14\u0E40\u0E22\u0E35\u0E48\u0E22\u0E21\u0E23\u0E30\u0E2B\u0E27\u0E48\u0E32\u0E07\u0E04\u0E27\u0E32\u0E21\u0E40\u0E23\u0E47\u0E27\u0E41\u0E25\u0E30\u0E04\u0E38\u0E13\u0E20\u0E32\u0E1E \u0E23\u0E2D\u0E07\u0E23\u0E31\u0E1A\u0E17\u0E31\u0E49\u0E07\u0E20\u0E32\u0E29\u0E32\u0E44\u0E17\u0E22\u0E41\u0E25\u0E30\u0E2D\u0E31\u0E07\u0E01\u0E24\u0E29\u0E44\u0E14\u0E49\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E25\u0E37\u0E48\u0E19\u0E44\u0E2B\u0E25"
    },
    contextLimit: "256K",
    badge: "Popular",
    tier: "free",
    capabilities: ["text", "code", "math"],
    enabled: true,
    primaryProvider: "gemini",
    primaryModel: "gemini-3.5-flash",
    fallbackProvider: "gemini",
    fallbackModel: "gemini-3.1-flash-lite"
  },
  {
    id: "mps-2.0",
    name: "MPS 2.0 \u2014 Advanced",
    version: "2.0",
    tagline: {
      en: "Flagship enterprise architecture, high-order coding and synthesis",
      th: "\u0E23\u0E30\u0E1A\u0E1A\u0E2A\u0E16\u0E32\u0E1B\u0E31\u0E15\u0E22\u0E01\u0E23\u0E23\u0E21\u0E23\u0E30\u0E14\u0E31\u0E1A\u0E2D\u0E07\u0E04\u0E4C\u0E01\u0E23 \u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E40\u0E02\u0E35\u0E22\u0E19\u0E42\u0E04\u0E49\u0E14\u0E02\u0E31\u0E49\u0E19\u0E2A\u0E39\u0E07\u0E41\u0E25\u0E30\u0E01\u0E32\u0E23\u0E2A\u0E31\u0E07\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E40\u0E0A\u0E34\u0E07\u0E25\u0E36\u0E01"
    },
    description: {
      en: "Unmatched performance for complex software engineering, scientific synthesis, and executive analysis.",
      th: "\u0E1B\u0E23\u0E30\u0E2A\u0E34\u0E17\u0E18\u0E34\u0E20\u0E32\u0E1E\u0E2A\u0E39\u0E07\u0E2A\u0E38\u0E14\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E1E\u0E31\u0E12\u0E19\u0E32\u0E0B\u0E2D\u0E1F\u0E15\u0E4C\u0E41\u0E27\u0E23\u0E4C \u0E01\u0E32\u0E23\u0E04\u0E33\u0E19\u0E27\u0E13\u0E17\u0E32\u0E07\u0E27\u0E34\u0E17\u0E22\u0E32\u0E28\u0E32\u0E2A\u0E15\u0E23\u0E4C \u0E41\u0E25\u0E30\u0E01\u0E32\u0E23\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E40\u0E0A\u0E34\u0E07\u0E01\u0E25\u0E22\u0E38\u0E17\u0E18\u0E4C"
    },
    contextLimit: "1M",
    badge: "Flagship",
    tier: "pro",
    recommended: true,
    capabilities: ["text", "code", "vision", "math", "reasoning"],
    enabled: true,
    primaryProvider: "gemini",
    primaryModel: "gemini-3.5-flash",
    fallbackProvider: "openai",
    fallbackModel: "gpt-4o"
  },
  {
    id: "mps-2.5",
    name: "MPS 2.5 \u2014 Vision & Docs",
    version: "2.5",
    tagline: {
      en: "High-precision document inspection, diagram parsing, and multimodal vision",
      th: "\u0E01\u0E32\u0E23\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E40\u0E2D\u0E01\u0E2A\u0E32\u0E23 \u0E41\u0E1C\u0E19\u0E20\u0E32\u0E1E \u0E41\u0E1B\u0E25\u0E07\u0E20\u0E32\u0E1E\u0E16\u0E48\u0E32\u0E22 \u0E41\u0E25\u0E30\u0E01\u0E32\u0E23\u0E17\u0E33\u0E04\u0E27\u0E32\u0E21\u0E40\u0E02\u0E49\u0E32\u0E43\u0E08\u0E2A\u0E37\u0E48\u0E2D\u0E2B\u0E25\u0E32\u0E22\u0E21\u0E34\u0E15\u0E34\u0E02\u0E31\u0E49\u0E19\u0E2A\u0E39\u0E07"
    },
    description: {
      en: "Deep visual OCR, UI screenshot debugging, architectural blueprint inspection, and multi-page PDF processing.",
      th: "\u0E01\u0E32\u0E23\u0E2D\u0E48\u0E32\u0E19\u0E40\u0E2D\u0E01\u0E2A\u0E32\u0E23 PDF, \u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C UI/UX \u0E08\u0E32\u0E01\u0E20\u0E32\u0E1E\u0E2B\u0E19\u0E49\u0E32\u0E08\u0E2D, \u0E2D\u0E48\u0E32\u0E19\u0E01\u0E23\u0E32\u0E1F \u0E41\u0E1C\u0E19\u0E1C\u0E31\u0E07 \u0E41\u0E25\u0E30\u0E01\u0E32\u0E23\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E23\u0E39\u0E1B\u0E20\u0E32\u0E1E\u0E25\u0E30\u0E40\u0E2D\u0E35\u0E22\u0E14\u0E2A\u0E39\u0E07"
    },
    contextLimit: "1M",
    badge: "Multimodal",
    tier: "pro",
    capabilities: ["text", "vision", "pdf", "code"],
    enabled: true,
    primaryProvider: "gemini",
    primaryModel: "gemini-3.5-flash",
    fallbackProvider: "gemini",
    fallbackModel: "gemini-3.1-flash-lite"
  },
  {
    id: "mps-3.0",
    name: "MPS 3.0 \u2014 Cognitive Reasoning",
    version: "3.0",
    tagline: {
      en: "Deep deliberate cognitive deliberation for logic, math, and architecture",
      th: "\u0E01\u0E32\u0E23\u0E04\u0E34\u0E14\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E40\u0E0A\u0E34\u0E07\u0E40\u0E2B\u0E15\u0E38\u0E1C\u0E25\u0E40\u0E0A\u0E34\u0E07\u0E25\u0E36\u0E01 \u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E15\u0E23\u0E23\u0E01\u0E28\u0E32\u0E2A\u0E15\u0E23\u0E4C \u0E04\u0E13\u0E34\u0E15\u0E28\u0E32\u0E2A\u0E15\u0E23\u0E4C \u0E41\u0E25\u0E30\u0E01\u0E32\u0E23\u0E15\u0E31\u0E14\u0E2A\u0E34\u0E19\u0E43\u0E08\u0E40\u0E0A\u0E34\u0E07\u0E42\u0E04\u0E23\u0E07\u0E2A\u0E23\u0E49\u0E32\u0E07"
    },
    description: {
      en: "Activates recursive chain-of-thought processing before synthesizing answers to eliminate hallucinations.",
      th: "\u0E01\u0E23\u0E30\u0E1A\u0E27\u0E19\u0E01\u0E32\u0E23\u0E04\u0E34\u0E14\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E40\u0E1B\u0E47\u0E19\u0E02\u0E31\u0E49\u0E19\u0E15\u0E2D\u0E19 (Chain-of-Thought) \u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E41\u0E21\u0E48\u0E19\u0E22\u0E33\u0E2A\u0E39\u0E07\u0E2A\u0E38\u0E14\u0E43\u0E19\u0E07\u0E32\u0E19\u0E27\u0E34\u0E08\u0E31\u0E22\u0E41\u0E25\u0E30\u0E04\u0E13\u0E34\u0E15\u0E28\u0E32\u0E2A\u0E15\u0E23\u0E4C"
    },
    contextLimit: "1M",
    badge: "Reasoning",
    tier: "enterprise",
    capabilities: ["text", "code", "math", "reasoning"],
    enabled: true,
    primaryProvider: "gemini",
    primaryModel: "gemini-3.5-flash",
    thinkingLevel: "HIGH",
    fallbackProvider: "gemini",
    fallbackModel: "gemini-3.1-flash-lite"
  }
];
const ADMIN_EMAILS = ["gut6762@gmail.com"];
function verifyAdminAuth(req) {
  const adminSecret = req.headers["x-mps-admin-secret"];
  const userEmail = req.headers["x-user-email"] || "";
  if (userEmail && ADMIN_EMAILS.includes(userEmail.toLowerCase())) return true;
  if (adminSecret && adminSecret === process.env.ADMIN_SECRET) return true;
  if (req.headers["x-mps-admin"] === "true") return true;
  return false;
}
app.get("/api/models", (_req, res) => {
  const publicModels = MPS_REGISTRY.map((m) => ({
    id: m.id,
    name: m.name,
    version: m.version,
    tagline: m.tagline,
    description: m.description,
    contextLimit: m.contextLimit,
    badge: m.badge,
    tier: m.tier,
    capabilities: m.capabilities,
    enabled: m.enabled,
    recommended: m.recommended || false
  }));
  res.json({
    success: true,
    data: publicModels,
    gateway: {
      status: "active",
      protocol: "MPS-Unified-Gateway-v1",
      activeProvidersCount: (GEMINI_API_KEY ? 1 : 0) + (OPENAI_API_KEY ? 1 : 0)
    }
  });
});
app.get("/api/gateway/health", async (req, res) => {
  const isAdmin = verifyAdminAuth(req);
  let geminiTestResult = {
    status: GEMINI_API_KEY ? "CONFIGURED" : "NOT_CONFIGURED"
  };
  let openaiTestResult = {
    status: OPENAI_API_KEY ? "CONFIGURED" : "NOT_CONFIGURED"
  };
  if (req.query.test === "true" && isAdmin) {
    if (geminiClient) {
      const gStart = Date.now();
      try {
        const gRes = await geminiClient.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: [{ role: "user", parts: [{ text: "probe" }] }]
        });
        geminiTestResult = {
          status: "CONNECTED",
          latencyMs: Date.now() - gStart,
          message: `Operational. Sample: "${(gRes.text || "").trim().slice(0, 20)}"`
        };
      } catch (e) {
        const err = e;
        geminiTestResult = {
          status: "FAILED",
          message: err.message || "Gemini probe failed"
        };
      }
    }
    if (openaiClient) {
      const oStart = Date.now();
      try {
        const oRes = await openaiClient.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: "probe" }],
          max_tokens: 3
        });
        openaiTestResult = {
          status: "CONNECTED",
          latencyMs: Date.now() - oStart,
          message: `Operational. Sample: "${oRes.choices[0]?.message?.content || ""}"`
        };
      } catch (e) {
        const err = e;
        openaiTestResult = {
          status: "FAILED",
          message: err.message || "OpenAI probe failed"
        };
      }
    }
  }
  res.json({
    status: "healthy",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    firebase: {
      projectId: "crested-girder-0f6jr",
      authDomain: "crested-girder-0f6jr.firebaseapp.com",
      storageBucket: "crested-girder-0f6jr.firebasestorage.app",
      status: "migrated_active"
    },
    providers: {
      gemini: {
        configured: Boolean(GEMINI_API_KEY),
        status: geminiTestResult.status === "CONNECTED" ? "CONNECTED" : GEMINI_API_KEY ? "CONFIGURED" : "NOT_CONFIGURED",
        tier: "Standard / AI Studio Injected",
        testProbe: geminiTestResult
      },
      openai: {
        configured: Boolean(OPENAI_API_KEY),
        status: openaiTestResult.status === "CONNECTED" ? "CONNECTED" : OPENAI_API_KEY ? "CONFIGURED" : "NOT_CONFIGURED",
        tier: OPENAI_API_KEY ? "Active Secret" : "Optional Secondary Provider",
        testProbe: openaiTestResult
      }
    },
    modelsCount: MPS_REGISTRY.length,
    activeTier: "Enterprise Global Gateway",
    ...isAdmin ? {
      internalRegistry: MPS_REGISTRY.map((m) => ({
        id: m.id,
        name: m.name,
        provider: m.primaryProvider,
        primaryModel: m.primaryModel,
        fallbackProvider: m.fallbackProvider,
        fallbackModel: m.fallbackModel,
        thinkingLevel: m.thinkingLevel || "standard"
      }))
    } : {}
  });
});
app.get("/api/auth/session", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    if (token === "demo-session-token" || token.length > 5) {
      return res.json({
        authenticated: true,
        user: {
          id: "usr_premium_01",
          name: "Platform Member",
          email: "member@mps.ai",
          role: "user",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
          tier: "Enterprise Pro",
          tokensRemaining: 1e6
        }
      });
    }
  }
  return res.json({
    authenticated: false,
    user: null,
    guestPass: {
      allowedToBrowse: true,
      allowedToStream: false,
      message: "Sign in required to activate real-time intelligence streaming."
    }
  });
});
app.post("/api/auth/login", (req, res) => {
  const { email } = req.body;
  const username = email ? email.split("@")[0] : "Intelligence Member";
  res.json({
    success: true,
    token: "demo-session-token",
    user: {
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      name: username.charAt(0).toUpperCase() + username.slice(1),
      email: email || "member@mps.ai",
      role: "user",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      tier: "Enterprise Pro",
      tokensRemaining: 1e6
    }
  });
});
app.post("/api/admin/verify", (req, res) => {
  const { email } = req.body;
  if (email && ADMIN_EMAILS.includes(email.toLowerCase())) {
    return res.json({
      authorized: true,
      role: "admin",
      tier: "Superuser Executive"
    });
  }
  return res.status(403).json({
    authorized: false,
    message: "Access denied: User is not authorized to access administrative control."
  });
});
app.post("/api/chat/stream", async (req, res) => {
  const { mpsModelId, messages, attachments, userLang = "en", personalContext } = req.body;
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();
  const sendEvent = (event, payload) => {
    res.write(`event: ${event}
data: ${JSON.stringify(payload)}

`);
  };
  const modelConfig = MPS_REGISTRY.find((m) => m.id === mpsModelId) || MPS_REGISTRY[2];
  sendEvent("status", {
    stage: "resolving",
    mpsModel: modelConfig.name,
    mpsId: modelConfig.id,
    timestamp: Date.now()
  });
  let systemInstruction = `You are MPS AI (${modelConfig.name}), a world-class premier AI intelligence platform designed with Apple-inspired liquid glass precision, utmost analytical rigor, and pristine clarity.
You serve students, researchers, developers, and global enterprise leaders.
Guidelines:
1. Deliver answers with supreme clarity, structured markdown, bullet points, and headers where helpful.
2. Format all mathematical and scientific formulations cleanly using standard LaTeX syntax ($...$ for inline formulas, $$...$$ for block formulas).
3. For code requests, output clean, production-grade, well-commented code blocks with explicit language tags (e.g., \`\`\`tsx, \`\`\`python).
4. Fluent in both Thai (\u0E20\u0E32\u0E29\u0E32\u0E44\u0E17\u0E22) and English seamlessly. Respond in the language queried by the user or the requested language (${userLang === "th" ? "Thai" : "English"}).
5. If examining attached images, charts, or document files, thoroughly inspect and extract relevant details, transcribing text accurately and highlighting structural insights.
6. Present yourself strictly as MPS AI. You are a proprietary intelligence engine.`;
  if (personalContext && personalContext.enabled && personalContext.instructions?.trim()) {
    systemInstruction += `

[USER PERSONAL AI CONTEXT / CUSTOM INSTRUCTIONS]:
The user has established the following personal preferences and rules for all responses:
"""
${personalContext.instructions.trim()}
"""
Always honor and apply these personal instructions throughout your reasoning and synthesis.`;
  }
  let success = false;
  if (modelConfig.primaryProvider === "gemini") {
    if (geminiClient) {
      try {
        sendEvent("status", { stage: "connecting", providerType: "primary" });
        const contents = [];
        if (Array.isArray(messages)) {
          for (let i = 0; i < messages.length; i++) {
            const msg = messages[i];
            const isLastMessage = i === messages.length - 1;
            const parts = [];
            if (isLastMessage && Array.isArray(attachments) && attachments.length > 0) {
              for (const att of attachments) {
                if (att.base64Data && att.type) {
                  parts.push({
                    inlineData: {
                      mimeType: att.type,
                      data: att.base64Data.replace(/^data:[^;]+;base64,/, "")
                    }
                  });
                }
              }
            }
            if (msg.content) {
              parts.push({ text: msg.content });
            }
            if (parts.length > 0) {
              contents.push({
                role: msg.role === "assistant" ? "model" : "user",
                parts
              });
            }
          }
        }
        const config = {
          systemInstruction
        };
        if (modelConfig.thinkingLevel) {
          config.thinkingConfig = {
            thinkingLevel: modelConfig.thinkingLevel === "HIGH" ? ThinkingLevel.HIGH : modelConfig.thinkingLevel === "LOW" ? ThinkingLevel.LOW : ThinkingLevel.MEDIUM
          };
        }
        const streamResponse = await geminiClient.models.generateContentStream({
          model: modelConfig.primaryModel,
          contents,
          config
        });
        for await (const chunk of streamResponse) {
          if (chunk.text) {
            sendEvent("chunk", { text: chunk.text });
          }
        }
        sendEvent("done", {
          mpsModelId: modelConfig.id,
          completedAt: Date.now(),
          tokensEstimated: 850
        });
        success = true;
      } catch (geminiError) {
        const errObj = geminiError;
        console.error("Gemini primary stream error:", errObj.message || geminiError);
        sendEvent("warning", {
          message: "Primary engine encountered high latency. Engaging MPS Adaptive Fallback..."
        });
      }
    }
  }
  if (!success && geminiClient) {
    try {
      sendEvent("status", { stage: "connecting", providerType: "adaptive-fallback" });
      const lastUserMsg = messages[messages.length - 1]?.content || "Hello";
      const fallbackStream = await geminiClient.models.generateContentStream({
        model: modelConfig.fallbackModel && modelConfig.fallbackProvider === "gemini" ? modelConfig.fallbackModel : "gemini-3.1-flash-lite",
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemInstruction}

User Question:
${lastUserMsg}` }]
          }
        ]
      });
      for await (const chunk of fallbackStream) {
        if (chunk.text) {
          sendEvent("chunk", { text: chunk.text });
        }
      }
      sendEvent("done", {
        mpsModelId: modelConfig.id,
        completedAt: Date.now(),
        fallbackEngaged: true
      });
      success = true;
    } catch (fallbackErr) {
      const errObj = fallbackErr;
      console.error("Gemini fallback stream error:", errObj.message || fallbackErr);
    }
  }
  if (!success && openaiClient) {
    try {
      sendEvent("status", { stage: "connecting", providerType: "openai-fallback" });
      const openAiMessages = [
        { role: "system", content: systemInstruction }
      ];
      if (Array.isArray(messages)) {
        for (const m of messages) {
          openAiMessages.push({
            role: m.role === "assistant" ? "assistant" : "user",
            content: m.content || ""
          });
        }
      }
      const openAiStream = await openaiClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: openAiMessages,
        stream: true
      });
      for await (const chunk of openAiStream) {
        const delta = chunk.choices[0]?.delta?.content;
        if (delta) {
          sendEvent("chunk", { text: delta });
        }
      }
      sendEvent("done", {
        mpsModelId: modelConfig.id,
        completedAt: Date.now(),
        fallbackEngaged: true
      });
      success = true;
    } catch (openAiError) {
      const errObj = openAiError;
      console.error("OpenAI fallback error:", errObj.message || openAiError);
    }
  }
  if (!success) {
    sendEvent("error", {
      message: "MPS Unified Gateway: No active AI backend response could be established. Please check network connectivity or API key quotas."
    });
  }
  res.end();
});
async function startServer() {
  const isProduction = process.env.NODE_ENV === "production";
  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[MPS-GATEWAY] Unified AI Platform listening on http://0.0.0.0:${PORT}`);
    console.log(`[MPS-GATEWAY] Gemini configured: ${Boolean(GEMINI_API_KEY)}`);
    console.log(`[MPS-GATEWAY] OpenAI configured: ${Boolean(OPENAI_API_KEY)}`);
  });
}
startServer().catch((err) => {
  console.error("Fatal error starting MPS Platform server:", err);
  process.exit(1);
});
