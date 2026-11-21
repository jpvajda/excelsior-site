import { expect, test } from "@playwright/test";
import {
  escapeHtml,
  formatDisplayDate,
  parseFrontmatter,
  renderMarkdown,
} from "../scripts/blog-markdown.mjs";
import { posts } from "../pages/blog/posts-data.js";
import { readFileSync, existsSync } from "node:fs";

test("parseFrontmatter reads title date summary and body", () => {
  const { meta, body } = parseFrontmatter(`---
title: Sample Post
date: 2026-11-21
summary: A short summary.
---

Hello **world**.
`);
  expect(meta).toEqual({
    title: "Sample Post",
    date: "2026-11-21",
    summary: "A short summary.",
  });
  expect(body).toBe("Hello **world**.");
});

test("renderMarkdown turns headings links and emphasis into HTML", () => {
  const html = renderMarkdown(`## Heading

A [link](https://excelsior-prt.com/) with **bold** and *italic*.

- one
- two
`);
  expect(html).toContain("<h2>Heading</h2>");
  expect(html).toContain('<a href="https://excelsior-prt.com/">link</a>');
  expect(html).toContain("<strong>bold</strong>");
  expect(html).toContain("<em>italic</em>");
  expect(html).toContain("<ul><li>one</li><li>two</li></ul>");
  expect(escapeHtml("<script>")).toBe("&lt;script&gt;");
  expect(formatDisplayDate("2026-11-21")).toBe("Nov 21, 2026");
});

test("committed first post matches the markdown source", () => {
  expect(posts[0]).toEqual({
    slug: "excelsior-llc-mission",
    title: "Excelsior LLC's Mission",
    date: "2026-11-21",
    summary:
      'Excelsior means "ever upward." Our mission is to help people with chronic pain feel better through Pain Reprocessing Therapy and somatic coaching.',
  });

  expect(existsSync("content/blog/excelsior-llc-mission.md")).toBe(true);
  expect(existsSync("pages/blog/excelsior-llc-mission/body.js")).toBe(true);
  expect(existsSync("pages/blog/excelsior-llc-mission/index.html")).toBe(true);
  expect(existsSync("pages/blog/excelsior-llc-mission/page.js")).toBe(true);

  const body = readFileSync("pages/blog/excelsior-llc-mission/body.js", "utf8");
  expect(body).toContain("Excelsior LLC's Mission");
  expect(body).toContain("Coaching is not medical care");
  expect(body).toContain('datetime=\\"2026-11-21\\"');
});

test("llms files list every committed post title summary and url", () => {
  const llms = readFileSync("llms.txt", "utf8");
  const full = readFileSync("llms-full.txt", "utf8");
  const index = readFileSync("pages/blog/index.html", "utf8");

  expect(llms).toContain("[Writing](https://excelsior-prt.com/pages/blog/)");
  expect(full).toContain("Writing: https://excelsior-prt.com/pages/blog/");
  expect(full).toContain("## Writing");

  for (const post of posts) {
    const url = `https://excelsior-prt.com/pages/blog/${post.slug}/`;
    expect(llms, `llms.txt missing ${post.slug}`).toContain(
      `- [${post.title}](${url}): ${post.summary}`,
    );
    expect(full, `llms-full.txt header missing ${post.slug}`).toContain(
      `${post.title}: ${url}`,
    );
    expect(full, `llms-full.txt Writing section missing ${post.slug}`).toContain(
      `${post.title} (${post.date}): ${url}`,
    );
    expect(full).toContain(post.summary);
    expect(index).toContain(`<h2>${escapeHtml(post.title)}</h2>`);
    expect(index).toContain(escapeHtml(post.summary));
    expect(index).toContain(url);
  }
});
