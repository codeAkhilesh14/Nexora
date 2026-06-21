# Nexora 🚀
> **Nexora** is a production-ready, full-stack, campus-exclusive social ecosystem designed for verified college students in India.

By blending anonymous-first interactions with progressive reveal mechanics, Nexora provides a secure yet exciting social environment. It brings together swipe deck discovery, realtime chat, mood-based public chatrooms, secret crush matching, approximate zone-based radar, tiered premium services (Razorpay), AI compatibility indexing, safety moderation, and a robust admin dashboard.

---

## 🌟 Key Features

### 1. Domain-Gated Authentication & Verification
- **Verified Signup:** Gatekeep registration through verified campus-specific email domains (e.g., `student@iitd.ac.in`).
- **Nodemailer OTP:** Realtime email verification via SMTP (with fallback to local testing inputs).
- **Secure Sessions:** Dual JWT architecture using secure HTTP-only cookies and token rotation mechanisms.
- **Onboarding Journey:** Interactive multi-step onboarding path to customize nickname, select avatar, vibe tags, prompts, music taste, and study/relationship interests.

### 2. Campus Discover
- **Swipe-Deck Cards:** Rich, interactive 3D swipe cards with dynamic cursor hover lighting, showing profile details, vibe tags, and interests.
- **Offline & Online Visibility:** Shows all matching campus students with active online/offline state indicators.
- **Swipe Controls:** Classic swipe interactions—Swipe Right (Like), Swipe Left (Dismiss, reappears in 7 days), Super Like (Exclusive Premium features), and Rewind (premium swipe recovery).

### 3. Reveal-Ladder Chat System
- **Progressive Reveal:** Profiles start fully anonymous. As users converse and interact, their reveal level advances:
  1. *Level 1:* Anonymous Vibe (Initial state)
  2. *Level 2:* Match unlock - compatibility index score & custom description generated via AI or deterministic algorithm
  3. *Level 3:* Add Secret Crush / Blur Photo visible
  4. *Level 4:* Share thoughts in rooms / partial info
  5. *Level 5:* Contact exchange / real photo reveal
- **Rich Realtime Chat:** Built on WebSockets via Socket.IO:
  - Disappearing messages option (24h TTL).
  - Soft-deletion of messages.
  - Message reactions (emoji selector).
  - Typing & read receipts.

### 4. Mood Rooms
- **Themed Public Channels:** Eight campus rooms categorized by mood (e.g., *Exam Stress, Coding Night, Lonely Tonight, Anime Fans, Study Partner, Gym Bros, Breakup Recovery, Hackathon Team*).
- **Realtime Broadcasts:** Live active room participant counts and instant message broadcasts.
- **Message Limits & Auto-Expiry:** Prevents clutter with a 10-day message auto-expiry TTL, alongside daily message limits.

### 5. Secret Crush
- **Mutual Reveals:** Add a crush via their college email.
- **Insta-Matching:** If the crush adds you back, it triggers an instant mutual match, skipping the swipe deck, unlocking a direct chat room, and sending notifications.

### 6. Campus Radar
- **Approximate Privacy-Safe Location:** No live tracking. Users set themselves to general campus zones (e.g. *library, cafeteria, college gate*).
- **Radar Dashboard:** Shows how many students crossed paths in that zone within the last 6 hours.

### 7. Razorpay Subscriptions
- **Premium Tiers:** Spark (Pulse Pro), Plus (Orbit Z), and Max (Nebula X) plans with dynamic limits on swipes/messages.
- **Premium Badges:** Unlocks unique user status badges (Pulse Pro, Orbit Z, Nebula X) and custom gradient page themes.

### 8. Admin Control Plane
- **Dashboard Metrics:** Tracks total active users, registered colleges, open moderation reports, and aggregate Razorpay revenue.
- **Moderation Tools:** Manage reports, suspend or ban problematic profiles, and dynamically seed or configure colleges.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 18, Vite (Fast builds, code-splitting)
- **Routing:** React Router v6 (Nested protected layout paths)
- **State Management:** Redux Toolkit, Redux Persist (Offline storage)
- **Data Fetching:** TanStack Query v5 (Optimistic UI updates, caching)
- **Styling & Animation:** Tailwind CSS v3, Framer Motion (Smooth 3D transitions)
- **Icons & UI:** Lucide React, React Hot Toast (Sleek alerts)
- **Forms & Validation:** React Hook Form, Zod

### Backend
- **Runtime:** Node.js, Express (ES Modules)
- **Database:** MongoDB Atlas, Mongoose (Index optimization, TTL hooks)
- **Realtime communications:** Socket.IO
- **AI Engine:** DeepSeek (via OpenRouter compatibility) with deterministic backup algorithms
- **Integrations:** Razorpay checkout & webhooks, Cloudinary image upload, Nodemailer SMTP
- **Security:** Helmet, CORS, Express rate limit, bcryptjs password hashing

---

## 📂 Project Structure

```
Nexora/
├── backend/
│   ├── server/
│   │   ├── config/          # Environment vars, database connections
│   │   ├── controllers/     # Route logic (discovery, chat, subscription, rooms...)
│   │   ├── middleware/      # Authentication, CORS, error handling
│   │   ├── models/          # Mongoose database models (User, Chat, Message, Swipe...)
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # Third party APIs (AI indexer, payments, notifications)
│   │   ├── sockets/         # WebSocket events (chat, rooms, active states)
│   │   └── utils/           # Shared utility classes and errors
│   ├── package.json
│   └── render.yaml          # Deploy configurations
├── frontend/
│   ├── src/
│   │   ├── api/             # HTTP Client config
│   │   ├── components/      # UI components (Button, Card, Input) & common utilities
│   │   ├── features/        # Feature state slices (auth, admin, chat...)
│   │   ├── hooks/           # Custom React hooks (theme tracking)
│   │   ├── layouts/         # Shared layouts (AppLayout & AuthShell)
│   │   ├── pages/           # Page containers (Discover, Chats, Radar, Premium...)
│   │   ├── redux/           # Global store setup
│   │   └── routes/          # Router and Protected route guards
│   ├── package.json
│   └── render.yaml          # Static frontend deploy instructions
└── README.md
```

---

## 🚀 Local Installation & Setup

### Prerequisites
- Node.js (>= 20.0.0)
- MongoDB running locally or a MongoDB Atlas connection string.

### Step 1: Clone and install backend dependencies
```bash
cd backend
cp .env.example .env
npm install
```

### Step 2: Configure Backend Environment Variables (`backend/.env`)
Edit the `.env` file with your config:
```env
PORT=8080
MONGODB_URI=mongodb://localhost:27017/nexora
JWT_ACCESS_SECRET=your_access_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=admin@nexora.in

# Email OTP Settings
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
MAIL_FROM="Nexora <noreply@nexora.in>"

# AI and Cloudinary Settings (Optional)
OPENROUTER_API_KEY=your_openrouter_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Payment gateway configuration
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### Step 3: Run database seeding and start the backend
Seed the initial list of colleges to register college email domains:
```bash
npm run seed:colleges
npm run dev
```
*The API server will launch on `http://localhost:8080`. API health check endpoint: `/health`.*

### Step 4: Setup frontend dependencies
```bash
cd ../frontend
cp .env.example .env
npm install
```

### Step 5: Configure Frontend Environment Variables (`frontend/.env`)
```env
VITE_API_URL=http://localhost:8080/api
VITE_SOCKET_URL=http://localhost:8080
```

### Step 6: Start frontend dev server
```bash
npm run dev
```
*Open `http://localhost:5173` in your browser.*

---

## 🔒 Security & Privacy Architecture
1. **Aadhaar Protection:** Nexora does NOT collect or store sensitive PII (Aadhaar cards, government ids). Instead, verified enrollment is enforced entirely by college-domain email OTP checks.
2. **Safe Campus Radar:** Location is stored as general zones (`library`, `cafeteria`) instead of GPS coordinates to protect user privacy. Signal points expire automatically after 6 hours.
3. **Automatic Content Moderation:** Incoming messages and room chats are moderate-checked against a toxic keyword blacklist or analyzed via AI triggers to decrement trust scores.
4. **Token Security:** JWT access and refresh tokens are served via HttpOnly cookies, protecting the webapp from XSS or local storage compromises.

---

## 🌐 Production Deployment
Nexora is configured for quick deployment to **Render**:
1. Create a MongoDB Atlas cluster and acquire a URI string.
2. Connect your repository to Render.
3. Use the pre-configured [backend/render.yaml](file:///d:/Nexora/backend/render.yaml) for the API container, and [frontend/render.yaml](file:///d:/Nexora/frontend/render.yaml) for the static client app.
4. Ensure environment variables match requirements.
5. In production console, seed the database with `npm run seed:colleges`.
