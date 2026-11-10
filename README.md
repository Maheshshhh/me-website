# Careerfolio

A lightweight React + TypeScript professional-profile portal built with Vite. It has three isolated configuration layers:

| Environment | Where it runs | Data/backend |
| --- | --- | --- |
| Development | Local machine only (`npm run dev`) | Hardcoded local test account and demo profile |
| UAT | GitHub Pages at `/me-website/uat/` | Read-only profiles from the UAT GitHub Environment configuration |
| Production | GitHub Pages at `/me-website/` | Read-only profiles from the production GitHub Environment configuration |

Profile content is view-only in the website: editing, adding, and removing profile data are disabled. The demo profile is loaded directly from the app and is not saved to browser storage. When Supabase is configured for UAT or production, the website can authenticate and read a profile but does not write profile changes.

## Local development

```sh
npm ci
npm run dev
```

The local development server is available at `http://localhost:8080`.

`.env.development` labels the local build. The local-only test account is configured in the ignored `.env.development.local` file with `VITE_LOCAL_AUTH_USERNAME` and `VITE_LOCAL_AUTH_PASSWORD`. Development mode never initializes the Supabase client, even if Supabase variables are present in the shell or a local override. The local account is only a development gate, not production authentication.

## Tests

```sh
npm test
```

The unit tests cover profile defaults, saved-profile normalization, and route handling.

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

When configuring Supabase Authentication, set the Site URL to the matching site root. Add these URLs to the allowed redirect URLs for each project:

- `https://maheshshhh.github.io/me-website/`
- `https://maheshshhh.github.io/me-website/login`
- `https://maheshshhh.github.io/me-website/reset-password`
- `https://maheshshhh.github.io/me-website/uat/`
- `https://maheshshhh.github.io/me-website/uat/login`
- `https://maheshshhh.github.io/me-website/uat/reset-password`

Email/password sign-in, sign-up, email confirmation, and password recovery are supported. Profile data remains read-only in the website.

The resume and mobile number are currently hidden from the profile, and the resume file is excluded from new GitHub Pages builds. Earlier public commits may still contain both in Git history; removing them from the current site does not remove previously accessible copies.

## Scale boundary

The UAT/production split prevents accidental data/config sharing but is not a guarantee of multi-million-tenant capacity. Size and load-test each backend environment, establish monitoring and backups, and review rate limits and data-retention requirements before a large launch.
