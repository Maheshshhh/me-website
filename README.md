# Careerfolio

A lightweight React + TypeScript professional-profile portal built with Vite. It supports a local demo mode and an optional Supabase prototype for email/password accounts, private per-user profile data, and private resume uploads.

## Run locally

```sh
npm install
npm run dev
```

Without Supabase settings, the app runs in demo mode and saves the example profile in this browser only. To use Supabase locally, copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the project URL and publishable/anon key. Then apply the SQL migration in `supabase/migrations/20261031000000_initial_profile.sql`.

Build and preview:

```sh
npm run build
npm run preview
```

## Configure Supabase

1. Create a Supabase project and enable email/password authentication.
2. Apply the migration in `supabase/migrations/20261031000000_initial_profile.sql`.
3. Configure the auth redirect/site URLs for the GitHub Pages URL.
4. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as GitHub Actions **Variables** in the repository settings.

The browser uses only the Supabase publishable/anon key. Never put a service-role key in a `VITE_` variable or in GitHub Pages. Profile rows are keyed by the authenticated user ID and protected by row-level security. Resume files are stored in a private bucket with policies limiting access to the owner's folder; downloads use short-lived signed URLs.

## Deploy to GitHub Pages

The workflow at `.github/workflows/deploy.yml` builds and deploys on pushes to `main`.

1. Push this project to a GitHub repository on the `main` branch.
2. In repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.
3. Add the two Supabase Actions variables above. For demo mode, leave them unset.
4. Push to `main` or run the workflow manually under **Actions**.

Vite's base path is set from the repository name by the workflow, so project Pages URLs load their assets correctly.

## Tenant and scale boundary

For this prototype, one authenticated user is one isolated profile tenant. Row-level security prevents users from reading or changing another user's profile or resume. This is a starting point, not a verified million-tenant production deployment: the GitHub Pages frontend and Supabase free tier have service limits, and this project has not been load-tested. Before a large launch, upgrade/size the backend, monitor and load-test expected traffic, review retention and backup policies, and plan rate limits and abuse controls.
