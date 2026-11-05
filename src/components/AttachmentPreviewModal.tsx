import React from 'react';
import { Attachment } from '../types';
import { X, Download, FileText } from 'lucide-react';

interface AttachmentPreviewModalProps {
  attachment: Attachment | null;
  onClose: () => void;
}

export const AttachmentPreviewModal: React.FC<AttachmentPreviewModalProps> = ({
  attachment,
  onClose,
}) => {
  if (!attachment) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] rounded-3xl liquid-glass-floating border border-white/20 p-4 sm:p-6 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10 text-white">
          <div className="flex items-center gap-2 min-w-0 pr-4">
            {attachment.isImage ? (
              <span className="text-xs font-mono uppercase bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                Image
              </span>
            ) : (
              <FileText className="w-4 h-4 text-blue-400" />
            )}
            <span className="font-semibold text-sm truncate">{attachment.name}</span>
            <span className="text-xs text-slate-400 font-mono">
              ({(attachment.size / 1024).toFixed(0)} KB)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={attachment.dataUrl}
              download={attachment.name}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Download file"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-2">
          {attachment.isImage ? (
            <img
              src={attachment.dataUrl}
              alt={attachment.name}
              className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
            />
          ) : (
            <div className="text-center py-12 px-6">
              <FileText className="w-16 h-16 mx-auto text-blue-400 mb-3" />
              <p className="text-sm font-semibold text-white mb-1">{attachment.name}</p>
              <p className="text-xs text-slate-400 mb-4">{attachment.type}</p>
              <a
                href={attachment.dataUrl}
                download={attachment.name}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Document</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
