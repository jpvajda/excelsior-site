export function PromoBanner(page = "home") {
  const href = page === "home" ? "#data" : "../../#data";

  return `
<aside class="promo-banner" aria-label="Study result">
  <p>66% of people were pain-free or nearly pain-free after trying PRT. <a href="${href}" data-data-section="banner">See the Data</a>.</p>
</aside>
`;
}
