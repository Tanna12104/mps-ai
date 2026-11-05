export type Role = 'user' | 'assistant' | 'system';

export type Capability = 'text' | 'code' | 'vision' | 'pdf' | 'reasoning' | 'math';

export type Tier = 'free' | 'pro' | 'enterprise';

export interface MPSModel {
  id: string;
  name: string;
  version: string;
  tagline: {
    en: string;
    th: string;
  };
  description: {
    en: string;
    th: string;
  };
  contextLimit: string;
  badge: string;
  tier: Tier;
  capabilities: Capability[];
  enabled: boolean;
  recommended?: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  base64Data?: string;
  isImage: boolean;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  mpsModelId?: string;
  attachments?: Attachment[];
  isStreaming?: boolean;
  isError?: boolean;
  statusMessage?: string;
  isEdited?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  mpsModelId: string;
  isPinned?: boolean;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  tier: string;
  tokensRemaining: number;
}

export interface GatewayHealth {
  status: string;
  timestamp: string;
  providers: {
    gemini: {
      configured: boolean;
      status: string;
      tier: string;
    };
    openai: {
      configured: boolean;
      status: string;
      tier: string;
    };
  };
  modelsCount: number;
  activeTier: string;
  internalRegistry?: Array<{
    id: string;
    name: string;
    provider: string;
    primaryModel: string;
    fallbackProvider?: string;
    fallbackModel?: string;
    thinkingLevel?: string;
  }>;
}
