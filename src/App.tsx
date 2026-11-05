import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatComposer } from './components/ChatComposer';
import { ChatMessage } from './components/ChatMessage';
import { AuthModal } from './components/AuthModal';
import { SettingsModal } from './components/SettingsModal';
import { AttachmentPreviewModal } from './components/AttachmentPreviewModal';
import { LandingPage } from './components/LandingPage';
import { AdminRoutePage } from './components/AdminRoutePage';
import { Attachment, Conversation, Message, MPSModel, UserSession } from './types';
import { PersonalAIContext } from './components/SettingsModal';
import { Language, translations } from './utils/translations';
import {
  auth,
  db,
  isUserAdmin,
  syncUserProfile,
  handleFirestoreError,
  OperationType,
} from './lib/firebase';
import { onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  Sparkles,
  Code2,
  FileSearch,
  BrainCircuit,
  TrendingUp,
  ArrowDown,
  LayoutDashboard,
} from 'lucide-react';

// Default Initial MPS Models
const DEFAULT_MPS_MODELS: MPSModel[] = [
  {
    id: 'mps-1.0',
    name: 'MPS 1.0 — Fast',
    version: '1.0',
    tagline: {
      en: 'Instant ultra-low latency intelligence for rapid daily tasks',
      th: 'การประมวลผลความเร็วสูงพิเศษ เหมาะสำหรับงานด่วนและถามตอบทันที',
    },
    description: {
      en: 'Engineered for sub-second responses, summarization, and immediate dialogue.',
      th: 'ออกแบบมาเพื่อความเร็วสูงสุด การสรุปความ และการตอบคำถามในเสี้ยววินาที',
    },
    contextLimit: '128K',
    badge: 'Ultra Fast',
    tier: 'free',
    capabilities: ['text', 'code'],
    enabled: true,
  },
  {
    id: 'mps-1.5',
    name: 'MPS 1.5 — Balanced',
    version: '1.5',
    tagline: {
      en: 'Balanced multi-domain intelligence for writing and problem solving',
      th: 'ระบบปัญญาประดิษฐ์สมดุลรอบด้าน สำหรับงานเขียนและแก้ไขปัญหา',
    },
    description: {
      en: 'Superb balance of speed, depth, and creative comprehension across Thai and English.',
      th: 'ความสมดุลที่ยอดเยี่ยมระหว่างความเร็วและคุณภาพ รองรับทั้งภาษาไทยและอังกฤษ',
    },
    contextLimit: '256K',
    badge: 'Popular',
    tier: 'free',
    capabilities: ['text', 'code', 'math'],
    enabled: true,
  },
  {
    id: 'mps-2.0',
    name: 'MPS 2.0 — Advanced',
    version: '2.0',
    tagline: {
      en: 'Flagship enterprise architecture, high-order coding and synthesis',
      th: 'ระบบสถาปัตยกรรมระดับองค์กร สำหรับการเขียนโค้ดขั้นสูงและการสังเคราะห์เชิงลึก',
    },
    description: {
      en: 'Unmatched performance for complex software engineering and executive analysis.',
      th: 'ประสิทธิภาพสูงสุดสำหรับการพัฒนาซอฟต์แวร์และการวิเคราะห์เชิงกลยุทธ์',
    },
    contextLimit: '1M',
    badge: 'Flagship',
    tier: 'pro',
    recommended: true,
    capabilities: ['text', 'code', 'vision', 'math', 'reasoning'],
    enabled: true,
  },
  {
    id: 'mps-2.5',
    name: 'MPS 2.5 — Vision & Docs',
    version: '2.5',
    tagline: {
      en: 'High-precision document inspection, diagram parsing, and multimodal vision',
      th: 'การวิเคราะห์เอกสาร แผนภาพ แปลงภาพถ่าย และทำความเข้าใจสื่อหลายมิติ',
    },
    description: {
      en: 'Deep visual OCR, UI screenshot debugging, and multi-page PDF processing.',
      th: 'การอ่านเอกสาร PDF, วิเคราะห์ UI/UX จากภาพหน้าจอ และอ่านกราฟแผนภาพ',
    },
    contextLimit: '1M',
    badge: 'Multimodal',
    tier: 'pro',
    capabilities: ['text', 'vision', 'pdf', 'code'],
    enabled: true,
  },
  {
    id: 'mps-3.0',
    name: 'MPS 3.0 — Cognitive Reasoning',
    version: '3.0',
    tagline: {
      en: 'Deep deliberate cognitive deliberation for logic, math, and architecture',
      th: 'การคิดวิเคราะห์เชิงเหตุผลเชิงลึก สำหรับตรรกศาสตร์และคณิตศาสตร์',
    },
    description: {
      en: 'Activates recursive chain-of-thought processing before synthesizing answers.',
      th: 'กระบวนการคิดวิเคราะห์อย่างเป็นขั้นตอนเพื่อความแม่นยำสูงสุด',
    },
    contextLimit: '1M',
    badge: 'Reasoning',
    tier: 'enterprise',
    capabilities: ['text', 'code', 'math', 'reasoning'],
    enabled: true,
  },
];

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('mps_theme');
    if (saved) return saved === 'dark';
    return true; // Sleek Apple dark mode default
  });

  // Language state
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('mps_lang') as Language;
    return saved || 'en';
  });

  const t = translations[lang];

  // View mode: 'landing', 'chat', or 'admin'
  const [viewMode, setViewMode] = useState<'landing' | 'chat' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      if (p === '/admins' || p.startsWith('/admins/') || p === '/admin' || p.startsWith('/admin/')) {
        return 'admin';
      }
    }
    return 'landing';
  });

  // Personal AI Context instructions state
  const [personalContext, setPersonalContext] = useState<PersonalAIContext>(() => {
    try {
      const saved = localStorage.getItem('mps_personal_context');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return {
      enabled: false,
      instructions: '',
      responseStyle: 'balanced',
      targetAudience: 'general',
    };
  });

  // Listen to browser popstate for /admins or /admin route
  useEffect(() => {
    const handleLocationChange = () => {
      const p = window.location.pathname;
      if (p === '/admins' || p.startsWith('/admins/') || p === '/admin' || p.startsWith('/admin/')) {
        setViewMode('admin');
      }
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // MPS Models state
  const [models, setModels] = useState<MPSModel[]>(DEFAULT_MPS_MODELS);
  const [selectedModelId, setSelectedModelId] = useState<string>('mps-2.0');

  // Conversations state
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem('mps_conversations_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved conversations', e);
    }
    return [];
  });
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // User session state (Synced with Firebase Auth)
  const [user, setUser] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('mps_user_session');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return null;
  });

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [gatewayOnline, setGatewayOnline] = useState(true);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Stored pending draft for guest user
  const pendingPromptRef = useRef<{ content: string; attachments: Attachment[] } | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);

  // Sync theme to HTML class
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('mps_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('mps_theme', 'light');
    }
  }, [isDark]);

  // Sync lang to localStorage
  useEffect(() => {
    localStorage.setItem('mps_lang', lang);
  }, [lang]);

  // Save conversations to localStorage (local cache / offline resilient)
  useEffect(() => {
    try {
      localStorage.setItem('mps_conversations_v1', JSON.stringify(conversations));
    } catch (e) {
      console.error('Failed to persist conversations', e);
    }
  }, [conversations]);

  // Save user session
  useEffect(() => {
    if (user) {
      localStorage.setItem('mps_user_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('mps_user_session');
    }
  }, [user]);

  // Save personal context
  useEffect(() => {
    try {
      localStorage.setItem('mps_personal_context', JSON.stringify(personalContext));
      if (user && auth.currentUser) {
        setDoc(
          doc(db, 'users', auth.currentUser.uid),
          { personalContext },
          { merge: true }
        ).catch(() => {});
      }
    } catch (e) {
      console.warn('Personal context storage notice:', e);
    }
  }, [personalContext, user]);

  // Fetch live public models from backend on mount
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await fetch('/api/models');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setModels(json.data);
          }
          setGatewayOnline(true);
        }
      } catch (e) {
        console.warn('Could not contact /api/models, using fallback registry', e);
        setGatewayOnline(false);
      }
    };
    fetchModels();
  }, []);

  // Firebase Auth State Listener & Firestore Sync
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const adminCheck = isUserAdmin(fbUser.email);
        const activeUser: UserSession = {
          id: fbUser.uid,
          name: fbUser.displayName || 'Intelligence Member',
          email: fbUser.email || 'user@mps.ai',
          role: adminCheck ? 'admin' : 'user',
          avatar:
            fbUser.photoURL ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
          tier: adminCheck ? 'Enterprise Executive' : 'Enterprise Pro',
          tokensRemaining: 1000000,
        };
        setUser(activeUser);

        // Sync Firestore profile
        syncUserProfile(fbUser).catch((e) => console.warn('Firestore profile sync note:', e));

        // Attach Firestore conversations query
        try {
          const q = query(
            collection(db, 'conversations'),
            where('ownerId', '==', fbUser.uid),
            orderBy('updatedAt', 'desc')
          );

          const unsubConv = onSnapshot(
            q,
            (snapshot) => {
              if (!snapshot.empty) {
                const firestoreConvs: Conversation[] = [];
                snapshot.forEach((docSnap) => {
                  const data = docSnap.data();
                  firestoreConvs.push({
                    id: docSnap.id,
                    title: data.title || 'Conversation',
                    createdAt: data.createdAt ? new Date(data.createdAt).getTime() : Date.now(),
                    updatedAt: data.updatedAt ? new Date(data.updatedAt).getTime() : Date.now(),
                    messages: data.messages || [],
                    mpsModelId: data.mpsModelId || 'mps-2.0',
                    isPinned: data.isPinned || false,
                  });
                });
                setConversations(firestoreConvs);
                if (firestoreConvs.length > 0 && !activeConversationId) {
                  setActiveConversationId(firestoreConvs[0].id);
                }
              }
            },
            (error) => {
              console.warn('Firestore snapshot notice (local fallback retained):', error.message);
            }
          );

          return () => unsubConv();
        } catch (e) {
          console.warn('Firestore subscription notice:', e);
        }
      }
    });

    return () => unsubscribeAuth();
  }, [activeConversationId]);

  // Keyboard shortcut: Ctrl+B / Cmd+B for sidebar toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setSidebarOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto scroll to bottom
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const handleScroll = () => {
    if (chatScrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatScrollContainerRef.current;
      const atBottom = scrollHeight - scrollTop - clientHeight < 120;
      setShowScrollBottom(!atBottom);
    }
  };

  // Active conversation object
  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;

  // Create new conversation
  const createNewConversation = (): string => {
    const newId = 'conv_' + Date.now();
    const newConv: Conversation = {
      id: newId,
      title: lang === 'th' ? 'บทสนทนาใหม่' : 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      mpsModelId: selectedModelId,
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newId);

    // Save to Firestore if user logged in
    if (user && auth.currentUser) {
      setDoc(doc(db, 'conversations', newId), {
        id: newId,
        ownerId: auth.currentUser.uid,
        title: newConv.title,
        mpsModelId: selectedModelId,
        isPinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).catch((e) => console.warn('Firestore conv create notice:', e));
    }

    return newId;
  };

  // Send message flow
  const handleSendMessage = async (content: string, attachments: Attachment[] = []) => {
    // If not authenticated, prompt Auth Modal immediately (Requirement 7 & 11)
    if (!user) {
      pendingPromptRef.current = { content, attachments };
      setAuthModalOpen(true);
      return;
    }

    let targetConvId = activeConversationId;
    if (!targetConvId) {
      targetConvId = createNewConversation();
    }

    const userMessageId = 'msg_' + Date.now();
    const userMessage: Message = {
      id: userMessageId,
      role: 'user',
      content,
      timestamp: Date.now(),
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    const assistantMessageId = 'msg_ai_' + (Date.now() + 1);
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      mpsModelId: selectedModelId,
      isStreaming: true,
      statusMessage: t.thinking,
    };

    // Update conversation state
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === targetConvId) {
          const isFirstMessage = conv.messages.length === 0;
          const autoTitle = isFirstMessage
            ? content.slice(0, 32) + (content.length > 32 ? '...' : '')
            : conv.title;

          return {
            ...conv,
            title: autoTitle,
            updatedAt: Date.now(),
            messages: [...conv.messages, userMessage, assistantMessage],
          };
        }
        return conv;
      })
    );

    setTimeout(() => scrollToBottom(), 50);

    // Call backend API gateway
    setIsStreaming(true);
    abortControllerRef.current = new AbortController();

    try {
      const currentConv = conversations.find((c) => c.id === targetConvId);
      const history = (currentConv ? currentConv.messages : []).concat(userMessage);

      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer demo-session-token',
        },
        body: JSON.stringify({
          mpsModelId: selectedModelId,
          messages: history.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          attachments: attachments.map((a) => ({
            name: a.name,
            type: a.type,
            base64Data: a.base64Data,
          })),
          userLang: lang,
          personalContext,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Gateway returned HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Response stream unavailable');

      const decoder = new TextDecoder();
      let buffer = '';
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;

          const eventMatch = line.match(/^event:\s*(.+)$/m);
          const dataMatch = line.match(/^data:\s*(.+)$/m);

          const eventName = eventMatch ? eventMatch[1].trim() : 'chunk';
          const dataRaw = dataMatch ? dataMatch[1].trim() : '';

          if (!dataRaw) continue;

          try {
            const dataObj = JSON.parse(dataRaw);

            if (eventName === 'chunk') {
              accumulatedText += dataObj.text || '';
              updateAssistantMessage(targetConvId, assistantMessageId, {
                content: accumulatedText,
                statusMessage: undefined,
              });
            } else if (eventName === 'status') {
              if (dataObj.stage === 'connecting') {
                updateAssistantMessage(targetConvId, assistantMessageId, {
                  statusMessage:
                    lang === 'th'
                      ? 'กำลังเชื่อมต่อขุมพลัง MPS Intelligence...'
                      : 'Connecting to MPS Intelligence Cluster...',
                });
              }
            } else if (eventName === 'warning') {
              updateAssistantMessage(targetConvId, assistantMessageId, {
                statusMessage: dataObj.message,
              });
            } else if (eventName === 'done') {
              updateAssistantMessage(targetConvId, assistantMessageId, {
                isStreaming: false,
                statusMessage: undefined,
              });
            } else if (eventName === 'error') {
              updateAssistantMessage(targetConvId, assistantMessageId, {
                isStreaming: false,
                isError: true,
                content: dataObj.message || 'Error occurred during generation',
              });
            }
          } catch {
            accumulatedText += dataRaw;
            updateAssistantMessage(targetConvId, assistantMessageId, {
              content: accumulatedText,
            });
          }
        }
      }

      // Mark completed
      updateAssistantMessage(targetConvId, assistantMessageId, {
        isStreaming: false,
        statusMessage: undefined,
      });

      // Sync completed messages to Firestore if logged in
      if (auth.currentUser && targetConvId) {
        updateDoc(doc(db, 'conversations', targetConvId), {
          updatedAt: new Date().toISOString(),
        }).catch(() => {});
      }
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') {
        updateAssistantMessage(targetConvId, assistantMessageId, {
          isStreaming: false,
          statusMessage: undefined,
        });
      } else {
        console.error('Chat stream error:', err);
        updateAssistantMessage(targetConvId, assistantMessageId, {
          isStreaming: false,
          isError: true,
          content:
            lang === 'th'
              ? 'ไม่สามารถเชื่อมต่อกับ MPS Gateway ได้ในขณะนี้ กรุณาตรวจสอบการตั้งค่า API Key หรือลองอีกครั้ง'
              : 'MPS Gateway connection disrupted. Please ensure GEMINI_API_KEY is configured in Settings > Secrets.',
        });
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const updateAssistantMessage = (
    convId: string,
    messageId: string,
    updates: Partial<Message>
  ) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === convId) {
          return {
            ...c,
            messages: c.messages.map((m) => (m.id === messageId ? { ...m, ...updates } : m)),
          };
        }
        return c;
      })
    );
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsStreaming(false);
  };

  const handleRegenerate = () => {
    if (!activeConversation || activeConversation.messages.length === 0) return;
    const lastUserMsg = [...activeConversation.messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeConversation.id) {
            return {
              ...c,
              messages: c.messages.filter((_, idx) => idx !== c.messages.length - 1),
            };
          }
          return c;
        })
      );
      handleSendMessage(lastUserMsg.content, lastUserMsg.attachments || []);
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    if (!activeConversation) return;
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConversation.id) {
          return {
            ...c,
            messages: c.messages.filter((m) => m.id !== messageId),
          };
        }
        return c;
      })
    );
  };

  const handleEditMessage = (messageId: string, newContent: string) => {
    if (!activeConversation) return;
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConversation.id) {
          return {
            ...c,
            messages: c.messages.map((m) =>
              m.id === messageId ? { ...m, content: newContent, isEdited: true } : m
            ),
          };
        }
        return c;
      })
    );
  };

  // Auth login callback
  const handleLoginSuccess = (signedInUser: UserSession) => {
    setUser(signedInUser);
    setAuthModalOpen(false);

    if (pendingPromptRef.current) {
      const { content, attachments } = pendingPromptRef.current;
      pendingPromptRef.current = null;
      setTimeout(() => {
        handleSendMessage(content, attachments);
      }, 100);
    }
  };

  const handleLogout = async () => {
    try {
      await fbSignOut(auth);
    } catch {
      // Ignore
    }
    setUser(null);
    localStorage.removeItem('mps_user_session');
  };

  const activeModel = models.find((m) => m.id === selectedModelId) || models[0];
  const isAdmin = user?.role === 'admin';

  return (
    <div className="relative min-h-[100dvh] flex flex-col bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 selection:bg-blue-500 selection:text-white transition-colors duration-300">
      {/* Background Chromatic Mesh */}
      <div className="mesh-gradient-bg" />

      {/* VIEW MODE: ADMIN ROUTE */}
      {viewMode === 'admin' ? (
        <AdminRoutePage
          user={user}
          onOpenAuth={() => setAuthModalOpen(true)}
          onNavigateHome={() => {
            window.history.pushState({}, '', '/');
            setViewMode('landing');
          }}
          lang={lang}
        />
      ) : viewMode === 'landing' ? (
        /* VIEW MODE 1: PUBLIC LANDING PAGE & DEMO SHOWCASE */
        <LandingPage
          onStartChatting={() => setViewMode('chat')}
          onOpenAuth={() => setAuthModalOpen(true)}
          user={user}
          models={models}
          lang={lang}
          onToggleLang={() => setLang(lang === 'en' ? 'th' : 'en')}
          isDark={isDark}
          onToggleDark={() => setIsDark(!isDark)}
        />
      ) : (
        /* VIEW MODE 2: FULL-SCREEN LIQUID GLASS CHAT WORKSPACE */
        <div className="relative z-10 flex h-[100dvh] w-full overflow-hidden animate-in fade-in duration-200">
          {/* Liquid Glass Sidebar */}
          <Sidebar
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={(id) => setActiveConversationId(id)}
            onNewConversation={() => createNewConversation()}
            onDeleteConversation={(id) => {
              setConversations((prev) => prev.filter((c) => c.id !== id));
              if (activeConversationId === id) setActiveConversationId(null);
              if (auth.currentUser) {
                deleteDoc(doc(db, 'conversations', id)).catch(() => {});
              }
            }}
            onRenameConversation={(id, newTitle) => {
              setConversations((prev) =>
                prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
              );
              if (auth.currentUser) {
                updateDoc(doc(db, 'conversations', id), {
                  title: newTitle,
                  updatedAt: new Date().toISOString(),
                }).catch(() => {});
              }
            }}
            onTogglePinConversation={(id) => {
              setConversations((prev) =>
                prev.map((c) => (c.id === id ? { ...c, isPinned: !c.isPinned } : c))
              );
            }}
            onClearAllConversations={() => {
              setConversations([]);
              setActiveConversationId(null);
            }}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            lang={lang}
            user={user}
            onOpenAuth={() => setAuthModalOpen(true)}
            onOpenSettings={() => setSettingsModalOpen(true)}
          />

          {/* Chat Main Area */}
          <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
            {/* Liquid Glass Header */}
            <Header
              models={models}
              selectedModelId={selectedModelId}
              onSelectModel={(id) => setSelectedModelId(id)}
              lang={lang}
              onToggleLang={() => setLang(lang === 'en' ? 'th' : 'en')}
              isDark={isDark}
              onToggleDark={() => setIsDark(!isDark)}
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              onOpenSettings={() => setSettingsModalOpen(true)}
              onOpenAuth={() => setAuthModalOpen(true)}
              onNavigateHome={() => setViewMode('landing')}
              user={user}
              gatewayOnline={gatewayOnline}
            />

            {/* Chat Messages Scroll Container */}
            <div
              ref={chatScrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-2 sm:px-4 py-4 md:py-6 space-y-4"
            >
              {!activeConversation || activeConversation.messages.length === 0 ? (
                <div className="max-w-3xl mx-auto py-8 sm:py-14 px-4 text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 mx-auto flex items-center justify-center text-white shadow-2xl shadow-indigo-500/30 mb-6 glass-reflection border border-white/20">
                    <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
                  </div>

                  <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
                    {t.welcomeTitle}
                  </h1>
                  <p className="text-xs sm:text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed mb-8">
                    {t.welcomeSubtitle}
                  </p>

                  {/* Suggested Strategic Workflows */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-left max-w-2xl mx-auto">
                    <button
                      onClick={() =>
                        handleSendMessage(
                          lang === 'th'
                            ? 'ช่วยออกแบบสถาปัตยกรรม High-Scale Microservices พร้อมตัวอย่างโค้ดและ diagram'
                            : 'Architect a high-throughput, low-latency microservices backend in TypeScript with Redis and Kafka.'
                        )
                      }
                      className="p-4 rounded-2xl liquid-glass hover:liquid-glass-floating border border-white/20 dark:border-white/10 transition-all duration-200 cursor-pointer group text-left"
                    >
                      <div className="flex items-center gap-2 mb-1.5 text-blue-500">
                        <Code2 className="w-4 h-4" />
                        <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {t.cap1Title}
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-snug">
                        {t.cap1Desc}
                      </p>
                    </button>

                    <button
                      onClick={() =>
                        handleSendMessage(
                          lang === 'th'
                            ? 'สอนวิธีการอ่านและวิเคราะห์กราฟเอกสารการเงิน พร้อมสูตรคำนวณทางคณิตศาสตร์'
                            : 'Analyze this financial report balance sheet and compute ROI formula with KaTeX equations.'
                        )
                      }
                      className="p-4 rounded-2xl liquid-glass hover:liquid-glass-floating border border-white/20 dark:border-white/10 transition-all duration-200 cursor-pointer group text-left"
                    >
                      <div className="flex items-center gap-2 mb-1.5 text-purple-500">
                        <FileSearch className="w-4 h-4" />
                        <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {t.cap2Title}
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-snug">
                        {t.cap2Desc}
                      </p>
                    </button>

                    <button
                      onClick={() =>
                        handleSendMessage(
                          lang === 'th'
                            ? 'แก้โจทย์ปัญหาเชิงตรรกศาสตร์และความน่าจะเป็นขั้นสูง พร้อมแสดงขั้นตอนการคิดทีละสเต็ป'
                            : 'Derive Bayes theorem step-by-step with continuous variables and show full LaTeX math equations.'
                        )
                      }
                      className="p-4 rounded-2xl liquid-glass hover:liquid-glass-floating border border-white/20 dark:border-white/10 transition-all duration-200 cursor-pointer group text-left"
                    >
                      <div className="flex items-center gap-2 mb-1.5 text-rose-500">
                        <BrainCircuit className="w-4 h-4" />
                        <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {t.cap3Title}
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-snug">
                        {t.cap3Desc}
                      </p>
                    </button>

                    <button
                      onClick={() =>
                        handleSendMessage(
                          lang === 'th'
                            ? 'ร่างแผนกลยุทธ์การขยายตลาดระดับ Global สำหรับองค์กรเทคโนโลยี พร้อม KPI และตารางเปรียบเทียบ'
                            : 'Synthesize a 5-pillar global expansion strategy for enterprise AI products with risk mitigation tables.'
                        )
                      }
                      className="p-4 rounded-2xl liquid-glass hover:liquid-glass-floating border border-white/20 dark:border-white/10 transition-all duration-200 cursor-pointer group text-left"
                    >
                      <div className="flex items-center gap-2 mb-1.5 text-emerald-500">
                        <TrendingUp className="w-4 h-4" />
                        <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {t.cap4Title}
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-snug">
                        {t.cap4Desc}
                      </p>
                    </button>
                  </div>
                </div>
              ) : (
                activeConversation.messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    onRegenerate={
                      message.role === 'assistant' ? handleRegenerate : undefined
                    }
                    onDelete={handleDeleteMessage}
                    onEdit={handleEditMessage}
                    onPreviewAttachment={(att) => setPreviewAttachment(att)}
                    lang={lang}
                  />
                ))
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Scroll Down Button */}
            {showScrollBottom && (
              <button
                onClick={() => scrollToBottom()}
                className="fixed bottom-24 right-6 z-20 p-2.5 rounded-full liquid-glass-floating shadow-xl border border-white/20 text-slate-600 dark:text-slate-200 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                title="Scroll to bottom"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            )}

            {/* Chat Composer */}
            <ChatComposer
              onSendMessage={handleSendMessage}
              onStopGeneration={handleStopGeneration}
              isStreaming={isStreaming}
              activeModel={activeModel}
              lang={lang}
              isAuthenticated={Boolean(user)}
              onRequireAuth={() => setAuthModalOpen(true)}
            />
          </div>
        </div>
      )}

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        lang={lang}
      />

      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        lang={lang}
        onSetLang={(l) => setLang(l)}
        isDark={isDark}
        onToggleDark={() => setIsDark(!isDark)}
        user={user}
        onLogout={handleLogout}
        conversations={conversations}
        activeConversation={activeConversation}
        onClearAll={() => {
          setConversations([]);
          setActiveConversationId(null);
        }}
        personalContext={personalContext}
        onUpdatePersonalContext={(ctx) => setPersonalContext(ctx)}
      />

      <AttachmentPreviewModal
        attachment={previewAttachment}
        onClose={() => setPreviewAttachment(null)}
      />
    </div>
  );
}
