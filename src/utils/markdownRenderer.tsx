import React, { useState, useMemo } from 'react';
import { marked } from 'marked';
import katex from 'katex';
import { Check, Copy } from 'lucide-react';

interface MarkdownProps {
  content: string;
}

// Configure marked with GitHub Flavored Markdown
marked.setOptions({
  gfm: true,
  breaks: true,
});

export const MarkdownRenderer: React.FC<MarkdownProps> = ({ content }) => {
  if (!content) return null;

  // Process math placeholders and parse with marked
  const renderedContent = useMemo(() => {
    return processMarkdownWithMath(content);
  }, [content]);

  return (
    <div className="mps-ai-response w-full text-slate-800 dark:text-slate-100 text-sm sm:text-base leading-relaxed tracking-normal select-text">
      {renderedContent}
    </div>
  );
};

// Component for Code Blocks with Apple Liquid Glass header and Copy button
export const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3.5 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/10 bg-[#0c1017] shadow-md transition-all">
      {/* Code Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-white/10 text-xs font-mono text-slate-400">
        <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
          {language || 'CODE'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors cursor-pointer text-[11px]"
          title="Copy code"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      {/* Code Content */}
      <div className="p-4 overflow-x-auto text-xs sm:text-sm font-mono text-slate-100 leading-relaxed bg-[#0b0f19]">
        <pre className="!m-0 !p-0 bg-transparent font-mono whitespace-pre">
          <code>{code.trimEnd()}</code>
        </pre>
      </div>
    </div>
  );
};

// Process content by extracting code blocks first, math blocks second, then compiling via marked
function processMarkdownWithMath(rawText: string): React.ReactNode {
  // 1. Extract triple-backtick code blocks
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let blockKey = 0;

  while ((match = codeBlockRegex.exec(rawText)) !== null) {
    const textBefore = rawText.substring(lastIndex, match.index);
    if (textBefore) {
      parts.push(
        <div key={`html-block-${blockKey++}`}>
          {renderMarkdownSection(textBefore)}
        </div>
      );
    }

    const lang = match[1] || 'plaintext';
    const code = match[2];
    parts.push(
      <CodeBlock key={`code-block-${blockKey++}`} language={lang} code={code} />
    );

    lastIndex = match.index + match[0].length;
  }

  const textRemaining = rawText.substring(lastIndex);
  if (textRemaining) {
    parts.push(
      <div key={`html-block-${blockKey++}`}>
        {renderMarkdownSection(textRemaining)}
      </div>
    );
  }

  return <>{parts}</>;
}

// Render non-code markdown section with KaTeX support
function renderMarkdownSection(markdownText: string): React.ReactNode {
  // Pre-process LaTeX display math: $$...$$
  const mathPlaceholders: { [key: string]: string } = {};
  let mathCounter = 0;

  // Replace $$...$$ block math
  let processed = markdownText.replace(/\$\$([\s\S]*?)\$\$/g, (_, latex) => {
    const id = `__MATH_BLOCK_${mathCounter++}__`;
    let rendered = '';
    try {
      rendered = katex.renderToString(latex.trim(), { displayMode: true, throwOnError: false });
    } catch {
      rendered = `<div class="katex-error text-rose-400 font-mono text-xs">$$${latex}$$</div>`;
    }
    mathPlaceholders[id] = `<div class="my-3 py-2 px-4 overflow-x-auto text-center rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">${rendered}</div>`;
    return id;
  });

  // Replace $...$ inline math (ignoring currency like $10 or $20.00)
  processed = processed.replace(/(^|[^\\])\$([^\$\n\t]+?)\$/g, (_, prefix, formula) => {
    // Skip if it looks like plain currency e.g. "$100" without math symbols
    if (/^\d+(\.\d+)?$/.test(formula.trim())) {
      return `${prefix}$${formula}$`;
    }
    const id = `__MATH_INLINE_${mathCounter++}__`;
    let rendered = '';
    try {
      rendered = katex.renderToString(formula.trim(), { displayMode: false, throwOnError: false });
    } catch {
      rendered = `<span class="katex-error text-rose-400 font-mono text-xs">$${formula}$</span>`;
    }
    mathPlaceholders[id] = `<span class="inline-block px-1 mx-0.5 rounded bg-black/5 dark:bg-white/10 align-middle">${rendered}</span>`;
    return `${prefix}${id}`;
  });

  // Compile with marked GFM
  let rawHtml = '';
  try {
    rawHtml = marked.parse(processed, { async: false }) as string;
  } catch (e) {
    console.error('marked parse failed, falling back to raw:', e);
    rawHtml = processed;
  }

  // Restore math placeholders
  for (const [id, mathHtml] of Object.entries(mathPlaceholders)) {
    rawHtml = rawHtml.replace(new RegExp(id, 'g'), mathHtml);
  }

  return (
    <div
      className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-100 font-normal leading-relaxed
        [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mt-5 [&>h1]:mb-2.5 [&>h1]:text-slate-900 [&>h1]:dark:text-white
        [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:mt-4 [&>h2]:mb-2 [&>h2]:text-slate-900 [&>h2]:dark:text-white
        [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:mt-3.5 [&>h3]:mb-1.5 [&>h3]:text-slate-800 [&>h3]:dark:text-slate-100
        [&>p]:my-2.5 [&>p]:leading-relaxed
        [&>ul]:my-2.5 [&>ul]:pl-5 [&>ul]:list-disc [&>ul]:space-y-1.5
        [&>ol]:my-2.5 [&>ol]:pl-5 [&>ol]:list-decimal [&>ol]:space-y-1.5
        [&>li]:leading-relaxed
        [&>blockquote]:border-l-4 [&>blockquote]:border-indigo-500 [&>blockquote]:pl-4 [&>blockquote]:py-1 [&>blockquote]:my-3 [&>blockquote]:italic [&>blockquote]:bg-indigo-50/50 [&>blockquote]:dark:bg-indigo-950/20 [&>blockquote]:rounded-r-xl
        [&_strong]:font-bold [&_strong]:text-slate-900 [&_strong]:dark:text-white
        [&_code]:text-xs [&_code]:font-mono [&_code]:font-medium [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:bg-indigo-500/10 [&_code]:text-indigo-600 [&_code]:dark:text-indigo-300 [&_code]:border [&_code]:border-indigo-500/20
        [&_table]:w-full [&_table]:my-4 [&_table]:overflow-x-auto [&_table]:block [&_table]:border-collapse [&_table]:rounded-xl [&_table]:border [&_table]:border-slate-200/80 [&_table]:dark:border-white/10
        [&_thead]:bg-slate-100/90 [&_thead]:dark:bg-slate-800/80
        [&_th]:px-4 [&_th]:py-2.5 [&_th]:text-left [&_th]:font-semibold [&_th]:text-xs [&_th]:sm:text-sm [&_th]:border-b [&_th]:border-slate-200 [&_th]:dark:border-white/10
        [&_td]:px-4 [&_td]:py-2.5 [&_td]:text-xs [&_td]:sm:text-sm [&_td]:border-b [&_td]:border-slate-100 [&_td]:dark:border-white/5
        [&_tr:last-child_td]:border-b-0
        [&_tr:hover]:bg-slate-50/50 [&_tr:hover]:dark:bg-white/5
        [&_a]:text-blue-600 [&_a]:dark:text-blue-400 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-blue-500
        [&_hr]:my-4 [&_hr]:border-black/10 [&_hr]:dark:border-white/10"
      dangerouslySetInnerHTML={{ __html: rawHtml }}
    />
  );
}
