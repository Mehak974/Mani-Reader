# 🚀 Mani Reader Deployment Guide

This document provides a comprehensive guide to deploying the Mani Reader system (Frontend and Backend) to a production environment.

## 📋 Prerequisites
- A production PostgreSQL database (e.g., Supabase, Neon, or DigitalOcean Managed DB).
- A Node.js v18+ environment.
- (Optional) A Redis instance for high-performance caching.

---

## 🏗️ 1. Backend Deployment

### Environment Variables
Create a `.env` file on your server with the following values:
```bash
# Database
DATABASE_URL="postgresql://user:password@host:port/dbname?sslmode=require"

# JWT Secrets (Generate long random strings)
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-other-super-secret-key"

# Server
PORT=4000
NODE_ENV=production
FRONTEND_URL="https://your-frontend-domain.com"

# Consumet API
CONSUMET_URL="https://api-consumet-org-five.vercel.app"
```

### Build & Start
1. Install dependencies: `npm install --production`
2. Run database migrations: `npx prisma migrate deploy`
3. Start the server: `npm start` (or use a process manager like PM2: `pm2 start src/server.js --name mani-backend`)

---

## 🎨 2. Frontend Deployment (Next.js)

### Environment Variables
Configure these in your hosting provider (e.g., Vercel, Netlify):
```bash
# The URL where your backend API is accessible
BACKEND_URL="https://your-backend-api.com"

# Next.js specific (if any)
NEXT_PUBLIC_APP_URL="https://your-frontend-domain.com"
```

### Build & Start
1. Install dependencies: `npm install`
2. Build the application: `npm run build`
3. Start the application: `npm start` (or deploy the `.next` folder to a serverless provider like Vercel).

---

## 🛠️ 3. Consumet API (Self-Hosted)
If you prefer to host your own scraping engine instead of using the public one:
1. Navigate to the `api.consumet.org` directory.
2. Build the Docker image: `docker build -t mani-consumet .`
3. Run the container: `docker run -p 3000:3000 mani-consumet`
4. Update your backend `CONSUMET_URL` to point to this instance.

---

## ✅ 4. Post-Deployment Verification
- [ ] Visit `https://your-backend-api.com/api/health` to verify the backend is up.
- [ ] Log in as an admin to ensure DB connectivity and JWTs are working.
- [ ] Verify that manga covers load (check for CORS issues).
- [ ] Test the "Support Us" link in the sidebar (should open Ko-fi).

---
*Mani Reader — Built for speed, aesthetics, and the ultimate reading experience.*
