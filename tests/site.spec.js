import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const sectionHeadings = [
  "Excelsior",
  "Understanding Chronic Pain",
  "Options",
  "The Process",
  "Who it is for",
  "About",
  "Data",
  "Questions",
  "Discovery Call",
];

const navLinks = [
  ["Options", "#options"],
  ["The Process", "#process"],
  ["About", "#about"],
];

const zoomBooking =
  "https://scheduler.zoom.us/excelsior-llc/prt-discovery-call";

async function openPage(page) {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveText("Excelsior");
  await page.waitForFunction(() =>
    [...document.images].every((img) => img.complete),
  );
}

function seriousViolations(results) {
  return results.violations.filter(
    (violation) =>
      violation.impact === "serious" || violation.impact === "critical",
  );
}

function formatViolations(violations) {
  return violations
    .map((violation) => {
      const targets = violation.nodes
        .map((node) => node.target.join(" "))
        .join(", ");
      return `${violation.id} (${violation.impact}): ${violation.help} [${targets}]`;
    })
    .join("\n");
}

test("search engines get the live domain and a description", async ({ page }) => {
  const description =
    "Pain Reprocessing Therapy coaching for chronic pain. Learn how the brain can keep pain going, then book a free 30 minute discovery call with Excelsior LLC.";

  await openPage(page);

  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    description,
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://excelsior-prt.com/",
  );

  const business = await page
    .locator('script[type="application/ld+json"]')
    .textContent();
  expect(JSON.parse(business).name).toBe("Excelsior LLC");
  expect(JSON.parse(business)["@type"]).toBe("ProfessionalService");

  const robots = await page.request.get("/robots.txt");
  expect(robots.ok()).toBeTruthy();
  expect(await robots.text()).toContain(
    "Sitemap: https://excelsior-prt.com/sitemap.xml",
  );

  const sitemap = await page.request.get("/sitemap.xml");
  expect(sitemap.ok()).toBeTruthy();
  const sitemapText = await sitemap.text();
  expect(sitemapText).toContain("https://excelsior-prt.com/");
  expect(sitemapText).toContain("https://excelsior-prt.com/pages/my-story/");
});

async function watchDiscoveryClicks(page) {
  await page.evaluate(() => {
    window.__discoveryEvents = [];
    const capture = window.posthog.capture.bind(window.posthog);
    window.posthog.capture = (name, properties) => {
      if (name === "discovery_call_clicked") {
        window.__discoveryEvents.push({ name, placement: properties.placement });
      }
      return capture(name, properties);
    };
  });
}

test("analytics snippet sends visits through the reverse proxy", async ({ page }) => {
  const hit = page.waitForRequest((request) =>
    request.url().includes("e.excelsior-prt.com"),
  );
  await page.goto("/");
  expect((await hit).url()).toContain("e.excelsior-prt.com");
});

test("booking links record which spot was clicked", async ({ page }) => {
  await openPage(page);
  await watchDiscoveryClicks(page);

  const spots = [
    ["header", "https://scheduler.zoom.us/excelsior-llc/prt-discovery-call"],
    ["options", "#contact"],
    ["contact", "https://scheduler.zoom.us/excelsior-llc/prt-discovery-call"],
  ];

  for (const [placement, href] of spots) {
    const link = page.locator(`[data-discovery-call="${placement}"]`);
    await expect(link).toHaveAttribute("href", href);
    await link.dispatchEvent("click", { bubbles: true });
  }

  await expect
    .poll(() => page.evaluate(() => window.__discoveryEvents))
    .toEqual([
      { name: "discovery_call_clicked", placement: "header" },
      { name: "discovery_call_clicked", placement: "options" },
      { name: "discovery_call_clicked", placement: "contact" },
    ]);
});

test("promo video stays a poster until play", async ({ page }) => {
  const vimeo = [];
  page.on("request", (request) => {
    if (request.url().includes("vimeo.com")) vimeo.push(request.url());
  });

  await openPage(page);

  const play = page.getByRole("button", {
    name: "Play the pain and fear cycle video",
  });
  await expect(play).toBeVisible();
  await expect(page.locator("#understanding .promo-video img")).toHaveAttribute(
    "src",
    "images/ig-promo-pain-fear-cycle.png",
  );
  await expect(page.locator("iframe")).toHaveCount(0);
  expect(vimeo).toEqual([]);

  await page.evaluate(() => {
    window.__videoEvents = [];
    const capture = window.posthog.capture.bind(window.posthog);
    window.posthog.capture = (name, properties) => {
      if (name === "promo_video_played") {
        window.__videoEvents.push({ name, placement: properties.placement });
      }
      return capture(name, properties);
    };
  });

  await play.click();

  const frame = page.locator("#understanding iframe");
  await expect(frame).toHaveAttribute(
    "src",
    /player\.vimeo\.com\/video\/1235991016/,
  );
  await expect(frame).toHaveAttribute("title", "The pain and fear cycle");
  await expect
    .poll(() => page.evaluate(() => window.__videoEvents))
    .toEqual([{ name: "promo_video_played", placement: "understanding" }]);
});

test("page sections stay in order with one heading", async ({ page }) => {
  await openPage(page);

  await expect(page.locator("h1")).toHaveCount(1);

  const landmarks = await page.evaluate(() =>
    [...document.querySelectorAll("header, main, footer")].map(
      (element) => element.tagName,
    ),
  );
  expect(landmarks).toEqual(["HEADER", "MAIN", "FOOTER"]);

  const headings = await page.locator("main h1, main h2").allTextContents();
  expect(headings.map((heading) => heading.trim())).toEqual(sectionHeadings);
});

async function watchStoryClicks(page) {
  await page.evaluate(() => {
    window.__storyEvents = [];
    const capture = window.posthog.capture.bind(window.posthog);
    window.posthog.capture = (name, properties) => {
      if (name === "my_story_clicked") {
        window.__storyEvents.push({ name, placement: properties.placement });
      }
      return capture(name, properties);
    };
  });
}

async function clickWithoutLeaving(locator) {
  await locator.evaluate((element) => {
    element.addEventListener("click", (event) => event.preventDefault());
  });
  await locator.dispatchEvent("click", { bubbles: true });
}

test("navigation and booking link are present", async ({ page }) => {
  await openPage(page);

  const nav = page.getByRole("navigation", { name: "Site" });
  for (const [name, href] of navLinks) {
    await expect(nav.getByRole("link", { name, exact: true })).toHaveAttribute(
      "href",
      href,
    );
    await expect(page.locator(href)).toBeAttached();
  }

  const story = nav.getByRole("link", { name: "My Story", exact: true });
  await expect(story).toHaveAttribute("href", "/pages/my-story/");
  await expect(story).not.toHaveAttribute("aria-current", "page");

  const book = page.locator("#contact").getByRole("link", { name: "Book a call" });
  await expect(book).toBeVisible();
  await expect(book).toHaveAttribute("href", zoomBooking);
  await expect(book).toHaveAttribute("target", "_blank");
  await expect(book).toHaveAttribute("rel", /noopener/);

  const headerBook = page
    .getByRole("navigation", { name: "Site" })
    .getByRole("link", { name: "Book a Discovery Call" });
  await expect(headerBook).toBeVisible();
  await expect(headerBook).toHaveAttribute("href", zoomBooking);
  await expect(headerBook).toHaveAttribute("target", "_blank");
  await expect(headerBook).toHaveAttribute("rel", /noopener/);
});

test("my story link records a header click", async ({ page }) => {
  await openPage(page);
  await watchStoryClicks(page);

  await clickWithoutLeaving(page.locator("[data-my-story='header']"));

  await expect
    .poll(() => page.evaluate(() => window.__storyEvents))
    .toEqual([{ name: "my_story_clicked", placement: "header" }]);
});

test("the single session is pay as you go", async ({ page }) => {
  await openPage(page);

  const option = page.locator("#options article").first();
  await expect(option).toContainText("Pay as you go: one 60-minute session");
  await expect(option).toContainText("Buy a 60-minute session whenever you need one.");
  await expect(option).toContainText("$100.00");
  await expect(page.locator("#options")).not.toContainText("one per person");
});

test("option prices share one line", async ({ page }) => {
  await openPage(page);
  const tops = await page.locator(".options-price").evaluateAll((prices) =>
    prices.map((price) => Math.round(price.getBoundingClientRect().top)),
  );
  expect(new Set(tops).size).toBe(1);
});

test("images load and the copyright line is present", async ({ page }) => {
  await openPage(page);

  const broken = await page.evaluate(() =>
    [...document.images]
      .filter((img) => img.naturalWidth === 0)
      .map((img) => img.getAttribute("src")),
  );
  expect(broken).toEqual([]);

  const sources = await page.evaluate(() =>
    [...document.images].map((img) => img.getAttribute("src")),
  );
  expect(sources.length).toBeGreaterThan(0);
  const tracked = new Set(
    execSync("git ls-files", { encoding: "utf8" }).trim().split("\n"),
  );
  const missing = sources.filter((src) => !tracked.has(src));
  expect(missing, "image src must match the committed filename, including case").toEqual([]);
  for (const src of sources) {
    expect(src).not.toMatch(/^https?:\/\//);
    const response = await page.request.get(src);
    expect(response.ok(), src).toBeTruthy();
  }

  await expect(page.locator("footer")).toContainText(
    "© 2026 Excelsior LLC. All rights reserved.",
  );
});

test("keyboard focus is visible", async ({ page }) => {
  await openPage(page);
  await page.keyboard.press("Tab");

  const outline = await page.evaluate(() => {
    const style = getComputedStyle(document.activeElement);
    return {
      style: style.outlineStyle,
      width: Number.parseFloat(style.outlineWidth),
    };
  });

  expect(outline.style).not.toBe("none");
  expect(outline.width).toBeGreaterThanOrEqual(3);
});

test("no serious access issues", async ({ page }) => {
  await openPage(page);
  const results = await new AxeBuilder({ page }).analyze();
  const blocking = seriousViolations(results);
  expect(blocking, formatViolations(blocking)).toEqual([]);
});

test.describe("phone layout", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("menu opens and closes from the keyboard", async ({ page }) => {
    await openPage(page);

    const menu = page.locator(".menu-toggle");
    await menu.focus();
    await page.keyboard.press("Enter");
    await expect(menu).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#site-nav")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(menu).toHaveAttribute("aria-expanded", "false");
    await expect(menu).toBeFocused();
    await expect(page.locator("#site-nav")).toBeHidden();
  });

  test("page does not scroll sideways", async ({ page }) => {
    await openPage(page);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);

    await page.locator(".menu-toggle").focus();
    await page.keyboard.press("Enter");
    const openOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(openOverflow).toBeLessThanOrEqual(1);
  });

  test("booking button in the open menu records a header click", async ({ page }) => {
    await openPage(page);
    await watchDiscoveryClicks(page);
    await page.locator(".menu-toggle").focus();
    await page.keyboard.press("Enter");

    const button = page.locator("#site-nav [data-discovery-call='header']");
    await expect(button).toBeVisible();
    await button.dispatchEvent("click", { bubbles: true });

    await expect
      .poll(() => page.evaluate(() => window.__discoveryEvents))
      .toEqual([{ name: "discovery_call_clicked", placement: "header" }]);
  });

  test("my story link is in the open menu", async ({ page }) => {
    await openPage(page);
    await watchStoryClicks(page);
    await page.locator(".menu-toggle").focus();
    await page.keyboard.press("Enter");

    const link = page.locator("#site-nav").getByRole("link", { name: "My Story" });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "/pages/my-story/");
    await clickWithoutLeaving(link);

    await expect
      .poll(() => page.evaluate(() => window.__storyEvents))
      .toEqual([{ name: "my_story_clicked", placement: "header" }]);
  });

  test("promo video plays from the poster", async ({ page }) => {
    await openPage(page);

    const play = page.getByRole("button", {
      name: "Play the pain and fear cycle video",
    });
    await expect(play).toBeVisible();
    await play.click();
    await expect(page.locator("#understanding iframe")).toBeVisible();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("booking button is centered in the open menu", async ({ page }) => {
    await openPage(page);
    await page.locator(".menu-toggle").focus();
    await page.keyboard.press("Enter");

    const button = page
      .locator("#site-nav")
      .getByRole("link", { name: "Book a Discovery Call" });
    await expect(button).toBeVisible();
    await expect(button).toHaveAttribute("href", zoomBooking);

    const centerDelta = await button.evaluate((element) => {
      const buttonBox = element.getBoundingClientRect();
      const menuBox = element.closest("nav").getBoundingClientRect();
      return Math.abs(
        buttonBox.left + buttonBox.width / 2 - (menuBox.left + menuBox.width / 2),
      );
    });
    expect(centerDelta).toBeLessThanOrEqual(1);
  });
});

async function openStory(page) {
  await page.goto("/pages/my-story/");
  await expect(page.locator("h1")).toHaveText("My Story");
  await page.waitForFunction(() =>
    [...document.images].every((img) => img.complete),
  );
}

test("my story is its own page", async ({ page }) => {
  await openStory(page);

  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://excelsior-prt.com/pages/my-story/",
  );
  await expect(page.locator(".story-banner img")).toHaveAttribute(
    "src",
    "../../images/comic_hero_banner.png",
  );
  await expect(page.locator("#working-in-tech img")).toHaveAttribute(
    "src",
    "../../images/jv_laptop_pain.png",
  );
  await expect(page.locator("#cycling img").nth(0)).toHaveAttribute(
    "src",
    "../../images/jv_cycling_back_pain.png",
  );
  await expect(page.locator("#cycling img").nth(1)).toHaveAttribute(
    "src",
    "../../images/jv_shoulder_lifting_pain.png",
  );
  await expect(page.locator("#the-year img")).toHaveCount(0);
  await expect(page.locator("#excelsior-meaning img")).toHaveAttribute(
    "src",
    "../../images/stan_lee.png",
  );

  const boxes = await page.evaluate(() => {
    const box = (selector) => document.querySelector(selector).getBoundingClientRect();
    return {
      title: box("#story-title"),
      sectionTitle: box("#working-in-tech h2"),
      laptop: box("#working-in-tech img"),
      workingText: box("#working-in-tech .story-copy"),
      shoulder: box("#cycling .story-aside-left img"),
      bike: box("#cycling .story-aside-right img"),
      stan: box("#excelsior-meaning img"),
      meaningText: box("#excelsior-meaning .story-copy"),
    };
  });
  expect(Math.abs(boxes.title.left - boxes.sectionTitle.left)).toBeLessThan(8);
  expect(boxes.laptop.right).toBeLessThanOrEqual(boxes.workingText.left + 1);
  const cycling = await page.evaluate(() => {
    const lines = (selector) => {
      const range = document.createRange();
      range.selectNodeContents(document.querySelector(selector));
      return [...range.getClientRects()];
    };
    const first = lines("#cycling .story-float p");
    const second = lines("#cycling .story-float:last-of-type p");
    const firstWrap = document.querySelector("#cycling .story-float").getBoundingClientRect();
    const secondWrap = document
      .querySelector("#cycling .story-float:last-of-type")
      .getBoundingClientRect();
    return {
      firstLeft: Math.min(...first.map((rect) => rect.left)),
      firstRight: Math.max(...first.map((rect) => rect.right)),
      secondLeft: Math.min(...second.map((rect) => rect.left)),
      secondRight: Math.max(...second.map((rect) => rect.right)),
      firstWrapRight: firstWrap.right,
      secondWrapLeft: secondWrap.left,
    };
  });
  expect(boxes.shoulder.right).toBeLessThanOrEqual(cycling.firstLeft + 4);
  expect(cycling.firstWrapRight - cycling.firstRight).toBeLessThan(80);
  expect(cycling.secondLeft - cycling.secondWrapLeft).toBeLessThan(16);
  expect(boxes.bike.left).toBeGreaterThanOrEqual(cycling.secondRight - 4);
  expect(boxes.bike.top).toBeGreaterThan(boxes.shoulder.top);
  expect(boxes.stan.left).toBeGreaterThanOrEqual(boxes.meaningText.right - 1);

  const headings = await page.locator("main h1, main h2").allTextContents();
  expect(headings.map((heading) => heading.trim())).toEqual([
    "My Story",
    "Working in tech with pain",
    "Cycling through the pain",
    "The year that broke me",
    "What does Excelsior mean?",
    "Be the hero of your own story",
  ]);

  const landmarks = await page.evaluate(() =>
    [...document.querySelectorAll("header, main, footer")].map(
      (element) => element.tagName,
    ),
  );
  expect(landmarks).toEqual(["HEADER", "MAIN", "FOOTER"]);

  const nav = page.getByRole("navigation", { name: "Site" });
  await expect(nav.getByRole("link", { name: "My Story", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(nav.getByRole("link", { name: "Options", exact: true })).toHaveAttribute(
    "href",
    "../../#options",
  );
  await expect(nav.getByRole("link", { name: "The Process", exact: true })).toHaveAttribute(
    "href",
    "../../#process",
  );
  await expect(nav.getByRole("link", { name: "About", exact: true })).toHaveAttribute(
    "href",
    "../../#about",
  );
  await expect(page.locator(".corner-box")).toHaveAttribute("href", "../../");

  const broken = await page.evaluate(() =>
    [...document.images]
      .filter((img) => img.naturalWidth === 0)
      .map((img) => img.getAttribute("src")),
  );
  expect(broken).toEqual([]);

  const storyCall = page.locator("#be-the-hero [data-discovery-call='story']");
  await expect(storyCall).toBeVisible();
  await expect(storyCall).toHaveClass(/button options-banner/);
  await expect(storyCall).toHaveText("Want to learn more? Book a free discovery call.");
  await expect(storyCall).toHaveAttribute("href", zoomBooking);
  await expect(storyCall).toHaveAttribute("target", "_blank");
  await expect(storyCall).toHaveAttribute("rel", /noopener/);
  const storyCallIsLast = await storyCall.evaluate(
    (element) => element === element.parentElement.lastElementChild,
  );
  expect(storyCallIsLast).toBe(true);

  await expect(page.locator("footer")).toContainText(
    "© 2026 Excelsior LLC. All rights reserved.",
  );

  const results = await new AxeBuilder({ page }).analyze();
  const blocking = seriousViolations(results);
  expect(blocking, formatViolations(blocking)).toEqual([]);
});

test("my story discovery call records where it was clicked", async ({ page }) => {
  await openStory(page);
  await watchDiscoveryClicks(page);

  const link = page.locator("#be-the-hero [data-discovery-call='story']");
  await expect(link).toHaveAttribute("href", zoomBooking);
  await link.dispatchEvent("click", { bubbles: true });

  await expect
    .poll(() => page.evaluate(() => window.__discoveryEvents))
    .toEqual([{ name: "discovery_call_clicked", placement: "story" }]);
});

test.describe("my story on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("menu opens and the page does not scroll sideways", async ({ page }) => {
    await openStory(page);

    const storyCall = page.locator("#be-the-hero [data-discovery-call='story']");
    await expect(storyCall).toBeVisible();
    await storyCall.scrollIntoViewIfNeeded();
    const callBox = await storyCall.boundingBox();
    expect(callBox.width).toBeGreaterThan(0);
    expect(callBox.x).toBeGreaterThanOrEqual(0);
    expect(callBox.x + callBox.width).toBeLessThanOrEqual(390);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);

    const menu = page.locator(".menu-toggle");
    await menu.focus();
    await page.keyboard.press("Enter");
    await expect(menu).toHaveAttribute("aria-expanded", "true");

    const link = page.locator("#site-nav").getByRole("link", { name: "My Story" });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("aria-current", "page");

    const openOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(openOverflow).toBeLessThanOrEqual(1);

    await page.keyboard.press("Escape");
    await expect(menu).toHaveAttribute("aria-expanded", "false");
    await expect(menu).toBeFocused();
  });
});

const pages = [
  { name: "home", url: "/", script: "pages/home/page.js", stylesheet: "css/style.css" },
  {
    name: "my-story",
    url: "/pages/my-story/",
    script: "page.js",
    stylesheet: "../../css/style.css",
  },
];

function list(dir) {
  return readdirSync(dir, { withFileTypes: true }).filter(
    (entry) => !entry.name.startsWith("."),
  );
}

test("files live in the documented folders", async () => {
  const looseAssets = list(".")
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => /\.(css|js|png|jpe?g|svg|webp|gif)$/i.test(name))
    .filter((name) => name !== "playwright.config.js");
  expect(looseAssets, "scripts, styles, and images belong in pages/, shared/, css/, images/").toEqual([]);

  for (const gone of ["design", "components", "js", "my-story"]) {
    expect(existsSync(gone), `${gone}/ no longer exists`).toBe(false);
  }

  expect(existsSync("index.html")).toBe(true);
  expect(existsSync("css/style.css")).toBe(true);
  expect(existsSync("images/comic_hero_banner.png")).toBe(true);

  expect(
    list("shared").map((entry) => entry.name).sort(),
    "shared/ holds only code used by every page",
  ).toEqual(["footer.js", "header.js", "menu.js", "tracking.js"]);

  const pageFolders = list("pages");
  expect(pageFolders.filter((entry) => entry.isFile()), "pages/ holds only page folders").toEqual([]);
  expect(
    pageFolders.map((entry) => entry.name).sort(),
    "every folder in pages/ is in the pages list in this test",
  ).toEqual(pages.map((entry) => entry.name).sort());

  const sitemapText = readFileSync("sitemap.xml", "utf8");
  for (const { name } of pages) {
    expect(existsSync(`pages/${name}/page.js`), `pages/${name}/page.js`).toBe(true);
    if (name === "home") {
      expect(existsSync("pages/home/index.html"), "home HTML stays in root").toBe(false);
    } else {
      expect(existsSync(`pages/${name}/index.html`), `pages/${name}/index.html`).toBe(true);
      expect(sitemapText, `sitemap lists ${name}`).toContain(
        `https://excelsior-prt.com/pages/${name}/`,
      );
    }
  }
});

for (const { url, script, stylesheet } of pages) {
  test(`${url} loads its script and styles from the right folders`, async ({ page }) => {
    const failures = [];
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => {
      if (response.url().startsWith("http://127.0.0.1:3000") && response.status() >= 400) {
        failures.push(`${response.status()} ${response.url()}`);
      }
    });

    await page.goto(url);
    await expect(page.locator("h1")).toBeVisible();
    await page.waitForFunction(() =>
      [...document.images].every((img) => img.complete),
    );

    await expect(page.locator('script[type="module"]')).toHaveAttribute("src", script);
    await expect(page.locator('link[rel="stylesheet"][href$="style.css"]')).toHaveAttribute(
      "href",
      stylesheet,
    );

    expect(failures).toEqual([]);
    expect(errors).toEqual([]);

    const ogImage = await page
      .locator('meta[property="og:image"]')
      .getAttribute("content");
    expect(ogImage).toMatch(/^https:\/\/excelsior-prt\.com\/images\//);
    const preview = await page.request.get(new URL(ogImage).pathname);
    expect(preview.ok(), ogImage).toBeTruthy();

    const imageSources = await page.evaluate(() =>
      [...document.images].map((img) => new URL(img.src).pathname),
    );
    expect(imageSources.length).toBeGreaterThan(0);
    for (const src of imageSources) {
      expect(src, "page images come from images/").toMatch(/^\/images\//);
    }
  });
}

test("an unknown path shows the 404 page", async ({ page }) => {
  for (const path of ["/blah", "/no/such/page"]) {
    const response = await page.goto(path);
    expect(response.status(), path).toBe(404);
    await expect(page.locator("h1")).toHaveText("404 — Page not found");
    await expect(page).toHaveURL(new RegExp(`${path}$`));
  }

  const background = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  );
  expect(background).toBe("rgb(29, 78, 216)");

  await page.evaluate(() => {
    window.__notFoundEvents = [];
    const capture = window.posthog.capture.bind(window.posthog);
    window.posthog.capture = (name, properties) => {
      if (name === "not_found_home_clicked") window.__notFoundEvents.push({ name });
      return capture(name, properties);
    };
  });
  const home = page.getByRole("link", { name: "Back to Excelsior" });
  await home.evaluate((element) => {
    element.addEventListener("click", (event) => event.preventDefault());
  });
  await home.dispatchEvent("click", { bubbles: true });
  await expect
    .poll(() => page.evaluate(() => window.__notFoundEvents))
    .toEqual([{ name: "not_found_home_clicked" }]);

  await page.goto("/blah");
  await page.getByRole("link", { name: "Back to Excelsior" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("h1")).toHaveText("Excelsior");
});

test.describe("404 on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("the page fits and the way home is visible", async ({ page }) => {
    const response = await page.goto("/blah");
    expect(response.status()).toBe(404);

    const home = page.getByRole("link", { name: "Back to Excelsior" });
    await expect(home).toBeVisible();
    await expect(page.locator(".site-nav").getByRole("link", { name: "My Story" })).toBeVisible();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
