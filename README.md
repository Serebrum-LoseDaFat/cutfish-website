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
