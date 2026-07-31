# 🏆 HackathonHunt Data Module

[![Status](https://img.shields.io/badge/Status-Active-brightgreen.svg)]()
[![Data Format](https://img.shields.io/badge/Format-JSON-blue.svg)]()
[![Update Frequency](https://img.shields.io/badge/Updates-Daily-orange.svg)]()

This directory serves as the centralized data store and ingestion mechanism for global hackathons. It acts as the primary data source powering the **Hackathons & Resources** tab in the main HACKIT-AI platform, providing a curated, heavily filtered, and formatted database of upcoming events.

---

## 🏗️ Architecture & Data Flow

1. **Scraping & Aggregation:** Originally relying on python scripts (`legacy/`), this module pulls hackathon data from major platforms like Devpost, MLH, and Devfolio.
2. **Data Normalization:** The raw data is stripped of unnecessary metadata and mapped into a strict, unified JSON schema.
3. **Serving:** The main FastAPI backend (`backend/api/hackathons`) reads from this store on startup to serve lightning-fast, cached responses to the Next.js frontend.

---

## 📂 Detailed Folder Structure

| File / Component | Type | Purpose |
|------------------|------|---------|
| `all_hackathons.json` | JSON Database | The master compiled database containing aggregated hackathon details, dates, prize pools, themes, and direct registration links. |

### Schema Example (`all_hackathons.json`)
Every hackathon injected into the system conforms to this structure:
```json
{
  "id": "global-ai-hackathon-2024",
  "title": "Global AI Hackathon 2024",
  "platform": "Devpost",
  "url": "https://global-ai.devpost.com",
  "prize_pool": "$50,000",
  "start_date": "2024-10-01T00:00:00Z",
  "end_date": "2024-10-05T00:00:00Z",
  "tags": ["AI", "Machine Learning", "Web3"]
}
```

---

## 🧠 Integration with Main App

The main `backend/` FastAPI application ingests `all_hackathons.json` during the `startup` event loop. It stores the data in memory (or a Redis cache) and serves it via the `/api/hackathons` REST endpoint. 

This enables the Next.js frontend to render interactive, searchable hackathon discovery cards on the `/dashboard` route instantly without hitting external platform APIs and facing rate limits.
