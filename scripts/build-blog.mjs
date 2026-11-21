#!/usr/bin/env node
import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  escapeHtml,
  formatDisplayDate,
  parseFrontmatter,
  renderMarkdown,
} from "./blog-markdown.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT_DIR = join(ROOT, "content", "blog");
const BLOG_DIR = join(ROOT, "pages", "blog");
const SITEMAP_PATH = join(ROOT, "sitemap.xml");
const LLMS_PATH = join(ROOT, "llms.txt");
const LLMS_FULL_PATH = join(ROOT, "llms-full.txt");
const SITE = "https://excelsior-prt.com";
const BLOG_INTRO =
  "A content hub for Pain Reprocessing Therapy & somatic coaching.";
const BLOG_META =
  "A content hub for Pain Reprocessing Therapy & somatic coaching. Based in Boulder, Colorado. Coaching by video anywhere.";

function loadPosts() {
  if (!existsSync(CONTENT_DIR)) {
    throw new Error(`Missing content folder: ${CONTENT_DIR}`);
  }
  const files = readdirSync(CONTENT_DIR)
    .filter((name) => name.endsWith(".md"))
    .sort();
  if (files.length === 0) {
    throw new Error("No markdown posts in content/blog/");
  }

  return files
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
        throw new Error(`Invalid slug from filename: ${file}`);
      }
      const raw = readFileSync(join(CONTENT_DIR, file), "utf8");
      const { meta, body } = parseFrontmatter(raw);
      return {
        slug,
        title: meta.title,
        date: meta.date,
        summary: meta.summary,
        body,
        html: renderMarkdown(body),
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

function existingSlugs() {
  if (!existsSync(BLOG_DIR)) return [];
  return readdirSync(BLOG_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

function writePostPages(posts) {
  const keep = new Set(posts.map((post) => post.slug));
  for (const slug of existingSlugs()) {
    if (!keep.has(slug)) {
      rmSync(join(BLOG_DIR, slug), { recursive: true, force: true });
    }
  }

  for (const post of posts) {
    const dir = join(BLOG_DIR, post.slug);
    mkdirSync(dir, { recursive: true });
    const displayDate = formatDisplayDate(post.date);
    const article = `
<article class="blog-post">
  <div class="blog-post-inner">
    <h1>${escapeHtml(post.title)}</h1>
    <p class="blog-meta"><time datetime="${post.date}">${displayDate}</time></p>
    <div class="blog-prose">
${post.html}
    </div>
    <p class="blog-back"><a href="../">All posts →</a></p>
  </div>
</article>`.trim();

    writeFileSync(
      join(dir, "body.js"),
      `export function PostBody() {\n  return ${JSON.stringify(article)};\n}\n`,
    );

    writeFileSync(
      join(dir, "page.js"),
      `import { Header } from "../../../shared/header.js";
import { PromoBanner } from "../../../shared/promo-banner.js";
import { Footer } from "../../../shared/footer.js";
import { bindMenu } from "../../../shared/menu.js";
import { bindTracking } from "../../../shared/tracking.js";
import { bindNewsletter } from "../../../shared/newsletter.js";
import { PostBody } from "./body.js";

const pageKey = ${JSON.stringify(`blog/${post.slug}`)};
const app = document.querySelector("#app");

app.innerHTML = [
  PromoBanner(pageKey),
  Header(pageKey),
  \`<main id="top">\${PostBody()}</main>\`,
  Footer(),
].join("\\n");

bindMenu();
bindTracking();
bindNewsletter();
`,
    );

    const url = `${SITE}/pages/blog/${post.slug}/`;
    const title = `${post.title} — Excelsior LLC`;
    const description = post.summary;
    writeFileSync(
      join(dir, "index.html"),
      `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta
      property="og:image"
      content="https://excelsior-prt.com/images/excelsior-retro-banner.png"
    />
    <script type="application/ld+json">
      ${JSON.stringify(
        {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          datePublished: post.date,
          description: post.summary,
          url,
          mainEntityOfPage: url,
          image: "https://excelsior-prt.com/images/excelsior-retro-banner.png",
          author: {
            "@type": "Person",
            "@id": "https://excelsior-prt.com/#john-vajda",
            name: "John Vajda",
            jobTitle: "Pain Reprocessing Therapy Coach",
            sameAs: "https://www.linkedin.com/in/johnpvajda/",
            worksFor: {
              "@type": "ProfessionalService",
              name: "Excelsior LLC",
              url: "https://excelsior-prt.com/",
            },
          },
          publisher: {
            "@type": "Organization",
            name: "Excelsior LLC",
            url: "https://excelsior-prt.com/",
          },
        },
        null,
        2,
      ).replace(/^/gm, "      ").trim()}
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Bangers&family=Source+Sans+3:wght@400;600;700&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="../../../css/style.css" />
    <script src="../../../shared/posthog.js"></script>
  </head>
  <body>
    <div id="app"></div>
    <noscript>
      <p>66% of people were pain-free or nearly pain-free after trying PRT. <a href="https://excelsior-prt.com/#data">See the Data</a>.</p>
      <h1>${escapeHtml(post.title)}</h1>
      <p><time datetime="${post.date}">${displayDate}</time></p>
      <p>${escapeHtml(post.summary)}</p>
      <p>${escapeHtml(post.body.split(/\n\n/)[0] || post.summary)}</p>
      <p><a href="https://excelsior-prt.com/pages/blog/">All posts</a></p>
      <p><a href="https://excelsior-prt.com/">Excelsior LLC</a></p>
      <p><a href="https://scheduler.zoom.us/excelsior-llc/prt-discovery-call">Book a free discovery call</a></p>
    </noscript>
    <script type="module" src="page.js"></script>
  </body>
</html>
`,
    );
  }
}

function writeManifest(posts) {
  const data = posts.map(({ slug, title, date, summary }) => ({
    slug,
    title,
    date,
    summary,
  }));
  writeFileSync(
    join(BLOG_DIR, "posts-data.js"),
    `// Generated by scripts/build-blog.mjs — do not edit by hand.\nexport const posts = ${JSON.stringify(data, null, 2)};\n`,
  );
}

function updateSitemap(posts) {
  const xml = readFileSync(SITEMAP_PATH, "utf8");
  const urls = [...xml.matchAll(/<url>\s*<loc>(.*?)<\/loc>\s*<lastmod>(.*?)<\/lastmod>\s*<\/url>/g)].map(
    (match) => ({ loc: match[1], lastmod: match[2] }),
  );
  const kept = urls.filter((entry) => !entry.loc.includes("/pages/blog"));
  const latest = posts[0]?.date || "2026-11-21";
  kept.push({ loc: `${SITE}/pages/blog/`, lastmod: latest });
  for (const post of posts) {
    kept.push({
      loc: `${SITE}/pages/blog/${post.slug}/`,
      lastmod: post.date,
    });
  }

  const body = kept
    .map(
      (entry) => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
  </url>`,
    )
    .join("\n");

  writeFileSync(
    SITEMAP_PATH,
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`,
  );
}

function updateLlmsTxt(posts) {
  const lines = readFileSync(LLMS_PATH, "utf8").split("\n");
  const withoutBlog = lines.filter((line) => !line.includes("/pages/blog/"));
  const insertAt = withoutBlog.findIndex((line) => line.includes("/pages/my-story/"));
  if (insertAt === -1) {
    throw new Error("llms.txt is missing the My Story page link");
  }
  const blogLines = [
    `- [Blog](${SITE}/pages/blog/): ${BLOG_INTRO}`,
    ...posts.map(
      (post) =>
        `- [${post.title}](${SITE}/pages/blog/${post.slug}/): ${post.summary}`,
    ),
  ];
  withoutBlog.splice(insertAt + 1, 0, ...blogLines);
  writeFileSync(LLMS_PATH, withoutBlog.join("\n"));
}

function updateLlmsFull(posts) {
  let text = readFileSync(LLMS_FULL_PATH, "utf8");
  const headerLines = text.split("\n");
  const withoutBlogHeader = headerLines.filter((line) => {
    if (line.startsWith("Writing: ") || line.startsWith("Blog: ")) return false;
    if (line.includes(`${SITE}/pages/blog/`)) return false;
    return true;
  });
  const storyAt = withoutBlogHeader.findIndex((line) => line.startsWith("My Story: "));
  if (storyAt === -1) {
    throw new Error("llms-full.txt is missing the My Story line");
  }
  const headerBlog = [
    `Blog: ${SITE}/pages/blog/`,
    ...posts.map((post) => `${post.title}: ${SITE}/pages/blog/${post.slug}/`),
  ];
  withoutBlogHeader.splice(storyAt + 1, 0, ...headerBlog);
  text = withoutBlogHeader.join("\n");

  const writingSection = `## Blog

${BLOG_INTRO} ${SITE}/pages/blog/

${posts
  .map(
    (post) =>
      `${post.title} (${post.date}): ${SITE}/pages/blog/${post.slug}/\n${post.summary}`,
  )
  .join("\n\n")}
`;

  if (!/## (?:Writing|Blog)\n[\s\S]*?(?=\n## )/.test(text)) {
    throw new Error("llms-full.txt is missing the ## Blog section");
  }
  text = text.replace(/## (?:Writing|Blog)\n[\s\S]*?(?=\n## )/, `${writingSection}\n`);
  writeFileSync(LLMS_FULL_PATH, text);
}

function writeBlogIndex(posts) {
  const postNoscript = posts
    .map(
      (post) => `      <h2>${escapeHtml(post.title)}</h2>
      <p>${escapeHtml(post.summary)}</p>
      <p><a href="${SITE}/pages/blog/${post.slug}/">Read the post</a></p>`,
    )
    .join("\n");

  writeFileSync(
    join(BLOG_DIR, "index.html"),
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Blog — Excelsior LLC</title>
    <meta name="description" content="${escapeHtml(BLOG_META)}" />
    <link rel="canonical" href="${SITE}/pages/blog/" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${SITE}/pages/blog/" />
    <meta property="og:title" content="Blog — Excelsior LLC" />
    <meta property="og:description" content="${escapeHtml(BLOG_META)}" />
    <meta
      property="og:image"
      content="https://excelsior-prt.com/images/excelsior-retro-banner.png"
    />
    <script type="application/ld+json">
      ${JSON.stringify(
        {
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Blog — Excelsior LLC",
          url: `${SITE}/pages/blog/`,
          description: BLOG_INTRO,
          publisher: {
            "@type": "Organization",
            name: "Excelsior LLC",
            url: `${SITE}/`,
          },
        },
        null,
        2,
      ).replace(/^/gm, "      ").trim()}
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Bangers&family=Source+Sans+3:wght@400;600;700&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="../../css/style.css" />
    <script src="../../shared/posthog.js"></script>
  </head>
  <body>
    <div id="app"></div>
    <noscript>
      <p>66% of people were pain-free or nearly pain-free after trying PRT. <a href="https://excelsior-prt.com/#data">See the Data</a>.</p>
      <h1>Blog</h1>
      <p>${escapeHtml(BLOG_INTRO)}</p>
${postNoscript}
      <p><a href="https://excelsior-prt.com/">Excelsior LLC</a></p>
      <p><a href="https://scheduler.zoom.us/excelsior-llc/prt-discovery-call">Book a free discovery call</a></p>
    </noscript>
    <script type="module" src="page.js"></script>
  </body>
</html>
`,
  );
}

export function buildBlog() {
  mkdirSync(BLOG_DIR, { recursive: true });
  const posts = loadPosts();
  writeManifest(posts);
  writeBlogIndex(posts);
  writePostPages(posts);
  updateSitemap(posts);
  updateLlmsTxt(posts);
  updateLlmsFull(posts);
  return posts;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const posts = buildBlog();
  console.log(`Built ${posts.length} blog post(s).`);
}
