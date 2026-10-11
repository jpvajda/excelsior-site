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
  ["Contact", "#contact"],
];

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

test("navigation and booking link are present", async ({ page }) => {
  await openPage(page);

  const nav = page.getByRole("navigation", { name: "On this page" });
  for (const [name, href] of navLinks) {
    await expect(nav.getByRole("link", { name, exact: true })).toHaveAttribute(
      "href",
      href,
    );
    await expect(page.locator(href)).toBeAttached();
  }

  const book = page.locator("#contact").getByRole("link", { name: "Book a call" });
  await expect(book).toBeVisible();
  await expect(book).toHaveAttribute("target", "_blank");
  await expect(book).toHaveAttribute("rel", /noopener/);
  await expect(book).toHaveAttribute("href", /^https:\/\//);
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
});
