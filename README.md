# 💜 Mani Reader — The Premium Manga Sanctuary

Mani Reader is a high-performance, gemstone-themed manga sanctuary built for speed, aesthetics, and user privacy. It aggregates over 38,000+ titles with real-time tracking, custom libraries, and advanced SEO optimization.

## ✨ Core Features
- **38k+ Manga Library**: Integrated with high-speed scrapers and the Consumet ecosystem.
- **Premium Aesthetics**: Gemstone-themed UI with fluid GSAP animations and Outfit typography.
- **Authority SEO**: Dynamic sitemaps, Canonical tags, and JSON-LD structured data.
- **User Ecosystem**: Personalized libraries, reading history, and progress tracking.
- **Incognito Mode**: Read without leaving a trace — privacy-first reading logic.
- **Global Analytics**: Comprehensive admin dashboard with traffic, engagement, and revenue tracking.
- **Reader Leaderboard**: Real-time rankings of your most dedicated readers.

## 🚀 Tech Stack
- **Frontend**: Next.js 14 (App Router), React, Vanilla CSS (Modern Design Tokens).
- **Backend**: Node.js, Express, Prisma ORM.
- **Database**: PostgreSQL.
- **Caching**: NodeCache / Redis (ready).
- **SEO**: Dynamic JSON-LD, Robots.txt, and Automatic Sitemaps.

## 🛠️ Quick Start

### 1. Prerequisites
- Node.js v18+
- PostgreSQL database

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your credentials
npm install
npx prisma db push
npm start
```

### 3. Frontend Setup
```bash
cd frontend
cp .env.example .env.local
# Edit .env.local with your URLs
npm install
npm run dev
```

## 🛡️ Security & Performance
- **Connection Pooling**: Centralized Prisma client for high-load stability.
- **Hardened Headers**: Helmet.js integration with strict CORS policies.
- **Rate Limiting**: Intelligent limiting on Auth and Search routes.
- **Clean Code**: Zero developer logs in production-ready files.

---
*Created with love for the manga community.*
