You are building the first version of the Excelsior LLC marketing site in this repository: /Users/jvajda/Documents/Github_Personal/excelsior-site (GitHub repo excelsior-site).

Do this in two phases. Phase 1: write a short implementation plan and STOP. Do not create or edit site files until I reply with approval. Phase 2: build only what I approved.

## What this site is

Excelsior LLC is my company. I am a Pain Reprocessing Therapy (PRT) coach. This site is a place I send people so they understand the offer and take one next step toward coaching.

The repo today is almost empty: a README (“Excelsior Website for PRT & Somatic Coaching”), .gitignore, and a design/ folder. There is no existing site to preserve.

README also mentions somatic coaching. Treat PRT coaching as the only offer on the page. Leave one clearly labeled content slot where somatic coaching could be added later. Do not invent a second program, pricing, biography, credentials, city, or results.

## Phase 1 — plan, then wait

Before any code, reply with a plan I can approve in under two minutes:

1. File list you will add.
2. Section order on the one page.
3. How GitHub Pages will be turned on, including the exact settings or workflow.
4. How the comic look will be built without copying the reference images.
5. What you will leave as Lorem Ipsum versus what will be real (company name, offer name, disclaimer).

Then stop. Wait for my approval. If I change the plan, follow the change. Do not expand scope.

## Phase 2 — build this

Build a single-page static site a stranger can open and understand in one scroll.

### Technical constraints

- GitHub Pages only. No server, no database, no framework, no bundler, no Node app.
- Plain HTML, one CSS file, and a small optional JS file for the mobile menu only.
- Put the site at the repository root so Pages can deploy from branch main, folder / (root).
- Add a .nojekyll file so Pages does not run Jekyll.
- Use relative URLs (./style.css, ./) so the page works both as a project site (https://<user>.github.io/excelsior-site/) and if a custom domain is added later.
- Do not add a GitHub Actions deploy workflow unless root-folder Pages cannot work. Prefer documenting the one Pages setting: Settings → Pages → Deploy from branch → main → / (root).
- Do not commit secrets. There are none.
- Do not deploy or push unless I explicitly ask.

### Page structure

One index.html. Sticky header. In-page anchor links. Sections, in this order:

1. Header. Corner-box mark reading EXCELSIOR / LLC. Links: the offer, how it works, about, contact.
2. Hero panel. Display wordmark “Excelsior”. One-line offer: Pain Reprocessing Therapy coaching. One short Lorem subhead. One primary button: “Start here”, linking to the contact section.
3. The problem. One panel of Lorem Ipsum about living with ongoing pain. Labeled placeholder.
4. The offer. What PRT coaching is, in three short caption boxes. Lorem Ipsum. Label the section so I can replace it.
5. How it works. Three numbered comic panels in a row on desktop, stacked on a phone. Lorem steps.
6. Who it is for. Short Lorem list inside one panel.
7. About the coach. Name slot “Your name”, role “Pain Reprocessing Therapy Coach”, Lorem bio. No photo of a real person. Use an empty framed panel marked “Photo later”.
8. Optional slot. A closed caption box titled “Somatic coaching — add later”. One line of Lorem. Visually quieter than the PRT sections.
9. Stories. Two speech bubbles of Lorem Ipsum. Each bubble labeled “Sample — replace with a real story”. No fake names presented as real clients.
10. Questions. Four FAQ caption boxes. Lorem questions and answers.
11. Contact. Final full-width panel. Headline slot. One button labeled “Book a call” with href="#" and an HTML comment: REPLACE WITH SCHEDULER OR MAILTO. A second line: “Email placeholder — replace me”. No fake email address, no Calendly, no form backend. GitHub Pages cannot receive form posts.
12. Footer. “Excelsior LLC”. A disclaimer slot in real, short language: this is coaching, not medical care, not a diagnosis, and not a promise to remove pain. Link back to the top.

Every Lorem block must have a visible or HTML-comment label naming the slot, for example “SLOT: hero subhead”. I will paste real copy later. Do not write marketing claims, statistics, credentials, or outcomes.

### Visual direction

Open and study these files before writing CSS. They are mood only:

- design/inspiration-1.png
- design/inspiration-2.png
- design/inspiration-3.png

They are existing comic covers. Do not copy them.

Use the graphic system, not the pictures:

- Huge condensed display headlines with a hard black offset shadow, used for “Excelsior” and section titles only.
- Thick black panel borders, like printed comic panels with a small gutter.
- A top corner box: small stacked label, the way a comic cover marks the title.
- Flat primary colors: comic yellow, red, blue, plus black and white. One green accent used sparingly.
- Ben-Day / halftone dot texture in backgrounds and bursts, never behind body paragraphs.
- A burst or speed-line shape behind the hero headline only.
- Speech bubbles for the two sample stories.
- Caption boxes (pale fill, black border, small label) for steps, FAQ, and short facts.
- Body text on solid white or solid pale yellow panels so it stays readable.

Do not use the reference PNGs in the page, as CSS backgrounds, or as cropped assets. Do not draw or name the characters, costumes, logos, or titles from those covers. Do not use a Marvel, Stan Lee, or comics-publisher wordmark. “Excelsior” is the company name only.

Typography: one free display face for headlines (a heavy condensed or comic-poster face from a source you can legally use, such as Google Fonts or a font already licensed for the web). One plain sans for body text. Body size at least 18px. Line length about 65 characters inside panels. Do not set paragraphs in the display face.

Layout: desktop is a page of panels. Below 720px, panels stack in the same order, the header becomes a simple menu, and the hero wordmark scales down without overflowing. No horizontal scroll.

Motion: optional. If you add any, keep it to a short panel fade. Honor prefers-reduced-motion.

### Accessibility

- Semantic regions: header, nav, main, section, footer.
- One h1 (“Excelsior”). Section titles are h2.
- Visible focus states on links and buttons.
- Color contrast of text at least WCAG AA on the solid panel backgrounds. If a yellow fails with black, darken the yellow or put the text in a solid caption box.
- Buttons and links have real text, not color alone.
- The mobile menu can be used with a keyboard.

### Quality bar

- Open index.html in a browser and check desktop width and a 390px-wide layout.
- Click every nav link and the “Start here” button. Each must land on the right section.
- Confirm the three inspiration images are not requested by the page.
- Do not add a blog, shop, login, CMS, analytics, or extra pages.
- Do not rewrite the README into a long essay. You may add up to five lines: what the page is, how to open it locally, and the GitHub Pages setting.

### Done when

- index.html, the stylesheet, .nojekyll, and any tiny menu script are in the repo root.
- design/ is unchanged and unused by the page.
- The page reads as Excelsior LLC, PRT coaching, with Lorem Ipsum in labeled slots and one real disclaimer.
- It looks like an original comic-cover layout, readable on a phone, and is ready for GitHub Pages from main / root.
- You have not pushed.

Start with Phase 1 only.