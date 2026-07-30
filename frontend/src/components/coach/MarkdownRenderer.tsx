"use client";

import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let inList = false;
  let listItems: React.ReactNode[] = [];
  let listType: 'ul' | 'ol' = 'ul';
  let tableLines: string[] = [];
  let inTable = false;

  const flushList = () => {
    if (inList && listItems.length > 0) {
      if (listType === 'ul') {
        elements.push(
          <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1.5 my-2.5">
            {listItems}
          </ul>
        );
      } else {
        elements.push(
          <ol key={`ol-${elements.length}`} className="list-decimal list-inside space-y-1.5 my-2.5">
            {listItems}
          </ol>
        );
      }
      listItems = [];
      inList = false;
    }
  };

  const flushTable = () => {
    if (!inTable || tableLines.length < 2) {
      if (tableLines.length > 0) tableLines = [];
      inTable = false;
      return;
    }

    const parseRow = (row: string) =>
      row
        .split('|')
        .map(cell => cell.trim())
        .filter((_, i, arr) => i !== 0 && i !== arr.length - 1);

    const headerCells = parseRow(tableLines[0]);
    const dataRows = tableLines.slice(2).map(parseRow); // skip separator row

    elements.push(
      <div key={`table-${elements.length}`} className="my-4 w-full overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {headerCells.map((cell, ci) => (
                <th
                  key={ci}
                  className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap"
                >
                  {formatInlineText(cell)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, ri) => (
              <tr
                key={ri}
                className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
              >
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className={`px-4 py-2.5 text-sm leading-relaxed ${ci === 0 ? 'font-semibold text-slate-800' : 'text-slate-600'}`}
                  >
                    {formatInlineText(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

    tableLines = [];
    inTable = false;
  };

  const formatInlineText = (text: string): React.ReactNode[] => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*|~~.*?~~)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold not-italic">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[11px] not-italic text-slate-800">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return <em key={index}>{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('~~') && part.endsWith('~~')) {
        return <del key={index}>{part.slice(2, -2)}</del>;
      }
      return part;
    });
  };

  // Check if line is a table row
  const isTableRow = (line: string) => {
    const t = line.trim();
    return t.startsWith('|') && t.endsWith('|');
  };

  // Check if line is a separator row (|---|---|)
  const isSeparatorRow = (line: string) => /^\|[\s\-:|]+\|$/.test(line.trim());

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();

    // Table detection
    if (isTableRow(trimmed)) {
      if (!inTable) {
        flushList();
        inTable = true;
        tableLines = [];
      }
      tableLines.push(trimmed);
      return;
    } else if (inTable) {
      flushTable();
    }

    // Headers
    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={lineIdx} className="text-base font-bold not-italic mt-4 mb-2">
          {formatInlineText(trimmed.slice(4))}
        </h3>
      );
      return;
    }

    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={lineIdx} className="text-lg font-extrabold not-italic mt-5 mb-2 pb-1 border-b border-gray-200">
          {formatInlineText(trimmed.slice(3))}
        </h2>
      );
      return;
    }

    if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(
        <h1 key={lineIdx} className="text-xl font-black not-italic mt-6 mb-3">
          {formatInlineText(trimmed.slice(2))}
        </h1>
      );
      return;
    }

    // Horizontal Divider
    if (trimmed === '---' || trimmed === '***') {
      flushList();
      elements.push(<hr key={lineIdx} className="my-4 border-gray-200" />);
      return;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      flushList();
      elements.push(
        <blockquote key={lineIdx} className="my-2.5 p-3 rounded-xl bg-gray-50 border-l-2 border-indigo-400 text-sm italic text-slate-600 opacity-90">
          {formatInlineText(trimmed.slice(2))}
        </blockquote>
      );
      return;
    }

    // Unordered List (- or *)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList || listType !== 'ul') {
        flushList();
        inList = true;
        listType = 'ul';
      }
      listItems.push(
        <li key={lineIdx} className="text-sm">
          {formatInlineText(trimmed.slice(2))}
        </li>
      );
      return;
    }

    // Ordered List (1. 2. etc)
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      if (!inList || listType !== 'ol') {
        flushList();
        inList = true;
        listType = 'ol';
      }
      listItems.push(
        <li key={lineIdx} className="text-sm">
          {formatInlineText(numMatch[2])}
        </li>
      );
      return;
    }

    // Empty Line
    if (trimmed === '') {
      flushList();
      return;
    }

    // Normal Paragraph
    flushList();
    elements.push(
      <p key={lineIdx} className="text-sm leading-[1.85] my-1.5">
        {formatInlineText(line)}
      </p>
    );
  });

  flushList();
  flushTable();

  return <div className="space-y-1">{elements}</div>;
}
