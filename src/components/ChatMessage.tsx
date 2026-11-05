import React, { useState } from 'react';
import { Attachment, Message } from '../types';
import { MarkdownRenderer } from '../utils/markdownRenderer';
import { Language, translations } from '../utils/translations';
import {
  Copy,
  Check,
  RotateCcw,
  Trash2,
  Volume2,
  VolumeX,
  Edit3,
  FileText,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  onRegenerate?: () => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newContent: string) => void;
  onPreviewAttachment: (attachment: Attachment) => void;
  lang: Language;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onRegenerate,
  onDelete,
  onEdit,
  onPreviewAttachment,
  lang,
}) => {
  const t = translations[lang];
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(message.content);
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeechToggle = () => {
    if (!('speechSynthesis' in window)) return;

    if (isPlayingSpeech) {
      window.speechSynthesis.cancel();
      setIsPlayingSpeech(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message.content);
    utterance.lang = lang === 'th' ? 'th-TH' : 'en-US';
    utterance.rate = 1.05;

    utterance.onend = () => setIsPlayingSpeech(false);
    utterance.onerror = () => setIsPlayingSpeech(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingSpeech(true);
  };

  const handleSaveEdit = () => {
    if (editedText.trim()) {
      onEdit(message.id, editedText.trim());
      setIsEditing(false);
    }
  };

  return (
    <div
      className={`group w-full max-w-4xl mx-auto py-2 px-3 sm:px-6 transition-all duration-200 flex flex-col ${
        isUser ? 'items-end' : 'items-start'
      }`}
    >
      {/* ---------------- User Message Bubble ---------------- */}
      {isUser ? (
        <div className="max-w-[92%] sm:max-w-[80%] flex flex-col items-end">
          {/* User Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2 justify-end">
              {message.attachments.map((file) => (
                <div
                  key={file.id}
                  onClick={() => onPreviewAttachment(file)}
                  className="relative rounded-2xl overflow-hidden liquid-glass border border-white/20 dark:border-white/10 cursor-pointer shadow-sm hover:scale-[1.02] transition-transform"
                >
                  {file.isImage ? (
                    <div className="w-28 h-28 sm:w-36 sm:h-36 bg-slate-900/50">
                      <img
                        src={file.dataUrl}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-20 p-2.5 flex flex-col justify-between bg-blue-500/10 text-xs">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-semibold truncate text-slate-800 dark:text-slate-200">
                          {file.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {(file.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* User Text Bubble */}
          <div className="rounded-3xl liquid-glass-floating glass-reflection px-4 py-3 text-xs sm:text-sm md:text-base leading-relaxed text-slate-900 dark:text-slate-100 border border-white/30 dark:border-white/10 shadow-sm">
            {isEditing ? (
              <div className="space-y-2 min-w-[240px]">
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="w-full p-2 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-blue-500 focus:outline-none text-xs sm:text-sm"
                  rows={3}
                />
                <div className="flex justify-end gap-1.5">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-2.5 py-1 text-xs rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-2.5 py-1 text-xs rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 cursor-pointer"
                  >
                    {t.save}
                  </button>
                </div>
              </div>
            ) : (
              <div className="whitespace-pre-wrap">{message.content}</div>
            )}
          </div>

          {/* User Actions */}
          {!isEditing && (
            <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400">
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title={t.edit}
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleCopy}
                className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title={t.copy}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              </button>
              <button
                onClick={() => onDelete(message.id)}
                className="p-1 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-500"
                title={t.delete}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* ---------------- Assistant Response: Full-Width Clean Canvas (No Box / No Card) ---------------- */
        <div className="w-full flex flex-col space-y-2 py-1">
          {/* Subtle Assistant Indicator / Model Badge */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1 pb-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
                <Sparkles className="w-3 h-3 animate-pulse" />
              </div>
              <span className="font-semibold text-xs tracking-tight text-slate-900 dark:text-white">
                MPS AI
              </span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-mono">
                {message.mpsModelId?.toUpperCase() || 'MPS 2.0'}
              </span>
            </div>

            <span className="text-[10px] text-slate-400 font-mono">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Reasoning / Connecting Status Indicator */}
          {message.statusMessage && (
            <div className="text-[11px] font-mono text-indigo-500 dark:text-indigo-400 flex items-center gap-1.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
              <span>{message.statusMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {message.isError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs sm:text-sm flex items-start gap-2.5 my-1">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-medium">{message.content}</p>
                {onRegenerate && (
                  <button
                    onClick={onRegenerate}
                    className="mt-2.5 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{t.regenerate}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Direct Full-Width Markdown Render (Zero container boxes, zero card border, zero shadows) */}
          {!message.isError && (
            <div className="w-full text-slate-800 dark:text-slate-100 text-sm sm:text-base leading-relaxed tracking-normal">
              <MarkdownRenderer content={message.content} />
              {message.isStreaming && <span className="streaming-cursor" />}
            </div>
          )}

          {/* Minimal Bottom Action Toolbar */}
          {!message.isStreaming && !message.isError && (
            <div className="flex items-center justify-between pt-1.5 text-xs text-slate-400">
              <div className="flex items-center gap-1">
                {/* Copy */}
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  title={t.copy}
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span className="text-[11px]">{copied ? t.copied : t.copy}</span>
                </button>

                {/* Regenerate */}
                {onRegenerate && (
                  <button
                    onClick={onRegenerate}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    title={t.regenerate}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="text-[11px]">{t.regenerate}</span>
                  </button>
                )}

                {/* Text-to-speech */}
                <button
                  onClick={handleSpeechToggle}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer ${
                    isPlayingSpeech
                      ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                  title={t.readAloud}
                >
                  {isPlayingSpeech ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span className="text-[11px]">{t.readAloud}</span>
                </button>
              </div>

              {/* Delete message */}
              <button
                onClick={() => onDelete(message.id)}
                className="p-1 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                title={t.delete}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
