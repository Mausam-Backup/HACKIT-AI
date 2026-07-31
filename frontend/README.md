# 🎨 HACKIT-AI Frontend Workspace

[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/State-Zustand-orange.svg)](#)

The highly interactive, beautiful Next.js frontend for the HACKIT-AI platform. It is designed to feel like a premium, native desktop application running entirely in the browser, complete with complex canvas editors, real-time voice streaming, and hardware-accelerated animations.

---

## 🏗️ Core Architecture & UI Systems

### 1. The Presentation Canvas (`react-konva`)
Located in `src/components/canvas/`, this is a massive engineering effort to replicate PowerPoint-like functionality in the browser. 
- **Layers & Bounds:** Implements custom coordinate mapping, Z-index layer management, and boundary collision detection.
- **Transformers:** Allows users to drag, drop, resize, and rotate elements freely across the slide.
- **Inline Editing:** Intercepts Konva text nodes and hot-swaps them with HTML `contenteditable` divs (`TiptapInlineTextEditor.tsx`) for rich text formatting directly on the canvas.

### 2. State Management (`Zustand`)
Given the immense complexity of the presentation editor and AI workflow builder, React Context was too slow. 
- `undoRedoSlice.ts`: Implements a custom stack-based undo/redo mechanism tracking specific node mutations on the canvas.
- `presentationGeneration.ts`: Manages the state of the LLM generating slide layouts asynchronously.

### 3. Aesthetics & Animations
Heavily utilizes **Aceternity UI**, **Framer Motion**, and **GSAP**.
- `Aurora.tsx`: Dynamic canvas-based animated backgrounds.
- `VideoStories.tsx`: Scroll-jacking GSAP implementations for the landing page.
- Radix UI primitives are used under the hood for fully accessible dropdowns, dialogs, and sliders.

---

## 📂 Detailed Folder Structure

| Directory / File | Description |
|------------------|-------------|
| `src/app/` | Next.js 14 App Router configuration. |
| ↳ `dashboard/` | User hackathon management and data overview. |
| ↳ `editor/` | The `/editor` route housing the massive Konva canvas app. |
| ↳ `interview/` | The WebSocket-powered AI mock interview UI. |
| `src/components/` | Modular React components broken down by feature domain. |
| ↳ `canvas/` | Core Konva slide builder logic (Shapes, Text bounds, Selection toolbars). |
| ↳ `landing/` | Landing page marketing components (Bento grids, Hero sections). |
| ↳ `ui/` | Reusable atomic UI components (Buttons, Inputs, Dialogs). |
| ↳ `workflow/` | The visual node-based editor for the AI Workflow builder. |
| `src/store/` | Zustand state slices for global state management. |
| `src/lib/` | Core utilities for API requests, JSON schema compilation, and Websocket connections. |
| `public/` | Static media, icons, `demo.mp4` files, and `assets/`. |

---

## 💻 Development Setup

```bash
# 1. Install all dependencies (we use standard npm)
npm install

# 2. Set environment variables
# Copy .env.example to .env.local (Ensure NEXT_PUBLIC_API_URL is set to your backend)

# 3. Start the Next.js development server
npm run dev

# 4. View in browser
# Navigate to http://localhost:3000
```
