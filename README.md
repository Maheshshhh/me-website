# Careerfolio

A lightweight React + TypeScript professional-profile portal built with Vite. It has three isolated configuration layers:

| Environment | Where it runs | Data/backend |
| --- | --- | --- |
| Development | Local machine only (`npm run dev`) | Demo profile in browser storage; Supabase is forcibly disabled |
| UAT | GitHub Pages at `/me-website/uat/` | UAT branch and UAT GitHub Environment configuration |
| Production | GitHub Pages at `/me-website/` | `main` branch and production GitHub Environment configuration |

## Local development

```sh
npm ci
npm run dev
```

`.env.development` labels the local build. Development mode never initializes the Supabase client, even if Supabase variables are present in the shell or a local override. Local demo changes stay in that browser.

## Build environments

```sh
npm run build:uat
npm run build:production
```

For local UAT/production previews, use the matching `.env.uat.example` or `.env.production.example` as a reference and create an ignored `.env.uat.local` or `.env.production.local`. Never commit project keys. `npm run build` is the production build.

## UAT and production deployment

The GitHub Actions workflow builds both environments and publishes them together to GitHub Pages:

- Production: `https://maheshshhh.github.io/me-website/`
- UAT: `https://maheshshhh.github.io/me-website/uat/`

The `main` branch is the production source. The `uat` branch is the testing source. A push to `main` publishes both the production build and the latest UAT build. To publish UAT-only changes before they are released, push to `uat`, then run **Deploy UAT and Production** manually from the `main` branch in GitHub Actions. After testing, merge the approved changes from `uat` into `main` to release them to production. Each deployment composes the latest `main` production build and latest `uat` build so one environment cannot overwrite the other.

In repository settings, configure GitHub Pages to use **GitHub Actions**. The workflow uses separate GitHub Actions Environments named `uat` and `production`. Add the following Actions **Variables** to each environment, using a distinct Supabase project for each:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

These are browser publishable/anon settings, not secrets. Never configure a Supabase service-role key in the frontend or as a `VITE_` variable. If an environment has no Supabase variables configured, it runs in demo mode.

The Supabase migration at `supabase/migrations/20261031000000_initial_profile.sql` provides per-user row-level access and private resume storage. Apply it separately to both the UAT and production Supabase projects.

The resume and mobile number are currently hidden from the profile, and the resume file is excluded from new GitHub Pages builds. Earlier public commits may still contain both in Git history; removing them from the current site does not remove previously accessible copies.

## Scale boundary

The UAT/production split prevents accidental data/config sharing but is not a guarantee of multi-million-tenant capacity. Size and load-test each backend environment, establish monitoring and backups, and review rate limits and data-retention requirements before a large launch.
