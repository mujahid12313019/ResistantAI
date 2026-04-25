<div align="center">

# ⚡ Resistant AI

**The anti-assistant. A crucible for deep thought that *resists* clarity until you earn it.**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Cloudflare AI](https://img.shields.io/badge/Cloudflare-Workers_AI-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/workers-ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

[Live Demo](#) · [Report Bug](https://github.com/mujahid12313019/ResistantAI/issues) · [Request Feature](https://github.com/mujahid12313019/ResistantAI/issues)

</div>

---

## 🧠 What Is Resistant AI?

Most AI tools hand you the answer. **Resistant AI does the opposite.**

It's a learning platform built on *cognitive friction* — the idea that you understand something deeply only when you can defend it under pressure. Instead of explaining concepts to you, the AI challenges, questions, and dismantles your reasoning until you've genuinely earned clarity.

> *"The limits of my language mean the limits of my world."* — Wittgenstein

---

## ✨ Features

### 🔥 Resistant Session Mode
- Enter any topic — quantum mechanics, recursion, the French Revolution — anything
- Choose an **AI Personality**: `Strict Teacher`, `Socratic`, `Devil's Advocate`, or `Scientist`
- The AI **critiques and resists** every answer you give
- A **Friction Score** tracks your learning pressure in real time
- After 3 iterations, unlock the **Mastery Protocol** (Teach-Back Mode)
- Teach the concept back to the AI to earn the final explanation unlock

### 📄 PDF Lockdown Mode
- Upload your **lecture notes** (PDF) and optionally a **Past Year Questions** PDF
- The AI generates intelligent checkpoint questions every 5 pages
- Pages lock until you answer — you can't scroll past without proving understanding
- An **Illusion Breaker** metric reveals your *perceived* vs *actual* understanding gap
- Tracks overconfidence level and neural blindspots (weak topics)

### 📚 History Archive
Two-tab history page preserving every session:
- **🧠 Resistant AI tab** — all past debate sessions with topic, mode, score, and attempt log
- **📄 PDF Lockdown tab** — all PDF sessions with:
  - Pages completed progress
  - Actual vs Perceived understanding stats
  - Overconfidence delta
  - Weak topic tags
  - Expandable **Answer History** per session showing each checkpoint with AI feedback

### 🎨 Visual Learning Anchor
- AI generates a **concept image** for every Resistant session
- The image is blurred/grayscale until you earn clarity — it unlocks progressively

### 📊 Cognitive Capacity HUD
- Dashboard shows daily cognitive usage percentage
- Global friction score and rank (A-CLASS / S-CLASS)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, React Router v7, TailwindCSS v4, Axios |
| **Backend** | Node.js, Express 5, Nodemon |
| **Database** | MongoDB Atlas (via Mongoose) |
| **AI Engine** | Cloudflare Workers AI — `@cf/meta/llama-3-8b-instruct` |
| **Auth** | JWT (JSON Web Tokens) + bcrypt |
| **PDF Processing** | `pdfreader` (server-side PDF text extraction) |
| **File Uploads** | Multer (multipart/form-data) |

---

## 📁 Project Structure

```
ResistantAI/
├── client/                     # React frontend
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── FrictionHUD.js  # Score display component
│       │   ├── Navbar.js       # Navigation bar
│       │   └── Toast.js        # Notification system
│       ├── context/
│       │   └── AuthContext.js  # Auth state (JWT)
│       ├── pages/
│       │   ├── Dashboard.js        # Main session launcher
│       │   ├── ResistantSession.js # Live AI debate session
│       │   ├── FrictionalPdfMode.js# PDF lockdown interface
│       │   ├── History.js          # Two-tab history archive
│       │   ├── Login.js
│       │   └── Register.js
│       ├── services/
│       │   └── api.js          # Axios API client
│       ├── App.js
│       └── App.css             # Global styles & animations
│
└── server/                     # Express backend
    ├── config/
    │   └── db.js               # MongoDB connection
    ├── middleware/
    │   └── authMiddleware.js   # JWT verification
    ├── models/
    │   ├── User.js             # User schema
    │   ├── Session.js          # Resistant session schema
    │   └── PdfSession.js       # PDF session schema
    ├── routes/
    │   ├── authRoutes.js       # /api/auth — signup, login, me
    │   ├── resistantRoutes.js  # /api/resistant — sessions, submit, teach
    │   ├── pdfRoutes.js        # /api/pdf — upload, checkpoint, sessions
    │   └── generateRoutes.js   # /api/generate — image generation
    ├── uploads/                # Uploaded PDFs (gitignored)
    └── server.js               # Express entry point
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster URI
- A [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/) account with API token

### 1. Clone the repository

```bash
git clone https://github.com/mujahid12313019/ResistantAI.git
cd ResistantAI
```

### 2. Set up the server

```bash
cd server
npm install
```

Create a `.env` file in `server/`:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key
CF_ACCOUNT_ID=your_cloudflare_account_id
CF_API_TOKEN=your_cloudflare_ai_api_token
```

Start the server:

```bash
npm start
```

> The server runs on **http://localhost:5000**

### 3. Set up the client

```bash
cd ../client
npm install
npm start
```

> The client runs on **http://localhost:3000**

---

## 🔌 API Reference

### Auth — `/api/auth`
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/signup` | Register a new user |
| `POST` | `/login` | Login, returns JWT |
| `GET` | `/me` | Get current user profile |

### Resistant Sessions — `/api/resistant`
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/start` | Start a new session (topic + mode) |
| `POST` | `/submit` | Submit an answer iteration |
| `POST` | `/teach` | Submit teach-back for mastery unlock |
| `GET` | `/session/:id` | Get a single session |
| `GET` | `/sessions` | List all sessions for current user |

### PDF Mode — `/api/pdf`
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/upload` | Upload lecture PDF (+ optional PYQ PDF) |
| `POST` | `/checkpoint` | Submit checkpoint answer |
| `GET` | `/sessions` | List all PDF sessions for current user |
| `GET` | `/view/:id` | Stream PDF file for in-browser display |

---

## 🎮 How It Works

### Resistant Mode Flow

```
User enters topic + selects AI personality
        ↓
AI generates a concept image (visual anchor)
        ↓
User submits their understanding
        ↓
AI critiques and resists — calculates Friction Score
        ↓
Repeat up to 3 iterations
        ↓
[Optional] Teach-Back Mode unlocks
        ↓
Final explanation revealed upon mastery
```

### PDF Lockdown Flow

```
User uploads lecture PDF (+ PYQ PDF)
        ↓
AI reads content in 5-page sectors
        ↓
Checkpoint question generated (PYQ-inspired + harder creative follow-up)
        ↓
Page locks — user must answer before proceeding
        ↓
AI evaluates answer → score, critique, suggestions, weak topics
        ↓
Illusion Breaker: perceived vs actual understanding gap revealed
        ↓
Answer saved to History sidebar (one-time, read-only)
```

---

## 📸 Screenshots

### Dashboard — Session Launcher
> Enter any topic, pick an AI personality, and initialize the learning loop.

### Resistant Session — Live Debate
> The AI dismantles your reasoning. Each iteration is logged with score delta and AI critique.

### PDF Lockdown Mode
> Pages lock mid-read. The right sidebar becomes your **Answer History** — showing each answered checkpoint with AI feedback or suggestions.

### History Archive — Two Tabs
> **Resistant AI tab**: review all past debate sessions.
> **PDF Lockdown tab**: full stats per PDF session including weak topics, overconfidence, and expandable answer histories.

---

## 🔐 Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: `5000`) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for signing JWTs |
| `CF_ACCOUNT_ID` | Cloudflare account ID |
| `CF_API_TOKEN` | Cloudflare Workers AI API token |

> ⚠️ **Never commit your `.env` file.** It is listed in `.gitignore`.

---

## 🧪 The Science Behind It

Resistant AI is inspired by **desirable difficulties** in cognitive psychology — the idea that learning is deeper when it's harder:

- **Retrieval practice** — forcing you to recall, not re-read
- **Generation effect** — knowledge you produce is retained better than knowledge you consume
- **Interleaving** — the AI shifts attack vectors across iterations
- **Metacognitive awareness** — the Illusion Breaker exposes the Dunning-Kruger gap

---

## 🤝 Contributing

Pull requests are welcome!

1. Fork the project
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">

**Built with 🔥 cognitive friction in mind.**

*Stop seeking answers. Start earning them.*

</div>
