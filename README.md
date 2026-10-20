![Comic banner for John P. Vajda, Excelsior LLC](images/comic_hero_banner.png)

# Excelsior LLC

Home page for Pain Reprocessing Therapy coaching.

© 2026 Excelsior LLC. All rights reserved. Do not copy, reproduce, or reuse this site, its words, or its images without permission.

## Development

Run it locally from this folder:

```bash
python3 serve.py
```

Then open http://127.0.0.1:3000.


## Testing

Run the checks:

```bash
pnpm test
```

GitHub runs these on every pull request.

Each page lives in a folder under `pages/`. Edit a section there. Each file is a JavaScript function for that part of the page. The folder map is in `AGENTS.MD`.

GitHub Pages: Settings → Pages → Deploy from a branch → `main` → `/ (root)`.

## Newsletter Signup

The footer newsletter form posts to the Cloudflare Worker in `worker/`. Deploy changes to that Worker from `worker/` with `npx wrangler deploy`, and only when asked. The Resend API key is a Worker secret and is not in source.

## Checkout

The option cards post to the Cloudflare Worker in `checkout/`. Deploy that Worker from `checkout/` with `npx wrangler deploy`, and only when asked. The Stripe secret key, the webhook secret, and the Resend API key are Worker secrets and are not in source. The starter session can be bought once per email address.

## Instrumentation

[PostHog](https://posthog.com) records page views, clicks, and booking clicks. The snippet lives in `index.html` and in each page under `pages/`. A plan buy sends `plan_checkout_started` with the plan name. A form error sends `form_error_shown`, and closing it sends `form_error_dismissed`.
