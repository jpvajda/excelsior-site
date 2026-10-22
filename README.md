![Comic banner for John P. Vajda, Excelsior LLC](images/comic_hero_banner.png)

# Excelsior LLC

Home page for Pain Reprocessing Therapy & Somatic Coaching.

© 2026 Excelsior LLC. All rights reserved. Do not copy, reproduce, or reuse this site, its words, or its images without permission.

## Development

Run it locally from this folder:

```bash
python3 serve.py
```

Then open http://127.0.0.1:3000.


## Testing

Install the tools once, then run the checks:

```bash
pnpm install
pnpm test
```

GitHub runs these checks on every pull request.

Each page lives in a folder under `pages/`. Edit a section there. Each file is a JavaScript function for that part of the page. The folder map is in `AGENTS.MD`.

GitHub Pages: Settings → Pages → Deploy from a branch → `main` → `/ (root)`. Pushing `main` publishes the site. It does not update the Workers.

## Workers

Deploy after `pnpm install`. Run this from the repo root. Signup first, then checkout. Do not use `npx wrangler`.

```bash
cd worker && pnpm exec wrangler deploy
cd ../checkout && pnpm exec wrangler deploy
```

The Resend and Stripe keys stay in Cloudflare. They are not in the repo. A deploy does not ask for them again.

## Newsletter Signup

The footer newsletter form posts to the Cloudflare Worker in `worker/`.

## Checkout

The option cards post to the Cloudflare Worker in `checkout/`. The Stripe secret key is a Worker secret and is not in source. The Starter card has no Buy button. A coupon code is provided after the Discovery Call.

## Instrumentation

[PostHog](https://posthog.com) records page views, clicks, and booking clicks. The snippet lives in `index.html` and in each page under `pages/`. A plan buy sends `plan_checkout_started` with the plan name. A form error sends `form_error_shown`, and closing it sends `form_error_dismissed`.
