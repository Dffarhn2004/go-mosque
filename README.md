# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Supabase keep-alive workflow

GitHub Actions runs a lightweight Supabase read every Monday and Thursday at 09:00 UTC (and on demand) so free-tier projects do not pause from inactivity. Files: `.github/workflows/ping-supabase.yml` and `scripts/ping-supabase.js`.

### Required GitHub Secrets

In the repository: **Settings → Secrets and variables → Actions → New repository secret**.

| Secret | Required | Description |
| --- | --- | --- |
| `SUPABASE_URL` | Yes | Project URL (e.g. `https://xxxx.supabase.co`) |
| `SUPABASE_ANON_KEY` | Yes* | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Used instead of the anon key when set (e.g. if RLS blocks anon) |

\* At least one of `SUPABASE_ANON_KEY` or `SUPABASE_SERVICE_ROLE_KEY` must be set.

Optional repository **variable**: `SUPABASE_HEALTH_TABLE` — table to read from (default `health_check`). The script only selects one row and never writes.

Ensure the table exists and is readable with the key you configured (create a minimal public-readable `health_check` table, or point the variable at an existing table).

### Manually trigger the workflow

1. Open the repository on GitHub.
2. Go to **Actions → Ping Supabase**.
3. Click **Run workflow**, choose the branch, then **Run workflow**.

### Verify the workflow succeeded

1. Open **Actions → Ping Supabase** and select the latest run.
2. Confirm the job is green and the **Ping Supabase** step log includes a line like:  
   `Supabase health check succeeded at <timestamp> (table="health_check", rows=…)`.
3. A red run means the script exited with an error; inspect the step logs for the failure reason.
