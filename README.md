# StayNear – AI Hostel & PG Finder (Vadodara) 🏠🤖

An intelligent, full-stack AI-powered Hostel & PG recommendation platform designed specifically for college students in Vadodara, Gujarat. Built with **React 18, Vite, Tailwind CSS, Node.js, Express, MongoDB (Dual-Database architecture), and Google Gemini (gemini-3.8-flash)**.

---

## 🌟 Key Features

### 🔍 Smart Search & Exploration
- **Quick & Natural Language AI Search**: Search by typing prompts like *"AC double sharing PG near MSU under 7000 with wifi and food"*.
- **Comprehensive Filters**: Filter by budget range, room type (Single, Double, Triple, Four-sharing), gender category (Boys, Girls, Co-ed), amenities, distance, and verified badge.
- **Geospatial Proximity**: Proximity calculation relative to major Vadodara colleges (MS University, Parul University, BVM, Navrachana, ITM Universe, SIGMA).
- **Interactive Map View**: Visual pinpoints of hostels with interactive details and directions.
- **Side-by-Side Comparison**: Compare up to 4 hostels simultaneously on rent, deposit, amenities, food policy, rules, and distance.

### 🧠 Gemini-Powered AI Intelligence
- **Structured Requirement Extraction**: Converts informal student queries into strict, validated filter parameters.
- **Deterministic 100% Match Scoring Engine**:
  - Budget Match: **30%**
  - Distance Match: **25%**
  - Amenities Match: **20%**
  - Room Type Match: **10%**
  - Rating Match: **10%**
  - Food Policy: **5%**
- **Grounding Rationale Cards**: Contextual "Why AI Recommends" rationale explaining why a property fits the student's constraints.
- **Conversational Floating AI Assistant**: Multi-turn chat assistant providing guidance, answers, and recommendation adjustments.
- **Zero-Latency Offline Fallback**: Robust heuristic fallbacks when offline or when external AI quotas are restricted.

### 🛡️ User & Role Management
- **Role-Based Access Control**: Tailored dashboards for **Students**, **Hostel Owners**, and **Admins**.
- **Student Dashboard**: Track active inquiries, saved favorites, search history, and personalized recommendations.
- **Owner Portal**: List properties, manage room availability, track inquiries, and view student reviews.
- **Admin Moderation**: Verify listings, oversee user accounts, and maintain platform trust.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 5, Tailwind CSS 3, Lucide React, Axios, React Router DOM 6 |
| **Backend** | Node.js, Express.js (REST API, CORS, Morgan) |
| **Databases** | MongoDB Atlas / In-Memory MongoDB (Dual Architecture: `student_finder_db` & `hostel_finder_db`) |
| **AI / LLM** | Google Gemini API (`@google/genai` / `gemini-3.8-flash`) |
| **Auth & Security** | JWT (JSON Web Tokens), bcryptjs password hashing |
| **Media** | Cloudinary image upload stream |
| **Geospatial** | MongoDB `2dsphere` geospatial indexing, Haversine formula |

---

## 📂 Project Architecture

```
ai-hostel-finder/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── components/      # Navbar, Footer, HostelCard, SearchBar, FilterSidebar, AIChat, MapView...
│   ├── context/         # AuthContext, SearchContext
│   ├── hooks/           # useAuth, useHostels
│   ├── pages/           # Home, FindHostel, HostelDetails, AIFinder, Compare, Dashboard, Login...
│   ├── services/        # api, authService, hostelService, aiService, enquiryService...
│   └── utils/           # calculateDistance, formatPrice
├── server/
│   ├── server.js        # Express API Server entry point
│   ├── seed.js          # Master database seeder for Vadodara hostels & colleges
│   ├── testEndpoints.js # Automated REST API test suite
│   ├── config/          # Multi-DB connection managers (studentDb, hostelDb)
│   ├── controllers/     # auth, hostel, ai, student, owner, review, enquiry, admin
│   ├── middleware/      # authMiddleware, roleMiddleware, errorMiddleware
│   ├── models/          # Hostel, Student, Owner, College, Area, Review, Enquiry...
│   ├── routes/          # REST route handlers
│   ├── services/        # geminiService, promptService, aiSearchService, recommendationService...
│   └── utils/           # ranking algorithm, aiValidation, input validation
└── docs/                # Architecture specifications & project roadmap
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn
- MongoDB (Local instance or MongoDB Atlas URI)

### 2. Backend Setup
```bash
cd server
npm install

# Copy environment template
cp .env.example .env
```

Configure your `.env` variables:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017
STUDENT_DB_NAME=student_finder_db
HOSTEL_DB_NAME=hostel_finder_db
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
```

Seed the database with 80+ curated Vadodara hostels and master colleges:
```bash
npm run seed
```

Start the backend development server:
```bash
npm run dev
```
*Backend runs on `http://localhost:5000`*

### 3. Frontend Setup
From the root directory:
```bash
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`*

### 4. Running Production Build
```bash
npm run build
```

---

## 🧪 Testing

Run backend automated integration test suite:
```bash
cd server
npm test
```

---

## 📄 License
This project is licensed under the MIT License.

