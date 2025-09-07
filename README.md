
# 🧠 Digital Mental Health & Psychological Support System for Students

> 🚀 A blockchain + AI-powered platform providing multilingual voice/chat support, relaxation resources, anonymous counseling, appointment booking, progress tracking, and gamified wellness for students in higher education.

---
Project Link: https://staging-mental-health-platform-5sqi.frontend.encr.app
## 📌 Problem Statement

Mental health challenges among students are rising due to stress, isolation, and lack of accessible counseling. Current solutions lack:

* **24/7 multilingual support**
* **Anonymity for privacy**
* **Offline accessibility**
* **Engagement features** like gamification

Our system bridges these gaps with **AI-driven support, counselor integration, and gamified wellness tracking**.

---

## 🎯 Key Features (MVPs)

1. 🎙 **AI Voice Assistant** – Multilingual, empathetic speech-to-speech conversations.
2. 💬 **Chatbot** – Anonymous text-based AI chatbot trained in CBT principles.
3. 🎵 **Relaxation Media Library** – Guided meditations, calming audio, motivational videos.
4. 📅 **Appointment Booking** – Book sessions with counselors based on availability & preferences.
5. 🕵 **Anonymous Mode** – Use without revealing identity (secure tokens).
6. 👩‍⚕️ **Counselor Dashboard** – Encrypted session notes, appointment management, trend analytics.
7. 📊 **Progress Tracker** – Mood logs, meditation streaks, mental wellness graphs.
8. 🎓 **Online Wellness Classes** – Live & recorded workshops for mindfulness and stress management.
9. 🏆 **Rewards & Gamification** – Points, streaks, certificates for consistent engagement.
10. 📶 **Offline Mode** – Downloadable content + SMS chatbot fallback.
11. 👨‍👩‍👧 **Parental Control Mode** – Risk alerts to guardians (optional).
12. 📞 **Emergency Numbers Section** – One-click call to national/student helplines.
13. 🌱 **Peer Experience Sharing** – Positive stories shared with counselor/admin moderation.

---

## 🏗️ Tech Stack

**Frontend:** React.js / Next.js + Tailwind CSS
**Backend:** Node.js + Express / FastAPI
**Database:** PostgreSQL / MongoDB (encrypted)
**Auth:** Supabase / Firebase (JWT role-based access)
**AI/ML:**

* HuggingFace Transformers / OpenAI API for chatbot
* Google Speech-to-Text + TTS for voice assistant
* LangChain for contextual Q\&A
  **Video/Audio:** Zoom SDK / Jitsi API, Media Streaming
  **Notifications:** Firebase / Twilio
  **Deployment:** Vercel (frontend) + Render/Heroku (backend)

---

## 🚀 Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/mental-health-support-system.git
cd mental-health-support-system
```

### 2️⃣ Install Dependencies

```bash
npm install   # frontend
cd backend && npm install   # backend
```

### 3️⃣ Environment Variables

Create a `.env` file in both `frontend` and `backend`:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
OPENAI_API_KEY=your_openai_key
GOOGLE_API_KEY=your_google_cloud_key
```

### 4️⃣ Run the Project

```bash
# Frontend
npm run dev

# Backend
cd backend && npm start
```

---

## 🎥 Demo Flow (Hackathon Showcase)

1. Student logs in anonymously.
2. Talks to AI voice assistant in Hindi/English.
3. AI suggests relaxation video → user watches.
4. User books appointment with counselor.
5. Counselor dashboard shows student mood trends.
6. Student attends an online wellness class → earns reward badge.
7. In crisis, parental control sends confidential alert.

---

## 🌟 Unique Selling Points (USP)

* ✅ **Multilingual AI (Voice + Chat)** – inclusive support for diverse students.
* ✅ **Anonymous Mode** – ensures privacy, builds trust.
* ✅ **Offline Mode** – reaches rural/low-connectivity areas.
* ✅ **Gamification** – keeps students engaged.
* ✅ **End-to-End Support** – instant AI + real counselors + long-term growth.

---

## 🔮 Future Scope

* AI-driven **personalized recommendations** for mental wellness.
* Integration with **wearables** (Fitbit, smartwatches) for stress detection.
* **Blockchain-based privacy vault** for storing therapy records securely.
* Expansion to **corporate wellness programs**.
