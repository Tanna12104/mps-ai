import React, { useState, useRef, useEffect } from 'react';
import { Attachment, MPSModel } from '../types';
import { Language, translations } from '../utils/translations';
import {
  ArrowUp,
  Paperclip,
  Square,
  X,
  FileText,
  Image as ImageIcon,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

interface ChatComposerProps {
  onSendMessage: (content: string, attachments: Attachment[]) => void;
  onStopGeneration: () => void;
  isStreaming: boolean;
  activeModel: MPSModel;
  lang: Language;
  isAuthenticated: boolean;
  onRequireAuth: () => void;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  onSendMessage,
  onStopGeneration,
  isStreaming,
  activeModel,
  lang,
  isAuthenticated,
  onRequireAuth,
}) => {
  const t = translations[lang];
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 180)}px`;
    }
  }, [content]);

  // Handle file selections
  const processFiles = (files: FileList | File[]) => {
    setFileError(null);
    const validFiles = Array.from(files);

    validFiles.forEach((file) => {
      if (file.size > 25 * 1024 * 1024) {
        setFileError(
          lang === 'th'
            ? `ไฟล์ ${file.name} มีขนาดเกิน 25MB`
            : `File ${file.name} exceeds 25MB limit`
        );
        return;
      }

      const reader = new FileReader();
      const isImg = file.type.startsWith('image/');

      reader.onload = () => {
        const base64Data = reader.result as string;
        const newAttachment: Attachment = {
          id: 'att_' + Math.random().toString(36).substring(2, 9),
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size,
          dataUrl: base64Data,
          base64Data,
          isImage: isImg,
        };

        setAttachments((prev) => [...prev, newAttachment]);
      };

      reader.readAsDataURL(file);
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!content.trim() && attachments.length === 0) return;

    // Requirement: Guest users can type, but submitting immediately triggers login flow
    if (!isAuthenticated) {
      onRequireAuth();
      return;
    }

    if (isStreaming) {
      onStopGeneration();
      return;
    }

    onSendMessage(content.trim(), attachments);
    setContent('');
    setAttachments([]);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const tokenEstimate = Math.ceil((content.length || 0) / 4);

  return (
    <div
      className="relative w-full max-w-4xl mx-auto px-3 sm:px-6 safe-bottom pb-2 transition-all"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag & Drop Highlight Overlay */}
      {isDragging && (
        <div className="absolute inset-x-3 -top-12 bottom-2 z-20 rounded-3xl liquid-glass border-2 border-dashed border-blue-500 flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-sm">
            <Sparkles className="w-5 h-5 animate-bounce" />
            <span>{t.dropFilesHere}</span>
          </div>
        </div>
      )}

      {/* File Size Error Banner */}
      {fileError && (
        <div className="mb-2 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{fileError}</span>
          </div>
          <button onClick={() => setFileError(null)} className="cursor-pointer">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Floating Liquid Glass Composer Container */}
      <div className="relative rounded-3xl liquid-glass-floating glass-reflection border border-white/25 dark:border-white/10 p-2 sm:p-3 transition-all duration-300">
        {/* Attachment chips preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 p-1.5 mb-2 border-b border-black/5 dark:border-white/10">
            {attachments.map((file) => (
              <div
                key={file.id}
                className="group relative flex items-center gap-2 px-2.5 py-1 rounded-xl liquid-glass-subtle text-xs text-slate-800 dark:text-slate-200 border border-white/20 dark:border-white/10"
              >
                {file.isImage ? (
                  <div className="w-5 h-5 rounded overflow-hidden flex-shrink-0 bg-slate-200 dark:bg-slate-800">
                    <img
                      src={file.dataUrl}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                )}
                <span className="max-w-[120px] sm:max-w-[180px] truncate font-medium">
                  {file.name}
                </span>
                <span className="text-[10px] text-slate-400">
                  {(file.size / 1024).toFixed(0)}KB
                </span>
                <button
                  type="button"
                  onClick={() => removeAttachment(file.id)}
                  className="p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Text Input Row */}
        <div className="flex items-end gap-2">
          {/* File attachment button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 sm:p-2.5 rounded-2xl hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors flex-shrink-0 cursor-pointer"
            title={t.attachFile}
          >
            <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,application/pdf,text/plain"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {/* Textarea */}
          <div className="flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              rows={1}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isAuthenticated ? t.composerPlaceholder : t.composerGuestPlaceholder
              }
              className="w-full bg-transparent resize-none py-2 text-xs sm:text-sm md:text-base leading-relaxed text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none max-h-44"
            />
          </div>

          {/* Action Button: Send or Stop */}
          {isStreaming ? (
            <button
              type="button"
              onClick={onStopGeneration}
              className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 transition-all cursor-pointer flex-shrink-0 animate-pulse"
              title={t.stopGenerating}
            >
              <Square className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={!content.trim() && attachments.length === 0}
              className={`flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-2xl transition-all duration-200 flex-shrink-0 cursor-pointer ${
                content.trim() || attachments.length > 0
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/25 scale-100 hover:scale-105 active:scale-95'
                  : 'bg-black/5 dark:bg-white/5 text-slate-300 dark:text-slate-600 cursor-not-allowed'
              }`}
              title={t.send}
            >
              <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </button>
          )}
        </div>

        {/* Footer Meta: Engine indicator & token counter */}
        <div className="flex items-center justify-between px-2 pt-1.5 mt-0.5 text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 border-t border-black/5 dark:border-white/5">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {activeModel.name.split('—')[0].trim()}
            </span>
            <span className="text-slate-400">•</span>
            <span>{activeModel.contextLimit} Context</span>
          </div>

          <div className="flex items-center gap-2 font-mono">
            <span>~{tokenEstimate} tokens</span>
            {!isAuthenticated && (
              <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-medium">
                Guest Mode
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
