# 🎨 HACKIT-AI Frontend Workspace

[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/State-Zustand-orange.svg)](#)

The highly interactive, beautiful Next.js frontend for the HACKIT-AI platform. It includes real-time WebSockets for AI interviews, a complex Konva-based slide canvas editor, Aceternity UI animations, and a rich Markdown text editor powered by Tiptap.

## 📂 Architecture & Folder Structure

| Directory | Description |
|-----------|-------------|
| `src/app/` | Next.js 14 App Router pages (`/dashboard`, `/editor`, `/interview`). |
| `src/components/` | Modular React components broken down by feature. |
| ↳ `components/canvas/` | The complex React-Konva slide editor engine (shapes, text bounding, transformers). |
| ↳ `components/landing/` | Aceternity UI landing page blocks (Aurora background, Video stories, 3D globes). |
| ↳ `components/ui/` | Reusable Radix UI primitives and Aceternity components (buttons, dialogs, charts). |
| ↳ `components/workflow/` | The interactive node-based canvas for the AI Workflow builder. |
| `src/store/` | Zustand state slices for global state management (undo/redo, presentation layouts). |
| `src/lib/` | Core utilities for fetching data, processing markdown, compiling slide schemas, and websocket connections. |
| `public/assets/` | Static media, icons, fonts, and demonstration videos. |

## 🚀 Key Features

- **Interactive Slide Editor:** A full-fledged presentation editor allowing precise drag-and-drop, bounding box resizing, and text editing layered on top of HTML/SVG standard layouts.
- **AI Agent Workflows:** A visual node-based editor for configuring autonomous agent chains.
- **Voice Interview WebSockets:** Connects to the backend via WebSockets to provide real-time STT/TTS (Speech-to-Text / Text-to-Speech) for interview prep.
- **Premium Aesthetics:** Heavily utilizes Framer Motion, GSAP, and Aceternity UI for smooth, modern micro-animations.

## 💻 Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev
# Server will start on http://localhost:3000
```
