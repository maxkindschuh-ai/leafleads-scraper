# LeafLeads Scraper (MVP UI + Mock Backend)

Quick demo you can click now. No build tools needed.

How to run locally
- Requirements: Node 18+
- Copy .env.example to .env and paste your GOOGLE_MAPS_JS_KEY (safe to leave blank for now)
- Install deps: npm i
- Start: npm run dev
- Open: http://localhost:4000

What it does (today)
- One-page UI: enter keywords, choose country + states (map coming next), click Start
- Shows live progress (mocked ~12s)
- Download CSV with columns: Name, Phone, Email

Endpoints (mocked)
- POST /api/run → { jobId }
- GET /api/status?jobId=... → progress + counts
- GET /api/download?jobId=... → CSV

Next up
- Interactive map area picker (draw polygon/rectangle)
- Connect Google Places + site crawler with $100/mo budget guardrails
- KY pilot → real CSV
