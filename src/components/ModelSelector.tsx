import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { MPSModel } from '../types';
import { Language } from '../utils/translations';
import {
  ChevronDown,
  Sparkles,
  Zap,
  Eye,
  Brain,
  Cpu,
  Check,
} from 'lucide-react';

interface ModelSelectorProps {
  models: MPSModel[];
  selectedModelId: string;
  onSelectModel: (modelId: string) => void;
  lang: Language;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModelId,
  onSelectModel,
  lang,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top?: number; bottom?: number; left: number; width: number }>({
    left: 12,
    width: 310,
  });

  const selectedModel = models.find((m) => m.id === selectedModelId) || models[0];

  // Calculate Popover anchor position relative to viewport
  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const popoverWidth = Math.min(320, window.innerWidth - 24);

    // Horizontally center popover with button, clamping inside viewport safe margins
    let idealLeft = rect.left + rect.width / 2 - popoverWidth / 2;
    if (idealLeft < 12) idealLeft = 12;
    if (idealLeft + popoverWidth > window.innerWidth - 12) {
      idealLeft = window.innerWidth - popoverWidth - 12;
    }

    const spaceBelow = window.innerHeight - rect.bottom;
    const openAbove = spaceBelow < 300 && rect.top > 300;

    if (openAbove) {
      setCoords({
        bottom: window.innerHeight - rect.top + 8,
        left: idealLeft,
        width: popoverWidth,
      });
    } else {
      setCoords({
        top: rect.bottom + 8,
        left: idealLeft,
        width: popoverWidth,
      });
    }
  };

  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
    }
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen]);

  // Click outside and Escape key to close
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }

    function handlePointerDown(e: MouseEvent | TouchEvent) {
      const target = e.target as Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [isOpen]);

  const getModelIcon = (id: string) => {
    switch (id) {
      case 'mps-1.0':
        return <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />;
      case 'mps-1.5':
        return <Cpu className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />;
      case 'mps-2.0':
        return <Sparkles className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />;
      case 'mps-2.5':
        return <Eye className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />;
      case 'mps-3.0':
        return <Brain className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />;
    }
  };

  return (
    <>
      {/* Header Compact Trigger Button: [ ✨ MPS 2.0 ▾ ] */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full liquid-glass-subtle hover:liquid-glass text-xs md:text-sm font-semibold transition-all duration-200 cursor-pointer text-slate-800 dark:text-slate-100 hover:scale-[1.02] active:scale-[0.98] border border-white/25 dark:border-white/10 shadow-xs select-none"
        title="Select MPS Engine"
      >
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-900/5 dark:bg-white/10">
          {getModelIcon(selectedModel?.id || 'mps-2.0')}
        </span>
        <span className="font-semibold tracking-tight text-slate-900 dark:text-white">
          {selectedModel?.name ? selectedModel.name.split('—')[0].trim() : 'MPS 2.0'}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Compact Floating Popover anchored via React Portal (Never pushes Chat layout) */}
      {isOpen &&
        createPortal(
          <div
            ref={popoverRef}
            style={{
              position: 'fixed',
              top: coords.top !== undefined ? `${coords.top}px` : undefined,
              bottom: coords.bottom !== undefined ? `${coords.bottom}px` : undefined,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              maxHeight: 'min(420px, calc(100dvh - 120px))',
              zIndex: 9999,
              boxSizing: 'border-box',
            }}
            className="rounded-2xl liquid-glass-floating p-2 shadow-2xl overflow-y-auto animate-in fade-in zoom-in-95 duration-150 border border-white/30 dark:border-white/15 glass-reflection bg-white/80 dark:bg-slate-900/85 backdrop-blur-2xl"
          >
            {/* Popover Header */}
            <div className="px-3 py-1.5 mb-1 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                {lang === 'th' ? 'เลือกรุ่นโมเดล MPS' : 'Select MPS Engine'}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                Online
              </span>
            </div>

            {/* Model List Items: compact, precise, zero-bloat */}
            <div className="space-y-0.5">
              {models.map((model) => {
                const isSelected = model.id === selectedModelId;
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => {
                      onSelectModel(model.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl transition-all duration-150 flex items-center justify-between cursor-pointer group ${
                      isSelected
                        ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 font-semibold border border-blue-500/30 shadow-xs'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="flex-shrink-0">{getModelIcon(model.id)}</span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs truncate font-medium">
                          {model.name}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate leading-tight">
                          {lang === 'th' ? model.tagline.th : model.tagline.en}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/10 text-slate-500 dark:text-slate-400">
                        {model.contextLimit}
                      </span>
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 text-blue-500" />
                      ) : (
                        <div className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
