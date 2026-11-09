import type { Request, Response } from 'express';
import { MPS_REGISTRY, getGeminiApiKey, getOpenAIApiKey } from '../server/gateway';

export default function handler(req: Request, res: Response) {
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
    recommended: m.recommended || false,
  }));

  const geminiConfigured = Boolean(getGeminiApiKey());
  const openaiConfigured = Boolean(getOpenAIApiKey());

  res.json({
    success: true,
    data: publicModels,
    gateway: {
      status: 'active',
      protocol: 'MPS-Unified-Gateway-v1',
      activeProvidersCount: (geminiConfigured ? 1 : 0) + (openaiConfigured ? 1 : 0),
    },
  });
}
