# Excelsior LLC

Marketing site for Excelsior LLC. The owner is a Pain Reprocessing Therapy (PRT) coach. A visitor should understand the offer and take one next step toward coaching.

## Stack

- Static files at the repo root. GitHub Pages deploys from branch `main`, folder `/` (root).
- Each section is a JavaScript module in `components/` that returns its markup. `main.js` places them in order. `index.html` only loads that script.
- To view locally, run `python3 -m http.server 3000` and open http://127.0.0.1:3000. Do not open `index.html` as a file. The browser blocks the section modules from a `file://` address.
- One CSS file, plus `main.js`, `menu.js`, and the section modules.
- No app framework, database, or deploy workflow.
- Relative URLs, so the site works as a project site and on a custom domain.
- Keep `.nojekyll` so Pages does not run Jekyll.
- Do not push or deploy unless asked.

## Offer and copy

- PRT coaching is the only offer. Do not add a second program.
- Do not invent pricing, biography, credentials, a city, results, statistics, or client names.
- Placeholder copy is Lorem Ipsum. Label each slot in the page or an HTML comment, for example `SLOT: hero subhead`.
- Contact stays a placeholder until a real scheduler or email is given. No form backend.
- Footer line: © 2026 Excelsior LLC. All rights reserved.

## Page

One page. Sticky header. In-page links. Sections stay in this order:

1. Header. Corner-box mark: EXCELSIOR / LLC. Links: Options, The Process, About, Contact.
2. Hero. Wordmark “Excelsior”. Line: Pain Reprocessing Therapy coaching. Short subhead. No button in the hero.
3. Understanding Chronic Pain. Title, short intro, three icon cards.
4. Options. Three short caption boxes.
5. The Process. Three numbered panels. A row on desktop, stacked on a phone.
6. Who it is for. One panel.
7. About the coach. Name slot, role “Pain Reprocessing Therapy Coach”, bio. Empty frame marked “Photo later”. No photo of a real person.
8. Stories. Two speech bubbles, each labeled as a sample to replace. No fake client names.
9. Questions. Four FAQ caption boxes.
10. Contact. Button “Book a call” links to the Google Calendar booking page and opens in a new tab. Email line stays a placeholder. No fake address.
11. Footer. “Excelsior LLC”, the copyright line, and the reading links.

One `h1`: Excelsior. Section titles are `h2`.

## Look

Before changing the visual design, study `design/inspiration-1.png`, `design/inspiration-2.png`, and `design/inspiration-3.png`. They are mood only. Do not use them on the page. Do not draw or name the characters, costumes, logos, or titles in those files. Do not add a Marvel, Stan Lee, or comics-publisher wordmark. “Excelsior” is the company name. Leave `design/` unchanged unless asked.

Use this graphic system:

- Condensed display headlines with a hard black offset shadow, for the wordmark and section titles only.
- Thick black panel borders and a small gutter.
- A corner box with a small stacked label.
- Flat comic yellow, red, and blue, plus black and white. Green as a spare accent.
- Halftone dots, and a burst or speed lines, in backgrounds only. Never behind body text.
- Speech bubbles for the two stories. Caption boxes for steps, FAQ, and short facts.
- Body text on solid white or solid pale yellow.

Type: one display face for headlines, from a source that allows web use. One plain sans for body text. Body at least 18px. Line length about 65 characters. Paragraphs stay in the body face.

Desktop is a page of panels. Below 720px, panels stack in the same order, the header becomes a simple menu, and the wordmark scales down. No horizontal scroll.

Motion stays short. Honor `prefers-reduced-motion`.

## Access

- Use `header`, `nav`, `main`, `section`, and `footer`.
- Show a visible focus style on links and buttons.
- Text on solid panels meets WCAG AA. If yellow fails against black, darken the yellow or move the text into a solid caption box.
- The mobile menu works from the keyboard.

## Scope

Stay on this one page. Do not add a blog, shop, login, CMS, analytics, or extra pages unless asked. Keep the README short: what the page is, how to open it locally, and the GitHub Pages setting.
