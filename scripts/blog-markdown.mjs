export function parseFrontmatter(raw) {
  const text = raw.replace(/^\uFEFF/, "");
  if (!text.startsWith("---\n")) {
    throw new Error("Post must start with YAML frontmatter (---)");
  }
  const end = text.indexOf("\n---\n", 4);
  if (end === -1) {
    throw new Error("Frontmatter closing --- not found");
  }
  const fm = text.slice(4, end);
  const body = text.slice(end + 5).trim();
  const meta = {};
  for (const line of fm.split("\n")) {
    if (!line.trim()) continue;
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) {
      throw new Error(`Invalid frontmatter line: ${line}`);
    }
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    meta[match[1]] = value;
  }
  for (const key of ["title", "date", "summary"]) {
    if (!meta[key]) throw new Error(`Missing frontmatter field: ${key}`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.date)) {
    throw new Error(`date must be YYYY-MM-DD, got ${meta.date}`);
  }
  return { meta, body };
}

export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderInline(text) {
  let out = "";
  let i = 0;
  while (i < text.length) {
    if (text[i] === "`") {
      const end = text.indexOf("`", i + 1);
      if (end !== -1) {
        out += `<code>${escapeHtml(text.slice(i + 1, end))}</code>`;
        i = end + 1;
        continue;
      }
    }
    if (text[i] === "[") {
      const close = text.indexOf("]", i + 1);
      if (close !== -1 && text[close + 1] === "(") {
        const urlEnd = text.indexOf(")", close + 2);
        if (urlEnd !== -1) {
          const label = text.slice(i + 1, close);
          const href = text.slice(close + 2, urlEnd);
          out += `<a href="${escapeHtml(href)}">${renderInline(label)}</a>`;
          i = urlEnd + 1;
          continue;
        }
      }
    }
    if (text.startsWith("**", i)) {
      const end = text.indexOf("**", i + 2);
      if (end !== -1) {
        out += `<strong>${renderInline(text.slice(i + 2, end))}</strong>`;
        i = end + 2;
        continue;
      }
    }
    if (text[i] === "*" && text[i + 1] !== "*") {
      const end = text.indexOf("*", i + 1);
      if (end !== -1) {
        out += `<em>${renderInline(text.slice(i + 1, end))}</em>`;
        i = end + 1;
        continue;
      }
    }
    out += escapeHtml(text[i]);
    i += 1;
  }
  return out;
}

function isBlockStart(line) {
  return (
    line.startsWith("> ") ||
    line.startsWith("## ") ||
    line.startsWith("### ") ||
    /^[-*] /.test(line) ||
    /^\d+\. /.test(line)
  );
}

export function renderMarkdown(md) {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i += 1;
      continue;
    }

    if (line.startsWith("> ")) {
      const quote = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quote.push(lines[i].slice(2));
        i += 1;
      }
      blocks.push(
        `<blockquote>${quote.map((q) => `<p>${renderInline(q)}</p>`).join("")}</blockquote>`,
      );
      continue;
    }

    if (line.startsWith("## ")) {
      blocks.push(`<h2>${renderInline(line.slice(3).trim())}</h2>`);
      i += 1;
      continue;
    }
    if (line.startsWith("### ")) {
      blocks.push(`<h3>${renderInline(line.slice(4).trim())}</h3>`);
      i += 1;
      continue;
    }

    if (/^[-*] /.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        items.push(`<li>${renderInline(lines[i].replace(/^[-*] /, ""))}</li>`);
        i += 1;
      }
      blocks.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    if (/^\d+\. /.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(`<li>${renderInline(lines[i].replace(/^\d+\. /, ""))}</li>`);
        i += 1;
      }
      blocks.push(`<ol>${items.join("")}</ol>`);
      continue;
    }

    const para = [];
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) {
      para.push(lines[i].trim());
      i += 1;
    }
    blocks.push(`<p>${renderInline(para.join(" "))}</p>`);
  }

  return blocks.join("\n");
}

export function formatDisplayDate(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
