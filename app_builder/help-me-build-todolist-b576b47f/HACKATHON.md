# Hackathon Guide — Todo List App

---

## Demo Script (5 minutes)

Use this script for your final presentation. Practice it 2–3 times so it feels natural.

---

### [0:00–0:30] — Intro

> "Hi everyone! We built a **Todo List app** — a full-stack web app with a React frontend and an Express API backend backed by SQLite. It's simple on the surface, but we focused on **clean architecture**, **polished UX**, and **production readiness**."

*(Show the app running on screen)*

---

### [0:30–1:30] — Add a Todo

> "Let's start by adding a todo. I'll type 'Build hackathon demo' and press Enter."

*(Type, press Enter — item appears)*

> "You'll notice it appears instantly at the top — that's because we're optimistically updating the UI before the server confirms. The todo is persisted to SQLite."

> "Let's add another: 'Practice pitch'."

*(Add second todo)*

---

### [1:30–2:15] — Toggle & Delete

> "Now let's mark 'Build hackathon demo' as done."

*(Click checkbox — line-through appears)*

> "The completed status is toggled via a `PATCH` request to our API. If I click again, it reverts."

*(Click again)*

> "Deleting is just as easy."

*(Click delete icon on 'Practice pitch' — it disappears)*

> "Each delete sends a `DELETE /api/todos/:id` request. No page reload needed."

---

### [2:15–3:00] — Show API & Architecture

> "Let's take a quick peek under the hood."

*(Open terminal, run curl commands)*

```bash
curl http://localhost:3001/api/todos
```

> "This is our API — a clean REST interface. We have five endpoints: Create, Read, Update, Delete, and Toggle."

> "The data lives in a SQLite database. Here's the schema — just one table with id, title, completed status, and timestamps."

*(Show ARCHITECTURE.md schema section briefly)*

---

### [3:00–3:45] — Error Handling

> "We put a lot of care into edge cases."

*(Try adding an empty todo)*

> "Validation catches empty titles and shows an inline error. The same happens for titles over 200 characters."

> "What if the backend goes down?"

*(Stop backend, refresh)*

> "The UI detects the backend is offline and shows a friendly message with demo data. The app never crashes — it degrades gracefully."

---

### [3:45–4:30] — UX Polish

> "We added several quality-of-life features:"

- **Search** — *(type in search box, filter todos)* — "Instant client-side filtering."
- **Filter tabs** — *(click "Active" / "Completed")* — "Filter by status."
- **Todo count** — "Shows how many items are left."
- **Keyboard shortcuts** — "Ctrl+N focuses the input, Ctrl+D focuses search."
- **Toasts** — "Every action shows a brief notification."

> "And it's fully keyboard accessible with proper ARIA labels."

---

### [4:30–5:00] — Closing

> "We designed this to be easily extensible. The architecture is modular — you could add due dates, priorities, tags, or even turn it into a Kanban board without rewriting anything."

> "The code is clean, the API is documented, and the app is ready to deploy."

> "Thank you! Happy to answer questions."

*(Smile, pause for applause)*

---

## Pitch Outline (30-second elevator pitch)

Use this for quick hallway conversations or a lightning round.

> **Problem**: Most todo apps are either too complex or have terrible UX.

> **Solution**: A clean, fast, full-stack todo app with instant updates, graceful error handling, and a beautiful dark-themed UI.

> **Tech**: React 18 + Vite on the frontend, Express + SQLite on the backend — all vanilla JavaScript, no bloated frameworks.

> **Key Differentiator**: We built for reliability — if the backend goes down, the app still works with demo data. And the code is so clean you can extend it in minutes.

> **Ask**: Try it out, fork it, and add your own twist!

---

## Presentation Checklist

### Before the Demo

- [ ] Both servers running (backend on :3001, frontend on :5173)
- [ ] Browser open to `http://localhost:5173/`
- [ ] Terminal window open with backend logs showing (split screen)
- [ ] Have curl commands ready in a separate terminal tab
- [ ] Turn off notifications / Do Not Disturb
- [ ] Check screen resolution and projector scaling
- [ ] Font size readable for back of the room (zoom browser to 120% if needed)
- [ ] Mute Slack, email, phone alarms
- [ ] Have a backup plan: screenshot slides in case live demo fails

### During the Demo

- [ ] Speak slowly and clearly
- [ ] Don't rush — let each action complete before explaining
- [ ] Point at the relevant UI area when describing features
- [ ] If something breaks, don't panic — say "Let me show you how we handle errors" and demonstrate offline mode
- [ ] Keep eye contact with the judges/audience
- [ ] Stay within 5 minutes (practice with a timer)

### After the Demo

- [ ] Thank the judges
- [ ] Be ready for Q&A (see below)
- [ ] Have a QR code or short URL ready for people to access the repo

### Anticipated Q&A

| Question | Suggested Answer |
|----------|-----------------|
| "Why SQLite instead of PostgreSQL?" | "For a hackathon MVP, SQLite is zero-config and fast. We'd swap to Postgres for production scaling." |
| "How do you handle concurrent edits?" | "Each update is atomic via SQLite transactions. For real-time multi-user, we'd add WebSockets." |
| "Did you consider TypeScript?" | "Yes — we kept it JS for speed, but the code is structured to add types easily." |
| "How would you add user authentication?" | "We'd add a `users` table, JWT-based auth middleware, and scope todos by `user_id`." |
| "What was the biggest challenge?" | "Getting error handling right — making sure the UI never crashes even when the API is down." |

---

## Judging Criteria Mapping

| Criterion | How We Address It |
|-----------|------------------|
| **Technical Complexity** | Full-stack CRUD with async API, SQL persistence, error handling, proxy setup |
| **UI/UX Design** | Dark theme, custom checkbox, animations, empty states, toasts, responsive layout |
| **Code Quality** | Clean separation of concerns, consistent naming, error boundaries, no dead code |
| **Completeness** | All CRUD operations, validation, graceful degradation, deploy-ready |
| **Presentation** | Live demo with clear narrative, backup plan, well-rehearsed |
| **Innovation** | Offline resilience, keyboard shortcuts, accessibility-first approach |
