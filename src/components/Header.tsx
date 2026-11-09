import React from 'react';
import { ModelSelector } from './ModelSelector';
import { MPSModel, UserSession } from '../types';
import { Language, translations } from '../utils/translations';
import { Menu, Moon, Sun, Settings, LogIn, Globe, ShieldCheck, Sparkles } from 'lucide-react';

interface HeaderProps {
  models: MPSModel[];
  selectedModelId: string;
  onSelectModel: (id: string) => void;
  lang: Language;
  onToggleLang: () => void;
  isDark: boolean;
  onToggleDark: () => void;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  onNavigateHome?: () => void;
  user: UserSession | null;
  gatewayOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  models,
  selectedModelId,
  onSelectModel,
  lang,
  onToggleLang,
  isDark,
  onToggleDark,
  onToggleSidebar,
  onOpenSettings,
  onOpenAuth,
  onNavigateHome,
  user,
  gatewayOnline,
}) => {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-30 w-full liquid-glass safe-top px-3 md:px-6 py-2.5 flex items-center justify-between border-b border-white/20 dark:border-white/10 glass-reflection transition-all duration-300">
      {/* Left section: Sidebar toggle & Brand */}
      <div className="flex items-center gap-2 md:gap-3.5">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          aria-label="Toggle sidebar"
          title="Toggle Navigation (Ctrl+B)"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand identity - Click returns to landing / home */}
        <div
          onClick={onNavigateHome}
          className="flex items-center gap-2 cursor-pointer select-none hover:opacity-85 transition-opacity"
          title="Return to Landing Page"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-black text-sm tracking-tighter">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div className="hidden xs:flex flex-col">
            <span className="font-bold text-sm md:text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              MPS AI
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-500/20">
                PRO
              </span>
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 -mt-0.5 tracking-wide hidden sm:block">
              {lang === 'th' ? 'แพลตฟอร์มปัญญาประดิษฐ์' : 'Global Intelligent Platform'}
            </span>
          </div>
        </div>
      </div>

      {/* Center section: Compact Model Selector */}
      <div className="flex items-center justify-center">
        <ModelSelector
          models={models}
          selectedModelId={selectedModelId}
          onSelectModel={onSelectModel}
          lang={lang}
        />
      </div>

      {/* Right section: Gateway Status, Language, Theme, Settings & User Profile */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {/* Gateway connection pill */}
        <div
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-xs text-slate-600 dark:text-slate-300"
          title={gatewayOnline ? t.gatewayStatus : t.gatewayOffline}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              gatewayOnline ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <span className="text-[11px] font-medium font-mono">
            {gatewayOnline ? 'Gateway Active' : 'Connecting'}
          </span>
        </div>

        {/* Language switch */}
        <button
          onClick={onToggleLang}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          title="Switch Language / เปลี่ยนภาษา"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{lang.toUpperCase()}</span>
        </button>

        {/* Dark/Light mode toggle */}
        <button
          onClick={onToggleDark}
          className="p-1.5 sm:p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 sm:p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          title={t.settings}
          aria-label="Open settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User profile or Sign In pill */}
        {user ? (
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full liquid-glass-subtle hover:liquid-glass text-xs font-medium cursor-pointer transition-all border border-white/20 dark:border-white/10"
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="w-6 h-6 rounded-full object-cover ring-1 ring-blue-500/50"
            />
            <span className="hidden md:inline-block max-w-[90px] truncate text-slate-900 dark:text-white font-medium">
              {user.name}
            </span>
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-medium shadow-md shadow-blue-500/20 cursor-pointer transition-all duration-200 active:scale-95"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.signIn}</span>
          </button>
        )}
      </div>
    </header>
  );
};
