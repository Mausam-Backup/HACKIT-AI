"use client";

import React, { useState, useEffect, useRef } from "react";
import mermaid from "mermaid";
import {
  Code,
  Sparkles,
  Send,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  FileCode,
  Wand2,
  Download,
  Image as ImageIcon,
  PanelRightClose,
  PanelRightOpen,
  LayoutGrid,
  Eye,
  Terminal as CodeIcon,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

mermaid.initialize({
  startOnLoad: false,
  theme: "neutral",
  securityLevel: "loose",
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
    curve: "basis",
  },
});

const TEMPLATES: Record<string, { label: string; code: string }> = {
  swarm: {
    label: "Multi-Agent Swarm",
    code: `graph TD
    User([User Problem Spec]) --> Router{Agent Router}
    Router -->|Decompose| Coach[AI Hack Coach]
    Router -->|Context| FastMCP[FastMCP Context Server]
    FastMCP --> Mem0[(Mem0 Vector Store)]
    Coach --> CodeGen[Enterprise CLI Agent]
    CodeGen --> Presentation[Pitch Deck Synthesizer]
    Presentation --> Export([PPTX / PDF Output])`,
  },
  fastmcp: {
    label: "FastMCP Context Pipeline",
    code: `flowchart LR
    Client[Next.js Client] -->|SSE Stream| Server[FastAPI Server]
    Server -->|Tool Calls| MCP[FastMCP Server]
    MCP -->|FastEmbed| Vector[(Mem0 Embeddings)]
    Server -->|Generate| Decks[Presentation Engine]`,
  },
  pitch: {
    label: "5-Slide Pitch Generator",
    code: `graph LR
    Slide1[01 Hook & Problem] --> Slide2[02 Solution Architecture]
    Slide2 --> Slide3[03 Live SSE Demo]
    Slide3 --> Slide4[04 Tech Stack & 2FA]
    Slide4 --> Slide5[05 Export & Roadmap]`,
  },
  architecture: {
    label: "Full Stack Architecture",
    code: `graph TD
    Frontend[Next.js 15 UI] -->|REST / SSE| Backend[FastAPI Server]
    Backend --> AuthService[Express 2FA Auth]
    Backend --> SQLite[(SQLAlchemy DB)]
    Backend --> FastMCP[FastMCP Server]
    FastMCP --> Mem0[(Mem0 Vector Store)]`,
  },
  rag: {
    label: "Mem0 RAG Flow",
    code: `flowchart TD
    Doc[LiteParse Spec Reader] --> Chunk[Score-Based Chunker]
    Chunk --> Embed[FastEmbed Embeddings]
    Embed --> Store[(Mem0 Persistent Store)]
    Store --> Prompt[AI Prompt Synthesizer]`,
  },
};

interface MermaidPanelProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function MermaidPanel({
  isCollapsed = false,
  onToggleCollapse,
}: MermaidPanelProps) {
  const [activeTemplate, setActiveTemplate] = useState("swarm");
  const [mermaidCode, setMermaidCode] = useState(TEMPLATES["swarm"].code);
  const [svgContent, setSvgContent] = useState<string>("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // View Mode: 'split' | 'diagram' | 'code'
  const [viewMode, setViewMode] = useState<"split" | "diagram" | "code">("split");
  const [zoomScale, setZoomScale] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    const renderDiagram = async () => {
      try {
        const id = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(id, mermaidCode);
        if (isMounted) {
          setSvgContent(svg);
        }
      } catch (err) {
        console.error("Mermaid Render Error:", err);
      }
    };

    renderDiagram();
    return () => {
      isMounted = false;
    };
  }, [mermaidCode]);

  const handleTemplateSelect = (key: string) => {
    setActiveTemplate(key);
    setMermaidCode(TEMPLATES[key].code);
  };

  const handleAiGenerate = () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);

    setTimeout(() => {
      const generatedCode = `graph TD
    Input([Prompt: ${aiPrompt}]) --> Agent[HAC-KIT Agent]
    Agent -->|Execute| FastMCP[FastMCP Context Server]
    FastMCP --> Mem0[(Mem0 Store)]
    Mem0 --> Result([Generated Pipeline Output])`;

      setMermaidCode(generatedCode);
      setAiPrompt("");
      setIsGenerating(false);
    }, 800);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(mermaidCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download Diagram as PNG
  const handleDownloadPNG = () => {
    if (!containerRef.current) return;
    const svgElement = containerRef.current.querySelector("svg");
    if (!svgElement) return;

    try {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const encodedSvg = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgData)}`;

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const bbox = svgElement.getBoundingClientRect();
        canvas.width = Math.max(bbox.width * 2, 800);
        canvas.height = Math.max(bbox.height * 2, 600);
        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }

        try {
          const pngUrl = canvas.toDataURL("image/png");
          const downloadLink = document.createElement("a");
          downloadLink.href = pngUrl;
          downloadLink.download = `mermaid-diagram-${Date.now()}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        } catch (canvasErr) {
          console.warn("Canvas security restriction, falling back to SVG export:", canvasErr);
          handleDownloadSVG();
        }
      };

      img.src = encodedSvg;
    } catch (err) {
      console.error("PNG Export error, falling back to SVG:", err);
      handleDownloadSVG();
    }
  };

  // Download Diagram as SVG
  const handleDownloadSVG = () => {
    if (!containerRef.current) return;
    const svgElement = containerRef.current.querySelector("svg");
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = `mermaid-diagram-${Date.now()}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  if (isCollapsed) {
    return (
      <aside className="w-12 h-screen bg-white border-l border-slate-200 flex flex-col items-center py-4 justify-between shrink-0 z-20 select-none">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
          title="Expand Mermaid Studio"
        >
          <PanelRightOpen className="size-5 text-cyan-600" />
        </button>
      </aside>
    );
  }

  return (
    <aside
      className={`${
        isExpanded ? "w-[600px]" : "w-[420px]"
      } h-screen bg-white border-l border-slate-200 flex flex-col shrink-0 transition-all duration-300 z-20 select-none overflow-hidden`}
    >
      {/* Top Header */}
      <div className="p-3 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-50 text-cyan-600">
            <Wand2 className="size-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">Mermaid AI Studio</h3>
            <span className="text-[10px] text-cyan-600 font-semibold">
              Live Code & Export Engine
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleDownloadPNG}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-[11px] font-bold transition-colors"
            title="Download PNG"
          >
            <ImageIcon className="size-3" />
            <span>PNG</span>
          </button>
          <button
            onClick={handleDownloadSVG}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors"
            title="Download SVG"
          >
            <Download className="size-3" />
            <span>SVG</span>
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            title={isExpanded ? "Standard Width" : "Expand Width"}
          >
            {isExpanded ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </button>
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              title="Close Right Panel"
            >
              <PanelRightClose className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Preset Templates */}
      <div className="p-2.5 border-b border-slate-100 bg-slate-50/50 shrink-0">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
          Preset Architecture Flowcharts
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {Object.entries(TEMPLATES).map(([key, item]) => (
            <button
              key={key}
              onClick={() => handleTemplateSelect(key)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTemplate === key
                  ? "bg-cyan-500 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Section View Mode Controller (Split View / Diagram Focus / Code Focus) */}
      <div className="px-3 py-1.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
          <button
            onClick={() => setViewMode("split")}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
              viewMode === "split"
                ? "bg-cyan-500 text-white shadow-2xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <LayoutGrid className="size-3" />
            <span>Split View</span>
          </button>
          <button
            onClick={() => setViewMode("diagram")}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
              viewMode === "diagram"
                ? "bg-cyan-500 text-white shadow-2xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Eye className="size-3" />
            <span>Diagram Only</span>
          </button>
          <button
            onClick={() => setViewMode("code")}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
              viewMode === "code"
                ? "bg-cyan-500 text-white shadow-2xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <CodeIcon className="size-3" />
            <span>Code Only</span>
          </button>
        </div>

        {/* Diagram Zoom Controls */}
        {viewMode !== "code" && (
          <div className="flex items-center gap-1 text-slate-500">
            <button
              onClick={() => setZoomScale((z) => Math.max(0.6, z - 0.1))}
              className="p-1 hover:bg-white rounded text-slate-600 border border-slate-200"
              title="Zoom Out Diagram"
            >
              <ZoomOut className="size-3" />
            </button>
            <span className="font-mono text-[10px] w-8 text-center">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              onClick={() => setZoomScale((z) => Math.min(1.6, z + 0.1))}
              className="p-1 hover:bg-white rounded text-slate-600 border border-slate-200"
              title="Zoom In Diagram"
            >
              <ZoomIn className="size-3" />
            </button>
          </div>
        )}
      </div>

      {/* Main Body Content Container */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-slate-50/40">
        {/* 1. Live Diagram Render Preview Box */}
        {(viewMode === "split" || viewMode === "diagram") && (
          <div
            className={`p-4 overflow-auto flex items-start justify-center border-b border-slate-200 transition-all ${
              viewMode === "diagram" ? "flex-1" : "h-1/2 min-h-[200px]"
            }`}
          >
            {svgContent ? (
              <div
                ref={containerRef}
                style={{ transform: `scale(${zoomScale})`, transformOrigin: "top center" }}
                className="w-full flex items-center justify-center p-2 transition-transform [&>svg]:max-w-full [&>svg]:h-auto"
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            ) : (
              <div className="text-center text-xs text-slate-400 mt-12">Rendering Diagram...</div>
            )}
          </div>
        )}

        {/* 2. Light Mode Code Editor Box */}
        {(viewMode === "split" || viewMode === "code") && (
          <div
            className={`p-3 bg-white text-slate-800 font-mono text-xs flex flex-col overflow-hidden border-b border-slate-200 ${
              viewMode === "code" ? "flex-1" : "h-1/2 min-h-[180px]"
            }`}
          >
            <div className="flex items-center justify-between pb-2 mb-1.5 border-b border-slate-100 text-[11px] text-slate-500 font-sans shrink-0">
              <div className="flex items-center gap-1.5 font-bold">
                <FileCode className="size-3.5 text-cyan-600" />
                <span>Mermaid Syntax Editor</span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors font-medium"
              >
                {copied ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                <span>{copied ? "Copied" : "Copy Code"}</span>
              </button>
            </div>

            <textarea
              value={mermaidCode}
              onChange={(e) => setMermaidCode(e.target.value)}
              className="flex-1 w-full bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white resize-none overflow-y-auto font-mono text-xs leading-relaxed shadow-2xs"
              placeholder="graph TD..."
            />
          </div>
        )}
      </div>

      {/* AI Prompt Input Bar */}
      <div className="p-3 bg-white border-t border-slate-200 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAiGenerate();
          }}
          className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 bg-slate-50/80 focus-within:border-cyan-500 focus-within:bg-white transition-all"
        >
          <Sparkles className="size-4 text-cyan-600 shrink-0 ml-1.5" />
          <input
            type="text"
            id="mermaid-ai-input"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Ask AI to generate or modify flowchart..."
            className="flex-1 bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isGenerating || !aiPrompt.trim()}
            className="p-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white disabled:opacity-40 transition-colors shadow-xs"
          >
            <Send className="size-3.5" />
          </button>
        </form>
      </div>
    </aside>
  );
}
