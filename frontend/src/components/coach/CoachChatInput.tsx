import React from 'react';
import { Attachment } from '@/services/coach-service';
import { Zap, Image as ImageIcon, FileText, Trash2, Paperclip, Settings, Mic, ArrowUp } from 'lucide-react';

interface CoachChatInputProps {
  input: string;
  setInput: (val: string) => void;
  attachments: Attachment[];
  removeAttachment: (idx: number) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (val: boolean) => void;
  isLoading: boolean;
  handleSend: () => void;
}

export default function CoachChatInput({
  input,
  setInput,
  attachments,
  removeAttachment,
  handleKeyDown,
  handleFileUpload,
  fileInputRef,
  mobileMenuOpen,
  setMobileMenuOpen,
  isLoading,
  handleSend
}: CoachChatInputProps) {
  return (
    <div className="w-full bg-white border border-gray-200 rounded-[20px] p-4 shadow-sm relative">
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
          <Zap className="w-3.5 h-3.5" /> <span>OpenRouter OSS 120B Connected</span>
        </div>
      </div>
      
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3 px-2">
          {attachments.map((att, idx) => (
            <div
              key={idx}
              className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs text-slate-700 flex items-center gap-2"
            >
              {att.type === 'image' ? (
                <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <FileText className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span className="font-medium max-w-[140px] truncate">{att.name}</span>
              <button
                onClick={() => removeAttachment(idx)}
                className="text-slate-400 hover:text-rose-500 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask me anything..."
        rows={1}
        className="w-full bg-transparent border-0 p-2 text-slate-900 placeholder-slate-400 resize-none outline-none text-sm min-h-[36px]"
      />

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="file"
            ref={fileInputRef as any}
            onChange={handleFileUpload}
            multiple
            accept="image/*,.pdf,.txt,.md,.json,.csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-full bg-gray-50 hover:bg-gray-100 text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2 transition-colors border border-gray-200"
          >
            <Paperclip className="w-3.5 h-3.5" /> Import File
          </button>
          
          <div className="lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="px-4 py-2 rounded-full bg-gray-50 hover:bg-gray-100 text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2 transition-colors border border-gray-200"
            >
              <Settings className="w-3.5 h-3.5" /> Config
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="text-slate-400 hover:text-slate-700 transition-colors p-2">
            <Mic className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleSend()}
            disabled={isLoading || (!input.trim() && attachments.length === 0)}
            className="w-10 h-10 rounded-full bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-20 flex items-center justify-center transition-all"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
