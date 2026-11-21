![Comic banner for John P. Vajda, Excelsior LLC](images/comic_hero_banner.png)

# Excelsior LLC

Home page for Pain Reprocessing Therapy & Somatic Coaching.

© 2026 Excelsior LLC. All rights reserved. Do not copy, reproduce, or reuse this site, its words, or its images without permission.

## Development

```bash
pnpm install
```

Run it locally from this folder:

```bash
python3 serve.py
```

Then open http://127.0.0.1:3000.


## Testing

Install the tools once, then run the checks:

```bash
pnpm test
```

GitHub runs these checks on every pull request.

Each page lives in a folder under `pages/`. Edit a section there. Each file is a JavaScript function for that part of the page. The folder map is in `AGENTS.MD`.

GitHub Pages: Settings → Pages → Deploy from a branch → `main` → `/ (root)`. Pushing `main` publishes the site. It does not update the Workers.

## Blog

Writing lives at `/pages/blog/`. Posts are markdown in `content/blog/<slug>.md`:

```md
---
title: Post title
date: YYYY-MM-DD
summary: One or two sentences for the list page.
---

Body text here.
```

After you add or edit a post, rebuild once:

```bash
pnpm build:blog
```

That updates the blog pages, sitemap blog URLs, and the blog lines in `llms.txt` and `llms-full.txt`. Commit the markdown and those generated files together. Do not hand-edit the generated blog output.

## Workers

Deploy after `pnpm install`. `cd` into the Worker folder, then run the same command. Signup first, then checkout.

```bash
cd worker
pnpm wrangler deploy
```

```bash
cd checkout
pnpm wrangler deploy
```

The Resend and Stripe keys stay in Cloudflare. They are not in the repo. A deploy does not ask for them again.

## Newsletter Signup

The footer newsletter form posts to the Cloudflare Worker in `worker/`.

## Checkout

The option cards post to the Cloudflare Worker in `checkout/`. The Stripe secret key is a Worker secret and is not in source. The Starter card has no Buy button. A coupon code is provided after the Discovery Call.

## Instrumentation

[PostHog](https://posthog.com) records page views, clicks, and booking clicks. The snippet is `shared/posthog.js`, loaded from each HTML page. A plan buy sends `plan_checkout_started` with the plan name. A form error sends `form_error_shown`, and closing it sends `form_error_dismissed`.
