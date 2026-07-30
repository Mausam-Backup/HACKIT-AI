#!/usr/bin/env node

// bin/cli.jsx
import React, { useState, useEffect, useRef } from "react";
import { render, Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";
import { spawn, execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var isTTY = process.stdout.isTTY;
if (isTTY) {
  process.stdout.write("\x1B[?1049h");
  process.stdout.write("\x1B[?1000l");
  process.stdout.write("\x1B[?1006l");
  let altScreenRestored = false;
  const restoreScreen = () => {
    if (!altScreenRestored) {
      altScreenRestored = true;
      process.stdout.write("\x1B[?1000l");
      process.stdout.write("\x1B[?1006l");
      process.stdout.write("\x1B[?1049l");
    }
  };
  process.on("SIGINT", () => {
    restoreScreen();
    process.exit(0);
  });
  process.on("exit", restoreScreen);
}
var cleanInput = (str) => {
  if (typeof str !== "string") return "";
  return str.replace(/\x1b\[[0-9;?]*[a-zA-Z]/g, "").replace(/\[<[0-9]+;[0-9]+;[0-9]+[mM]/g, "").replace(/\[M[\s\S]{3}/g, "").replace(/[\x00-\x08\x0B-\x1F\x7F]/g, "");
};
var commands = ["python", "python3", "py"];
var pythonCmd = null;
try {
  for (const cmd of commands) {
    try {
      execSync(`${cmd} --version`, { stdio: "ignore" });
      pythonCmd = cmd;
      break;
    } catch (e) {
    }
  }
} catch (e) {
}
var Starfield = ({ columns, rows }) => {
  const [stars, setStars] = useState([]);
  useEffect(() => {
    const s = [];
    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < columns; j++) {
        if (Math.random() < 0.02) {
          row.push(["+", ".", "*", "\xB7"][Math.floor(Math.random() * 4)]);
        } else {
          row.push(null);
        }
      }
      s.push(row);
    }
    setStars(s);
  }, [columns, rows]);
  const lines = stars.map((row, i) => {
    let str = "";
    for (const star of row) {
      if (!star) {
        str += " ";
        continue;
      }
      str += star;
    }
    return str;
  });
  return /* @__PURE__ */ React.createElement(Box, { position: "absolute", width: columns, height: rows, zIndex: -1, flexDirection: "column" }, lines.map((line, i) => /* @__PURE__ */ React.createElement(Text, { key: i, color: "#444" }, line)));
};
var SixSquarePulse = ({ isRunning }) => {
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (!isRunning) {
      setActive(-1);
      return;
    }
    const t = setInterval(() => setActive((a) => (a + 1) % 6), 180);
    return () => clearInterval(t);
  }, [isRunning]);
  const squares = [0, 1, 2, 3, 4, 5];
  return /* @__PURE__ */ React.createElement(Box, { marginRight: 1 }, squares.map((i) => /* @__PURE__ */ React.createElement(
    Text,
    {
      key: i,
      color: isRunning && i === active ? "#00ffff" : "#1c3b44",
      bold: isRunning && i === active
    },
    "\u25A0"
  )));
};
var StatusBar = ({ status, stages }) => {
  const doneCount = Object.values(stages).filter((s) => s === "done").length;
  const total = Object.keys(stages).length;
  const running = status === "running";
  const done = status === "done";
  let statusText = "idle";
  let statusColor = "gray";
  if (running) {
    statusText = "running";
    statusColor = "yellow";
  }
  if (done) {
    statusText = "done";
    statusColor = "green";
  }
  return /* @__PURE__ */ React.createElement(Box, { height: 1, backgroundColor: "#111111", paddingLeft: 1, paddingRight: 1 }, /* @__PURE__ */ React.createElement(Box, { flexGrow: 1 }, /* @__PURE__ */ React.createElement(SixSquarePulse, { isRunning: running }), /* @__PURE__ */ React.createElement(Text, { color: "white" }, " "), /* @__PURE__ */ React.createElement(Text, { bold: true, color: "cyan" }, "HACKIT"), /* @__PURE__ */ React.createElement(Text, { color: "gray" }, "  "), /* @__PURE__ */ React.createElement(Text, { color: statusColor }, statusText), running && /* @__PURE__ */ React.createElement(Text, { color: "gray" }, "  [", doneCount, "/", total, "]")));
};
var App = () => {
  const [input, setInput] = useState("");
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
    process.stdout.on("resize", onResize);
    return () => process.stdout.removeListener("resize", onResize);
  }, []);
  const [stages, setStages] = useState({
    coach: "pending",
    builder: "pending",
    validation: "pending",
    pitch: "pending"
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
      const isScrollUp = key.upArrow || inputChars.includes("\x1B[<64") || inputChars.includes("\x1B[<0;") || inputChars.includes("\x1B[M`");
      const isScrollDown = key.downArrow || inputChars.includes("\x1B[<65") || inputChars.includes("\x1B[<1;") || inputChars.includes("\x1B[Ma");
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
    const t = setInterval(() => setElapsed((e) => e + 1), 1e3);
    return () => clearInterval(t);
  }, [isRunning]);
  const handleSubmit = (value) => {
    const trimmed = cleanInput(value).trim();
    if (!trimmed) return;
    if (trimmed === "/new" || trimmed.startsWith("/new ")) {
      if (childRef.current) {
        try {
          childRef.current.kill();
        } catch (e) {
        }
        childRef.current = null;
      }
      setHasStarted(false);
      setIsRunning(false);
      setLogs([]);
      setStages({ coach: "pending", builder: "pending", validation: "pending", pitch: "pending" });
      setError(null);
      setErrorDetails(null);
      setSuccess(false);
      setElapsed(0);
      setInput("");
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
    setStages({ coach: "pending", builder: "pending", validation: "pending", pitch: "pending" });
    setSuccess(false);
    setError(null);
    setErrorDetails(null);
    setElapsed(0);
    setIsRunning(true);
    setInput("");
    setScrollOffset(0);
    const bridgePath = path.join(__dirname, "python_bridge.py");
    const finalIdea = `${value}

[TECH STACK REQUIRED: ${stacks[stackIndex]}]`;
    const child = spawn(pythonCmd, [bridgePath, finalIdea], {
      env: { ...process.env, PYTHONUNBUFFERED: "1" }
    });
    childRef.current = child;
    child.stdout.on("data", (data) => {
      const lines = data.toString().split("\n");
      lines.forEach((line) => {
        if (!line.trim()) return;
        try {
          const parsed = JSON.parse(line);
          handleEvent(parsed);
        } catch (e) {
          if (isTTY) {
            setLogs((prev) => [...prev, line.trim()]);
          } else {
            console.log(line.trim());
          }
        }
      });
    });
    child.stderr.on("data", (data) => {
      const msg = `[ERR] ${data.toString().trim()}`;
      if (isTTY) {
        setLogs((prev) => [...prev, msg]);
      } else {
        console.error(msg);
      }
    });
    child.on("close", (code) => {
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
    const { event, message, success: success2, passed, error: error2, traceback, log_file } = data;
    if (message) {
      if (isTTY) {
        setLogs((prev) => [...prev, message.trim()]);
      } else {
        console.log(message.trim());
      }
    }
    setStages((prev) => {
      let changed = false;
      const next = { ...prev };
      const updateStage = (key, val) => {
        if (next[key] !== val) {
          next[key] = val;
          changed = true;
        }
      };
      if (event === "coach_start") updateStage("coach", "active");
      if (event === "coach_complete") updateStage("coach", success2 !== false ? "done" : "failed");
      if (event === "builder_start") updateStage("builder", "active");
      if (event === "builder_complete") updateStage("builder", success2 !== false ? "done" : "failed");
      if (event === "validation_start") updateStage("validation", "active");
      if (event === "validation_complete") updateStage("validation", passed !== false ? "done" : "failed");
      if (event === "pitch_update_start" || event === "judge_start") updateStage("pitch", "active");
      if (event === "pitch_update_complete") updateStage("pitch", "done");
      if (event === "pipeline_error") {
        setError(error2 || "Unknown pipeline error");
        setErrorDetails({ traceback, log_file });
      }
      return changed ? next : prev;
    });
  };
  const renderStage = (name, label, status2) => {
    let icon = /* @__PURE__ */ React.createElement(Text, { color: "gray" }, "\u25CB");
    if (status2 === "active") icon = /* @__PURE__ */ React.createElement(Text, { color: "yellow" }, "\u25B6");
    if (status2 === "done") icon = /* @__PURE__ */ React.createElement(Text, { color: "green" }, "\u2713");
    if (status2 === "failed") icon = /* @__PURE__ */ React.createElement(Text, { color: "red" }, "\u2717");
    return /* @__PURE__ */ React.createElement(Box, { key: name }, /* @__PURE__ */ React.createElement(Box, { width: 3 }, icon), /* @__PURE__ */ React.createElement(Text, { bold: status2 === "active", color: status2 === "active" ? "white" : "gray" }, label));
  };
  const status = isRunning ? "running" : success ? "done" : "idle";
  return /* @__PURE__ */ React.createElement(Box, { flexDirection: "column", height: "100%" }, /* @__PURE__ */ React.createElement(Box, { flexGrow: 1, flexDirection: "column", padding: hasStarted ? 1 : 0, paddingBottom: 0 }, !hasStarted && /* @__PURE__ */ React.createElement(Starfield, { columns: size.columns, rows: Math.max(0, size.rows - 1) }), !hasStarted ? /* @__PURE__ */ React.createElement(
    Box,
    {
      width: size.columns,
      height: Math.max(0, size.rows - 1),
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column"
    },
    /* @__PURE__ */ React.createElement(Box, { flexDirection: "column", alignItems: "center", marginBottom: 2 }, /* @__PURE__ */ React.createElement(Text, { bold: true, color: "white" }, `\u2588\u2588\u2557  \u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2557  \u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2557  \u2588\u2588\u2557\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557
\u2588\u2588\u2551  \u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u2588\u2588\u2551 \u2588\u2588\u2554\u255D\u2588\u2588\u2551\u255A\u2550\u2550\u2588\u2588\u2554\u2550\u2550\u255D
\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551\u2588\u2588\u2551     \u2588\u2588\u2588\u2588\u2588\u2554\u255D \u2588\u2588\u2551   \u2588\u2588\u2551   
\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2551\u2588\u2588\u2551     \u2588\u2588\u2554\u2550\u2588\u2588\u2557 \u2588\u2588\u2551   \u2588\u2588\u2551   
\u2588\u2588\u2551  \u2588\u2588\u2551\u2588\u2588\u2551  \u2588\u2588\u2551\u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2551  \u2588\u2588\u2557\u2588\u2588\u2551   \u2588\u2588\u2551   
\u255A\u2550\u255D  \u255A\u2550\u255D\u255A\u2550\u255D  \u255A\u2550\u255D \u255A\u2550\u2550\u2550\u2550\u2550\u255D\u255A\u2550\u255D  \u255A\u2550\u255D\u255A\u2550\u255D   \u255A\u2550\u255D`), /* @__PURE__ */ React.createElement(Text, { italic: true, color: "gray" }, "Autonomous AI Hackathon Coach & App Builder")),
    error && !isRunning && /* @__PURE__ */ React.createElement(Box, { flexDirection: "column", marginBottom: 1, borderColor: "red", borderStyle: "round", padding: 1 }, /* @__PURE__ */ React.createElement(Text, { color: "red", bold: true }, "\u274C Fatal Error: ", error), errorDetails?.log_file && /* @__PURE__ */ React.createElement(Text, { color: "yellow" }, "\u{1F4C4} Log file: ", errorDetails.log_file), errorDetails?.traceback && /* @__PURE__ */ React.createElement(Box, { marginTop: 1, flexDirection: "column" }, /* @__PURE__ */ React.createElement(Text, { color: "gray", bold: true }, "Traceback:"), /* @__PURE__ */ React.createElement(Text, { color: "red" }, errorDetails.traceback.split("\n").slice(-8).join("\n")))),
    /* @__PURE__ */ React.createElement(Box, { width: size.columns ? Math.floor(size.columns * 0.75) : 75, flexDirection: "column", marginY: 1 }, /* @__PURE__ */ React.createElement(Box, { flexDirection: "row", alignItems: "center" }, /* @__PURE__ */ React.createElement(Text, { color: "#3b82f6" }, "\u2500\u2500 "), /* @__PURE__ */ React.createElement(Text, { color: "cyan", bold: true }, "Tell me your next crazzzzyyy idea!"), /* @__PURE__ */ React.createElement(Text, { color: "#3b82f6" }, " ", "\u2500".repeat(Math.max(5, (size.columns ? Math.floor(size.columns * 0.75) : 75) - 39)))), /* @__PURE__ */ React.createElement(Box, { flexDirection: "row", marginY: 1, paddingLeft: 2 }, /* @__PURE__ */ React.createElement(Text, { color: "cyan", bold: true }, "\u276F "), /* @__PURE__ */ React.createElement(TextInput, { value: input, onChange: handleInputChange, onSubmit: handleSubmit }), input.length === 0 && /* @__PURE__ */ React.createElement(Text, { color: "#6e7681" }, ' Ask anything... "Create a retro snake game"')), /* @__PURE__ */ React.createElement(Box, { paddingLeft: 2, marginBottom: 1 }, /* @__PURE__ */ React.createElement(Text, { color: "#2f81f7" }, "TECH Stack "), /* @__PURE__ */ React.createElement(Text, { color: "#8b949e" }, "\xB7 "), /* @__PURE__ */ React.createElement(Text, { color: "#e3b341", bold: true }, stacks[stackIndex]), /* @__PURE__ */ React.createElement(Text, { color: "#8b949e" }, " \xB7")), /* @__PURE__ */ React.createElement(Box, { flexDirection: "row", alignItems: "center" }, /* @__PURE__ */ React.createElement(Text, { color: "#3b82f6" }, "\u2500".repeat(size.columns ? Math.floor(size.columns * 0.75) : 75)))),
    /* @__PURE__ */ React.createElement(Box, { width: size.columns ? Math.floor(size.columns * 0.75) : 75, marginTop: 1, paddingLeft: 2 }, /* @__PURE__ */ React.createElement(Text, { color: "#8b949e" }, /* @__PURE__ */ React.createElement(Text, { bold: true, color: "#c9d1d9" }, "enter"), " run pipeline   ", /* @__PURE__ */ React.createElement(Text, { bold: true, color: "#c9d1d9" }, "tab"), " cycle stack   ", /* @__PURE__ */ React.createElement(Text, { bold: true, color: "#c9d1d9" }, "/new"), " fresh window"))
  ) : /* @__PURE__ */ React.createElement(Box, { height: Math.max(0, size.rows - 1), overflow: "hidden", flexDirection: "column" }, /* @__PURE__ */ React.createElement(Box, { flexDirection: "column" }, /* @__PURE__ */ React.createElement(Box, { flexDirection: "column", marginBottom: 1 }, /* @__PURE__ */ React.createElement(Text, { bold: true, color: "white" }, `\u2588\u2588\u2557  \u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2557  \u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2557  \u2588\u2588\u2557\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557
\u2588\u2588\u2551  \u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u2588\u2588\u2551 \u2588\u2588\u2554\u255D\u2588\u2588\u2551\u255A\u2550\u2550\u2588\u2588\u2554\u2550\u2550\u255D
\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551\u2588\u2588\u2551     \u2588\u2588\u2588\u2588\u2588\u2554\u255D \u2588\u2588\u2551   \u2588\u2588\u2551   
\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2551\u2588\u2588\u2551     \u2588\u2588\u2554\u2550\u2588\u2588\u2557 \u2588\u2588\u2551   \u2588\u2588\u2551   
\u2588\u2588\u2551  \u2588\u2588\u2551\u2588\u2588\u2551  \u2588\u2588\u2551\u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2551  \u2588\u2588\u2557\u2588\u2588\u2551   \u2588\u2588\u2551   
\u255A\u2550\u255D  \u255A\u2550\u255D\u255A\u2550\u255D  \u255A\u2550\u255D \u255A\u2550\u2550\u2550\u2550\u2550\u255D\u255A\u2550\u255D  \u255A\u2550\u255D\u255A\u2550\u255D   \u255A\u2550\u255D`), /* @__PURE__ */ React.createElement(Text, { italic: true, color: "gray" }, "Autonomous AI Hackathon Coach & App Builder")), error && !isRunning && /* @__PURE__ */ React.createElement(Box, { flexDirection: "column", marginBottom: 1, borderColor: "red", borderStyle: "round", padding: 1 }, /* @__PURE__ */ React.createElement(Text, { color: "red", bold: true }, "\u274C Fatal Error: ", error), errorDetails?.log_file && /* @__PURE__ */ React.createElement(Text, { color: "yellow" }, "\u{1F4C4} Log file: ", errorDetails.log_file), errorDetails?.traceback && /* @__PURE__ */ React.createElement(Box, { marginTop: 1, flexDirection: "column" }, /* @__PURE__ */ React.createElement(Text, { color: "gray", bold: true }, "Traceback:"), /* @__PURE__ */ React.createElement(Text, { color: "red" }, errorDetails.traceback.split("\n").slice(-12).join("\n")))), success && /* @__PURE__ */ React.createElement(Box, { marginBottom: 1, borderColor: "green", borderStyle: "round", padding: 0 }, /* @__PURE__ */ React.createElement(Text, { color: "green", bold: true }, "\u{1F389} SUCCESS! Project is ready.")), isRunning && /* @__PURE__ */ React.createElement(Box, { flexDirection: "column", marginBottom: 1 }, /* @__PURE__ */ React.createElement(Box, { borderStyle: "round", borderColor: "yellow", padding: 0, flexDirection: "column" }, /* @__PURE__ */ React.createElement(Text, { bold: true, color: "yellow" }, "\u26A1 HACKIT Agent Pipeline Progress", "  ", /* @__PURE__ */ React.createElement(Text, { color: "white" }, "\u23F1 ", String(Math.floor(elapsed / 60)).padStart(2, "0"), ":", String(elapsed % 60).padStart(2, "0"))), /* @__PURE__ */ React.createElement(Box, { flexDirection: "column" }, renderStage("coach", "1. Coach Planning (PLAN, ARCHITECTURE, TASKS, PROMPTS)", stages.coach), renderStage("builder", "2. Code Generation (Vite+React Frontend & Express Backend)", stages.builder), renderStage("validation", "3. Validation & Repair (Build, Lint, Tests & Auto-repair)", stages.validation), renderStage("pitch", "4. Pitch & Evaluation (HACKATHON update & JUDGE score)", stages.pitch)))), logs.length > 0 && /* @__PURE__ */ React.createElement(Box, { flexDirection: "column", borderStyle: "round", borderColor: "#333", padding: 1, marginBottom: 1 }, /* @__PURE__ */ React.createElement(Box, { justifyContent: "space-between", marginBottom: 1 }, /* @__PURE__ */ React.createElement(Text, { color: "cyan", bold: true }, "\u{1F4CB} Pipeline Logs"), /* @__PURE__ */ React.createElement(Text, { color: "#6e7681" }, `[Total ${logs.length} logs | \u2191/\u2193 scroll (${startLogIdx + 1}-${startLogIdx + visibleLogs.length})]`)), visibleLogs.map((logLine, idx) => /* @__PURE__ */ React.createElement(Text, { key: idx, color: "gray", wrap: "truncate-end" }, logLine))), !isRunning && hasStarted && /* @__PURE__ */ React.createElement(Box, { flexDirection: "column", marginTop: 1, marginBottom: 2 }, /* @__PURE__ */ React.createElement(Box, { flexDirection: "row", alignItems: "center" }, /* @__PURE__ */ React.createElement(Text, { color: "#3b82f6" }, "\u2500\u2500 "), /* @__PURE__ */ React.createElement(Text, { color: "cyan", bold: true }, "What's Next!"), /* @__PURE__ */ React.createElement(Text, { color: "#3b82f6" }, " ", "\u2500".repeat(Math.max(5, (size.columns || 80) - 18)))), /* @__PURE__ */ React.createElement(Box, { flexDirection: "row", marginY: 1, paddingLeft: 2 }, /* @__PURE__ */ React.createElement(Text, { color: "cyan", bold: true }, "\u276F "), /* @__PURE__ */ React.createElement(TextInput, { value: input, onChange: handleInputChange, onSubmit: handleSubmit }), input.length === 0 && /* @__PURE__ */ React.createElement(Text, { color: "#6e7681" }, " Type prompt or /new to reset workspace")), /* @__PURE__ */ React.createElement(Box, { flexDirection: "row", alignItems: "center" }, /* @__PURE__ */ React.createElement(Text, { color: "#3b82f6" }, "\u2500".repeat(size.columns || 80))))))), /* @__PURE__ */ React.createElement(StatusBar, { status, stages }));
};
render(/* @__PURE__ */ React.createElement(App, null));
