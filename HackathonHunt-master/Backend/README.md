# 🏆 HackathonHunt Data Module

[![Status](https://img.shields.io/badge/Status-Active-brightgreen.svg)]()
[![Data Format](https://img.shields.io/badge/Format-JSON-blue.svg)]()

This directory serves as the centralized data store for global hackathons. It powers the **Hackathons & Resources** tab in the main HACKIT-AI platform, providing a curated, filterable database of upcoming events.

## 📂 Folder Structure

| File / Component | Purpose |
|------------------|---------|
| `all_hackathons.json` | Master JSON database containing aggregated hackathon details, dates, prize pools, and registration links. |

## 🧠 Integration

The main `backend/` FastAPI application ingests `all_hackathons.json` on startup and serves it via the `/api/hackathons` REST endpoint, enabling the Next.js frontend to render interactive hackathon discovery cards.
