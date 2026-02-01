# ClawSignal AI — OpenClaw Wallet Intelligence Terminal (Real Data MVP)

This repo is a **static UI** + a **Vercel Serverless Function** that pulls real Solana wallet activity.

## What’s real vs demo
✅ Real:
- Pull recent wallet transactions from **Helius** (requires free API key)
- Extract token mints interacted from `tokenTransfers`
- Enrich top tokens using **DexScreener** (free, no key)
- Compute an initial **Smart Money Score** from observable activity signals (MVP)

🟨 Demo (UI-only for now):
- Token gating checkbox
- “Agent logs” animation (transparent pipeline)

## Project structure
- `index.html`
- `assets/styles.css`
- `assets/app.js`
- `api/scan.js`  ← Vercel function
- `vercel.json`

## Deploy (GitHub → Vercel)
1. Push this repo to GitHub
2. Import into Vercel
3. In Vercel Project Settings → Environment Variables:
   - `HELIUS_API_KEY` = your Helius API key
4. Redeploy

## Notes
- This is intentionally **free-tier friendly**.
- Next upgrades for trader-grade accuracy:
  - true PnL per token (buys vs sells)
  - detect launch time (pair creation) for real “early entry %”
  - caching + watchlists + alerts
