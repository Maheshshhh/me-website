# Careerfolio

A lightweight React + TypeScript professional-profile portal built with Vite. It has three isolated configuration layers:

| Environment | Where it runs | Data/backend |
| --- | --- | --- |
| Development | Local machine only (`npm run dev`) | Local test account and browser-saved profile |
| UAT | GitHub Pages at `/me-website/uat/` | User-owned profiles in the UAT Supabase project |
| Production | GitHub Pages at `/me-website/` | User-owned profiles in the production Supabase project |

Each signed-in user can create and edit only their own profile. Recruiter preview is read-only. Owners may enable an unlisted share link; anyone with that link can view the public profile and download its resume, but phone numbers are never included. Owners can disable sharing to revoke the link.

## Local development

```sh
npm ci
npm run dev
```

The local development server is available at `http://localhost:8080`.

`.env.development` labels the local build. The local-only test account is configured in the ignored `.env.development.local` file with `VITE_LOCAL_AUTH_USERNAME` and `VITE_LOCAL_AUTH_PASSWORD`. Development mode never initializes the Supabase client, even if Supabase variables are present in the shell or a local override. The local account is only a development gate and saves profile fields in this browser; resume uploads and public sharing require a Supabase-configured UAT or production environment.

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

Apply the migrations in order to both the UAT and production Supabase projects:

1. `supabase/migrations/20261031000000_initial_profile.sql` creates user-owned profile storage and a private resume bucket.
2. `supabase/migrations/20261111000000_profile_editor_and_sharing.sql` adds owner-controlled unlisted share links, a public read-only profile function that excludes phone numbers, and resume downloads available only while sharing is enabled.

The existing profile RLS rules restrict profile reads and writes to the authenticated owner. The public RPC returns only an explicit allowlist of recruiter profile fields. Share links use unguessable UUID tokens; anyone who has the link can see the profile email and download the resume, so share only with intended recipients. Disabling sharing makes both the page and resume unavailable.

## AI writing assistant

The profile editor can request an AI rewrite of a professional summary or work-experience highlights. Only the text in the selected field is sent to Google Gemini; suggestions are editable and are not saved until the user applies them and saves the profile. Authenticated users are limited to 10 requests per hour. Gemini's free-tier availability and quotas are controlled by Google and may change.

To enable AI separately in UAT and production:

1. Apply `supabase/migrations/20261111222000_ai_profile_writing.sql` to that environment's Supabase project.
2. Obtain a Gemini API key through Google AI Studio. In that project's Supabase Dashboard, add it as the `GEMINI_API_KEY` Edge Function secret. Never put it in the frontend or a `VITE_` variable.
3. Link the Supabase CLI to the intended project and deploy the function:

   ```sh
   supabase link --project-ref <project-ref>
   supabase functions deploy improve-profile-text
   ```

   Optionally set `GEMINI_MODEL` to a Gemini model enabled for that API key. The function defaults to `gemini-2.5-flash`. To allow additional browser origins, set `AI_ALLOWED_ORIGINS` to a comma-separated list of exact origins; the GitHub Pages origin is allowed by default.

Repeat these steps for the other Supabase project. AI suggestions are not available in local development mode.

When configuring Supabase Authentication, set the Site URL to the matching site root. Add these URLs to the allowed redirect URLs for each project:

- `https://maheshshhh.github.io/me-website/`
- `https://maheshshhh.github.io/me-website/login`
- `https://maheshshhh.github.io/me-website/reset-password`
- `https://maheshshhh.github.io/me-website/uat/`
- `https://maheshshhh.github.io/me-website/uat/login`
- `https://maheshshhh.github.io/me-website/uat/reset-password`

Email/password sign-in, sign-up, email confirmation, and password recovery are supported. First-time users are prompted to create a profile after signing in.

Phone numbers remain private and are not displayed in recruiter previews or shared profiles. Resume files are stored in the private Supabase Storage bucket, not in GitHub Pages builds. Earlier public commits may still contain historical profile content; current-site privacy changes do not remove previously accessible copies.

## Scale boundary

The UAT/production split prevents accidental data/config sharing but is not a guarantee of multi-million-tenant capacity. Size and load-test each backend environment, establish monitoring and backups, and review rate limits and data-retention requirements before a large launch.
