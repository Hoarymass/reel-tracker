# Reel Tracker: Project Handoff Document

## Project Overview

**Reel Tracker** is a personal movie tracking app with AI recommendations.

- **Stack**: React + Vite (frontend), Supabase (PostgreSQL + Auth + Edge Functions), Vercel (deployment)
- **GitHub**: `git@github.com:Hoarymass/reel-tracker.git`
- **Live URL**: https://reel-tracker-sigma.vercel.app
- **Supabase Project Ref**: `itozqlfdcvqunhsxzyxh`
- **Local Path**: `/Users/dnmiller/Downloads/reel-tracker/`

---

## Architecture

```
User (Browser/Phone)
       │ HTTPS
       ▼
Vercel (reel-tracker-sigma.vercel.app)
  ── auto-deploys from GitHub on push
       │ serves built React app
       ▼
React + Vite Frontend
  ├── Auth.jsx          → Login screen (email/password)
  ├── App.jsx           → Main shell (auth, state, routing)
  ├── MovieCard.jsx     → Expand, edit, streaming check
  ├── AddMovieForm.jsx  → OMDB + TMDB search, auto-fill
  ├── AIPanel.jsx       → AI Advisor (calls Edge Function)
  └── StarRating.jsx    → Star rating widget
       │ supabase-js client
       ▼
Supabase Backend
  ├── Auth             → Invite-only users, JWT sessions
  ├── PostgreSQL       → movies table, RLS enabled
  └── Edge Function    → ai-advisor (proxies Claude API)
       │ x-api-key (secret)
       ▼
Anthropic Claude API (model: claude-sonnet-4-6)
```

---

## File Structure

```
reel-tracker/
├── index.html
├── package.json
├── vite.config.js          # Dev server config (no-cache headers)
├── vercel.json             # Production cache headers
├── .env                    # Local env vars (NOT committed)
├── .env.example            # Template
├── .gitignore
├── supabase-schema.sql     # Database schema + seed data
├── supabase/
│   └── functions/
│       └── ai-advisor/
│           ├── index.ts    # Edge Function (Claude proxy)
│           └── deno.json
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── lib/
    │   └── supabase.js     # Supabase client init
    └── components/
        ├── Auth.jsx
        ├── MovieCard.jsx
        ├── AddMovieForm.jsx
        ├── AIPanel.jsx
        └── StarRating.jsx
```

---

## Environment Variables

### Local (.env)
```
VITE_SUPABASE_URL=https://itozqlfdcvqunhsxzyxh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...  (JWT anon key)
VITE_OMDB_API_KEY=cadf81f6
VITE_TMDB_TOKEN=eyJ...  (TMDB Read Access Token)
```

### Vercel (Settings → Environment Variables)
Same as above. Must be added manually in Vercel dashboard.

### Supabase Secrets (for Edge Function)
```
ANTHROPIC_API_KEY=sk-ant-api03-...  (set via `supabase secrets set`)
```

---

## Database Schema

Table: `movies`

| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL PK | Auto-increment |
| title | TEXT NOT NULL | Movie title |
| year | INTEGER | Release year |
| platform | TEXT | Netflix, Max, Hulu, etc. |
| language | TEXT DEFAULT 'English' | Primary language |
| genre | TEXT | e.g., "Mystery / Thriller" |
| rt_critics | INTEGER | Rotten Tomatoes critics % |
| rt_audience | INTEGER | Rotten Tomatoes audience % |
| runtime | TEXT | e.g., "2h 24m" |
| status | TEXT DEFAULT 'watchlist' | CHECK: watchlist, watched, skipped |
| rating | INTEGER | CHECK: 1-5 |
| notes | TEXT DEFAULT '' | User notes |
| synopsis | TEXT DEFAULT '' | Plot summary |
| sort_order | INTEGER DEFAULT 0 | Custom ordering |
| created_at | TIMESTAMPTZ DEFAULT NOW() | Auto-set |
| updated_at | TIMESTAMPTZ DEFAULT NOW() | Auto-updated via trigger |

### Trigger
```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON movies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### RLS Policy
```sql
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users only" ON movies
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
```

---

## Authentication

- **Type**: Invite-only email/password via Supabase Auth
- **Sign-ups disabled**: Only admin-invited users can access
- **Frontend**: `Auth.jsx` shows login form; `App.jsx` wraps everything in session check
- **Flow**: User signs in → JWT issued → supabase-js attaches JWT to all requests → RLS enforces access

---

## Key SOPs (Standard Operating Procedures)

### SOP 1: Local Development

```bash
cd /Users/dnmiller/Downloads/reel-tracker
npm install          # first time only
npm run dev          # starts Vite dev server on localhost:5173
```

- Vite config sets `Cache-Control: no-store` to prevent stale cache locally
- `.env` must exist with all 4 env vars
- Hot module reload (HMR) picks up code changes automatically
- Restart required after `.env` changes

### SOP 2: Deploying to Production

```bash
git add .
git commit -m "description of changes"
git push
```

- Vercel auto-deploys on push to `main`
- `vercel.json` prevents HTML caching (fixes white screen issues)
- New env vars must be added in Vercel dashboard before deploy
- If Vercel is pinned to a rollback, promote the new deployment manually

### SOP 3: Adding a Movie (User Flow)

1. Click "+ Add" button
2. Type movie title in search bar, press Enter
3. Results from OMDB + TMDB appear (searched in parallel, deduplicated)
4. Click a result to auto-fill all fields
5. Select Platform manually (not auto-detected)
6. Click "Add Movie"
7. Duplicate check: same title + year blocks re-add with error message

### SOP 4: Supabase Edge Function Deployment

```bash
supabase login                    # first time
supabase link --project-ref itozqlfdcvqunhsxzyxh
supabase secrets set KEY='value'  # set secrets
supabase functions deploy ai-advisor --no-verify-jwt
```

- `--no-verify-jwt` required because the function is called from the browser
- Model must be one available on the account (use `claude-sonnet-4-6`)
- Test with: `curl -X POST https://itozqlfdcvqunhsxzyxh.supabase.co/functions/v1/ai-advisor -H "Content-Type: application/json" -d '{"prompt":"test","context":"test"}'`

### SOP 5: Inviting Users

1. Supabase dashboard → Authentication → Users → Invite user
2. Enter email address
3. User receives invite link, sets password
4. Sign-ups are disabled (invite-only)

### SOP 6: Git + GitHub (SSH)

- SSH key configured (`~/.ssh/id_ed25519`)
- Remote: `git@github.com:Hoarymass/reel-tracker.git`
- No tokens needed for push/pull

---

## Known Issues & Outstanding Work

### 1. AI Advisor on Deployed Version
- **Status**: Works locally, fails on Vercel ("Error connecting to AI")
- **Root Cause**: Likely `supabase.functions.invoke()` failing on Vercel due to CORS or session issue
- **Debug Steps**: Open browser console on deployed site, click AI button, check error
- **Edge Function**: Deployed with `--no-verify-jwt`, model `claude-sonnet-4-6` confirmed working

### 2. Night/Light Mode Toggle (Not Yet Implemented)
- Previous attempts broke the build (CSS variable approach + filter approach both caused issues)
- **Recommended approach**: Use a single CSS file with CSS variables at `:root` and `[data-theme="light"]` selectors. Do NOT pass theme props through every component. Keep all existing inline styles as-is; only override the key colors via CSS variables applied to container elements.
- **Critical lesson**: All function definitions in App.jsx MUST be above early returns (`if (!session) return <Auth />`) or the production bundler crashes.

### 3. Sort Criteria (Not Yet Implemented)
- Add sort dropdown next to filter with options: Title (A-Z), Year (newest first), RT Critics Score (highest first), Date Added (newest first), Runtime (shortest first)
- Modify the `filtered` array's `.sort()` in App.jsx

---

## Technical Patterns & Lessons Learned

### Production Build vs Dev Mode
- Vite's production bundler (Rollup) handles `const` declarations differently than dev mode
- **Rule**: ALL function definitions (`const fn = async () => {...}`) must appear before any early returns in the component body
- Dev mode (HMR) is more forgiving; always test with `npm run build && npm run preview` before deploying

### Browser Caching
- Old `index.html` gets cached by browsers, pointing to dead JS bundles
- **Fix**: `vercel.json` sets `Cache-Control: no-cache, no-store` on all routes except `/assets/` (hashed files)
- Locally: `vite.config.js` sets `server.headers: {'Cache-Control': 'no-store'}`

### Supabase RLS
- RLS is enabled by default on new tables; blocks all access until a policy is created
- For personal apps: `USING (auth.role() = 'authenticated')` allows all logged-in users full access

### updateMovie Pattern
- When updating a row, use `.select().single()` to get the updated row back (includes trigger-modified fields like `updated_at`)
- Merge the full returned row into local state, not just the fields you sent

### Duplicate Detection
- Frontend check: case-insensitive title + year match against local `movies` state
- Database backup: `CREATE UNIQUE INDEX movies_title_year_unique ON movies (LOWER(title), year)`

### OMDB + TMDB Dual Search
- Search both APIs in parallel with `Promise.allSettled()`
- OMDB provides RT scores; TMDB provides streaming data and broader coverage
- Deduplicate by lowercase title + year before displaying
- Sort exact title matches to the top
- When selecting a TMDB result, also fetch from OMDB for RT scores as fallback

### Edge Function (Deno)
- Runs on Supabase's edge runtime (Deno-based)
- Must include CORS headers for browser access
- Secrets accessed via `Deno.env.get('KEY')`
- Deploy with `--no-verify-jwt` for public access (app-level auth handles security)

---

## API Keys & Services

| Service | Key Location | Purpose |
|---------|-------------|---------|
| Supabase | `.env` (URL + anon key) | Database, Auth, Edge Functions |
| OMDB | `.env` (VITE_OMDB_API_KEY) | Movie search, RT scores |
| TMDB | `.env` (VITE_TMDB_TOKEN) | Movie search, broader coverage |
| Anthropic | Supabase secret | AI Advisor (Claude Sonnet 4.6) |

---

## User's Streaming Subscriptions

Used for the streaming availability check in MovieCard:
- Netflix
- Max
- Hulu
- Disney+
- Apple TV+
- Amazon Prime Video

Defined in `MovieCard.jsx` as `MY_SERVICES` constant.

---

## User Preferences (Dan Miller)

- Red/green color blind: never use red/green for status indicators
- No em dashes in writing
- Prefers dark mode UI
- Movies interests: foreign films, mystery, thriller, action, morally complex dramas
