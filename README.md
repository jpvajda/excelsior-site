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

## Instrumentation

[PostHog](https://posthog.com) records page views, clicks, and booking clicks. The snippet lives in `index.html` and `pages/my-story/index.html`. Booking buttons send one shared event, `discovery_call_clicked`, with a `placement` property for the spot that was clicked. The My Story link sends `my_story_clicked` with `placement` set to `header`.
