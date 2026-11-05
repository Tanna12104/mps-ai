import React, { useState } from 'react';
import { MPSModel, UserSession } from '../types';
import { Language, translations } from '../utils/translations';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Cpu,
  Brain,
  Eye,
  CheckCircle2,
  Lock,
  Globe,
  Server,
  Layers,
  ChevronRight,
  FileText,
  HelpCircle,
  X,
} from 'lucide-react';

interface LandingPageProps {
  onStartChatting: () => void;
  onOpenAuth: () => void;
  user: UserSession | null;
  models: MPSModel[];
  lang: Language;
  onToggleLang: () => void;
  isDark: boolean;
  onToggleDark: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartChatting,
  onOpenAuth,
  user,
  models,
  lang,
  onToggleLang,
  isDark,
  onToggleDark,
}) => {
  const t = translations[lang];
  const [modalType, setModalType] = useState<'privacy' | 'terms' | 'contact' | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-blue-500 selection:text-white transition-colors duration-300">
      {/* Background Mesh */}
      <div className="mesh-gradient-bg" />

      {/* Landing Navigation Header */}
      <nav className="sticky top-0 z-40 w-full liquid-glass border-b border-white/20 dark:border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between glass-reflection">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 font-black">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              MPS AI
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-500/20">
                GLOBAL
              </span>
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
          <a href="#models" className="hover:text-blue-500 transition-colors">
            {lang === 'th' ? 'โมเดล AI' : 'Intelligence Engines'}
          </a>
          <a href="#capabilities" className="hover:text-blue-500 transition-colors">
            {lang === 'th' ? 'ความสามารถ' : 'Capabilities'}
          </a>
          <a href="#architecture" className="hover:text-blue-500 transition-colors">
            {lang === 'th' ? 'สถาปัตยกรรม' : 'Architecture'}
          </a>
          <a href="#pricing" className="hover:text-blue-500 transition-colors">
            {lang === 'th' ? 'แพ็กเกจสมาชิก' : 'Membership'}
          </a>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-xs font-semibold cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang.toUpperCase()}</span>
          </button>

          {user ? (
            <button
              onClick={onStartChatting}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/25 cursor-pointer transition-all active:scale-95"
            >
              <span>{lang === 'th' ? 'เปิดแชตบอท' : 'Launch Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuth}
                className="hidden sm:inline-flex px-3.5 py-1.5 rounded-xl text-xs font-medium hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
              >
                {t.signIn}
              </button>
              <button
                onClick={onStartChatting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/25 cursor-pointer transition-all active:scale-95"
              >
                <span>{lang === 'th' ? 'เริ่มใช้งานทันที' : 'Start Chatting'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 sm:pt-24 pb-16 px-4 sm:px-8 max-w-6xl mx-auto text-center">
        {/* Holographic Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-subtle border border-indigo-500/30 text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-6 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>
            {lang === 'th'
              ? 'แพลตฟอร์ม AI ระดับสากล พร้อมดีไซน์ Liquid Glass สไตล์ Apple'
              : 'Next-Generation Global AI Platform • Apple Liquid Glass Edition'}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15] mb-6">
          {lang === 'th' ? (
            <>
              ปัญญาประดิษฐ์ระดับโลก <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
                สำหรับผู้นำองค์กรและนักพัฒนา
              </span>
            </>
          ) : (
            <>
              Intelligent Architecture for <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
                Global Innovators & Engineers
              </span>
            </>
          )}
        </h1>

        <p className="max-w-2xl mx-auto text-sm sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
          {lang === 'th'
            ? 'รวมขุมพลังโมเดลชั้นนำของโลก (Google Gemini & OpenAI) ภายใต้เกตเวย์ MPS Proprietary Intelligence พร้อมระบบ Real-time Streaming, รองรับภาพและเอกสาร PDF, และการคิดวิเคราะห์เชิงลึก'
            : 'Unified multi-provider intelligence powered by official Google Gemini & OpenAI engines. Built with Apple-inspired liquid glass, real-time SSE streaming, multimodal OCR, and enterprise cognitive reasoning.'}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto mb-14">
          <button
            onClick={onStartChatting}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-blue-500/30 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-98"
          >
            <span>{lang === 'th' ? 'เปิดแชตทดลองใช้งาน (Live Demo)' : 'Start Chatting (Public Demo)'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href="#models"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl liquid-glass hover:liquid-glass-floating border border-white/20 dark:border-white/10 text-slate-800 dark:text-slate-200 font-semibold text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span>{lang === 'th' ? 'ดูโมเดลทั้งหมด' : 'Explore MPS Models'}</span>
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        {/* Platform Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
          <div className="p-4 rounded-2xl liquid-glass-subtle border border-black/5 dark:border-white/10">
            <span className="block text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400">
              5 Tier
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              MPS Intelligence Suite
            </span>
          </div>

          <div className="p-4 rounded-2xl liquid-glass-subtle border border-black/5 dark:border-white/10">
            <span className="block text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
              1M
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Token Context Window
            </span>
          </div>

          <div className="p-4 rounded-2xl liquid-glass-subtle border border-black/5 dark:border-white/10">
            <span className="block text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              &lt; 400ms
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Low-Latency Streaming
            </span>
          </div>

          <div className="p-4 rounded-2xl liquid-glass-subtle border border-black/5 dark:border-white/10">
            <span className="block text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400">
              100%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Zero-Exposure Privacy
            </span>
          </div>
        </div>
      </section>

      {/* Model Presentation Grid (Section 5 & 10) */}
      <section id="models" className="relative z-10 py-16 px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-2 block">
            {lang === 'th' ? 'ขุมพลังปัญญาประดิษฐ์' : 'MPS Model Presentation Matrix'}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            {lang === 'th' ? 'เลือกรุ่นโมเดลที่เหมาะกับงานของคุณ' : 'Precision Intelligence for Every Domain'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xl mx-auto">
            {lang === 'th'
              ? 'ระบบจัดหมวดหมู่โมเดลระดับมืออาชีพ พร้อมการสลับผู้ให้บริการแบบ Adaptive Fallback'
              : 'Categorized into Fast, Balanced, Advanced, Multimodal Vision, and Cognitive Reasoning.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {models.map((model) => (
            <div
              key={model.id}
              className={`relative rounded-3xl liquid-glass p-5 sm:p-6 border transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between ${
                model.recommended
                  ? 'border-blue-500/50 shadow-xl shadow-blue-500/10'
                  : 'border-white/20 dark:border-white/10'
              }`}
            >
              {model.recommended && (
                <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-md">
                  RECOMMENDED
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    {model.badge}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {model.contextLimit} Context
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">
                  {model.name}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  {lang === 'th' ? model.description.th : model.description.en}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-6">
                  {model.capabilities.map((cap) => (
                    <span
                      key={cap}
                      className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-slate-600 dark:text-slate-300"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={onStartChatting}
                className="w-full py-2.5 rounded-xl liquid-glass-subtle hover:liquid-glass font-semibold text-xs text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{lang === 'th' ? 'เลือกใช้งานรุ่นนี้' : 'Select Engine'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Enterprise Architecture Showcase (Section 4 & 9) */}
      <section id="architecture" className="relative z-10 py-16 px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="rounded-3xl liquid-glass glass-reflection border border-white/20 dark:border-white/10 p-6 sm:p-10 shadow-2xl">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-1 block">
              {lang === 'th' ? 'ความปลอดภัยและเกตเวย์อัจฉริยะ' : 'Unified AI Gateway Architecture'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {lang === 'th' ? 'ระบบสองเครื่องยนต์ ปลอดภัยระดับองค์กร' : 'Dual-Engine Multi-Cloud Redundancy'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              {lang === 'th'
                ? 'คำขอจากผู้ใช้จะวิ่งผ่าน MPS AI Gateway ที่คอยตรวจจับสถานะความพร้อมของทั้ง Google Gemini และ OpenAI หากผู้ให้บริการใดขัดข้อง ระบบจะทำการ Adaptive Fallback ทันทีโดยไม่รบกวนการสนทนา'
                : 'Every prompt routes through the secure MPS Gateway, inspecting health across Google Gemini and OpenAI. In the event of upstream rate-limiting, requests seamlessly failover.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl liquid-glass-subtle border border-black/5 dark:border-white/10">
              <Server className="w-6 h-6 text-blue-500 mb-3" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                Google Gemini Flagship
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Native multi-modal document understanding, ultra-fast streaming via `@google/genai` TypeScript SDK.
              </p>
            </div>

            <div className="p-4 rounded-2xl liquid-glass-subtle border border-black/5 dark:border-white/10">
              <Cpu className="w-6 h-6 text-purple-500 mb-3" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                OpenAI Enterprise Adapter
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Secondary provider integration via official OpenAI SDK for uninterrupted uptime and reasoning tasks.
              </p>
            </div>

            <div className="p-4 rounded-2xl liquid-glass-subtle border border-black/5 dark:border-white/10">
              <Lock className="w-6 h-6 text-emerald-500 mb-3" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                Zero-Leak Key Management
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                All credentials strictly guarded server-side. Zero API keys are ever transmitted or exposed to browsers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Membership Tiers (Section 6 & 7) */}
      <section id="pricing" className="relative z-10 py-16 px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-2 block">
            {lang === 'th' ? 'ระดับสมาชิก' : 'Membership Plans'}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            {lang === 'th' ? 'ยกระดับการทำงานด้วยขุมพลังขั้นสูง' : 'Empowering Free Users & Global Enterprises'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free Explorer */}
          <div className="rounded-3xl liquid-glass p-6 border border-white/20 dark:border-white/10 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Free Explorer
              </span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white my-3">
                ฿0 <span className="text-xs font-normal text-slate-400">/ forever</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Instant access to core MPS intelligence for everyday queries and drafting.
              </p>
              <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 mb-8">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>MPS 1.0 & 1.5 Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Real-time SSE Streaming</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Standard Latency</span>
                </div>
              </div>
            </div>
            <button
              onClick={onStartChatting}
              className="w-full py-2.5 rounded-xl liquid-glass-subtle hover:liquid-glass text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              Start Free
            </button>
          </div>

          {/* Pro Member */}
          <div className="rounded-3xl liquid-glass p-6 border-2 border-blue-500 shadow-xl shadow-blue-500/10 flex flex-col justify-between relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider">
              POPULAR CHOICE
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Enterprise Pro
              </span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white my-3">
                ฿690 <span className="text-xs font-normal text-slate-400">/ month</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Full-spectrum cognitive power for engineers, researchers, and professional teams.
              </p>
              <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 mb-8">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>All Models (MPS 1.0 – 3.0)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Multimodal PDF & Document OCR</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>1M Token Context Processing</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Encrypted Cloud History Sync</span>
                </div>
              </div>
            </div>
            <button
              onClick={onStartChatting}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 cursor-pointer"
            >
              Get Started with Pro
            </button>
          </div>

          {/* Enterprise */}
          <div className="rounded-3xl liquid-glass p-6 border border-white/20 dark:border-white/10 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Institutional
              </span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white my-3">
                Custom <span className="text-xs font-normal text-slate-400">/ enterprise</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Dedicated throughput, private Cloud SQL integration, and custom compliance SLA.
              </p>
              <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 mb-8">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Unlimited MPS 3.0 Reasoning</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Custom API Gateway Integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Dedicated Account Manager & SLA</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setModalType('contact')}
              className="w-full py-2.5 rounded-xl liquid-glass-subtle hover:liquid-glass text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer (Section 10) */}
      <footer className="mt-auto relative z-10 border-t border-black/5 dark:border-white/10 py-10 px-4 sm:px-8 max-w-6xl mx-auto w-full text-xs text-slate-500 dark:text-slate-400">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span>MPS AI Global Platform</span>
          </div>

          <div className="flex items-center gap-5">
            <button
              onClick={() => setModalType('privacy')}
              className="hover:underline cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setModalType('terms')}
              className="hover:underline cursor-pointer"
            >
              Terms of Service
            </button>
            <button
              onClick={() => setModalType('contact')}
              className="hover:underline cursor-pointer"
            >
              Contact & Support
            </button>
          </div>

          <p className="text-[11px]">
            © {new Date().getFullYear()} MPS AI Platform. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Info Modals */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl liquid-glass-floating border border-white/20 p-6 shadow-2xl">
            <button
              onClick={() => setModalType(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {modalType === 'privacy' && (
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Privacy Policy
                </h3>
                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
                  <p>
                    MPS AI values your confidentiality. We do not sell user data, train foundational models on private prompts without explicit institutional agreements, or transmit secret credentials to client browsers.
                  </p>
                  <p>
                    All API keys are isolated on backend servers with automated sanitization. Chats are stored with Firebase Firestore security rules ensuring strict user-level authorization.
                  </p>
                </div>
              </div>
            )}

            {modalType === 'terms' && (
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Terms of Service
                </h3>
                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
                  <p>
                    By accessing MPS AI Global Platform, you agree to respect acceptable use policies. Automated scraping, malicious denial-of-wallet attacks, or prompt-injection attempts intended to violate server integrity are strictly prohibited.
                  </p>
                  <p>
                    Free tier users enjoy standard quota; high-volume concurrency is reserved for Enterprise Pro members.
                  </p>
                </div>
              </div>
            )}

            {modalType === 'contact' && (
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Contact & Support
                </h3>
                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
                  <p>
                    For institutional deployment, enterprise licensing, or technical inquiries:
                  </p>
                  <p className="font-mono bg-black/5 dark:bg-white/10 p-2 rounded-lg text-blue-500">
                    enterprise@mps.ai • support@mps.ai
                  </p>
                  <p>
                    Global Operations: Singapore • Tokyo • Bangkok • San Francisco
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
