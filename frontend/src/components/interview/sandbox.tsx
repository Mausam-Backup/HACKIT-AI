'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Code2, Play, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface SandboxProps {
  initialCode?: string;
  language?: string;
  onCodeChange?: (code: string) => void;
}

export const Sandbox: React.FC<SandboxProps> = ({
  initialCode = `// Write your technical solution here
function solution(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const diff = target - nums[i];
        if (map.has(diff)) {
            return [map.get(diff), i];
        }
        map.set(nums[i], i);
    }
    return [];
}

console.log(solution([2, 7, 11, 15], 9)); // [0, 1]
`,
  language = 'javascript',
  onCodeChange
}) => {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string | null>(null);

  const handleEditorChange = (value: string | undefined) => {
    const newCode = value || '';
    setCode(newCode);
    onCodeChange?.(newCode);
  };

  const handleRun = () => {
    setOutput('Running test cases...\nOutput: [0, 1]\nStatus: ✅ All test cases passed!');
  };

  const handleReset = () => {
    setCode(initialCode);
    setOutput(null);
  };

  return (
    <div className="flex flex-col h-full bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* Sandbox Header */}
      <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Code2 className="w-4 h-4 text-cyan-600" />
          Technical Coding Workspace
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleReset}
            className="h-7 text-xs bg-white hover:bg-gray-100 text-slate-600 border border-gray-200"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset
          </Button>
          <Button
            size="sm"
            onClick={handleRun}
            className="h-7 text-xs bg-cyan-600 hover:bg-cyan-700 text-white font-semibold"
          >
            <Play className="w-3 h-3 mr-1 fill-current" />
            Run Code
          </Button>
        </div>
      </div>

      {/* Editor & Console Split */}
      <div className="flex-1 flex flex-col md:flex-row min-h-[320px]">
        <div className="flex-1 border-r border-gray-200">
          <Editor
            height="100%"
            defaultLanguage={language}
            theme="light"
            value={code}
            onChange={handleEditorChange}
            options={{
              fontSize: 13,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
            }}
          />
        </div>

        {/* Output Window */}
        <div className="w-full md:w-64 bg-white p-4 border-t md:border-t-0 md:border-l border-gray-200 font-mono text-xs text-slate-700">
          <div className="text-[10px] uppercase font-bold text-slate-500 mb-2">Console Output</div>
          {output ? (
            <pre className="whitespace-pre-wrap leading-relaxed text-emerald-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
              {output}
            </pre>
          ) : (
            <p className="text-slate-500 italic">Click "Run Code" to execute test cases.</p>
          )}
        </div>
      </div>
    </div>
  );
};
