# Reel Tracker

A personal movie tracker with AI recommendations, powered by React + Supabase + Vercel.

---

## Setup (takes about 15 minutes)

### 1. Supabase — Create your database

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**, give it a name (e.g. `reel-tracker`), set a database password, choose a region
3. Once created, go to the **SQL Editor** tab
4. Paste the entire contents of `supabase-schema.sql` and click **Run**
5. This creates the `movies` table and seeds all 31 films

Get your credentials:
- Go to **Project Settings → API**
- Copy the **Project URL** (looks like `https://abc123.supabase.co`)
- Copy the **anon public** key

### 2. Local setup

```bash
# Clone or unzip the project
cd reel-tracker

# Install dependencies
npm install

# Create your environment file
cp .env.example .env
```

Edit `.env` and fill in your Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Run locally:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 3. GitHub — Push your code

```bash
git init
git add .
git commit -m "Initial commit"
```

Create a new repo on [github.com](https://github.com) and push:
```bash
git remote add origin https://github.com/YOUR_USERNAME/reel-tracker.git
git branch -M main
git push -u origin main
```

### 4. Vercel — Deploy

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New Project** → Import your `reel-tracker` repo
3. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL` → your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` → your anon key
4. Click **Deploy**

Vercel gives you a URL like `reel-tracker-dan.vercel.app`. That's your app — works on iPhone, iPad, desktop, anywhere.

---

## Using the app

- **Watchlist** is the default view on open
- **Expand** any movie to see synopsis, RT scores, and a streaming check button
- **Edit** to update status, rating, and notes — saves instantly to Supabase
- **AI Advisor** tab gives personalized recommendations based on your watch history
- **+ Add** to add new films

All changes save in real-time to Supabase. No export/import needed.

---

## Adding movies via Claude

In your Claude conversation, say e.g. **"Add Dune Part Two to the tracker"** and ask Claude to generate the SQL:

```sql
INSERT INTO movies (title, year, platform, language, genre, rt_critics, rt_audience, runtime, status, synopsis)
VALUES ('Dune: Part Two', 2024, 'Max', 'English', 'Sci-Fi / Epic', 93, 95, '2h 46m', 'watchlist', 'Paul Atreides unites with the Fremen to wage war against the Harkonnens...');
```

Run it in the Supabase SQL Editor and refresh the app.

---

## Supabase security note

The current setup uses the **anon key** with no Row Level Security (RLS). This means anyone who finds your URL and knows Supabase could theoretically read your data. For a personal app this is usually fine — the URL is obscure and the data isn't sensitive. If you want to add authentication later, Supabase Auth is straightforward to add.
