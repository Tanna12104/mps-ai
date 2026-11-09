import type { Request, Response } from 'express';
import { MPS_REGISTRY, getGeminiApiKey, getOpenAIApiKey, getGeminiClient } from '../../server/gateway';

export default async function handler(req: Request, res: Response) {
  const geminiKey = getGeminiApiKey();
  const openaiKey = getOpenAIApiKey();

  let geminiProbe: { status: string; latencyMs?: number; message?: string } = {
    status: geminiKey ? 'CONFIGURED' : 'NOT_CONFIGURED',
  };

  if (req.query.test === 'true') {
    const { client } = getGeminiClient();
    if (client) {
      try {
        const start = Date.now();
        const probeRes = await client.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: 'probe',
        });
        geminiProbe = {
          status: 'CONNECTED',
          latencyMs: Date.now() - start,
          message: probeRes.text?.slice(0, 30) || 'Operational',
        } as { status: string; latencyMs?: number; message?: string };
      } catch (err: unknown) {
        const e = err as { message?: string };
        geminiProbe = {
          status: 'FAILED',
          message: e.message || 'Probe error',
        };
      }
    }
  }

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    firebase: {
      projectId: 'crested-girder-0f6jr',
      authDomain: 'crested-girder-0f6jr.firebaseapp.com',
      storageBucket: 'crested-girder-0f6jr.firebasestorage.app',
      status: 'migrated_active',
    },
    providers: {
      gemini: {
        configured: Boolean(geminiKey),
        status: geminiProbe.status,
        tier: 'Standard / AI Studio Injected',
      },
      openai: {
        configured: Boolean(openaiKey),
        status: openaiKey ? 'CONFIGURED' : 'NOT_CONFIGURED',
        tier: 'Secondary / Fallback Engine',
      },
    },
    modelsCount: MPS_REGISTRY.length,
    activeTier: 'Enterprise Global Gateway',
  });
}
