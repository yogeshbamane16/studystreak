# StudyStreak ⚡
### Tactical AI Study Companion for Competitive Exam Aspirants (JEE • NEET • UPSC • GATE • CAT • SSC • Banking)

> **Live Demo & Deployment Ready** — Mobile-first, zero-login, privacy-focused AI study companion engineered with Next.js 14 App Router, Tailwind CSS, and a resilient multi-tier pedagogical answering engine.

---

## 🚀 Key Features

### 1. 🛡️ Tutor & Practice (Tactical Doubt Chat & Precision Quizzes)
* **Step-by-Step AI Doubt Solver:** Built for rigorous competitive examinations. Deconstructs doubts into:
  * *Academic Tenets & Definitions*
  * *Microscopic & Mathematical Derivations* (Algebra, Quadratics, Calculus $\frac{d}{dx}\sin x = \cos x$)
  * *Tactical Traps (Examiner Pitfalls)*
  * *15-Second Speed Shortcuts*
* **Multi-Tier Factual Answering Pipeline:**
  1. Built-in Math & Calculus Solver (with step-by-step derivations and LHS = RHS proofs)
  2. 30+ High-Yield Curated Syllabus Modules (Physics, Chemistry, Biology, Indian Polity, Economics)
  3. Live Encyclopedic Fact Retrieval (Wikipedia REST & Search APIs for real-time verified answers on any concept, country, or event)
  4. Optional External LLM Integration (Groq Llama 3.1, Google Gemini 1.5 Flash, OpenAI GPT-4o-mini)
* **5-MCQ "Quiz Me" Engine:**
  * Generates 5 timed, exam-calibrated questions on any subject or weak topic.
  * Instant feedback with tactical explanations and trap warnings.
  * Confetti celebration on completion.
* **Weak Topics Radar:**
  * Automatically records question mistakes per topic in `localStorage`.
  * One-click **"Airstrike Drill"** targets weak topics in the next quiz.

### 2. 📅 Study Plan & Daily Tracker
* **Real-time Exam Countdown:** Computes exact days remaining to exam date.
* **Daily Target Progress Bar:** Tracks study hours logged vs. daily target.
* **Study Session Logger:** Log subject, duration (e.g., 90m), and topics studied.
* **Interactive Weekly Schedule:** Check off daily study tasks.
* **AI Sortie Generator:** Automatically generates a personalized 5-point study schedule prioritizing identified weak topics.

### 3. 📚 Curated Resource Hub
* **High-Yield Subject Library:** Instant revision notes, formula cheat-sheets, and 5-year past question weightage trends.
* **Real-time Search Bar:** Instantly filter resources by subject, formula name, or exam syllabus.
* **Read / Inspection Modal:** Full tactical review with quick copy shortcuts.

---

## 🛠️ Architecture & Tech Stack

* **Framework:** Next.js 14.2 (App Router)
* **Styling:** Tailwind CSS with deep dark mode (`#0b0f11` background, `#12181c` cards, `#00f5ff` and `#10b981` accents)
* **Icons:** `lucide-react`
* **Animations & Effects:** `canvas-confetti`
* **State Management:** Browser `localStorage` (Zero login, no database, 100% offline-ready student privacy)
* **Backend:** Next.js Serverless Route (`/api/chat`) with multi-provider failover.

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory:

```env
# Optional: Default BharatCode or External LLM Configuration
BHARATCODE_API_KEY=your_bharatcode_api_key_here
BHARATCODE_API_URL=https://api.bharatcode.ai/v1/chat/completions

# Optional: Direct Provider Keys (can also be configured by students via UI)
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

*(Note: StudyStreak runs **100% out-of-the-box** even with zero API keys using its internal knowledge engine and live encyclopedic resolver!)*

---

## 📦 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Open in browser
http://localhost:3000
```

---

## 🚢 Production Deployment

### Option 1: Deploy on Vercel (Recommended)
1. Push this repository to GitHub / GitLab.
2. Import the project into [Vercel](https://vercel.com).
3. (Optional) Add your environment variables in the Vercel project dashboard.
4. Click **Deploy**. Vercel will build and launch your application globally on its Edge Network.

### Option 2: Production Build & Start
```bash
npm run build
npm run start
```

---

## 🔒 Security & Privacy
* **Never Exposes Keys to Browser:** All API requests and model keys are securely processed on the backend inside [`src/app/api/chat/route.js`](src/app/api/chat/route.js).
* **Zero PII Collection:** No user accounts, emails, or personal tracking. All study telemetry stays strictly inside the student's browser `localStorage`.
