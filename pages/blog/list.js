import { posts } from "./posts-data.js";

function formatDate(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function BlogList() {
  const items = posts
    .map(
      (post) => `
    <li>
      <a href="${post.slug}/">${escapeHtml(post.title)}</a>
      <p class="blog-list-meta"><time datetime="${post.date}">${formatDate(post.date)}</time></p>
      <p class="blog-list-summary">${escapeHtml(post.summary)}</p>
    </li>`,
    )
    .join("\n");

  return `
<section class="panel blog-index" id="blog">
  <h1 class="blog-heading">Blog</h1>
  <p class="blog-intro">A content hub for Pain Reprocessing Therapy &amp; somatic coaching.</p>
  <ul class="blog-list">
    ${items}
  </ul>
</section>
`;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
