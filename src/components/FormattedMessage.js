'use client';
import React from 'react';

// Formats inline text (bold, inline code, inline math)
function formatInline(text) {
  if (!text) return null;

  // Split on bold, code, and inline math
  const parts = [];
  let remaining = text;
  let keyIdx = 0;

  // Simple token matching
  const regex = /(\*\*.*?\*\*|`.*?`|\$.*?\$)/g;
  let match;
  let lastIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={keyIdx++}>{text.substring(lastIndex, match.index)}</span>);
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={keyIdx++} className="font-semibold text-white">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={keyIdx++}
          className="font-mono text-xs px-1.5 py-0.5 rounded bg-surface-lowest text-brand-glow border border-slate-800"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('$') && token.endsWith('$') && !token.startsWith('$$')) {
      parts.push(
        <span
          key={keyIdx++}
          className="font-mono text-[13px] px-1 py-0.2 rounded bg-surface-lowest/80 text-cyan-300 font-medium"
        >
          {token.slice(1, -1)}
        </span>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(<span key={keyIdx++}>{text.substring(lastIndex)}</span>);
  }

  return parts.length > 0 ? parts : text;
}

export default function FormattedMessage({ text }) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let currentTable = null;
  let inCodeBlock = false;
  let codeBlockLines = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Code block toggle (```)
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre
            key={`code-${i}`}
            className="my-3 p-3 rounded-xl bg-surface-lowest border border-slate-800 font-mono text-xs text-brand-glow overflow-x-auto"
          >
            {codeBlockLines.join('\n')}
          </pre>
        );
        codeBlockLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(rawLine);
      continue;
    }

    // Markdown Table Detection
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (!currentTable) {
        currentTable = [];
      }
      currentTable.push(trimmed);
      continue;
    } else if (currentTable) {
      // Flush current table
      elements.push(renderTable(currentTable, `table-${i}`));
      currentTable = null;
    }

    // Math block ($$ ... $$)
    if (trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length > 4) {
      const formula = trimmed.slice(2, -2).trim();
      elements.push(
        <div
          key={`math-${i}`}
          className="my-2.5 px-3.5 py-2 rounded-xl bg-surface-lowest border border-slate-800 text-center font-mono text-xs sm:text-sm text-cyan-300 overflow-x-auto"
        >
          {formula}
        </div>
      );
      continue;
    }

    // Horizontal Rule (---)
    if (trimmed === '---' || trimmed === '***') {
      elements.push(<hr key={`hr-${i}`} className="my-3 border-slate-800" />);
      continue;
    }

    // Heading 3 (###)
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3
          key={`h3-${i}`}
          className="mt-3.5 mb-2 font-heading font-bold text-sm sm:text-base text-brand-glow flex items-center gap-2 border-b border-slate-800/80 pb-1.5"
        >
          <span>{formatInline(trimmed.replace(/^###\s+/, ''))}</span>
        </h3>
      );
      continue;
    }

    // Heading 4 (####)
    if (trimmed.startsWith('#### ')) {
      const title = trimmed.replace(/^####\s+/, '');
      const isTrap = title.includes('Trap') || title.includes('Ambush') || title.includes('⚠️');
      const isTip = title.includes('Tip') || title.includes('Shortcut') || title.includes('💡');

      elements.push(
        <h4
          key={`h4-${i}`}
          className={`mt-3 mb-1 font-heading font-semibold text-xs sm:text-sm flex items-center gap-1.5 ${
            isTrap
              ? 'text-amber-400'
              : isTip
              ? 'text-emerald-400'
              : 'text-slate-200'
          }`}
        >
          <span>{formatInline(title)}</span>
        </h4>
      );
      continue;
    }

    // Blockquote (> )
    if (trimmed.startsWith('> ')) {
      elements.push(
        <blockquote
          key={`bq-${i}`}
          className="my-2 border-l-2 border-brand-glow bg-surface-lowest/60 px-3 py-1.5 rounded-r-lg text-xs italic text-slate-300"
        >
          {formatInline(trimmed.replace(/^>\s+/, ''))}
        </blockquote>
      );
      continue;
    }

    // Unordered List (* or -)
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      elements.push(
        <div key={`li-${i}`} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300 ml-1 my-1">
          <span className="text-brand-glow text-base leading-none select-none">•</span>
          <span className="flex-1">{formatInline(trimmed.replace(/^[*\-]\s+/, ''))}</span>
        </div>
      );
      continue;
    }

    // Ordered List (1. 2.)
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      elements.push(
        <div key={`num-${i}`} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300 ml-1 my-1">
          <span className="font-mono text-[11px] font-bold text-cyan-400 bg-surface-lowest px-1.5 py-0.5 rounded border border-slate-800 shrink-0">
            {numMatch[1]}
          </span>
          <span className="flex-1">{formatInline(numMatch[2])}</span>
        </div>
      );
      continue;
    }

    // Empty line
    if (!trimmed) {
      elements.push(<div key={`sp-${i}`} className="h-1.5" />);
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={`p-${i}`} className="text-xs sm:text-sm text-slate-300 leading-relaxed my-1">
        {formatInline(rawLine)}
      </p>
    );
  }

  // Flush trailing table if any
  if (currentTable) {
    elements.push(renderTable(currentTable, 'table-end'));
  }

  return <div className="space-y-0.5">{elements}</div>;
}

function renderTable(tableLines, key) {
  if (tableLines.length < 2) return null;

  const parseRow = (line) =>
    line
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim());

  const headers = parseRow(tableLines[0]);
  const rows = tableLines
    .slice(2)
    .filter((l) => !l.includes('---'))
    .map(parseRow);

  return (
    <div key={key} className="my-3 overflow-x-auto rounded-xl border border-slate-800 bg-surface-lowest">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-slate-800 bg-surface-container">
            {headers.map((h, idx) => (
              <th key={idx} className="p-2.5 font-mono font-semibold text-slate-200">
                {formatInline(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {rows.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-surface-low/50">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="p-2.5 text-slate-300">
                  {formatInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
