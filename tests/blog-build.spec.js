import { expect, test } from "@playwright/test";
import {
  escapeHtml,
  formatDisplayDate,
  parseFrontmatter,
  renderMarkdown,
} from "../scripts/blog-markdown.mjs";
import { posts } from "../pages/blog/posts-data.js";
import { readFileSync, readdirSync, existsSync } from "node:fs";

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

function postsFromMarkdown() {
  return readdirSync("content/blog")
    .filter((name) => name.endsWith(".md"))
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const { meta } = parseFrontmatter(readFileSync(`content/blog/${file}`, "utf8"));
      return {
        slug,
        title: meta.title,
        date: meta.date,
        summary: meta.summary,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

test("generated posts match the markdown sources, newest first", () => {
  const sources = postsFromMarkdown();
  expect(sources.length).toBeGreaterThan(0);
  expect(posts).toEqual(sources);

  for (const post of sources) {
    expect(existsSync(`pages/blog/${post.slug}/body.js`), post.slug).toBe(true);
    expect(existsSync(`pages/blog/${post.slug}/index.html`), post.slug).toBe(true);
    expect(existsSync(`pages/blog/${post.slug}/page.js`), post.slug).toBe(true);
    const body = readFileSync(`pages/blog/${post.slug}/body.js`, "utf8");
    expect(body).toContain(post.title);
    expect(body).toContain(`datetime=\\"${post.date}\\"`);
  }
});

test("llms files list every committed post title summary and url", () => {
  const llms = readFileSync("llms.txt", "utf8");
  const full = readFileSync("llms-full.txt", "utf8");
  const index = readFileSync("pages/blog/index.html", "utf8");

  expect(llms).toContain(
    "[Blog](https://excelsior-prt.com/pages/blog/): A content hub for Pain Reprocessing Therapy & somatic coaching.",
  );
  expect(full).toContain("Blog: https://excelsior-prt.com/pages/blog/");
  expect(full).toContain("## Blog");
  expect(full).toContain(
    "A content hub for Pain Reprocessing Therapy & somatic coaching. https://excelsior-prt.com/pages/blog/",
  );
  expect(index).toContain("<h1>Blog</h1>");
  expect(index).toContain("<title>Blog — Excelsior LLC</title>");
  expect(index).toContain(
    "A content hub for Pain Reprocessing Therapy &amp; somatic coaching.",
  );

  for (const post of posts) {
    const url = `https://excelsior-prt.com/pages/blog/${post.slug}/`;
    expect(llms, `llms.txt missing ${post.slug}`).toContain(
      `- [${post.title}](${url}): ${post.summary}`,
    );
    expect(full, `llms-full.txt header missing ${post.slug}`).toContain(
      `${post.title}: ${url}`,
    );
    expect(full, `llms-full.txt Blog section missing ${post.slug}`).toContain(
      `${post.title} (${post.date}): ${url}`,
    );
    expect(full).toContain(post.summary);
    expect(index).toContain(`<h2>${escapeHtml(post.title)}</h2>`);
    expect(index).toContain(escapeHtml(post.summary));
    expect(index).toContain(url);
  }
});
