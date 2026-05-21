# Ground Work

Policy and infrastructure frameworks for Nigeria's future. By Adeoluwa Adesina.

Built with Next.js 14, Neon PostgreSQL, NextAuth, and Resend.

---

## What this is

A publication site where you publish structured frameworks (policy, infrastructure, organizational analyses for Nigeria). Visitors read overviews, can expand to full versions, see real view counts, and subscribe so you can email them when something new goes out.

**Stack at a glance:**
- **Next.js 14 (App Router)** for the site
- **Neon** (PostgreSQL) for the database
- **NextAuth** (credentials) for admin login
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

### 2. Set up Neon

1. Go to [neon.tech](https://neon.tech), create a project, and copy the **connection string** (use the **pooled** URL for Vercel/serverless).
2. In the Neon SQL editor (or any `psql` client), run the schema in [`db/schema.sql`](db/schema.sql) to create `frameworks`, `subscribers`, and helper functions.
3. Confirm tables exist: `frameworks`, `subscribers`.

If you are migrating from Supabase, export your existing rows and import them into Neon before switching `DATABASE_URL`.

### 3. Set up Resend

1. Go to [resend.com](https://resend.com), create an account, and open the **API Keys** section.
2. Create an API key and copy it into `RESEND_API_KEY` (see step 4).
3. **Development and testing:** You can send from Resend's shared address so you do not need your own domain yet. Set `FROM_EMAIL` to `Ground Work <onboarding@resend.dev>`. You can only send to the email address tied to your Resend account until you add a verified domain.
4. **Production:** In Resend, add and verify your domain (DNS records they provide). Then set `FROM_EMAIL` to something like `Ground Work <hello@yourdomain.com>` using that domain. Unverified domains will not deliver in production.

### 4. Configure environment variables

In the project root, copy the example file:

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in all the values:

```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-random-secret
NEXTAUTH_URL=http://localhost:3000
RESEND_API_KEY=re_xxxx
FROM_EMAIL=Ground Work <onboarding@resend.dev>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_EMAIL=your-real-email@example.com
ADMIN_PASSWORD=your-strong-admin-password
```

Generate `NEXTAUTH_SECRET` with `openssl rand -base64 32`. Set `NEXTAUTH_URL` to your site origin (local or production, no trailing slash).

Set `NEXT_PUBLIC_SITE_URL` to your public URL in production. Broadcast emails use it for framework links.

### 5. Run locally

```bash
npm run dev
```

Open `http://localhost:3000`. The site should load with no frameworks yet.

### 6. Log into admin and publish your first framework

1. Go to `http://localhost:3000/admin`.
2. Enter `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
3. Click **Sign In**. You'll be signed in to the admin portal.
4. **Upload a framework file** (drag-and-drop or click the upload zone): `.md` with YAML frontmatter (recommended), `.json`, or `.txt`. Fields auto-fill; edit anything before saving. Download **framework template** from the upload zone or use [`public/framework-template.md`](public/framework-template.md).
5. Add your first framework (or finish editing imported fields). Hit **Publish**.
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

### 3. Update env for production and preview

- In Vercel, set `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `NEXT_PUBLIC_SITE_URL` for each environment you use.
- **Production** and **Preview** are separate scopes in Vercel. Preview deployments need their own `DATABASE_URL` (can be the same Neon DB) and `NEXTAUTH_URL` set to the preview host (for example `https://your-app-git-dev-….vercel.app`).
- Redeploy after env changes.

### 4. (Later) Connect a custom domain

When you're ready to buy `groundwork.ng` or similar:

1. Buy from a registrar (Namecheap, Porkbun, GoDaddy).
2. In Vercel: **Settings** > **Domains** > **Add**, enter your domain.
3. Vercel gives you DNS records. Paste them into your registrar's DNS panel.
4. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL` to your custom domain.
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
│       ├── auth/[...nextauth]/   # NextAuth handler
│       ├── admin/frameworks/     # Admin CRUD (session required)
│       ├── subscribe/            # Newsletter signup + welcome email
│       ├── unsubscribe/          # GET: opt out of broadcast emails (keeps subscriber row)
│       ├── broadcast/            # Admin: email opted-in subscribers about a framework
│       └── views/                # View counter
├── components/
│   ├── SiteHeader.tsx
│   ├── SiteFooter.tsx
│   ├── SubscribeForm.tsx
│   └── EyeIcon.tsx
├── lib/
│   ├── db.ts                     # Neon postgres client
│   ├── db/                       # SQL query helpers
│   ├── auth.ts                   # NextAuth options
│   ├── email/                    # Resend helpers and HTML templates
│   └── types.ts                  # Framework type definition
├── db/
│   └── schema.sql                # Database schema (run once on Neon)
├── middleware.ts                 # Protects admin API routes
└── .env.local                    # Your secrets (never commit)
```

---

## How features work

**View counts.** Every time someone opens a framework, the client posts to `/api/views`, which calls the Postgres function `increment_views` on Neon. One increment per session (we use `sessionStorage` to prevent reload-spam).

**Reading progress.** As readers scroll a framework, scroll percentage is saved to a cookie (`gw_progress_NR-PWR-001`). On return visits, scroll restores to where they left off. No accounts needed.

**Newsletter.** Subscribers are stored in Neon (`subscribers` table). On first signup, the app sends a short welcome email through Resend. When you publish or update a framework, you can click **Send to subscribers** in the admin portal. That route emails only subscribers who have **not** opted out (`receive_mail = true`). Each email includes an **unsubscribe** link: the row stays in `subscribers`, but `receive_mail` is set to `false`, so they no longer receive broadcasts. Signing up again from the homepage turns email back on. To remove someone entirely, delete their row in the `subscribers` table.

**Admin auth.** NextAuth credentials provider checks `ADMIN_EMAIL` + `ADMIN_PASSWORD` from env. `/admin` shows a login form when there is no session; `/api/admin/*` and `/api/broadcast` require a valid session.

**Lite vs full.** Each framework has two content fields. The Overview (lite) loads first. A button reveals the full version. The toggle in the top bar lets readers switch back.

---

## Sending a newsletter campaign

1. Publish or edit the framework in the admin portal as usual.
2. In **Published Frameworks**, click **Send to subscribers** on that row.
3. The site emails everyone in `subscribers` who is still opted in to mail, with the framework title, id, sector, overview (lite) text, a link to the full reader page (`NEXT_PUBLIC_SITE_URL/framework/{id}`), and an unsubscribe link.

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

**Database connection errors:** Confirm `DATABASE_URL` is set and `db/schema.sql` has been applied on Neon. Restart the dev server after editing `.env.local`.

**Admin login fails with `Invalid email or password`:** Confirm `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env.local` or Vercel match what you type. Check `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are set (preview deployments need `NEXTAUTH_URL` matching the preview host).

**Admin login succeeds then returns to the sign-in form (or terminal shows `JWT_SESSION_ERROR` / `NO_SECRET`):** `.env.local` on disk must include `DATABASE_URL` and `NEXTAUTH_SECRET` (remove old Supabase vars). Quote `DATABASE_URL` if the Neon URL contains `&`. Restart `npm run dev` after editing env. Clear `next-auth.session-token` cookies for localhost, regenerate `NEXTAUTH_SECRET` if you changed it, then sign in again. Run `node scripts/check-env.mjs` to confirm all three vars load.

**Welcome or broadcast emails do not arrive:** Confirm `RESEND_API_KEY` and `FROM_EMAIL` are set. On `onboarding@resend.dev`, Resend only delivers to your own verified account email until you add a domain. In production, use a verified domain and a matching `FROM_EMAIL`. Check Vercel logs for Resend error messages.

**Broadcast says unauthorized:** You must be logged into `/admin` with the same address as `ADMIN_EMAIL`. Session cookies must be sent (same browser; the admin button uses `credentials: 'include'`).

**Wrong links in email:** Set `NEXT_PUBLIC_SITE_URL` to the public URL readers use. For Vercel previews you can rely on `VERCEL_URL` as a fallback only when `NEXT_PUBLIC_SITE_URL` is unset; prefer setting it explicitly.

**"User not authorized" in admin:** Your active session email doesn't match `ADMIN_EMAIL`, or `ADMIN_EMAIL` is missing in env vars. Update env vars and redeploy.

---

## What you might want to add later

- **RSS feed** for each framework so readers can subscribe via reader apps
- **Open Graph image generation** so frameworks look nice when shared on Twitter/LinkedIn
- **Server-side full-text search** if the homepage filter is not enough (Postgres full-text on Neon)
- **Comment system** (Disqus or Giscus, both free)
- **Analytics** (Plausible or Vercel Analytics, both privacy-friendly)
- **Richer admin editor** (preview pane, autosave) for long Markdown frameworks
- **DOCX/PDF import** with AI field extraction (optional; currently supports `.md`, `.json`, `.txt`)

Most of these are 1-to-2-hour additions whenever you decide you want them.
