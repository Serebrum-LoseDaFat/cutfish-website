# Cutfish website

The public site for Cutfish: home page, brand kit, privacy policy and terms of
service. TikTok's and Google's app reviews ask for the privacy and terms pages
on the product's own domain.

Plain HTML and one stylesheet, with no build step. Vercel serves it as-is.

| Page | File | URL |
|---|---|---|
| Home | `index.html` | `/` |
| Brand kit | `brand.html` | `/brand` |
| Privacy policy | `privacy.html` | `/privacy` |
| Terms of service | `terms.html` | `/terms` |
| Not found | `404.html` | any unknown path |

Brand files (logo, mark, PNGs and the full kit zip) are in `brand/`, copied
from the Cutfish brand pack (concept A2). Colors: Ink `#0E1A2B`, Coral
`#FF5B3A`. Type: Bricolage Grotesque (display), IBM Plex Sans and Mono. The site
uses the black theme and the black app icons and favicons.

**Deploys:** a push to `main` deploys only if the commit's author is `partners-arch`.
Vercel blocks commits by anyone else on this project (it shows "Deployment was
blocked" on the commit).

## Before it goes live (handoff for Krishna, Oct 27)

The content is done: AI-native positioning, private beta, the flowchart, no vendor or model names, and a share image (`brand/cutfish-share-card.png`). What's left needs decisions, a domain, or a reviewer.

### 1. Decide

- [x] **Domain:** live at https://www.cut.fish (Nov 7). `cut.fish` redirects to `www`.
- [x] **Hosting: Vercel, from this private repo.** GitHub Pages on the free plan needs a public repo, and this repo's first two commits name the tools we've stopped naming publicly. If it ever goes public, push a fresh single commit to a new repo instead of this history.
- [ ] **Company entity** that operates Cutfish. It fills the legal blanks below.

### 2. Fill the yellow blanks (class `todo`)

| What | Where |
|---|---|
| Legal company name | `privacy.html` (intro and Contact), `terms.html` (intro and Contact) |
| Registered address | same four places |
| Effective date and last-updated date | top of `privacy.html` and `terms.html` (use the launch date) |
| App hosting provider | `privacy.html` §5 table (AWS is the current plan for the app) |
| Governing law and venue | `terms.html` §16 (usually the state of incorporation) |

- [ ] Have someone qualified review the privacy policy and terms. AI providers are described by category ("AI model providers", "AI video tools"), not by name.

Find every blank with:

```bash
grep -rn 'class="todo"' --include=*.html .
```

### 3. Once the domain exists

- [x] Domain added in Vercel, with HTTPS.
- [ ] **Email:** create Cutfish addresses (e.g. `hello@` and `privacy@`), then replace `partners@vygor.health` everywhere. It's a stand-in, and it links Cutfish to Vygor publicly: `grep -rn 'partners@vygor.health' --include=*.html .`
- [x] **Absolute URLs for share previews:** `og:image`, `og:url` and `<link rel="canonical">` point at `https://www.cut.fish/...` on every page.
- [x] `sitemap.xml`, and a `Sitemap:` line in `robots.txt`.
- [ ] Give https://www.cut.fish/privacy and https://www.cut.fish/terms to the TikTok API for Business application and the Google app review, **after the yellow blanks are filled**: both pages still show them publicly.

### 4. Optional

- [ ] An invite form instead of the email button (e.g. a form service or a small endpoint on the app), so requests land in one place.

### Keep it confidential

- Don't add vendor or model names, internal plans, pricing per action, or customer numbers to this repo. It's the public site's source.

## Preview locally

```bash
python3 -m http.server 4100
```

Then open http://localhost:4100 (clean URLs like `/brand` need `brand.html` locally).

## Deploy on Vercel from GitHub

1. The repo is `Serebrum-LoseDaFat/cutfish-website` (private).
2. In Vercel: Add New → Project → import the repo. Framework preset: **Other**. No build command, output directory `.` (the repo root).
3. Add the Cutfish domain under Project → Settings → Domains, and set the DNS records Vercel shows.

`vercel.json` turns on clean URLs (`/privacy` instead of `/privacy.html`) and a few security headers.

## Private app preview (`/app-preview`)

A static, clickable mockup of the Cutfish app for Krishna and investors: the app's menu and a step-by-step walkthrough of one reel's path (Brand → Research → Planning → Plan → Shot plan → Script → Stills → Video → Review → Publish → Results), with sample data and screens marked built or coming. It saves nothing and names no tools or models.

- **File:** `app-preview/index.html` (one file, no build). URL: `https://www.cut.fish/app-preview`.
- **Sign-in:** `middleware.js` (Vercel Routing Middleware) shows a Cutfish sign-in page (email and password) on `/app-preview` only; the rest of the site stays public. Invited emails: `partners@vygor.health` and `krishna@serebrumhq.com` (in `ALLOWED_EMAILS`, or override with a comma-separated `PREVIEW_EMAILS` environment variable). The password is the `PREVIEW_PASSWORD` environment variable in Vercel → Project → Settings → Environment Variables (Production, and Preview if used), then redeploy. Never commit the password. A sign-in lasts 7 days (signed cookie); changing the password signs everyone out; "Sign out" is in the preview's top bar. Without `PREVIEW_PASSWORD` the preview stays locked.
- **Not indexed:** `robots.txt` disallows `/app-preview`, the page has `noindex`, and it isn't in the sitemap.
