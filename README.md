# RadioSatCare

Marketing website for **radiosatscare.com**, built to be the landing site for ad campaigns: an independent
assistance service for in-car satellite radio (activation, signal, missing channels and subscription
questions). Visitors read the guides, then call the phone number or send the contact form.

The service is **independent**. It does not claim affiliation with any radio provider or manufacturer,
does not take payments, and never asks for card numbers or radio account passwords.

**It is one small app.** One install, one build, one process. There is **no database, no login and no admin
area**: the contact form validates the enquiry and emails it to your inbox (`BUSINESS_EMAIL`). The website
keeps no copy.

```
radiosatscare/
├── app/          Pages (App Router) and the one API route: app/api/[...path]/route.ts
├── components/   React components        lib/   page copy, SEO helpers, form schema
├── server/       Server-only code: the enquiry API (http/), email sending (services/), validation
├── tests/        Vitest suite (no database needed)
├── deploy/       nginx/ (reverse proxy + rate limits) · ecosystem.config.cjs (PM2)
└── docs/         api-contract.md
```

## Requirements

Node.js 22 or newer and npm 10 or newer. For production you also need an email provider (Brevo or any SMTP
server) to deliver enquiries.

## Local development

```bash
npm install
cp .env.example .env.local        # leave EMAIL_PROVIDER=log: enquiries are printed in the terminal, not sent
npm run dev                       # http://localhost:3000
```

## Configuration (`.env.local`)

One file, documented in `.env.example`. `NEXT_PUBLIC_*` values are inlined at build time, so **rebuild after
changing them**; everything else is read at start-up, so restart after changing it.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for canonicals, sitemap and Open Graph; its origin is always allowed to post the form |
| `NEXT_PUBLIC_SUPPORT_PHONE` / `_DISPLAY` | The single support number used everywhere (`tel:` links). Blank hides phone buttons |
| `NEXT_PUBLIC_SUPPORT_EMAIL` / `_HOURS` | Optional public email and hours. Only state hours you can staff |
| `NEXT_PUBLIC_BUSINESS_LEGAL_NAME` / `_JURISDICTION` | Shown in the footer, About, Contact and legal pages when set. The postal address is fixed in `lib/site.ts` |
| `BUSINESS_EMAIL` (required) | Inbox that receives every enquiry. Replying to the email answers the customer |
| `EMAIL_FROM` (required) / `EMAIL_FROM_NAME` | Sender. With Brevo it must be a verified sender or domain |
| `EMAIL_PROVIDER` | `brevo` (API), `smtp`, or `log` (development only; the app refuses to run in production with `log`) |
| `BREVO_API_KEY` | When `EMAIL_PROVIDER=brevo` |
| `SMTP_HOST` `SMTP_PORT` `SMTP_SECURE` `SMTP_USER` `SMTP_PASS` | When `EMAIL_PROVIDER=smtp` (Brevo SMTP: `smtp-relay.brevo.com:587`) |
| `TRUST_PROXY` | Proxy hops in front of the app. Defaults to `1` in production (Nginx) and `0` in development |
| `RATE_LIMIT_*` | Enquiries per visitor IP (default 5/hour) and a global ceiling |

> `.env.example` ships a reserved fictional number (`+1 555 010 0199`). Replace it with the real business
> number before launch, or clear it to hide phone call-to-actions.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` · `npm start` | Production build and server |
| `npm run lint` · `npm run typecheck` · `npm test` | ESLint, TypeScript, and the test suite |

## What is built

- **Pages:** `/`, `/radio-activation`, `/signal-support`, `/channel-assistance`, `/subscription-support`,
  `/about`, `/contact`, `/faq`, `/privacy-policy`, `/terms-and-conditions`, `/disclaimer`, a custom 404 and
  error page. No refund page: the site takes no payments.
- **Contact form:** validated in the browser and again on the server, then emailed to you. Spam defences:
  hidden honeypot field, minimum-fill-time check, per-IP rate limit, duplicate detection (10 minutes, in
  memory), link limit. The visitor's IP is used in memory for rate limiting only; it is never stored or emailed.
  If the email cannot be sent, the visitor is told to retry or call (there is no other copy).
- **Phone:** one configurable number, `tel:` links in the support bar, header, hero, CTAs, footer and a mobile
  sticky call bar that hides while a form field is focused.
- **SEO:** unique title/description per page, canonical URLs, Open Graph + Twitter tags with a share image,
  `sitemap.xml`, `robots.txt`, JSON-LD (Organization, WebSite, BreadcrumbList, and FAQPage only where the
  questions are visible).
- **Accessibility:** skip link, keyboard-operable menus and accordions, visible focus rings, labelled fields
  with error summaries, `prefers-reduced-motion` support.

## Running ads to this site

- **Tracking is not included.** The site sets no cookies and loads no analytics or ad pixels, and the privacy
  policy says exactly that. If you add Google Ads, Meta Pixel, Google Analytics or any other tracker, you must
  also update `app/(site)/privacy-policy/page.tsx` and, where the law requires it (for example the EU, UK and
  California), add a consent banner before the tags load. Ad networks also review landing pages: keep the
  independence statement visible and do not add claims you cannot prove.
- **Landing pages:** each service page (`/radio-activation`, `/signal-support`, `/channel-assistance`,
  `/subscription-support`) can be used as a campaign destination. It has its own headline, checklist, FAQ and a
  pre-selected enquiry form. `/` suits broad campaigns.
- **Phone is the main conversion.** Make sure the number in `NEXT_PUBLIC_SUPPORT_PHONE` is answered during the
  hours your ads run.

## Production deployment (Ubuntu + Nginx + PM2)

Assumes the repo is at `/srv/radiosatscare` and DNS for `radiosatscare.com` and `www` points at the server.

```bash
# 1. System packages
sudo apt update && sudo apt install -y nginx certbot
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt install -y nodejs
sudo npm install -g pm2
sudo mkdir -p /var/log/radiosatscare /var/www/certbot && sudo chown "$USER" /var/log/radiosatscare

# 2. Code and dependencies
git clone <your-repo-url> /srv/radiosatscare && cd /srv/radiosatscare
npm ci

# 3. Configure
cp .env.example .env.local && chmod 600 .env.local
#    Set: EMAIL_PROVIDER=brevo (or smtp) with its credentials, BUSINESS_EMAIL, EMAIL_FROM,
#         NEXT_PUBLIC_SITE_URL=https://radiosatscare.com and the real phone, email, hours and business identity.

# 4. Build (reads .env.local for the NEXT_PUBLIC_* values) and start
npm run build
pm2 start deploy/ecosystem.config.cjs && pm2 save && pm2 startup   # run the command pm2 prints

# 5. Nginx + HTTPS
sudo cp deploy/nginx/rsc-proxy.conf /etc/nginx/rsc-proxy.conf
sudo cp deploy/nginx/radiosatscare.conf /etc/nginx/sites-available/radiosatscare.conf
#    The 443 blocks need certificates before nginx will load. Get them first with the HTTP block only:
#    comment out the two 443 server blocks, enable the site, then:
sudo ln -s /etc/nginx/sites-available/radiosatscare.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot certonly --webroot -w /var/www/certbot -d radiosatscare.com -d www.radiosatscare.com
#    Re-enable the 443 blocks, then:
sudo nginx -t && sudo systemctl reload nginx
```

Updating later: `git pull && npm ci && npm run build && pm2 reload radiosatscare`.

**Verify after deploy**

```bash
curl -s https://radiosatscare.com/api/health          # {"status":"ok"}
curl -sI https://radiosatscare.com | grep -i -E "strict-transport|content-security|x-frame"
curl -s https://radiosatscare.com/sitemap.xml | head
```

Then **submit a real enquiry from the live site and confirm the email arrives**. If delivery is misconfigured,
the form tells the visitor it could not send, and the log says why.

**Scaling.** Run exactly one instance (the PM2 file does). Rate-limit and duplicate counters live in that
process's memory, which is right for a site like this.

**Real visitor IPs.** The app reads the visitor's IP from `X-Forwarded-For` as set by Nginx (`TRUST_PROXY=1`, the
production default). Do not expose port 3000 to the internet: the PM2 file binds it to `127.0.0.1` so only Nginx
can reach it. Without a proxy all visitors share one rate-limit bucket.

### Email (Brevo)

1. Create a Brevo account, add and **verify the sending domain** (add the SPF and DKIM DNS records Brevo shows)
   or at least verify the sender address used in `EMAIL_FROM`.
2. Create an API key (SMTP & API → API keys) and put it in `BREVO_API_KEY`; set `EMAIL_PROVIDER=brevo`.
3. Send a test enquiry from the live site.

> Email delivery is tested here against a local SMTP server and with a mocked Brevo client. Live Brevo delivery
> has not been exercised, so do the live test enquiry above before launch.

### Handling enquiries and retention

Enquiries live only in the inbox that receives them. The privacy policy says they are kept while being dealt
with and for up to 12 months afterwards, then deleted, so **someone needs to delete old enquiry emails**
(an inbox rule or a calendar reminder is enough). Change the wording in `app/(site)/privacy-policy/page.tsx` if
you choose a different period. Because nothing is stored on the website, there is nothing to back up there.

## Security notes

- The website stores nothing, so there is no database, password or session to protect. Secrets (the email
  credentials) live only in `.env.local` (mode 600), are never sent to the browser, and are never logged.
- The logger redacts emails, phone numbers, passwords, cookies and API keys, and never logs request bodies.
- API responses carry a locked-down CSP, `no-store` caching and `nosniff`; pages carry their own CSP and
  headers (production); HSTS is set by the API and by Nginx.
- The pages' CSP keeps `script-src 'unsafe-inline'` because Next.js needs inline hydration scripts. If you add
  ad or analytics tags you will also need to allow their domains in `next.config.ts`.
- Posts are refused unless their `Origin` is the site itself (or listed in `CORS_ORIGINS`). Nginx adds a second
  layer of rate limiting on `/api`.
- `npm audit --omit=dev` reports **0** vulnerabilities. `npm audit` lists some in the dev-only lint toolchain
  (`eslint-config-next` → `fast-glob` → `braces`). They are not shipped to production, and the suggested
  `--force` fix downgrades `eslint-config-next` to v14, so it was not applied.

## Troubleshooting

| Symptom | Likely cause and fix |
|---|---|
| Form says "Something went wrong on our side" and the log says "API configuration error" | A required variable is missing or invalid in `.env.local`. The log line names it. In production `EMAIL_PROVIDER=log` is refused on purpose |
| Form says "We could not send your enquiry" | Email delivery failed. Check the log, the Brevo API key or SMTP credentials, and that `EMAIL_FROM` is verified |
| Enquiries "sent" but nothing in the inbox | Check spam, that `BUSINESS_EMAIL` is right, and Brevo's logs. In development `EMAIL_PROVIDER=log` only prints to the terminal |
| Form posts return 403 "Origin not allowed" | The page was loaded from a different origin than the one serving `/api`. Add that origin to `CORS_ORIGINS` |
| Everyone gets 429 after a few enquiries | The app is not behind a proxy that sets `X-Forwarded-For`, so all visitors look like one IP. Put Nginx in front and keep `TRUST_PROXY=1` |
| `nginx -t` fails on missing certificates | Complete the certificate step first (HTTP block only), then enable the 443 blocks |
| Phone number or hours didn't change | `NEXT_PUBLIC_*` are build-time. Run `npm run build` and `pm2 reload radiosatscare` |
| Port already in use | Another process holds 3000. Stop it, or change the port in the PM2 file and Nginx upstream |

## Decisions to confirm before launch

These were judgment calls made while building, and they need a human decision:

1. **No database or admin.** Enquiries exist only as emails. If you later want a dashboard, reporting or
   automatic deletion, enquiries would need to be stored (the design can be extended, but this is a larger
   change). Make sure the inbox is monitored and backed up like any business mailbox.
2. **Legal pages are drafts** written for the service model described here (independent, enquiry-only, no
   payments, no cookies or trackers). Have them reviewed by a qualified professional for your jurisdiction, and
   update them if you add ad tracking. Fill in the legal name, address and governing law via the
   `NEXT_PUBLIC_BUSINESS_*` variables.
3. **Support hours and phone number** are empty/fictional until configured. Never advertise 24/7, instant
   answers or certified specialists unless you can substantiate them.
4. **Imagery:** the hero is an original vector illustration drawn for this site, and the logo, favicon and share
   image are original too, so no third-party licensing is involved. Add properly licensed photography if you
   want it, with descriptive `alt` text.
5. **Not run in this environment:** live Brevo delivery, Nginx and real TLS. Everything else was exercised
   against the production build.
