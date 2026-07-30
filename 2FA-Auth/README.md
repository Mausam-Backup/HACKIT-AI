# 🛡️ Hack-It AI Authentication

<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
</div>

<br />

Hack-It AI Authentication is a highly secure, full-stack authentication and session management system. It provides both a **React (Vite)** and **Next.js** frontend out-of-the-box, connected to a robust **Node.js/Express** backend powered by **MongoDB**. 

---

## ✨ Key Features

| Feature | Description | Status |
| :--- | :--- | :---: |
| 🔐 **Authentication** | Secure Email/Password registration and login. | ✅ |
| 📱 **Multi-Factor Auth** | Time-based One-Time Password (TOTP) support using authenticator apps. | ✅ |
| 🔄 **Session Management** | Track, manage, and revoke active sessions across multiple devices. | ✅ |
| 📧 **Email Verification** | Mandatory email verification for new accounts via Resend. | ✅ |
| 🔑 **Password Recovery** | Secure forgot/reset password flow using expiring tokens. | ✅ |
| 🎨 **Theming** | Fully responsive Light & Dark modes built with Tailwind CSS. | ✅ |

---

## 🏗️ System Architecture

The application is built using a decoupled architecture, allowing you to seamlessly switch between the React and Next.js clients.

```mermaid
graph TD
    subgraph Frontend Layer
        React[React / Vite App]
        Next[Next.js App]
    end

    subgraph Backend Layer
        Express[Node.js + Express API]
        Auth[Authentication & Session Logic]
        MFA[TOTP MFA Service]
        Express --> Auth
        Express --> MFA
    end

    subgraph Data & Services
        Mongo[(MongoDB)]
        Resend[Resend Email API]
    end

    React -->|REST API / JSON| Express
    Next -->|REST API / JSON| Express
    Auth --> Mongo
    Auth --> Resend
```

---

## 🌊 Authentication Flow

Below is the standard flow for a user logging in with Multi-Factor Authentication enabled.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Client as Frontend (React/Next)
    participant API as Backend (Express)
    participant DB as MongoDB

    User->>Client: Enters Email & Password
    Client->>API: POST /auth/login
    API->>DB: Validate Credentials
    
    alt MFA Enabled
        DB-->>API: MFA Required flag
        API-->>Client: 200 OK (MFA Required)
        Client-->>User: Prompt for TOTP Code
        User->>Client: Enters 6-digit TOTP
        Client->>API: POST /mfa/verify-login
        API->>DB: Validate TOTP against Secret
    end

    API->>API: Generate Access Token & Session
    API-->>Client: Set HttpOnly Cookie & Return 200 OK
    Client-->>User: Redirect to Secure Dashboard
```

---

## ⚙️ Environment Variables

To run this project, you will need to add the following environment variables to your respective `.env` files.

### Backend (`/backend/.env`)
| Variable | Description |
| :--- | :--- |
| `PORT` | The port your backend server runs on (e.g., 8000) |
| `NODE_ENV` | `development` or `production` |
| `MONGO_URI` | Your MongoDB connection string |
| `JWT_SECRET` | Secret key for signing Access Tokens |
| `JWT_EXPIRES_IN` | Expiration time for tokens (e.g., `15m`) |
| `RESEND_API_KEY` | API key from Resend for sending emails |
| `APP_ORIGIN` | URL of your frontend application |

### Frontends (`/react-frontend/.env` & `/next-frontend/.env`)
| Variable | Description |
| :--- | :--- |
| `VITE_API_URL` | Base URL of the backend API (React) |
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API (Next.js) |

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Mausam5055/MERN-Auth-System.git
cd MERN-Auth-System
```

### 2. Install dependencies
Install dependencies for the backend and your frontend of choice:
```bash
# Backend
cd backend && npm install

# React Frontend
cd react-frontend && npm install

# Next.js Frontend
cd next-frontend && npm install
```

### 3. Start the development servers
Open multiple terminal windows to run the backend and frontend simultaneously.

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: React Frontend
cd react-frontend
npm run dev
```

---

## 👨‍💻 Developer

Designed and developed by **Mausam Kumar** 🚀.
