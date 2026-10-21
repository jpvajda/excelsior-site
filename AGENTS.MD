# Excelsior LLC

Marketing site for Excelsior LLC. The owner is a Pain Reprocessing Therapy (PRT) coach. A visitor should understand the offer and take one next step toward coaching.

## Stack

- Static files at the repo root. GitHub Pages deploys from branch `main`, folder `/` (root).
- Each section is a JavaScript module that returns its markup as a string. Each page has one `page.js` that stacks its sections into `#app`. The HTML file only loads that script. See File layout.
- To view locally, run `python3 serve.py` and open http://127.0.0.1:3000. http://localhost:3000 is the same server with a different browser origin. See Newsletter. Do not use `python3 -m http.server`. That command shows Python's own error page for a bad address. Do not open `index.html` as a file. The browser blocks the modules from a `file://` address.
- One CSS file at `css/style.css`.
- No app framework, database, or build step. Vanilla JS, HTML, and CSS only. GitHub Pages publishes the static files. The footer signup Worker is the only separate deploy. See Newsletter.
- Relative URLs, so the site works as a project site and on a custom domain.
- Keep `.nojekyll` so Pages does not run Jekyll.
- Do not push or deploy unless asked. That includes `npx wrangler deploy`.

## File layout

```
index.html                  home page HTML. Must stay in root so "/" works. Loads pages/home/page.js
404.html                    missing-path page. Stays in root because GitHub Pages looks for it there
serve.py                    local server. Serves 404.html with status 404 for a bad address
pages/                      one folder per page. Everything for a page lives in its folder
  home/
    page.js                 entry script. Stacks the sections into #app, then binds behavior
    hero.js, options.js ... one file per section. Each exports one function that returns markup
  my-story/
    index.html              served at /pages/my-story/. Loads page.js
    page.js                 entry script
    story.js                the page content
shared/                     code used by two or more pages
  header.js, footer.js      markup
  menu.js                   mobile menu behavior
  newsletter.js             newsletter signup behavior
  tracking.js               PostHog click events
worker/                     Cloudflare Worker for the footer signup. Holds no API key. Deploy from this folder only
  index.js                  request handler
  wrangler.toml             Worker name, segment id, and allowed origins
checkout/                   Stripe Checkout Worker. Holds no API key. Deploy from this folder only
  index.js                  request handler
  wrangler.toml             Worker name, sandbox price ids, and allowed origins
css/style.css               the only stylesheet
images/                     every image the site shows
tests/                      Playwright checks
```

Words: a **page** is a folder in `pages/` with an address. A **section** is one markup file inside a page.

These stay in the repo root because GitHub Pages and tooling expect them there: `index.html`, `CNAME`, `robots.txt`, `sitemap.xml`, `llms.txt`, `llms-full.txt`, `.nojekyll`, `package.json`, `pnpm-lock.yaml`, `playwright.config.js`.

Rules:

- Put page-specific files in that page's folder. Move a file to `shared/` only when a second page needs it.
- Every folder in `pages/` has a `page.js`. Every folder except `home/` also has an `index.html`. The home page HTML is the root `index.html`.
- Markup files export a function that returns a string and contain no event code. Behavior files export a `bind...` function and contain no markup.
- A `page.js` imports from its own folder and from `shared/`. Files in `shared/` never import from `pages/`. A page never imports from another page's folder.
- Do not put `.js`, `.css`, or image files in the repo root. `tests/site.spec.js` fails if you do.
- Name files in lowercase with hyphens, for example `who-its-for.js`. A page folder name is its URL segment and the key passed to `Header()`.

Gotcha: image and link paths in markup resolve against the page URL, not the file that holds the markup. On `/` write `images/x.png`. On `/pages/my-story/` write `../../images/x.png`. `shared/header.js` takes the page folder name and builds the right prefix. Image filenames must match the committed name exactly, including case.

To add a section to a page:
1. Add `pages/<page>/<name>.js` exporting one function that returns the markup.
2. Import it in that page's `page.js` and place it in order.
3. Add the matching check to `tests/`.

To add a page (only when asked):
1. Copy `pages/my-story/` to `pages/<name>/`. Rename `story.js` and rewrite it as the new content.
2. In the new `index.html`, change the title, description, canonical URL, `og:url`, and the `url` in the JSON-LD. Keep the PostHog snippet and the `../../` paths. In `page.js`, import the new content and call `Header("<name>")`.
3. Add the link in `shared/header.js`, using `prefix` for the href, and add a `<loc>` for `https://excelsior-prt.com/pages/<name>/` to `sitemap.xml`.
4. In `tests/site.spec.js`, add the page to the `pages` list and add a test for what a visitor can do there. The folder check fails until you do.
5. If the page adds a control, send a PostHog event for it (see Instrumentation).
6. Add the page to `llms.txt` and a short plain-text section to `llms-full.txt`. See Findability.

## Offer and copy

- PRT coaching is the only offer. Do not add a second program.
- Approved location claim, use this sentence: "Based in Boulder, Colorado. Coaching by video anywhere." The My Story meta description says "coaching online" on purpose. Do not copy that wording into `llms.txt`, `llms-full.txt`, or the home page.
- Leave credentials off the site until asked. They will be added later. Do not invent a credential, a year, or a training name in the meantime.
- Do not invent pricing, biography, credentials, a city, results, statistics, or client names.
- Placeholder copy is Lorem Ipsum. Label each slot in the page or an HTML comment, for example `SLOT: hero subhead`.
- Contact email stays a placeholder until a real scheduler or email is given. The footer newsletter form posts to the Cloudflare Worker in `worker/`. See Newsletter.
- Footer line: © 2026 Excelsior LLC. All rights reserved.

## Page

One page. Sticky header. In-page links. Sections stay in this order:

1. Header. Corner-box mark: EXCELSIOR / LLC. Links: Options, The Process, About, My Story, Free Discovery Call. My Story goes to `/pages/my-story/`. On that page, the other links return to the matching home section.
2. Hero. Wordmark “Excelsior”. Line: Pain Reprocessing Therapy & Somatic Coaching. Short subhead. No button in the hero.
3. Understanding Chronic Pain. Title, short intro, three icon cards.
4. Options. Three short caption boxes.
5. The Process. Five numbered panels and a red payoff panel. Three across on desktop, stacked on a phone.
6. Who it is for. One panel.
7. About the coach. Name slot, role “Pain Reprocessing Therapy Coach”, the Boulder sentence, bio, and the LinkedIn link.
8. Data. Four speech bubbles. Each holds a sourced NIH finding or quote and links to the NIH article. No fake client names.
9. Questions. FAQ caption boxes, including where coaching happens and whether it is remote.
10. Contact. Button “Book a call” links to the Google Calendar booking page and opens in a new tab. Email line stays a placeholder. No fake address.
11. Footer. “Excelsior LLC”, the copyright line, a newsletter signup, and the reading links.

One `h1` on the home page: Excelsior. The My Story page `h1` is My Story. Section titles are `h2`.

## Look

Before changing the visual design, study `images/inspiration-1.png`, `images/inspiration-2.png`, and `images/inspiration-3.png` if they are present. They are mood only. Do not use them on the page. Do not draw or name the characters, costumes, logos, or titles in those files. Do not add a Marvel, Stan Lee, or comics-publisher wordmark. “Excelsior” is the company name. Leave existing files in `images/` unchanged unless asked.

Use this graphic system:

- Condensed display headlines with a hard black offset shadow, for the wordmark and section titles only.
- Thick black panel borders and a small gutter.
- A corner box with a small stacked label.
- Flat comic yellow, red, and blue, plus black and white. Green as a spare accent.
- Halftone dots, and a burst or speed lines, in backgrounds only. Never behind body text.
- Speech bubbles for the data points. Caption boxes for steps, FAQ, and short facts.
- Body text on solid white or solid pale yellow.

Type: one display face for headlines, from a source that allows web use. One plain sans for body text. Body at least 18px. Line length about 65 characters. Paragraphs stay in the body face.

Desktop is a page of panels. Below 720px, panels stack in the same order, the header becomes a simple menu, and the wordmark scales down. No horizontal scroll.

Motion stays short. Honor `prefers-reduced-motion`.

## Access

- Use `header`, `nav`, `main`, `section`, and `footer`.
- Show a visible focus style on links and buttons.
- Text on solid panels meets WCAG AA. If yellow fails against black, darken the yellow or move the text into a solid caption box.
- The mobile menu works from the keyboard.

## Tests

When a new feature or element is added, add or update a check in `tests/` in the same change. Cover what a visitor can do: the control is present, it goes to the right place, and it still works on a phone when the layout changes. Run `pnpm test`. Do not add a screenshot test unless asked.

When files move or are renamed, update every import, `<script>`, `<link>`, image `src`, and `og:image` URL, then update the tests that name them. `tests/site.spec.js` checks the folder layout, that every folder in `pages/` is registered in the test and listed in `sitemap.xml`, that each page loads its script and stylesheet from the right place with no failed requests, that every image comes from `images/`, and that `llms.txt`, `llms-full.txt`, the JSON-LD, and the `<noscript>` text match the visible page. `tests/worker.spec.js` checks the signup Worker. See Newsletter.

## Findability

The home page is built in the browser. Agents that do not run JavaScript only see `index.html`: the title, meta description, JSON-LD, and `<noscript>` text. `llms.txt` and `llms-full.txt` are the plain-text copies for those agents. Visitors do not see them. Spec: https://llmstxt.org/

`llms.txt` is the short index. Keep this order: an H1 `# Excelsior LLC`, a blockquote summary (offer, the approved location sentence, booking), then H2 sections whose items are markdown links. The H1 text is checked by `tests/site.spec.js`. Markdown links may only point at `https://excelsior-prt.com/...` or the Zoom booking URL. Any other markdown link fails the test. Put other URLs in the blockquote as plain text.

`llms-full.txt` is one file with the offer, who it is for, the process, the session options, the questions, and the bio. The August 2026 spec no longer requires this expanded file. Keep it. This site has no per-page `.md` copies, and one fetch is how an agent reads the facts without JavaScript. Link it from `llms.txt`. Do not delete it, and do not add `/.well-known/` agent files. GitHub Pages cannot set `Link` headers.

The `<noscript>` blocks, the JSON-LD, `llms.txt`, and `llms-full.txt` must state the same facts as the visible page. When the offer, location, process, session options, or questions change, update all four in the same change. The home JSON-LD `FAQPage` questions and answers must match the `#questions` caption text. The test `agents can read the offer without running scripts` fails when they drift.

`robots.txt` stays `Allow: /` for `*` and for the named search and answer bots. Do not add `Disallow: /`. Keep the `Sitemap:` line.

## Instrumentation

PostHog records visits and clicks. The snippet is in `index.html` and in every `pages/<name>/index.html`. Click handlers live in `shared/tracking.js`. Do not add a second analytics tool, and do not write the project key, host account, or dashboard names into the repo docs.

When a new control is added, send a PostHog event for it in the same change. Booking links already share one event, `discovery_call_clicked`, with a `placement` property for where it was clicked. Follow that pattern: one event name, plus a property when the same action appears in more than one place. The newsletter form sends `newsletter_signup` with `placement` set to `footer` only after the signup is accepted. A plan buy sends `plan_checkout_started` with `plan` only after the checkout Worker accepts it. A form error sends `form_error_shown` with `placement` and `reason`, and dismissing it sends `form_error_dismissed` with the same properties. Cover the event in `tests/`.

## Newsletter

The footer form is on every page. Markup is in `shared/footer.js`. `shared/newsletter.js` posts the address. `pages/home/page.js` and `pages/my-story/page.js` call `bindNewsletter()`.

- The browser posts JSON `{ email, signup_hp }` to `newsletterEndpoint` in `shared/newsletter.js`: `https://excelsior-signup.john-vajda.workers.dev`. Keep the `john-vajda` subdomain. `https://excelsior-signup.workers.dev` does not serve this Worker.
- Deploy the Worker only when asked, and only from `worker/`: `npx wrangler deploy`. From the repo root, Wrangler offers a new static Worker named `excelsior-site`. Decline that. Editing `worker/` does not change the live Worker until this deploy. The static site still ships only when `main` is pushed.
- `RESEND_API_KEY` is set with `npx wrangler secret put RESEND_API_KEY` from `worker/`. It stays a Cloudflare secret. Do not put it in the repo, in `wrangler.toml`, or in a committed `worker/.dev.vars`. The key needs Full access. A Sending access key cannot create contacts. No sending domain is required.
- `SEGMENT_ID` in `wrangler.toml` is the Resend Newsletter segment. It is a plain var, not a secret.
- `ALLOWED_ORIGINS` is the exact `Origin` the browser sends. `http://127.0.0.1:3000` and `http://localhost:3000` are both local and both required. A missing origin gets 403 with no CORS header, and the form says "Could not sign up. Try again." Restarting `serve.py` does not change the list.
- The hidden field is `signup_hp`. If it is non-empty, the Worker returns success and does not call Resend. Do not name that field `company` or any other autofill name.
- A contact Resend already has is treated as success.
- Observability in `wrangler.toml` uses `[observability.logs]` and `[observability.issues]`. `issue_detection` is not a valid key.
- Leave the `workers.dev` URL public. Do not put the Worker behind Cloudflare Access.
- `tests/site.spec.js` covers the form, the posted body, and `newsletter_signup`. `tests/worker.spec.js` checks `ALLOWED_ORIGINS` and that only `signup_hp` skips Resend. Update both when those change.

## Checkout

Buying a session pack uses a second Worker in `checkout/`. The newsletter Worker stays as it is. Deploy this Worker only when asked, from `checkout/`: `npx wrangler deploy`.

- The browser posts JSON `{ plan, checkout_hp }` to `checkoutEndpoint` in `pages/home/checkout.js`. `plan` is `session`, `pack-6`, or `pack-12`. The Worker maps that name to a Stripe Price ID. A price or amount in the body is ignored. Stripe Checkout collects the email.
- The Starter card has no Buy button and the Worker has no starter plan. The coach gives the buyer a coupon code after the Discovery Call. The buyer uses Pay-as-you-go, or enters the code on the Stripe page of a plan. Checkout shows a promotion code box (`allow_promotion_codes`). Coupons and promotion codes are made in Stripe, not in the repo.
- There is no webhook. The coach checks Payments in Stripe. Do not add a webhook, a refund, or an email send unless asked.
- `STRIPE_SECRET_KEY` is the only Worker secret. Do not put it in the repo or in `checkout/wrangler.toml`. The Price IDs in that file are the sandbox prices.
- After payment, Stripe sends the buyer to `/pages/paid/`. That page is not in the header. Cancel returns to `/#options`. The thank-you page is not proof of payment.
- `tests/checkout.spec.js` covers the price lock, the promotion code box, and that the starter has no checkout. `tests/site.spec.js` covers the buttons and `plan_checkout_started`.

## Scope

The home page stays one page. My Story is the story page, at `/pages/my-story/`. `/pages/paid/` is the page Stripe returns to after a payment. It is not in the header. Do not add a blog index, shop, login, CMS, or other pages unless asked. When a page is asked for, follow the steps in File layout. Keep the README short: what the page is, how to open it locally, the GitHub Pages setting, and that PostHog is used for instrumentation. Keep the file layout in this file, not the README.
