import React, { useState, useEffect } from 'react';
import { Conversation, GatewayHealth, UserSession } from '../types';
import { Language, translations } from '../utils/translations';
import {
  X,
  Palette,
  Globe,
  Activity,
  Database,
  Moon,
  Sun,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Cpu,
  LogOut,
  RefreshCw,
  Server,
  Sliders,
  Sparkles,
  Check,
} from 'lucide-react';

export interface PersonalAIContext {
  enabled: boolean;
  instructions: string;
  responseStyle?: 'concise' | 'balanced' | 'comprehensive';
  targetAudience?: 'general' | 'developer' | 'executive' | 'student';
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSetLang: (lang: Language) => void;
  isDark: boolean;
  onToggleDark: () => void;
  user: UserSession | null;
  onLogout: () => void;
  conversations: Conversation[];
  activeConversation: Conversation | null;
  onClearAll: () => void;
  personalContext: PersonalAIContext;
  onUpdatePersonalContext: (ctx: PersonalAIContext) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  lang,
  onSetLang,
  isDark,
  onToggleDark,
  user,
  onLogout,
  conversations,
  activeConversation,
  onClearAll,
  personalContext,
  onUpdatePersonalContext,
}) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'appearance' | 'context' | 'gateway' | 'data'>('appearance');
  const [gatewayData, setGatewayData] = useState<GatewayHealth | null>(null);
  const [isLoadingGateway, setIsLoadingGateway] = useState(false);

  // Local draft for personal context
  const [contextDraft, setContextDraft] = useState<PersonalAIContext>(personalContext);
  const [isSavedPrompt, setIsSavedPrompt] = useState(false);

  useEffect(() => {
    setContextDraft(personalContext);
  }, [personalContext]);

  useEffect(() => {
    if (isOpen && activeTab === 'gateway') {
      fetchGatewayHealth();
    }
  }, [isOpen, activeTab]);

  const fetchGatewayHealth = async () => {
    setIsLoadingGateway(true);
    try {
      const res = await fetch('/api/gateway/health');
      const data = await res.json();
      setGatewayData(data);
    } catch (e) {
      console.error('Failed to load gateway status', e);
    } finally {
      setIsLoadingGateway(false);
    }
  };

  const handleSaveContext = () => {
    onUpdatePersonalContext(contextDraft);
    setIsSavedPrompt(true);
    setTimeout(() => setIsSavedPrompt(false), 2000);
  };

  const handleClearContext = () => {
    const emptyCtx: PersonalAIContext = {
      enabled: false,
      instructions: '',
      responseStyle: 'balanced',
      targetAudience: 'general',
    };
    setContextDraft(emptyCtx);
    onUpdatePersonalContext(emptyCtx);
  };

  const applyPresetTemplate = (text: string) => {
    setContextDraft((prev) => ({
      ...prev,
      enabled: true,
      instructions: text,
    }));
  };

  if (!isOpen) return null;

  // Export conversations to JSON
  const exportAllJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(conversations, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `mps_ai_conversations_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export active conversation to Markdown
  const exportCurrentMarkdown = () => {
    if (!activeConversation) return;

    let md = `# ${activeConversation.title}\n`;
    md += `*Exported from MPS AI on ${new Date().toLocaleString()}*\n\n---\n\n`;

    activeConversation.messages.forEach((m) => {
      const speaker = m.role === 'user' ? 'User' : `MPS AI (${m.mpsModelId || 'Engine'})`;
      md += `### ${speaker} (${new Date(m.timestamp).toLocaleTimeString()})\n\n`;
      md += `${m.content}\n\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', url);
    downloadAnchor.setAttribute(
      'download',
      `${activeConversation.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.md`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl rounded-3xl liquid-glass-floating glass-reflection border border-white/30 dark:border-white/10 p-5 sm:p-7 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-4 mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            {t.settingsTitle}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-1 p-1 rounded-2xl liquid-glass-subtle mb-4 border border-black/5 dark:border-white/10 overflow-x-auto">
          <button
            onClick={() => setActiveTab('appearance')}
            className={`flex-1 min-w-[90px] flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'appearance'
                ? 'liquid-glass text-blue-600 dark:text-blue-400 shadow-sm border border-blue-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>{t.appearance}</span>
          </button>

          <button
            onClick={() => setActiveTab('context')}
            className={`flex-1 min-w-[130px] flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'context'
                ? 'liquid-glass text-blue-600 dark:text-blue-400 shadow-sm border border-blue-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>{lang === 'th' ? 'บริบทการตอบ AI' : 'AI Instructions'}</span>
          </button>

          <button
            onClick={() => setActiveTab('gateway')}
            className={`flex-1 min-w-[90px] flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'gateway'
                ? 'liquid-glass text-blue-600 dark:text-blue-400 shadow-sm border border-blue-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>{t.gatewayTab}</span>
          </button>

          <button
            onClick={() => setActiveTab('data')}
            className={`flex-1 min-w-[90px] flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'data'
                ? 'liquid-glass text-blue-600 dark:text-blue-400 shadow-sm border border-blue-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>{t.dataPrivacy}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {/* 1. Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-4">
              {/* Theme Toggle */}
              <div className="p-4 rounded-2xl liquid-glass-subtle border border-black/5 dark:border-white/10 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-sm text-slate-900 dark:text-white block">
                    {t.theme}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {isDark ? 'Dark Mode (Apple Space Gray)' : 'Light Mode (Apple Frosted Glass)'}
                  </span>
                </div>
                <button
                  onClick={onToggleDark}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl liquid-glass hover:bg-black/5 dark:hover:bg-white/5 border border-white/20 dark:border-white/10 text-xs font-semibold cursor-pointer"
                >
                  {isDark ? (
                    <>
                      <Sun className="w-4 h-4 text-amber-400" />
                      <span>{t.light}</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 text-indigo-500" />
                      <span>{t.dark}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Language Selection */}
              <div className="p-4 rounded-2xl liquid-glass-subtle border border-black/5 dark:border-white/10 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-sm text-slate-900 dark:text-white block">
                    {t.language}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {lang === 'th' ? 'ภาษาไทย (ค่าเริ่มต้น)' : 'English (US)'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onSetLang('en')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                      lang === 'en'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'hover:bg-black/5 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => onSetLang('th')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                      lang === 'th'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'hover:bg-black/5 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    ไทย (TH)
                  </button>
                </div>
              </div>

              {/* User Account / Session */}
              {user && (
                <div className="p-4 rounded-2xl liquid-glass-subtle border border-black/5 dark:border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/30"
                    />
                    <div>
                      <span className="font-semibold text-sm text-slate-900 dark:text-white block">
                        {user.name}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {user.email} • {user.tier}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t.signOut}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 2. Personal AI Context Tab (Task 6) */}
          {activeTab === 'context' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl liquid-glass-subtle border border-black/5 dark:border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-sm text-slate-900 dark:text-white block">
                      {lang === 'th' ? 'เปิดใช้งานบริบทส่วนบุคคล' : 'Enable Personal Instructions'}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {lang === 'th'
                        ? 'แนบคำสั่งนี้ไปกับทุกคำตอบของ AI โดยอัตโนมัติ'
                        : 'Automatically inject these custom rules into every AI query.'}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      setContextDraft((prev) => ({ ...prev, enabled: !prev.enabled }))
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      contextDraft.enabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        contextDraft.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Textarea for Custom Instructions */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {lang === 'th'
                      ? 'คุณต้องการให้ AI ตอบคำถามในลักษณะใด? (สไตล์, ภาษา, โค้ด, กรอบความคิด)'
                      : 'How would you like MPS AI to respond? (Style, constraints, tone, format)'}
                  </label>
                  <textarea
                    value={contextDraft.instructions}
                    onChange={(e) =>
                      setContextDraft((prev) => ({ ...prev, instructions: e.target.value }))
                    }
                    rows={4}
                    placeholder={
                      lang === 'th'
                        ? 'เช่น: ตอบคำถามอย่างกระชับ ตรงประเด็น, ใช้ภาษาไทยที่สุภาพ, หากเป็นโค้ดให้เขียนเป็น TypeScript เท่านั้น พร้อมคอมเมนต์อธิบายสั้น ๆ'
                        : 'E.g., Be concise and direct, write code exclusively in TypeScript, provide bulleted action items, avoid conversational filler.'
                    }
                    className="w-full p-3 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-black/10 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                  />
                </div>

                {/* Preset Fast Chips */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                    {lang === 'th' ? 'เทมเพลตด่วนแนะนำ:' : 'Quick Presets:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        applyPresetTemplate(
                          lang === 'th'
                            ? 'ตอบอย่างกระชับ ชัดเจน ตรงประเด็น สรุปเป็นข้อ ๆ ไม่ต้องมีบทนำหรือบทสรุปเยิ่นเย้อ'
                            : 'Be concise, precise, and highly structured with bullet points. Omit conversational pleasantries.'
                        )
                      }
                      className="px-2.5 py-1 rounded-lg liquid-glass hover:bg-black/5 dark:hover:bg-white/5 text-[11px] text-slate-600 dark:text-slate-300 border border-black/5 dark:border-white/10 cursor-pointer"
                    >
                      ⚡ {lang === 'th' ? 'กระชับตรงประเด็น' : 'Ultra Concise'}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        applyPresetTemplate(
                          lang === 'th'
                            ? 'ทำหน้าที่เป็น Senior Software Engineer เขียนโค้ดคุณภาพสูง Clean Code พร้อมบอก Trade-offs'
                            : 'Act as a Principal Software Engineer. Provide production-ready, clean code and highlight architectural trade-offs.'
                        )
                      }
                      className="px-2.5 py-1 rounded-lg liquid-glass hover:bg-black/5 dark:hover:bg-white/5 text-[11px] text-slate-600 dark:text-slate-300 border border-black/5 dark:border-white/10 cursor-pointer"
                    >
                      💻 {lang === 'th' ? 'วิศวกรซอฟต์แวร์' : 'Senior Engineer'}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        applyPresetTemplate(
                          lang === 'th'
                            ? 'อธิบายอย่างละเอียดเป็นขั้นตอน (Step-by-step) พร้อมตัวอย่างที่เข้าใจง่ายสำหรับผู้เริ่มต้น'
                            : 'Explain step-by-step with clear real-world examples and intuitive analogies.'
                        )
                      }
                      className="px-2.5 py-1 rounded-lg liquid-glass hover:bg-black/5 dark:hover:bg-white/5 text-[11px] text-slate-600 dark:text-slate-300 border border-black/5 dark:border-white/10 cursor-pointer"
                    >
                      🎓 {lang === 'th' ? 'การศึกษาเชิงลึก' : 'Educator & Tutor'}
                    </button>
                  </div>
                </div>

                {/* Save & Reset Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/10">
                  <button
                    onClick={handleClearContext}
                    className="text-xs text-slate-500 hover:text-rose-500 transition-colors cursor-pointer"
                  >
                    {lang === 'th' ? 'ล้างค่าเริ่มต้น' : 'Reset to Default'}
                  </button>
                  <button
                    onClick={handleSaveContext}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-500/20 cursor-pointer transition-all"
                  >
                    {isSavedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>{isSavedPrompt ? (lang === 'th' ? 'บันทึกแล้ว' : 'Saved') : (lang === 'th' ? 'บันทึกบริบท' : 'Save Instructions')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. Gateway Tab */}
          {activeTab === 'gateway' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {t.providerStatus}
                </span>
                <button
                  onClick={fetchGatewayHealth}
                  className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingGateway ? 'animate-spin' : ''}`} />
                  <span>Refresh Status</span>
                </button>
              </div>

              {gatewayData ? (
                <>
                  {/* Firebase Project Card */}
                  <div className="p-3.5 rounded-2xl liquid-glass-subtle border border-black/5 dark:border-white/10 mb-3 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-xs text-slate-900 dark:text-white block">
                        Firebase Project: crested-girder-0f6jr
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Auth Domain: crested-girder-0f6jr.firebaseapp.com • Cloud Firestore: Connected
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                      Connected
                    </span>
                  </div>

                  {/* Providers Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Gemini Provider */}
                    <div className="p-3.5 rounded-2xl liquid-glass-subtle border border-black/5 dark:border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Server className="w-3.5 h-3.5 text-blue-500" />
                          Google Gemini Engine
                        </span>
                        {gatewayData.providers.gemini.configured ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            Connected
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                            <AlertCircle className="w-3 h-3" />
                            Key Required
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {gatewayData.providers.gemini.configured
                          ? 'Operational via @google/genai SDK with streaming & multimodal support.'
                          : 'Configure GEMINI_API_KEY in Settings > Secrets to activate.'}
                      </p>
                    </div>

                    {/* OpenAI Provider */}
                    <div className="p-3.5 rounded-2xl liquid-glass-subtle border border-black/5 dark:border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 text-purple-500" />
                          OpenAI Unified Gateway
                        </span>
                        {gatewayData.providers.openai.configured ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            Connected
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full">
                            Optional Fallback
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {gatewayData.providers.openai.configured
                          ? 'Configured for high-speed fallback & reasoning models.'
                          : 'Add OPENAI_API_KEY in backend secrets to enable multi-cloud redundancy.'}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-xs text-slate-400">
                  Loading gateway configuration...
                </div>
              )}
            </div>
          )}

          {/* 4. Data & Privacy Tab */}
          {activeTab === 'data' && (
            <div className="space-y-4">
              {/* Export All */}
              <div className="p-4 rounded-2xl liquid-glass-subtle border border-black/5 dark:border-white/10 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-sm text-slate-900 dark:text-white block">
                    {t.exportChats}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Download complete conversation history as JSON
                  </span>
                </div>
                <button
                  onClick={exportAllJSON}
                  disabled={conversations.length === 0}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download JSON</span>
                </button>
              </div>

              {/* Export Current Markdown */}
              {activeConversation && (
                <div className="p-4 rounded-2xl liquid-glass-subtle border border-black/5 dark:border-white/10 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-sm text-slate-900 dark:text-white block">
                      {t.exportMarkdown}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Export active chat as formatted Markdown (.md)
                    </span>
                  </div>
                  <button
                    onClick={exportCurrentMarkdown}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl liquid-glass hover:bg-black/5 dark:hover:bg-white/5 border border-white/20 dark:border-white/10 text-xs font-semibold cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download MD</span>
                  </button>
                </div>
              )}

              {/* Clear History */}
              <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-sm text-rose-600 dark:text-rose-400 block">
                    {t.clearHistory}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Delete local conversation index and stored chats
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm(t.clearAllConfirm)) {
                      onClearAll();
                      onClose();
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Wipe All</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
