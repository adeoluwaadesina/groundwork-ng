# Ground Work

Policy and infrastructure frameworks for Nigeria's future. By Adeoluwa Adesina.

Built with Next.js 14, Supabase, and Resend.

---

## What this is

A publication site where you publish structured frameworks (policy, infrastructure, organizational analyses for Nigeria). Visitors read overviews, can expand to full versions, see real view counts, and subscribe so you can email them when something new goes out.

**Stack at a glance:**
- **Next.js 14 (App Router)** for the site
- **Supabase** as the database and admin auth backend
- **Resend** for transactional and broadcast email
- **Vercel** for hosting (free tier)
- **Total monthly cost at launch: 0** (within free tiers)

---

## Setup walkthrough

Follow these in order. Total time: 30 to 45 minutes.

### 1. Open in Cursor and install

```bash
cd groundwork
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com), create a free account, create a new project.
2. Wait for it to provision (about 2 minutes).
3. In the project dashboard, go to **SQL Editor** > **New Query**.
4. Open `supabase/schema.sql` from this folder, copy everything, paste into the SQL editor, click **Run**.
5. You should see the `frameworks` and `subscribers` tables under **Table Editor**.

### 3. Get Supabase keys

In your Supabase project dashboard:

- Go to **Settings** > **API**
- Copy these three values:
  - **Project URL** (under "Project URL")
  - **anon public** key (under "Project API keys")
  - **service_role** key (under "Project API keys", click "Reveal")

### 4. Set up Resend

1. Go to [resend.com](https://resend.com), create an account, and open the **API Keys** section.
2. Create an API key and copy it into `RESEND_API_KEY` (see step 5).
3. **Development and testing:** You can send from Resend's shared address so you do not need your own domain yet. Set `FROM_EMAIL` to `Ground Work <onboarding@resend.dev>`. You can only send to the email address tied to your Resend account until you add a verified domain.
4. **Production:** In Resend, add and verify your domain (DNS records they provide). Then set `FROM_EMAIL` to something like `Ground Work <hello@yourdomain.com>` using that domain. Unverified domains will not deliver in production.

### 5. Configure environment variables

In the project root, copy the example file:

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in all the values:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
RESEND_API_KEY=re_xxxx
FROM_EMAIL=Ground Work <onboarding@resend.dev>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_EMAIL=your-real-email@example.com
ADMIN_PASSWORD=your-strong-admin-password
```

**Important:** `ADMIN_EMAIL` and `ADMIN_PASSWORD` must match a real email/password account in Supabase Auth (create it in Supabase **Authentication** > **Users** if needed).

Set `NEXT_PUBLIC_SITE_URL` to your real public URL in production (no trailing slash), for example `https://your-project.vercel.app` or your custom domain. Broadcast emails use it for framework links.

### 6. Configure Supabase auth settings

Still in Supabase dashboard:

1. Go to **Authentication** > **Users** and ensure your admin user exists as an **email/password** user.
2. If not, click **Add user** and create the admin email/password you set in `.env.local`.

### 7. Run locally

```bash
npm run dev
```

Open `http://localhost:3000`. The site should load with no frameworks yet.

### 8. Log into admin and publish your first framework

1. Go to `http://localhost:3000/admin`.
2. Enter `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
3. Click **Sign In**. You'll be signed in to the admin portal.
5. Add your first framework. Hit **Publish**.
6. Go back to `/` and you'll see it on the homepage.

---

## Deploying to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
```

Create a new repo on GitHub, then:

```bash
git remote add origin https://github.com/YOUR-USERNAME/groundwork.git
git branch -M main
git push -u origin main
```

### 2. Connect Vercel

1. Go to [vercel.com](https://vercel.com), sign up with GitHub.
2. Click **Add New** > **Project**, import your `groundwork` repo.
3. **Before deploying**, expand the **Environment Variables** section and add every variable from `.env.local` (including `NEXT_PUBLIC_SITE_URL` for your production URL).
4. Click **Deploy**.

After ~1 minute you'll get a URL like `groundwork-xxxxx.vercel.app`.

### 3. Update auth/env for production and preview

- In Vercel, set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `NEXT_PUBLIC_SITE_URL` for each environment you use.
- **Production** and **Preview** are separate: branch previews (for example `…-git-dev-….vercel.app`) only see variables scoped to **Preview**. If `ADMIN_PASSWORD` is missing there, login always fails with a generic invalid-credentials message while the API still returns HTTP 200 (see troubleshooting).
- In Supabase **Authentication** > **Users**, ensure the same admin email/password exists as an email/password user, and that the Email provider allows password sign-in.
- Redeploy after env changes.

### 4. (Later) Connect a custom domain

When you're ready to buy `groundwork.ng` or similar:

1. Buy from a registrar (Namecheap, Porkbun, GoDaddy).
2. In Vercel: **Settings** > **Domains** > **Add**, enter your domain.
3. Vercel gives you DNS records. Paste them into your registrar's DNS panel.
4. Update Supabase auth URLs to use your new domain.
5. Add the same domain in Resend and update `FROM_EMAIL` after verification.

---

## Project structure

```
groundwork/
├── app/
│   ├── page.tsx                  # Homepage
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # All styles
│   ├── framework/[id]/           # Individual framework reader
│   ├── admin/                    # Admin portal (protected)
│   └── api/
│       ├── admin/request-login/ # Admin credential pre-check (rate-limited)
│       ├── subscribe/            # Newsletter signup + welcome email
│       ├── broadcast/            # Admin: email all subscribers about a framework
│       └── views/                # View counter
├── components/
│   ├── SiteHeader.tsx
│   ├── SiteFooter.tsx
│   ├── SubscribeForm.tsx
│   └── EyeIcon.tsx
├── lib/
│   ├── email/                    # Resend helpers and HTML templates
│   ├── supabase-browser.ts       # Browser-side Supabase client
│   ├── supabase-server.ts        # Server-side Supabase client
│   ├── supabase-admin.ts         # Service-role client (server only)
│   └── types.ts                  # Framework type definition
├── supabase/
│   └── schema.sql                # Database schema (run once)
├── middleware.ts                 # Auth session refresh
└── .env.local                    # Your secrets (never commit)
```

---

## How features work

**View counts.** Every time someone opens a framework, the client posts to `/api/views`, which calls a Postgres function `increment_views` on Supabase. One increment per session (we use `sessionStorage` to prevent reload-spam).

**Reading progress.** As readers scroll a framework, scroll percentage is saved to a cookie (`gw_progress_NR-PWR-001`). On return visits, scroll restores to where they left off. No accounts needed.

**Newsletter.** Subscribers are stored only in Supabase (`subscribers` table). On first signup, the app sends a short welcome email through Resend. When you publish or update a framework, you can click **Send to subscribers** in the admin portal. That route loads every subscriber email from Supabase and sends a batch through Resend (up to 100 messages per API call, chunked automatically). List management is yours: remove addresses in the `subscribers` table if someone asks to be taken off.

**Admin auth.** Username/password via Supabase Auth plus server-side allowlist. Login requires matching `ADMIN_EMAIL` + `ADMIN_PASSWORD`, then `/admin` and protected admin APIs enforce that the active session email matches `ADMIN_EMAIL`.

**Lite vs full.** Each framework has two content fields. The Overview (lite) loads first. A button reveals the full version. The toggle in the top bar lets readers switch back.

---

## Sending a newsletter campaign

1. Publish or edit the framework in the admin portal as usual.
2. In **Published Frameworks**, click **Send to subscribers** on that row.
3. The site emails everyone in `subscribers` with the framework title, id, sector, overview (lite) text, and a link to the full reader page (`NEXT_PUBLIC_SITE_URL/framework/{id}`).

You stay within Resend's [API limits](https://resend.com/docs) (including batch size). If a batch fails, check Vercel function logs and the JSON response from the admin action.

---

## Common commands

```bash
npm run dev          # Start local dev server
npm run build        # Build for production
npm run start        # Start production server locally
npm run lint         # Lint
```

---

## Troubleshooting

**"Invalid API key" on subscribe:** Check `.env.local` has the right Supabase keys. Restart the dev server after editing.

**Admin login fails with `Invalid email or password`:** Confirm the entered email and password match `.env.local` or Vercel (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) and the Supabase Auth user (same password for both the env check and `signInWithPassword`). Avoid accidental spaces when pasting values in the Vercel dashboard.

**Vercel logs show `POST /api/admin/request-login` as 200 but you still cannot sign in:** That is normal. The route always responds with **200** and a JSON body `{ "ok": true, "authorized": true|false }` so failures do not use HTTP error codes. Open the browser **Network** tab, select that request, and inspect the JSON: if `authorized` is `false`, the server rejected the email/password pair (often missing **Preview** env vars, wrong email, or password mismatch). If `authorized` is `true` but you still see an error, Supabase rejected `signInWithPassword` (user missing, wrong password in Auth, or password sign-in disabled for Email).

**Welcome or broadcast emails do not arrive:** Confirm `RESEND_API_KEY` and `FROM_EMAIL` are set. On `onboarding@resend.dev`, Resend only delivers to your own verified account email until you add a domain. In production, use a verified domain and a matching `FROM_EMAIL`. Check Vercel logs for Resend error messages.

**Broadcast says unauthorized:** You must be logged into `/admin` with the same address as `ADMIN_EMAIL`. Session cookies must be sent (same browser; the admin button uses `credentials: 'include'`).

**Wrong links in email:** Set `NEXT_PUBLIC_SITE_URL` to the public URL readers use. For Vercel previews you can rely on `VERCEL_URL` as a fallback only when `NEXT_PUBLIC_SITE_URL` is unset; prefer setting it explicitly.

**"User not authorized" in admin:** Your active session email doesn't match `ADMIN_EMAIL`, or `ADMIN_EMAIL` is missing in env vars. Update env vars and redeploy.

---

## What you might want to add later

- **RSS feed** for each framework so readers can subscribe via reader apps
- **Open Graph image generation** so frameworks look nice when shared on Twitter/LinkedIn
- **Server-side full-text search** if the homepage filter is not enough (Supabase full-text is free)
- **Comment system** (Disqus or Giscus, both free)
- **Analytics** (Plausible or Vercel Analytics, both privacy-friendly)
- **Markdown rendering** in the framework body (currently plain paragraphs split on blank lines)

Most of these are 1-to-2-hour additions whenever you decide you want them.
