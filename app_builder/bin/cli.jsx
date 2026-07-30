import React, { useState, useEffect, useRef } from 'react';
import { render, Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { spawn, execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isTTY = process.stdout.isTTY;

if (isTTY) {
  process.stdout.write('\x1b[?1049h');
  process.stdout.write('\x1b[?1000l');
  process.stdout.write('\x1b[?1006l');
  let altScreenRestored = false;
  const restoreScreen = () => {
    if (!altScreenRestored) {
      altScreenRestored = true;
      process.stdout.write('\x1b[?1000l');
      process.stdout.write('\x1b[?1006l');
      process.stdout.write('\x1b[?1049l');
    }
  };
  process.on('SIGINT', () => { restoreScreen(); process.exit(0); });
  process.on('exit', restoreScreen);
}

const cleanInput = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .replace(/\x1b\[[0-9;?]*[a-zA-Z]/g, '')
    .replace(/\[<[0-9]+;[0-9]+;[0-9]+[mM]/g, '')
    .replace(/\[M[\s\S]{3}/g, '')
    .replace(/[\x00-\x08\x0B-\x1F\x7F]/g, '');
};

const commands = ['python', 'python3', 'py'];
let pythonCmd = null;
try {
  for (const cmd of commands) {
    try { execSync(`${cmd} --version`, { stdio: 'ignore' }); pythonCmd = cmd; break; } catch (e) {}
  }
} catch(e) {}

const Starfield = ({ columns, rows }) => {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const s = [];
    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < columns; j++) {
        if (Math.random() < 0.02) {
          row.push(['+', '.', '*', '·'][Math.floor(Math.random() * 4)]);
        } else {
          row.push(null);
        }
      }
      s.push(row);
    }
    setStars(s);
  }, [columns, rows]);

  const lines = stars.map((row, i) => {
    let str = '';
    for (const star of row) {
      if (!star) { str += ' '; continue; }
      str += star;
    }
    return str;
  });

  return (
    <Box position="absolute" width={columns} height={rows} zIndex={-1} flexDirection="column">
      {lines.map((line, i) => (
        <Text key={i} color="#444">{line}</Text>
      ))}
    </Box>
  );
};

const SixSquarePulse = ({ isRunning }) => {
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (!isRunning) {
      setActive(-1);
      return;
    }
    const t = setInterval(() => setActive(a => (a + 1) % 6), 180);
    return () => clearInterval(t);
  }, [isRunning]);

  const squares = [0, 1, 2, 3, 4, 5];
  return (
    <Box marginRight={1}>
      {squares.map((i) => (
        <Text 
          key={i} 
          color={isRunning && i === active ? '#00ffff' : '#1c3b44'} 
          bold={isRunning && i === active}
        >
          ■
        </Text>
      ))}
    </Box>
  );
};

const StatusBar = ({ status, stages }) => {
  const doneCount = Object.values(stages).filter(s => s === 'done').length;
  const total = Object.keys(stages).length;
  const running = status === 'running';
  const done = status === 'done';

  let statusText = 'idle';
  let statusColor = 'gray';
  if (running) { statusText = 'running'; statusColor = 'yellow'; }
  if (done) { statusText = 'done'; statusColor = 'green'; }

  return (
    <Box height={1} backgroundColor="#111111" paddingLeft={1} paddingRight={1}>
      <Box flexGrow={1}>
        <SixSquarePulse isRunning={running} />
        <Text color="white"> </Text>
        <Text bold color="cyan">HACKIT</Text>
        <Text color="gray">  </Text>
        <Text color={statusColor}>{statusText}</Text>
        {running && (
          <Text color="gray">  [{doneCount}/{total}]</Text>
        )}
      </Box>
    </Box>
  );
};

const App = () => {
  const [input, setInput] = useState('');
  const handleInputChange = (val) => {
    setInput(cleanInput(val));
  };
  const [hasStarted, setHasStarted] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [size, setSize] = useState({
    columns: process.stdout.columns || 80,
    rows: process.stdout.rows || 24
  });
  const childRef = useRef(null);

  useEffect(() => {
    const onResize = () => {
      setSize({
        columns: process.stdout.columns || 80,
        rows: process.stdout.rows || 24
      });
    };
    process.stdout.on('resize', onResize);
    return () => process.stdout.removeListener('resize', onResize);
  }, []);
  const [stages, setStages] = useState({
    coach: 'pending',
    builder: 'pending',
    validation: 'pending',
    pitch: 'pending'
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const stacks = [
    "Vite + React + Express",
    "Next.js + Tailwind + Supabase",
    "Vanilla HTML + JS + CSS",
    "Vue 3 + Next + Node"
  ];
  const [stackIndex, setStackIndex] = useState(0);

  const [scrollOffset, setScrollOffset] = useState(0);

  const maxVisibleLogs = Math.max(4, Math.min(10, (size.rows || 24) - 15));
  const maxScroll = Math.max(0, logs.length - maxVisibleLogs);
  const effectiveScroll = Math.min(scrollOffset, maxScroll);
  const startLogIdx = Math.max(0, logs.length - maxVisibleLogs - effectiveScroll);
  const visibleLogs = logs.slice(startLogIdx, startLogIdx + maxVisibleLogs);

  useInput((inputChars, key) => {
    if (key.tab && !hasStarted) {
      setStackIndex((prev) => (prev + 1) % stacks.length);
    }
    if (hasStarted) {
      const isScrollUp = key.upArrow || 
        inputChars.includes('\x1b[<64') || 
        inputChars.includes('\x1b[<0;') || 
        inputChars.includes('\x1b[M`');

      const isScrollDown = key.downArrow || 
        inputChars.includes('\x1b[<65') || 
        inputChars.includes('\x1b[<1;') || 
        inputChars.includes('\x1b[Ma');

      if (isScrollUp) {
        setScrollOffset((prev) => Math.min(maxScroll, prev + 1));
      }
      if (isScrollDown) {
        setScrollOffset((prev) => Math.max(0, prev - 1));
      }
    }
  });

  useEffect(() => {
    if (isRunning) {
      setScrollOffset(0);
    }
  }, [logs.length, isRunning]);

  useEffect(() => {
    if (!pythonCmd) {
      setError("Python interpreter not found! Please install Python >= 3.11.");
    }
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [isRunning]);

  const handleSubmit = (value) => {
    const trimmed = cleanInput(value).trim();
    if (!trimmed) return;

    if (trimmed === '/new' || trimmed.startsWith('/new ')) {
      if (childRef.current) {
        try { childRef.current.kill(); } catch (e) {}
        childRef.current = null;
      }
      setHasStarted(false);
      setIsRunning(false);
      setLogs([]);
      setStages({ coach: 'pending', builder: 'pending', validation: 'pending', pitch: 'pending' });
      setError(null);
      setErrorDetails(null);
      setSuccess(false);
      setElapsed(0);
      setInput('');
      setScrollOffset(0);

      const remainder = trimmed.slice(4).trim();
      if (!remainder) return;
      value = remainder;
    }

    if (trimmed.length < 10 || trimmed.split(/\s+/).length < 2) {
      setError("Please provide a more detailed project idea (at least a few words). Or type /new for a fresh workspace.");
      return;
    }

    setHasStarted(true);
    setLogs([]);
    setStages({ coach: 'pending', builder: 'pending', validation: 'pending', pitch: 'pending' });
    setSuccess(false);
    setError(null);
    setErrorDetails(null);
    setElapsed(0);
    setIsRunning(true);
    setInput('');
    setScrollOffset(0);

    const bridgePath = path.join(__dirname, 'python_bridge.py');
    const finalIdea = `${value}\n\n[TECH STACK REQUIRED: ${stacks[stackIndex]}]`;
    const child = spawn(pythonCmd, [bridgePath, finalIdea], {
      env: { ...process.env, PYTHONUNBUFFERED: '1' }
    });
    childRef.current = child;

    child.stdout.on('data', (data) => {
      const lines = data.toString().split('\n');
      lines.forEach(line => {
        if (!line.trim()) return;
        try {
          const parsed = JSON.parse(line);
          handleEvent(parsed);
        } catch (e) {
          if (isTTY) {
            setLogs(prev => [...prev, line.trim()]);
          } else {
            console.log(line.trim());
          }
        }
      });
    });

    child.stderr.on('data', (data) => {
      const msg = `[ERR] ${data.toString().trim()}`;
      if (isTTY) {
        setLogs(prev => [...prev, msg]);
      } else {
        console.error(msg);
      }
    });

    child.on('close', (code) => {
      childRef.current = null;
      setIsRunning(false);
      if (code === 0) {
        setSuccess(true);
      } else {
        setError(`Pipeline failed with exit code ${code}`);
      }
    });
  };

  const [errorDetails, setErrorDetails] = useState(null);

  const handleEvent = (data) => {
    const { event, message, success, passed, error, traceback, log_file } = data;
    if (message) {
      if (isTTY) {
        setLogs(prev => [...prev, message.trim()]);
      } else {
        console.log(message.trim());
      }
    }
    setStages(prev => {
      let changed = false;
      const next = { ...prev };
      const updateStage = (key, val) => {
        if (next[key] !== val) { next[key] = val; changed = true; }
      };
      if (event === 'coach_start') updateStage('coach', 'active');
      if (event === 'coach_complete') updateStage('coach', success !== false ? 'done' : 'failed');
      if (event === 'builder_start') updateStage('builder', 'active');
      if (event === 'builder_complete') updateStage('builder', success !== false ? 'done' : 'failed');
      if (event === 'validation_start') updateStage('validation', 'active');
      if (event === 'validation_complete') updateStage('validation', passed !== false ? 'done' : 'failed');
      if (event === 'pitch_update_start' || event === 'judge_start') updateStage('pitch', 'active');
      if (event === 'pitch_update_complete') updateStage('pitch', 'done');
      if (event === 'pipeline_error') {
        setError(error || "Unknown pipeline error");
        setErrorDetails({ traceback, log_file });
      }
      return changed ? next : prev;
    });
  };

  const renderStage = (name, label, status) => {
    let icon = <Text color="gray">○</Text>;
    if (status === 'active') icon = <Text color="yellow">▶</Text>;
    if (status === 'done') icon = <Text color="green">✓</Text>;
    if (status === 'failed') icon = <Text color="red">✗</Text>;

    return (
      <Box key={name}>
        <Box width={3}>{icon}</Box>
        <Text bold={status === 'active'} color={status === 'active' ? 'white' : 'gray'}>
          {label}
        </Text>
      </Box>
    );
  };

  const status = isRunning ? 'running' : (success ? 'done' : 'idle');

  return (
    <Box flexDirection="column" height="100%">
      <Box flexGrow={1} flexDirection="column" padding={hasStarted ? 1 : 0} paddingBottom={0}>
        
        {!hasStarted && <Starfield columns={size.columns} rows={Math.max(0, size.rows - 1)} />}

        {!hasStarted ? (
          <Box 
            width={size.columns} 
            height={Math.max(0, size.rows - 1)} 
            justifyContent="center" 
            alignItems="center" 
            flexDirection="column"
          >
            {/* Centered Logo */}
            <Box flexDirection="column" alignItems="center" marginBottom={2}>
              <Text bold color="white">
{`██╗  ██╗ █████╗  ██████╗██╗  ██╗██╗████████╗
██║  ██║██╔══██╗██╔════╝██║ ██╔╝██║╚══██╔══╝
███████║███████║██║     █████╔╝ ██║   ██║   
██╔══██║██╔══██║██║     ██╔═██╗ ██║   ██║   
██║  ██║██║  ██║╚██████╗██║  ██╗██║   ██║   
╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝   ╚═╝`}
              </Text>
              <Text italic color="gray">Autonomous AI Hackathon Coach & App Builder</Text>
            </Box>

            {/* Error banner */}
            {error && !isRunning && (
              <Box flexDirection="column" marginBottom={1} borderColor="red" borderStyle="round" padding={1}>
                <Text color="red" bold>❌ Fatal Error: {error}</Text>
                {errorDetails?.log_file && (
                  <Text color="yellow">📄 Log file: {errorDetails.log_file}</Text>
                )}
                {errorDetails?.traceback && (
                  <Box marginTop={1} flexDirection="column">
                    <Text color="gray" bold>Traceback:</Text>
                    <Text color="red">{errorDetails.traceback.split('\n').slice(-8).join('\n')}</Text>
                  </Box>
                )}
              </Box>
            )}

            {/* Welcome input (Claude Code style 2-line prompt) */}
            <Box width={size.columns ? Math.floor(size.columns * 0.75) : 75} flexDirection="column" marginY={1}>
              {/* Top Line */}
              <Box flexDirection="row" alignItems="center">
                <Text color="#3b82f6">── </Text>
                <Text color="cyan" bold>Tell me your next crazzzzyyy idea!</Text>
                <Text color="#3b82f6"> {"─".repeat(Math.max(5, (size.columns ? Math.floor(size.columns * 0.75) : 75) - 39))}</Text>
              </Box>

              {/* Input Row */}
              <Box flexDirection="row" marginY={1} paddingLeft={2}>
                <Text color="cyan" bold>❯ </Text>
                <TextInput value={input} onChange={handleInputChange} onSubmit={handleSubmit} />
                {input.length === 0 && (
                  <Text color="#6e7681"> Ask anything... "Create a retro snake game"</Text>
                )}
              </Box>

              {/* Tech Stack Indicator */}
              <Box paddingLeft={2} marginBottom={1}>
                <Text color="#2f81f7">TECH Stack </Text>
                <Text color="#8b949e">· </Text>
                <Text color="#e3b341" bold>{stacks[stackIndex]}</Text>
                <Text color="#8b949e"> ·</Text>
              </Box>

              {/* Bottom Line */}
              <Box flexDirection="row" alignItems="center">
                <Text color="#3b82f6">{"─".repeat(size.columns ? Math.floor(size.columns * 0.75) : 75)}</Text>
              </Box>
            </Box>
            
            <Box width={size.columns ? Math.floor(size.columns * 0.75) : 75} marginTop={1} paddingLeft={2}>
              <Text color="#8b949e">
                <Text bold color="#c9d1d9">enter</Text> run pipeline   <Text bold color="#c9d1d9">tab</Text> cycle stack   <Text bold color="#c9d1d9">/new</Text> fresh window
              </Text>
            </Box>
          </Box>
        ) : (
          <Box height={Math.max(0, size.rows - 1)} overflow="hidden" flexDirection="column">
            <Box flexDirection="column">
              {/* Logo area (Left-aligned for active state) */}
              <Box flexDirection="column" marginBottom={1}>
                <Text bold color="white">
{`██╗  ██╗ █████╗  ██████╗██╗  ██╗██╗████████╗
██║  ██║██╔══██╗██╔════╝██║ ██╔╝██║╚══██╔══╝
███████║███████║██║     █████╔╝ ██║   ██║   
██╔══██║██╔══██║██║     ██╔═██╗ ██║   ██║   
██║  ██║██║  ██║╚██████╗██║  ██╗██║   ██║   
╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝   ╚═╝`}
                </Text>
                <Text italic color="gray">Autonomous AI Hackathon Coach & App Builder</Text>
              </Box>

              {/* Error banner */}
              {error && !isRunning && (
                <Box flexDirection="column" marginBottom={1} borderColor="red" borderStyle="round" padding={1}>
                  <Text color="red" bold>❌ Fatal Error: {error}</Text>
                  {errorDetails?.log_file && (
                    <Text color="yellow">📄 Log file: {errorDetails.log_file}</Text>
                  )}
                  {errorDetails?.traceback && (
                    <Box marginTop={1} flexDirection="column">
                      <Text color="gray" bold>Traceback:</Text>
                      <Text color="red">{errorDetails.traceback.split('\n').slice(-12).join('\n')}</Text>
                    </Box>
                  )}
                </Box>
              )}

              {/* Success banner */}
              {success && (
                <Box marginBottom={1} borderColor="green" borderStyle="round" padding={0}>
                  <Text color="green" bold>🎉 SUCCESS! Project is ready.</Text>
                </Box>
              )}

              {/* Pipeline progress */}
              {isRunning && (
                <Box flexDirection="column" marginBottom={1}>
                  <Box borderStyle="round" borderColor="yellow" padding={0} flexDirection="column">
                    <Text bold color="yellow">⚡ HACKIT Agent Pipeline Progress{"  "}<Text color="white">⏱ {String(Math.floor(elapsed / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')}</Text></Text>
                    <Box flexDirection="column">
                      {renderStage('coach', '1. Coach Planning (PLAN, ARCHITECTURE, TASKS, PROMPTS)', stages.coach)}
                      {renderStage('builder', '2. Code Generation (Vite+React Frontend & Express Backend)', stages.builder)}
                      {renderStage('validation', '3. Validation & Repair (Build, Lint, Tests & Auto-repair)', stages.validation)}
                      {renderStage('pitch', '4. Pitch & Evaluation (HACKATHON update & JUDGE score)', stages.pitch)}
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Full Pipeline Logs Panel (Bounded & Scrollable) */}
              {logs.length > 0 && (
                <Box flexDirection="column" borderStyle="round" borderColor="#333" padding={1} marginBottom={1}>
                  <Box justifyContent="space-between" marginBottom={1}>
                    <Text color="cyan" bold>📋 Pipeline Logs</Text>
                    <Text color="#6e7681">
                      {`[Total ${logs.length} logs | ↑/↓ scroll (${startLogIdx + 1}-${startLogIdx + visibleLogs.length})]`}
                    </Text>
                  </Box>
                  {visibleLogs.map((logLine, idx) => (
                    <Text key={idx} color="gray" wrap="truncate-end">{logLine}</Text>
                  ))}
                </Box>
              )}

              {/* Post-pipeline input (Claude Code style 2-line prompt) */}
              {!isRunning && hasStarted && (
                <Box flexDirection="column" marginTop={1} marginBottom={2}>
                  {/* Top Line */}
                  <Box flexDirection="row" alignItems="center">
                    <Text color="#3b82f6">── </Text>
                    <Text color="cyan" bold>What's Next!</Text>
                    <Text color="#3b82f6"> {"─".repeat(Math.max(5, (size.columns || 80) - 18))}</Text>
                  </Box>

                  {/* Input Row */}
                  <Box flexDirection="row" marginY={1} paddingLeft={2}>
                    <Text color="cyan" bold>❯ </Text>
                    <TextInput value={input} onChange={handleInputChange} onSubmit={handleSubmit} />
                    {input.length === 0 && (
                      <Text color="#6e7681"> Type prompt or /new to reset workspace</Text>
                    )}
                  </Box>

                  {/* Bottom Line */}
                  <Box flexDirection="row" alignItems="center">
                    <Text color="#3b82f6">{"─".repeat(size.columns || 80)}</Text>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        )}

      </Box>

      {/* Status bar */}
      <StatusBar status={status} stages={stages} />
    </Box>
  );
};

render(<App />);
