# Production readiness

The governed API at `/api/governance` is the supported yield prediction and market intelligence path. It records tenant/field-scoped source reconciliation, constraints, historical replay, yield and market forecasts, uncertainty, agronomist and market review, observed execution, recovery, realized outcomes, and immutable connector history. It never irrigates, treats crops, trades, purchases, or dispatches labor.

## Deployment sequence

1. Review and back up the database, then apply `backend/migrations/001_governed_yield_market_plan.sql` separately using a least-privilege migration identity.
2. Copy `.env.example` to `.env`, replace every placeholder, and configure a unique 32-plus-character JWT secret and explicit CORS allowlist.
3. Install locked dependencies explicitly. `start.sh` only supervises the already-installed backend and frontend.
4. Provision tenant memberships and deploy separately reviewed connector workers. Workers exchange opaque references, versions, digests, and receipts; raw secrets and sensitive content do not enter workflow payloads.
5. Exercise retry, dead-letter, reconciliation, retention/deletion, audit export, backup, restore, and incident-response procedures before production.

Production rejects wildcard CORS, weak secrets, provider/demo flags, generated routes, and startup schema mutation. The additive migration never drops or truncates tables. Legacy `sequelize.sync` is disabled by default and prohibited in production. Destructive demo seed execution requires `ALLOW_DEMO_SEED=true` in a non-production environment.

## Required external validation

Validate farm-management, satellite, soil, weather, market, ERP/WMS/TMS, financial, and notification contracts. Benchmark yield and price error, confidence coverage, freshness, latency, missed events, crop/region edge cases, offline recovery, and realized outcomes on reviewed multi-season data. No farm or commodity-market action was performed.
