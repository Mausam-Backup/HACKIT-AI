# Hack-It Ai

<p align="center">
  <img src="demo.gif" alt="HAC-KIT AI Demo" width="800">
</p>

AI-powered presentation generation platform. Input a prompt or upload documents, and the system generates professional slide decks via multiple LLM providers, with a full-featured slide editor and PPTX/PDF export.

---

## Table of Contents

- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Data Flow](#data-flow)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Authentication](#authentication)
- [LLM Providers](#llm-providers)
- [Deployment](#deployment)
- [Development Setup](#development-setup)

---

## System Architecture

### High-Level Overview

```mermaid
graph TB
    subgraph CLIENT["Client Layer"]
        B["Browser (React 19 SPA)"]
    end

    subgraph FRONTEND["Next.js 16 (Port 3000)"]
        direction TB
        R["App Router (Server Components)"]
        C["Client Components"]
        N["Next.js API Routes (BFF)"]
        S["Redux Store (4 slices)"]
        R --> C
        C --> S
        N -->|"fetch()"| C
    end

    subgraph PROXY["Next.js Rewrites"]
        P1["/api/v1/* -> FastAPI"]
        P2["/api/v2/* -> FastAPI"]
        P3["/app_data/* -> FastAPI"]
        P4["/static/* -> FastAPI"]
    end

    subgraph BACKEND["FastAPI (Port 8000)"]
        direction TB
        M["Middleware Stack<br/>SessionAuth / CORS / Sentry"]
        RT["Routers<br/>ppt / auth / async-tasks / webhook"]
        SV["Services<br/>Chat / Image Gen / Export / Webhook / Memory"]
        LLM["LLM Adapters<br/>OpenAI / Anthropic / Google / Ollama / ..."]
        M --> RT --> SV --> LLM
    end

    subgraph DB["Database Layer"]
        SQL[("SQL<br/>SQLite / PostgreSQL / MySQL")]
        ALEM["Alembic Migrations"]
    end

    subgraph STORAGE["Storage Layer"]
        APP_DATA["/app_data/<br/>Uploads / Exports / Fonts"]
        STATIC["/static/<br/>Icons / Placeholders"]
    end

    subgraph MCP["MCP Server (Port 8001)"]
        MCP_S["FastMCP Server<br/>OpenAPI -> Tool Defs"]
    end

    B -->|"HTTP"| FRONTEND
    FRONTEND -->|"Rewrites"| PROXY
    PROXY -->|"Proxy"| BACKEND
    BACKEND --> SQL
    BACKEND --> STORAGE
    BACKEND -.->|"Optional"| MCP
    SV -.->|"Async"| DB
    LLM -.->|"API Calls"| EXT_LLM["External LLM APIs<br/>OpenAI / Anthropic / etc."]
```

### Request Lifecycle (Presentation Generation)

```mermaid
sequenceDiagram
    participant U as User
    participant F as Next.js Frontend
    participant B as FastAPI Backend
    participant DB as Database
    participant LLM as LLM Provider

    U->>F: Upload document + select template
    F->>B: POST /api/v1/ppt/presentation/create
    B->>DB: Insert presentation record
    B-->>F: Return presentation ID

    F->>B: POST /api/v1/ppt/presentation/generate
    B->>B: Parse uploaded document
    B->>LLM: Generate outline (LLM call 1)
    LLM-->>B: Return outline
    B-->>F: SSE: outline_chunk events

    U->>F: Review + approve outline
    F->>B: Confirm outline

    B->>LLM: Generate slides (LLM call 2-N, parallel)
    LLM-->>B: Return slide content
    B->>DB: Insert slides
    B-->>F: SSE: slide_complete events

    F->>U: Render slide editor
    U->>F: Edit slide content
    F->>B: PUT /api/v1/ppt/slide/{id}
    B->>DB: Update slide

    U->>F: Click Export
    F->>B: POST /api/v1/ppt/presentation/{id}/export
    B->>B: Generate PPTX / PDF
    B->>DB: Store export path
    B-->>F: Return download URL
    F->>U: Download file
```

### Frontend Component Tree

```mermaid
graph TB
    subgraph ROOT["Root Layout (layout.tsx)"]
        P["<Providers> (Redux)"]
        SS["<SmoothScroll> (Lenis)"]
        T["<Toaster> (Sonner)"]
        F["Font Injection<br/>Geist / Outfit / Inter"]
    end

    subgraph LANDING["Landing Page (/)"]
        H["<Hero><br/>- Aurora WebGL<br/>- Globe Wireframe<br/>- Social Proof Marquee</Hero>"]
        M["<Mission>"]
        SH["<Showcase><br/>- Scroll-triggered tabs<br/>- 4 AI workflow stages</Showcase>"]
        CP["<Capabilities><br/>- Bento grid<br/>- Embedded videos<br/>- Tech stack marquee</Capabilities>"]
        ST["<StatsSection><br/>- Interactive analytics tabs</StatsSection>"]
        VS["<VideoStories><br/>- Dual-column testimonials<br/>- Auto-scroll masonry</VideoStories>"]
        FT["<Footer>"]
    end

    subgraph DASHBOARD["Presentation Generator (auth-protected)"]
        UPL["/upload<br/>- File upload<br/>- Prompt input<br/>- Template selector"]
        OUTL["/outline<br/>- Outline review<br/>- Edit + approve"]
        PRES["/presentation<br/>- Slide editor<br/>- TipTap text editor<br/>- dnd-kit reorder<br/>- Monaco layout code"]
        TEMP["/custom-template<br/>- Custom layout builder<br/>- Monaco editor"]
        PREV["/template-preview<br/>- Template preview"]
        DOCP["/documents-preview<br/>- Document viewer"]
    end

    subgraph MODULES["Feature Modules"]
        COACH["/coach<br/>AI Pitch Coach"]
        INT["/interviews<br/>Interview Prep"]
        HACK["/upcoming-hackathons<br/>Hackathon Browser"]
        RES["/resources<br/>Resource Library"]
    end

    subgraph STATE["Redux Store"]
        PG["presentationGeneration<br/>- Generation progress<br/>- SSE stream state"]
        PU["pptGenUpload<br/>- File upload queue<br/>- Processing status"]
        UC["userConfig<br/>- LLM provider config<br/>- API keys<br/>- Preferences"]
        UR["undoRedo<br/>- Editor history stack"]
    end

    ROOT --> LANDING
    ROOT --> DASHBOARD
    ROOT --> MODULES
    DASHBOARD --> STATE
```

---

## Tech Stack

### Frontend

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.10 |
| Language | TypeScript | 5.x |
| UI Library | React | 19.2.4 |
| Styling | Tailwind CSS | 4.x |
| Component System | shadcn/ui (Radix primitives) | base-nova style |
| State Management | Redux Toolkit | 2.2.8 |
| Server State | TanStack React Query + SWR | 5.x / 2.x |
| Text Editor | TipTap (ProseMirror) | 2.x |
| Drag & Drop | dnd-kit | 6.x / 10.x |
| Animation | Framer Motion + GSAP + Lenis | 12.x / 3.15 / 1.3 |
| 3D / WebGL | ogl + react-konva + d3 | 1.x / 19.x / 7.x |
| Charts | Chart.js + Recharts + Mermaid | 4.x / 3.x / 11.x |
| Code Editor | Monaco Editor | 4.x |
| Form Validation | Zod | 4.x |
| Icons | Lucide React + Phosphor Icons | latest |
| Fonts | Geist + Outfit + Inter (next/font) | latest |
| Voice AI | Vapi AI (Web SDK) | 2.x |
| Analytics | Mixpanel | latest |
| Notifications | Sonner | 2.x |

### Backend

| Category | Technology | Version |
|----------|-----------|---------|
| Runtime | Python | 3.11 |
| Web Framework | FastAPI (ASGI) | 0.116+ |
| Server | Uvicorn | latest |
| ORM | SQLModel (SQLAlchemy + Pydantic) | 0.0.24 |
| Migrations | Alembic | 1.14+ |
| Database (default) | SQLite (aiosqlite) | built-in |
| Database (prod) | PostgreSQL (asyncpg) or MySQL (aiomysql) | configurable |
| LLM Integration | OpenAI + Anthropic + Google + Groq + Ollama + 10 more | various |
| Image Generation | DALL-E + ComfyUI + Pexels + Pixabay + Open WebUI | various |
| Vector Store | FastEmbed (local embeddings) | 0.5.2 |
| Memory | mem0ai (OSS long-term memory) | 0.1.115+ |
| Web Search | SearXNG / Tavily / Exa / Brave / Serper | various |
| Document Parsing | pdfplumber + python-pptx + Pillow + fonttools | latest |
| MCP Protocol | FastMCP | 2.11+ |
| Auth | Custom PBKDF2-HMAC-SHA256 session tokens | custom |
| Error Tracking | Sentry SDK (optional) | latest |
| Testing | pytest + pytest-cov | 9.x / 7.x |

---

## Project Structure

```
SCOF-main/
│
├── frontend/                              # Next.js 16 application
│   ├── src/
│   │   ├── app/                           # App Router
│   │   │   ├── layout.tsx                 # Root layout
│   │   │   ├── page.tsx                   # Landing page
│   │   │   ├── providers.tsx              # Redux Provider wrapper
│   │   │   ├── globals.css                # Tailwind v4 + global styles
│   │   │   ├── ConfigurationInitializer.tsx
│   │   │   ├── ChatGptAuthRedirectHandler.tsx
│   │   │   ├── MixpanelInitializer.tsx
│   │   │   │
│   │   │   ├── (presentation-generator)/  # Auth-protected presentation routes
│   │   │   │   ├── upload/               # Document upload + prompt input
│   │   │   │   ├── outline/              # AI-generated outline review
│   │   │   │   ├── presentation/         # Full slide editor
│   │   │   │   ├── documents-preview/    # Uploaded document viewer
│   │   │   │   ├── template-preview/     # Template browser
│   │   │   │   ├── custom-template/      # Custom layout builder (Monaco)
│   │   │   │   └── services/api/         # API service layer
│   │   │   │
│   │   │   ├── signup/                   # Auth pages
│   │   │   ├── coach/                    # AI pitch coach
│   │   │   ├── interviews/               # Interview preparation
│   │   │   ├── upcoming-hackathons/      # Hackathon browser
│   │   │   ├── resources/                # Resource library
│   │   │   ├── (export)/pdf-maker/       # PDF export
│   │   │   └── api/                      # BFF API route handlers
│   │   │
│   │   ├── components/
│   │   │   ├── ui/                       # shadcn/ui primitives (button, card, dialog, etc.)
│   │   │   ├── landing/                  # Landing page sections
│   │   │   ├── auth/                     # Login/setup forms
│   │   │   ├── slide-editor/             # Slide editor + toolbar + text
│   │   │   ├── coach/                    # AI coach components
│   │   │   ├── interview/               # Interview components
│   │   │   ├── hackathons/              # Hackathon card/browser components
│   │   │   ├── OnBoarding/              # First-run onboarding
│   │   │   └── analytics/               # Usage analytics widgets
│   │   │
│   │   ├── store/
│   │   │   ├── store.ts                 # configureStore
│   │   │   └── slices/
│   │   │       ├── presentationGeneration.ts
│   │   │       ├── presentationGenUpload.ts
│   │   │       ├── userConfig.ts
│   │   │       └── undoRedoSlice.ts
│   │   │
│   │   ├── hooks/                       # Custom React hooks
│   │   ├── lib/                         # Utilities (template compilation, validation, SVG)
│   │   ├── services/                    # Service clients (coach, groq)
│   │   ├── types/                       # TypeScript definitions
│   │   ├── utils/                       # API client, auth, constants, analytics
│   │   └── styles/                      # Additional CSS files
│   │
│   ├── templates/                       # Presentation templates (5 variants)
│   │   ├── swift/
│   │   ├── standard/
│   │   ├── modern/
│   │   ├── dynamic/
│   │   └── general/
│   │
│   ├── public/                          # Static assets (images, videos, SVGs)
│   ├── layouts.json                     # Slide layout definitions (shared with backend)
│   ├── next.config.ts                   # Next.js config + API rewrites
│   └── package.json
│
├── backend/                             # FastAPI Python backend
│   ├── api/
│   │   ├── main.py                      # App factory + middleware + router registration
│   │   ├── lifespan.py                  # Startup/shutdown lifecycle
│   │   ├── middlewares.py               # SessionAuth + UserConfigEnv middleware
│   │   └── v1/
│   │       ├── auth/
│   │       │   └── router.py           # /auth/* endpoints
│   │       ├── ppt/
│   │       │   ├── router.py           # Router aggregator
│   │       │   └── endpoints/          # 23 endpoint modules
│   │       ├── async_tasks/
│   │       │   └── router.py
│   │       ├── webhook/
│   │       │   └── router.py
│   │       └── mock/
│   │           └── router.py
│   │
│   ├── models/
│   │   ├── sql/                        # 14 SQLModel ORM tables
│   │   └── ...                         # Pydantic request/response models
│   │
│   ├── services/                       # Business logic layer
│   │   ├── database.py                # Engine + session factory
│   │   ├── chat/                      # Chat message handling + memory
│   │   ├── image_generation_service.py # Multi-provider image gen
│   │   ├── icon_finder_service.py     # Icon search from local store
│   │   ├── document_conversion_service.py
│   │   ├── export_task_service.py     # PPTX/PDF export jobs
│   │   ├── webhook_service.py
│   │   ├── mem0_oss_memory.py         # Long-term LLM memory
│   │   ├── office_document_service.py
│   │   └── liteparse_service.py
│   │
│   ├── templates/                      # Presentation rendering engine
│   │   ├── v2/                        # Template v2 schema
│   │   ├── handler.py                 # Main template handler
│   │   ├── providers.py               # LLM-powered template generation
│   │   └── slide_layout_jobs.py       # Layout rendering pipeline
│   │
│   ├── utils/                         # Utility modules
│   │   ├── simple_auth.py             # PBKDF2 + HMAC auth logic
│   │   ├── llm_provider.py            # LLM provider factory
│   │   ├── llm_calls/                 # Per-provider call implementations
│   │   ├── oauth/                     # OAuth integrations
│   │   ├── sse.py                     # Server-Sent Events helpers
│   │   └── ...                        # 35+ utility modules
│   │
│   ├── constants/                     # App-wide constants
│   ├── enums/                         # llm_provider, tone, verbosity, etc.
│   ├── alembic/                       # Migration versions
│   ├── tests/                         # pytest (unit / integration / regression)
│   ├── static/                        # Built-in icons and images
│   ├── assets/                        # Icon JSON stores
│   ├── scripts/                       # Utility scripts
│   │
│   ├── server.py                      # Uvicorn entrypoint
│   ├── mcp_server.py                  # FastMCP server (port 8001)
│   ├── migrations.py                  # Migrate-on-startup runner
│   ├── pyproject.toml
│   └── alembic.ini
│
├── CLAUDE.md
├── .gitignore
└── README.md
```

---

## Frontend Architecture

### Route Map

| Route Group | Path | Component | Purpose |
|-------------|------|-----------|---------|
| Public | `/` | `page.tsx` | Landing page (server-rendered) |
| Public | `/signup` | Signup page | Authentication / onboarding |
| Protected | `/upload` | Upload page | File upload + prompt + template selection |
| Protected | `/outline` | Outline page | AI outline review + editing |
| Protected | `/presentation` | Presentation page | Slide editor (TipTap, dnd-kit, Monaco) |
| Protected | `/documents-preview` | Document preview | Uploaded document viewer |
| Protected | `/template-preview` | Template preview | Template layout browser |
| Protected | `/custom-template` | Custom template | Monaco-based layout builder |
| Protected | `/pdf-maker` | PDF export | Export configuration |
| Protected | `/coach` | AI coach | AI pitch coaching interface |
| Protected | `/interviews` | Interview prep | Interview question generator |
| Protected | `/upcoming-hackathons` | Hackathon browser | Hackathon listing with filters |
| Protected | `/resources` | Resource library | Educational content |

### State Management (Redux Toolkit)

```mermaid
graph LR
    subgraph PRESENTATION_GEN["presentationGeneration Slice"]
        P_STATE["State:
        - requestConfig
        - generationProgress
        - sseConnectionStatus
        - generatedSlides[]"]
        P_ACT["Actions:
        - startGeneration
        - receiveOutlineChunk
        - receiveSlideComplete
        - setGenerationError"]
    end

    subgraph UPLOAD["pptGenUpload Slice"]
        UP_STATE["State:
        - uploadQueue[]
        - uploadingFile
        - uploadProgress
        - processingStatus"]
        UP_ACT["Actions:
        - enqueueFile
        - setUploadProgress
        - completeUpload
        - clearUpload"]
    end

    subgraph CONFIG["userConfig Slice"]
        C_STATE["State:
        - llmProvider
        - apiKeys{}
        - themePreferences
        - defaultTemplate"]
        C_ACT["Actions:
        - setProvider
        - setApiKey
        - setTheme
        - setDefaultTemplate"]
    end

    subgraph UNDO["undoRedo Slice"]
        U_STATE["State:
        - past: SlideState[]
        - present: SlideState
        - future: SlideState[]"]
        U_ACT["Actions:
        - undo
        - redo
        - commitChange
        - clearHistory"]
    end

    PRESENTATION_GEN --- UPLOAD
    CONFIG --- PRESENTATION_GEN
    UNDO --- PRESENTATION_GEN
```

### BFF API Routes

Next.js Route Handlers at `src/app/api/` provide a backend-for-frontend layer:

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/user-config` | GET/POST | Read/write user configuration |
| `/api/template` | GET/POST | Template operations |
| `/api/templates` | GET | List available templates |
| `/api/template/custom` | POST | Custom template CRUD |
| `/api/save-layout` | POST | Persist slide layout |
| `/api/export-presentation` | POST | Trigger PPTX/PDF export |
| `/api/export-presentation/file` | GET | Download exported file |
| `/api/export-presentation-data/[id]` | GET | Get export metadata |
| `/api/upload-image` | POST | Upload image asset |
| `/api/read-file` | POST | Read uploaded file contents |
| `/api/coach` | POST | AI coach interaction |
| `/api/validate-layout-code` | POST | Validate custom layout code |
| `/api/has-required-key` | GET | Check if API keys are configured |
| `/api/can-change-keys` | GET | Check if user can modify keys |
| `/api/telemetry-status` | GET | Telemetry opt-in status |

### API Proxy (Next.js Rewrites)

In `next.config.ts`, all requests to matching paths are proxied to the FastAPI backend:

```
/api/v1/*              ->  {fastApiUrl}/api/v1/*
/api/v2/*              ->  {fastApiUrl}/api/v2/*
/app_data/*            ->  {fastApiUrl}/app_data/*
/static/*              ->  {fastApiUrl}/static/*
```

Backend URL resolution:
1. `FAST_API_INTERNAL_URL` (Docker internal networking)
2. `NEXT_PUBLIC_FAST_API` (Electron / browser)
3. Fallback: `http://127.0.0.1:8000`

---

## Backend Architecture

### Application Factory (api/main.py)

```mermaid
graph TD
    START["server.py entrypoint<br/>uvicorn.run()"]
    MAIN["api/main.py<br/>FastAPI() instance"]

    subgraph REGISTRATION["App Initialization"]
        SENTRY["_maybe_init_sentry()<br/>DSN from env"]
        RTR["Router Registration<br/>- ppt/v1 router<br/>- auth router<br/>- async-tasks router<br/>- webhook router<br/>- mock router"]
        STATIC["Static Mounts<br/>- /app_data/ -> APP_DATA_DIRECTORY<br/>- /static/ -> backend/static/"]
        CORS["CORS Middleware<br/>NEXT_PUBLIC_URL or *"]
        UA["UserConfigEnvUpdateMiddleware<br/>Injects env into config"]
        SA["SessionAuthMiddleware<br/>Protects /api/* routes"]
    end

    subgraph LIFESPAN["Lifespan Events (api/lifespan.py)"]
        LOG["Configure logging"]
        MKDIR["Create APP_DATA_DIRECTORY"]
        MIG["Run Alembic migrations<br/>(if MIGRATE_DATABASE_ON_STARTUP)"]
        TBL["Create DB tables"]
        TMP["Import default templates"]
        AUTH["Bootstrap auth from env"]
        KEYS["Update env with user config"]
        CHECK["Check LLM + image provider availability"]
    end

    START --> MAIN --> SENTRY --> RTR --> STATIC --> CORS --> UA --> SA
    MAIN --> LIFESPAN
```

### Services Layer

```mermaid
graph LR
    subgraph DB_SVC["Persistence"]
        DB[("SQL Database")]
        ALEM["Alembic Migrations"]
    end

    subgraph CORE_SVCS["Core Services"]
        CHAT["Chat Service<br/>- Conversation history<br/>- SSE streaming<br/>- Memory management"]
        IMG["Image Gen Service<br/>- DALL-E / ComfyUI / Pexels / Pixabay<br/>- Provider abstraction"]
        ICON["Icon Finder<br/>- Local SVG store<br/>- Search + filter"]
        DOC["Doc Conversion<br/>- PDF / PPTX / DOCX parsing<br/>- Text extraction"]
        EXPORT["Export Service<br/>- PPTX generation (python-pptx)<br/>- PDF generation<br/>- Async queue"]
        WH["Webhook Service<br/>- Event subscriptions<br/>- HTTP delivery"]
    end

    subgraph AI_SVCS["AI Services"]
        LLM["LLM Provider Factory<br/>15 providers"]
        MEM["Mem0 Memory<br/>- OSS long-term memory<br/>- Context injection"]
        SEARCH["Web Search<br/>5 search engines"]
    end

    subgraph TEMPLATE["Template Engine"]
        RENDER["Template Renderer<br/>- v2 schema rendering<br/>- Layout code execution<br/>- HTML -> PPTX"]
        LAYOUT["Layout Manager<br/>- Custom layout validation<br/>- Code sandbox"]
    end

    CORE_SVCS --> DB_SVC
    AI_SVCS --> CORE_SVCS
    TEMPLATE --> CORE_SVCS
    EXPORT --> TEMPLATE
```

### Middleware Stack

| Order | Middleware | File | Purpose |
|-------|-----------|------|---------|
| 1 | CORS | `api/main.py` | Restrict origins to configured URL or allow all in dev |
| 2 | UserConfigEnvUpdate | `api/middlewares.py` | Injects user-config keys into env for each request |
| 3 | SessionAuth | `api/middlewares.py` | Validates session tokens on all /api/* paths, exempts /auth/* |
| 4 | Static Icon Fallback | `api/main.py` | Returns placeholder SVG for missing icon paths (404 catch) |

### Startup Sequence (Lifespan)

```
1. Configure logging (LOG_LEVEL env, default INFO)
2. Create APP_DATA_DIRECTORY if not exist
3. Run Alembic migrations (if MIGRATE_DATABASE_ON_STARTUP=true)
4. Create any missing database tables
5. Import default presentation templates
6. Bootstrap auth from env (if AUTH_USERNAME/AUTH_PASSWORD set)
7. Sync env with user config
8. Check LLM + image provider API key / model availability
```

---

## Data Flow

### Presentation Generation Pipeline

```mermaid
flowchart TD
    START(["User submits prompt + files"]) --> UPLOAD["Upload documents<br/>/api/v1/ppt/files/*"]
    UPLOAD --> PARSE["Parse documents<br/>pdfplumber / python-pptx"]
    PARSE --> OUTLINE["Generate outline<br/>LLM call 1: context -> structure"]
    OUTLINE --> SSE_OUT["SSE: outline_chunk events"]
    SSE_OUT --> USER_REV["User reviews outline"]
    USER_REV --> APPROVE{"Approved?"}
    APPROVE -->|"No"| REVISE["Send revision prompt"]
    REVISE --> OUTLINE
    APPROVE -->|"Yes"| SLIDE_GEN["Generate slides<br/>LLM calls 2-N (parallelized)"]
    SLIDE_GEN --> SLIDE_PARSE["Parse + validate slide JSON"]
    SLIDE_PARSE --> SLIDE_DB["Insert slides into DB"]
    SLIDE_DB --> SSE_SLIDE["SSE: slide_complete events"]
    SSE_SLIDE --> TEMPLATE["Apply template layout"]
    TEMPLATE --> HTML["Render to HTML preview"]
    HTML --> EDITOR["Slide editor ready"]
    
    EDITOR --> EXPORT{"Export?"}
    EXPORT -->|"PPTX"| PPTX["python-pptx generation<br/>fonts + images + layouts"]
    EXPORT -->|"PDF"| PDF["PDF generation<br/>HTML -> PDF"]
    PPTX --> DOWNLOAD["Return download URL"]
    PDF --> DOWNLOAD
```

### Chat with Presentation

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant BE as FastAPI
    participant DB as Database
    participant LLM as LLM Provider

    U->>FE: Type question about slide
    FE->>BE: POST /api/v1/ppt/chat/message/stream
    BE->>DB: Load conversation history
    BE->>DB: Load slide context
    BE->>BE: Build prompt with context
    BE->>LLM: Stream response
    LLM-->>BE: Token stream
    BE-->>FE: SSE: token events
    FE->>U: Render streaming response
    BE->>DB: Save message pair
```

---

## Database Schema

### Entity-Relationship Diagram

```mermaid
erDiagram
    presentations ||--o{ slides : contains
    presentations ||--o{ chat_history_messages : has
    template_v2 ||--o{ chat_history_messages : referenced_by
    presentations ||--o{ presentation_layout_codes : has_layout_code
    template_v2 ||--o{ template_create_infos : created_by

    presentations {
        uuid id PK
        enum version "v1-standard | v2-standard"
        text content
        int n_slides
        varchar language
        varchar title
        json file_paths
        json outlines
        json layout
        json structure
        json theme
        json fonts
        text instructions
        enum tone
        enum verbosity
        bool include_table_of_contents
        bool include_title_slide
        bool web_search
        datetime created_at
        datetime updated_at
    }

    slides {
        uuid id PK
        uuid presentation_id FK
        varchar layout_group
        varchar layout
        int index
        json content
        text html_content
        text speaker_note
        json properties
        json ui
    }

    template_v2 {
        varchar id PK
        varchar name
        text description
        json raw_layouts
        json components
        json merged_components
        json layouts
        json assets
        bool is_default
        datetime created_at
        datetime updated_at
    }

    chat_history_messages {
        uuid id PK
        uuid presentation_id FK
        varchar template_v2_id FK
        uuid conversation_id
        int position
        varchar role "user | assistant | system"
        text content
        json tool_calls
        datetime created_at
    }

    imageasset {
        uuid id PK
        varchar path
        bool is_uploaded
        json extras
        datetime created_at
    }

    font_uploads {
        uuid id PK
        varchar filename
        varchar path
        varchar normalized_family_name
        varchar family_name
        varchar subfamily_name
        varchar postscript_name
        int weight_class
        int width_class
        varchar format
        int size_bytes
        json extras
        datetime created_at
    }

    keyvaluesqlmodel {
        uuid id PK
        varchar key "indexed"
        json value
    }

    webhook_subscriptions {
        uuid id PK
        varchar url
        varchar secret
        varchar event
        datetime created_at
    }

    async_tasks {
        uuid id PK
        varchar type
        varchar status
        datetime created_at
    }

    async_presentation_generation_tasks {
        uuid id PK
        varchar status
        datetime created_at
    }

    ollama_pull_status {
        uuid id PK
        varchar status
        datetime created_at
    }
```

### Tables Summary

| Table | Records | Key Relationships |
|-------|---------|-------------------|
| `presentations` | Presentation root | FK -> slides, chat_history_messages |
| `slides` | Individual slides | FK -> presentations |
| `template_v2` | Template definitions | FK -> chat_history_messages |
| `chat_history_messages` | Conversation messages | FK -> presentations, template_v2 |
| `imageasset` | Generated/uploaded images | Independent |
| `font_uploads` | Custom fonts | Independent |
| `keyvaluesqlmodel` | Generic key-value store | Used for user config, metadata |
| `presentation_layout_codes` | Custom layout code | FK -> presentations |
| `template_create_infos` | Template creation metadata | FK -> template_v2 |
| `webhook_subscriptions` | Webhook registrations | Independent |
| `async_tasks` | Background job tracking | Independent |
| `async_presentation_generation_tasks` | Generation job status | Independent |
| `ollama_pull_status` | Ollama model download | Independent |

Database: SQLite (default), PostgreSQL, or MySQL. Configured via `DATABASE_URL`.

---

## API Reference

### Auth Endpoints

```
GET    /api/v1/auth/status      -> Auth config + session status
GET    /api/v1/auth/verify      -> Verify current session token
POST   /api/v1/auth/setup       -> Create initial credentials (first-run)
POST   /api/v1/auth/login       -> Login, returns token + sets cookie
POST   /api/v1/auth/logout      -> Clear session
```

### Presentation Endpoints

```
GET    /api/v1/ppt/presentation/all                  -> List presentations
GET    /api/v1/ppt/presentation/{id}                 -> Get presentation with slides
POST   /api/v1/ppt/presentation/create               -> Create empty presentation
POST   /api/v1/ppt/presentation/generate             -> Generate full presentation (SSE)
DELETE /api/v1/ppt/presentation/{id}                 -> Delete presentation
POST   /api/v1/ppt/presentation/{id}/duplicate       -> Duplicate presentation
POST   /api/v1/ppt/presentation/{id}/export          -> Export as PPTX/PDF (async)
```

### Slide Endpoints

```
GET    /api/v1/ppt/slide/{id}        -> Get slide
PUT    /api/v1/ppt/slide/{id}        -> Update slide content/properties
POST   /api/v1/ppt/slide/add         -> Add new slide
DELETE /api/v1/ppt/slide/{id}        -> Delete slide
POST   /api/v1/ppt/slide/reorder     -> Reorder slides
```

### Chat Endpoints

```
GET    /api/v1/ppt/chat/conversations          -> List conversations
GET    /api/v1/ppt/chat/history                -> Get conversation history
POST   /api/v1/ppt/chat/message                -> Send message (non-streaming)
POST   /api/v1/ppt/chat/message/stream         -> Send message (SSE streaming)
DELETE /api/v1/ppt/chat/conversation           -> Delete conversation
```

### Template Endpoints

```
GET    /api/v1/ppt/template/all          -> List all templates
GET    /api/v1/ppt/template/{id}         -> Get template detail
POST   /api/v1/ppt/template/create       -> Create custom template
PUT    /api/v1/ppt/template/{id}         -> Update template
DELETE /api/v1/ppt/template/{id}         -> Delete template
```

### LLM Provider Endpoints

```
POST   /api/v1/ppt/openai/...            -> OpenAI-specific operations
POST   /api/v1/ppt/anthropic/...         -> Anthropic Claude operations
POST   /api/v1/ppt/google/...            -> Google Gemini operations
POST   /api/v1/ppt/ollama/...            -> Ollama model management
```

### Other Endpoints

```
/api/v1/ppt/images/*          -> Image generation + management
/api/v1/ppt/icons/*           -> Icon search + retrieval
/api/v1/ppt/fonts/*           -> Font upload + management
/api/v1/ppt/files/*           -> File upload + management
/api/v1/ppt/outlines/*        -> Outline generation + management
/api/v1/ppt/themes/*          -> Theme management
/api/v1/ppt/layouts/*         -> Layout management
/api/v1/ppt/pptx-slides/*     -> PPTX slide extraction
/api/v1/ppt/pdf-slides/*      -> PDF slide extraction
/api/v1/ppt/prompts/*         -> Prompt management
/api/v1/ppt/codex-auth/*      -> Codex OAuth flow
/api/v1/async-tasks/*         -> Async task status
/api/v1/webhook/*             -> Webhook subscribe/unsubscribe
/api/v1/mock/*                -> Mock endpoints for testing
```

---

## Authentication

### Auth Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant BE as Backend
    participant CFG as user-config.json

    alt First Run (no credentials)
        FE->>BE: GET /api/v1/auth/status
        BE-->>FE: { configured: false }
        FE->>U: Show setup form
        U->>FE: Enter username + password
        FE->>BE: POST /api/v1/auth/setup
        BE->>CFG: Store PBKDF2 hash + secret key
        BE-->>FE: { success: true }
    end

    opt Login
        FE->>U: Show login form
        U->>FE: Enter credentials
        FE->>BE: POST /api/v1/auth/login
        BE->>CFG: Verify PBKDF2 hash
        BE->>BE: Generate HMAC-signed session token
        BE-->>FE: { token } + Set-Cookie: presenton_session
        FE->>BE: Subsequent requests with cookie
        BE->>BE: Verify HMAC signature + expiry
        BE-->>FE: 200 OK
    end

    opt Token Expired
        BE-->>FE: 401 Unauthorized
        FE->>U: Redirect to login
    end
```

### Auth Implementation

| Component | Detail |
|-----------|--------|
| Password Hashing | PBKDF2-HMAC-SHA256, 200,000 iterations, 16-byte random salt |
| Session Token | HMAC-SHA256 signed payload: `{v:1, u:username, iat, exp}` |
| Token Expiry | 30 days from issue |
| Transport | HTTP-only cookie (`presenton_session`) or `Authorization: Bearer <token>` |
| Fallback | `Authorization: Basic <base64>` for service-to-service calls |
| Storage | `user-config.json` in `APP_DATA_DIRECTORY` |

### Auth Modes (env-controlled)

| Mode | Variables | Behavior |
|------|-----------|----------|
| Disabled | `DISABLE_AUTH=true` | No auth required (default, for Electron desktop) |
| Enabled | `DISABLE_AUTH=false` | Login/setup flow active |
| Auto-Setup | `AUTH_USERNAME` + `AUTH_PASSWORD` | Creates credentials at startup |
| Override | `AUTH_OVERRIDE_FROM_ENV=true` | Overwrites existing stored credentials |
| Reset | `RESET_AUTH=true` | Clears all stored credentials |

### Protected Paths

The `SessionAuthMiddleware` protects:
- All `/api/*` routes (except `/api/v1/auth/*`)
- `/docs`, `/openapi.json`, `/redoc`

Public (exempt):
- `/api/v1/auth/*` (login, setup, status)
- `/app_data/images/*`
- `/app_data/fonts/*`
- `/app_data/pptx-to-html/*`

---

## LLM Providers

15 LLM providers supported through a unified adapter:

| Provider | Config Value | Models |
|----------|-------------|--------|
| OpenAI | `LLM=openai` | GPT-4o, GPT-4, o1, o3 |
| Anthropic | `LLM=anthropic` | Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 4 |
| Google Gemini | `LLM=google` | Gemini 1.5 Pro, Gemini 1.5 Flash, Gemini 2.0 |
| Groq | `LLM=groq` | Llama 3, Mixtral, Gemma (fast inference) |
| Ollama | `LLM=ollama` | Any local model (pull API included) |
| DeepSeek | `LLM=deepseek` | DeepSeek V2, DeepSeek V3 |
| Azure OpenAI | `LLM=azure` | Azure-deployed GPT models |
| AWS Bedrock | `LLM=bedrock` | Claude via AWS |
| OpenRouter | `LLM=openrouter` | 200+ models unified API |
| Fireworks | `LLM=fireworks` | Fast inference on open models |
| Together AI | `LLM=together` | Open-source model hosting |
| Cerebras | `LLM=cerebras` | Ultra-low latency inference |
| LiteLLM | `LLM=litellm` | Proxy for 100+ providers |
| LMStudio | `LLM=lmstudio` | Local OpenAI-compatible server |
| Custom | `LLM=custom` | Any OpenAI-compatible endpoint |

### Image Generation Providers

| Provider | Config | Type |
|----------|--------|------|
| OpenAI DALL-E | Image provider = `openai` | Cloud |
| ComfyUI | Image provider = `comfyui` | Self-hosted |
| Pexels | Image provider = `pexels` | Stock photo API |
| Pixabay | Image provider = `pixabay` | Stock photo API |
| Open WebUI | Image provider = `open-webui` | Self-hosted |
| OpenAI Compatible | Image provider = `openai-compatible` | Any API |

### Web Search Providers

| Provider | Config |
|----------|--------|
| SearXNG | `WEB_SEARCH_PROVIDER=searxng` |
| Tavily | `WEB_SEARCH_PROVIDER=tavily` |
| Exa | `WEB_SEARCH_PROVIDER=exa` |
| Brave Search | `WEB_SEARCH_PROVIDER=brave` |
| Serper | `WEB_SEARCH_PROVIDER=serper` |

---

## MCP Server

A secondary server (`mcp_server.py`) runs on port 8001 using FastMCP. It converts the FastAPI OpenAPI specification into LLM-callable tool definitions, enabling AI assistants to interact with the platform programmatically.

```mermaid
graph LR
    AI["AI Assistant<br/>(Claude, GPT, etc.)"] -->|"MCP Protocol"| MCP["FastMCP Server<br/>Port 8001"]
    MCP -->|"HTTP + Auth"| API["FastAPI Server<br/>Port 8000"]
    API --> DB[("Database")]
```

MCP exposes tools for:
- Creating and generating presentations
- Chatting with a presentation
- Listing and managing templates
- Exporting to PPTX/PDF
- Managing auth and configuration

Disabled in Electron mode (`PRESENTON_ELECTRON=true`).

---

## Deployment

### Deployment Architecture

```mermaid
graph TB
    subgraph PROD["Production (Docker)"]
        NGINX["nginx Reverse Proxy<br/>Port 80/443"]
        NEXT["Next.js<br/>Port 3000"]
        FAST["FastAPI<br/>Port 8000"]
        MCP_S["MCP Server<br/>Port 8001"]
        POSTGRES[("PostgreSQL")]
        APP_DATA["/app_data volume"]
        NGINX --> NEXT
        NGINX --> FAST
        NEXT -->|"internal network"| FAST
        FAST --> POSTGRES
        FAST --> APP_DATA
    end

    subgraph ELECTRON["Electron Desktop"]
        E_NEXT["Next.js<br/>Port 3000"]
        E_FAST["FastAPI<br/>Port 8000"]
        E_SQLITE[("SQLite")]
        E_NEXT -->|"loopback"| E_FAST
        E_FAST --> E_SQLITE
    end

    subgraph VERCEL["Vercel (Frontend Only)"]
        V_NEXT["Next.js SSR + Static"]
        V_CDN["Vercel Edge CDN"]
        V_NEXT --> V_CDN
    end
```

### Environment Variables

#### Backend

| Variable | Default | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | `sqlite:///{app_data}/fastapi.db` | Database connection string |
| `APP_DATA_DIRECTORY` | `{project}/app_data` | Upload/export/font storage path |
| `MIGRATE_DATABASE_ON_STARTUP` | `false` | Auto-run migrations on startup |
| `DISABLE_AUTH` | `true` | Disable authentication |
| `AUTH_USERNAME` | - | Auto-configure admin username |
| `AUTH_PASSWORD` | - | Auto-configure admin password |
| `LLM` | - | Active LLM provider |
| `OPENAI_API_KEY` | - | OpenAI API key |
| `ANTHROPIC_API_KEY` | - | Anthropic API key |
| `GOOGLE_API_KEY` | - | Google AI API key |
| `SENTRY_DSN` | - | Sentry error tracking DSN |
| `LOG_LEVEL` | `INFO` | Logging verbosity |
| `DB_POOL_SIZE` | `5` | Database connection pool size |
| `DB_MAX_OVERFLOW` | `10` | Max pool overflow connections |

#### Frontend

| Variable | Default | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_FAST_API` | `http://127.0.0.1:8000` | Backend URL (browser-side) |
| `FAST_API_INTERNAL_URL` | - | Backend URL (server-side, Docker) |
| `NEXT_PUBLIC_HACKATHONS_API_URL` | - | External hackathon data API |

---

## Development Setup

### Prerequisites

- Node.js 20+
- Python 3.11
- npm or pnpm
- uv (Python package manager)

### Backend

```bash
cd backend

# Install dependencies
uv sync

# Run server
uv run python server.py --port 8000 --reload true
```

API docs available at `http://127.0.0.1:8000/docs`.

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

Opens at `http://localhost:3000`. API requests are proxied to the backend.

### Environment Configuration

Create `frontend/.env.local`:

```env
# Point to running backend
NEXT_PUBLIC_FAST_API=http://127.0.0.1:8000
```

### Running Tests

```bash
cd backend
uv run pytest
```

### Database Migrations

Auto-run on startup when `MIGRATE_DATABASE_ON_STARTUP=true`. Manual:

```bash
cd backend
alembic revision --autogenerate -m "description"
alembic upgrade head
```


---

Made by AC-DC for Summer of Codefest 2.0
