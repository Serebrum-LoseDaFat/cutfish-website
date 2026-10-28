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
`#FF5B3A`. Type: Bricolage Grotesque (display), IBM Plex Sans and Mono.

## Before it goes live

Everything highlighted in yellow on the site (class `todo`) needs a real value:

- [ ] Legal company name and registered address (privacy, terms)
- [ ] Contact emails: `partners@vygor.health` for now (Oct 27); swap in Cutfish addresses once the domain has email
- [ ] Effective date and last-updated date (privacy, terms)
- [ ] App hosting provider (privacy, section 5)
- [ ] Governing law and venue (terms, section 16)
- [ ] Have someone qualified review the privacy policy and terms
- [ ] Once the domain is known, add `<link rel="canonical">` and absolute `og:image` URLs

Find them all with:

```bash
grep -rn 'class="todo"\|cutfish.example' --include=*.html .
```

## Preview locally

```bash
python3 -m http.server 4100
```

Then open http://localhost:4100 (clean URLs like `/brand` need `brand.html` locally).

## Deploy on Vercel from GitHub

1. Push this folder to the GitHub repo for the website.
2. In Vercel: Add New → Project → import the repo. Framework preset: **Other**. No build command, output directory `.` (the repo root).
3. Add the Cutfish domain under Project → Settings → Domains, and set the DNS records Vercel shows.

`vercel.json` turns on clean URLs (`/privacy` instead of `/privacy.html`) and a few security headers.
