## Problem

On the deployed site:
- The logo doesn't load
- The leaderboard is stuck loading
- Nothing seems to be running

## Root cause

The project's `.env` file is missing from the sandbox. That file holds the Lovable Cloud (Supabase) connection values that Vite inlines into the client bundle at build time (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`). Without them:

- The Supabase client throws on first use → leaderboard fetch never resolves → infinite loading.
- The same crash prevents the rest of the page (including imported assets like the logo) from rendering on the published build.

`.env` is not in `.gitignore`, so this is a stale/desynced managed-environment state rather than a config mistake — the standard fix is to refresh the Lovable Cloud integration so the file is regenerated.

## Fix

1. Refresh the Lovable Cloud / backend integration to regenerate `.env` with the correct `VITE_SUPABASE_*` values.
2. Restart the sandbox / preview so Vite picks up the new env vars.
3. Verify the preview loads (logo visible, leaderboard data appears).
4. Re-publish so the live deployment is rebuilt with the env vars baked in.

No application code changes are needed — this is purely an environment/deployment fix.