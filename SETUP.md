# PPC News Dashboard — Setup Guide

## What This Does

- Aggregates Google Ads, Microsoft Ads, and Google Merchant Center news from official blogs + industry sources
- Shows headline + link + 3-sentence summary for each article
- Dashboard with filtering by platform, search, and date range
- Stores historical data in Postgres
- Sends a weekly email digest every Monday at 9am to info@zatomarketing.com
- Fetches new articles daily at 8am via Vercel Cron

## Deploy to Vercel

### 1. Push to GitHub

```bash
cd ppc-news-dashboard
git init
git add .
git commit -m "Initial commit"
# Create a repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/ppc-news-dashboard.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and import your GitHub repo
2. Vercel will auto-detect Next.js — click **Deploy**

### 3. Add Vercel Postgres

1. In your Vercel project dashboard, go to **Storage** tab
2. Click **Create Database** → **Postgres**
3. Follow the prompts — this auto-populates the `POSTGRES_*` env vars

### 4. Set Up Resend (for weekly emails)

1. Sign up at [resend.com](https://resend.com) (free tier = 100 emails/month, plenty for weekly digests)
2. Create an API key
3. In Vercel project → **Settings** → **Environment Variables**, add:
   - `RESEND_API_KEY` = your Resend API key
   - `DIGEST_EMAIL` = `info@zatomarketing.com`
   - `RESEND_FROM_EMAIL` = `PPC News <noreply@yourdomain.com>` (or use Resend's default)

**Optional:** To send from your own domain (e.g., `noreply@zatomarketing.com`), verify your domain in Resend's dashboard.

### 5. Secure the Cron Endpoints

1. In Vercel → **Settings** → **Environment Variables**, add:
   - `CRON_SECRET` = any random string (e.g., generate with `openssl rand -hex 32`)

### 6. Initialize the Database

After deploying, visit your dashboard URL and click **"Initialize Dashboard"** — this creates the tables and fetches the first batch of articles.

## Cron Schedule (automatic)

Configured in `vercel.json`:
- **Daily at 8am UTC** — Fetches new articles from all RSS feeds
- **Every Monday at 9am UTC** — Sends weekly email digest

> Note: Vercel Cron is available on the Pro plan ($20/mo). On the free/Hobby plan, you can trigger fetches manually via the "Fetch Now" button on the dashboard.

## RSS Sources Monitored

**Official:**
- Google Ads Blog
- Google Ads Developer Blog
- Google Merchant Center / Shopping Blog
- Microsoft Advertising Blog

**Industry:**
- Search Engine Land (filtered for PPC keywords)
- PPC Hero
- Search Engine Journal — PPC section

Articles from industry sources are only included if they mention Google Ads, Microsoft Ads, or Merchant Center keywords.

## Local Development

```bash
nvm use 20
npm install
# Copy .env.example to .env.local and fill in your Postgres + Resend credentials
cp .env.example .env.local
npm run dev
```

## Manual Triggers

- **Fetch articles now:** Click "Fetch Now" button on dashboard, or `GET /api/fetch-news`
- **Send digest now:** `GET /api/send-digest`
- **Setup database:** `POST /api/setup`
