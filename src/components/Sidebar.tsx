import React, { useState } from 'react';
import { Conversation, UserSession } from '../types';
import { Language, translations } from '../utils/translations';
import {
  Plus,
  Search,
  MessageSquare,
  Pin,
  Trash2,
  Edit2,
  Check,
  X,
  Sparkles,
  Shield,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onTogglePinConversation: (id: string) => void;
  onClearAllConversations: () => void;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  user: UserSession | null;
  onOpenAuth: () => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onRenameConversation,
  onTogglePinConversation,
  onClearAllConversations,
  isOpen,
  onClose,
  lang,
  user,
  onOpenAuth,
  onOpenSettings,
}) => {
  const t = translations[lang];
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startEditing = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditingTitle(currentTitle);
  };

  const saveEditing = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingTitle.trim()) {
      onRenameConversation(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  const cancelEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  // Group conversations by time
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;

  const pinned = filteredConversations.filter((c) => c.isPinned);
  const unpinned = filteredConversations.filter((c) => !c.isPinned);

  const today = unpinned.filter((c) => now - c.updatedAt < ONE_DAY);
  const yesterday = unpinned.filter(
    (c) => now - c.updatedAt >= ONE_DAY && now - c.updatedAt < 2 * ONE_DAY
  );
  const previousDays = unpinned.filter(
    (c) => now - c.updatedAt >= 2 * ONE_DAY && now - c.updatedAt < 7 * ONE_DAY
  );
  const older = unpinned.filter((c) => now - c.updatedAt >= 7 * ONE_DAY);

  const renderGroup = (title: string, items: Conversation[]) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-4">
        <div className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {title}
        </div>
        <div className="space-y-1">
          {items.map((conv) => {
            const isActive = conv.id === activeConversationId;
            const isEditing = conv.id === editingId;

            return (
              <div
                key={conv.id}
                onClick={() => {
                  onSelectConversation(conv.id);
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs md:text-sm font-medium cursor-pointer transition-all duration-150 ${
                  isActive
                    ? 'liquid-glass text-blue-600 dark:text-blue-400 shadow-sm border border-blue-500/20'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {conv.isPinned ? (
                    <Pin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                  ) : (
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                  )}

                  {isEditing ? (
                    <div className="flex items-center gap-1 flex-1 mr-1">
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                        className="w-full px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-xs border border-blue-500 focus:outline-none"
                      />
                      <button
                        onClick={(e) => saveEditing(conv.id, e)}
                        className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="p-1 text-rose-500 hover:bg-rose-500/10 rounded"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <span className="truncate flex-1">{conv.title}</span>
                  )}
                </div>

                {!isEditing && (
                  <div className="hidden group-hover:flex items-center gap-1 ml-1 opacity-90 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePinConversation(conv.id);
                      }}
                      className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      title={conv.isPinned ? t.unpin : t.pin}
                    >
                      <Pin className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => startEditing(conv.id, conv.title, e)}
                      className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      title={t.rename}
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(conv.id);
                      }}
                      className="p-1 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-500"
                      title={t.delete}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 left-0 z-50 lg:z-10 h-full w-72 sm:w-80 flex-shrink-0 liquid-glass border-r border-white/20 dark:border-white/10 flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header: Brand & New Chat */}
        <div className="p-3 border-b border-black/5 dark:border-white/10 safe-top">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => {
                onNewConversation();
                if (window.innerWidth < 1024) onClose();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs md:text-sm shadow-md shadow-blue-500/20 transition-all duration-200 cursor-pointer active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>{t.newChat}</span>
            </button>

            <button
              onClick={onClose}
              className="lg:hidden ml-2 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search conversations */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchChats}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl liquid-glass-subtle border border-black/5 dark:border-white/10 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Scrollable Conversation History */}
        <div className="flex-1 overflow-y-auto px-2 py-3">
          {conversations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {t.noChatsFound}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                {t.noChatsDescription}
              </p>
            </div>
          ) : (
            <>
              {renderGroup(lang === 'th' ? 'ปักหมุดแล้ว' : 'Pinned', pinned)}
              {renderGroup(t.today, today)}
              {renderGroup(t.yesterday, yesterday)}
              {renderGroup(t.previousDays, previousDays)}
              {renderGroup(t.older, older)}
            </>
          )}
        </div>

        {/* Bottom Profile & Tier Bar */}
        <div className="p-3 border-t border-black/5 dark:border-white/10 safe-bottom">
          {user ? (
            <div
              onClick={onOpenSettings}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/30"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                    {user.name}
                  </span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    PRO
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  <span className="truncate">{user.email}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span className="font-semibold text-xs text-slate-900 dark:text-white">
                  {t.guest}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mb-2.5">
                {lang === 'th'
                  ? 'เข้าสู่ระบบเพื่อใช้งานโมเดล MPS ขั้นสูงแบบไม่จำกัด'
                  : 'Unlock unlimited high-order reasoning & document vision.'}
              </p>
              <button
                onClick={onOpenAuth}
                className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors shadow-sm cursor-pointer"
              >
                {t.signIn}
              </button>
            </div>
          )}

          {conversations.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm(t.clearAllConfirm)) {
                  onClearAllConversations();
                }
              }}
              className="w-full mt-2 py-1 text-[11px] text-slate-400 hover:text-rose-500 transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>{t.clearAll}</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
