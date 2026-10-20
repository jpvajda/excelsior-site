// `page` is the folder name under pages/ ("home" for the root index.html).
// Links resolve against the page URL: "/" for home, "/pages/<page>/" for the rest.
export function Header(page = "home") {
  const onHome = page === "home";
  const prefix = onHome ? "" : "../../";
  const section = (id) => (onHome ? `#${id}` : `${prefix}#${id}`);
  const homeHref = onHome ? "#top" : prefix;
  const current = (key) => (page === key ? ' aria-current="page"' : "");

  return `
<header class="site-header">
  <div class="header-inner">
    <a class="corner-box" href="${homeHref}">
      <span class="corner-box-title">Excelsior</span>
      <span class="corner-box-sub">LLC</span>
    </a>
    <button type="button" class="menu-toggle" aria-expanded="false" aria-controls="site-nav">Menu</button>
    <nav id="site-nav" class="site-nav" aria-label="Site">
      <a href="${section("options")}">Options</a>
      <a href="${section("process")}">The Process</a>
      <a href="${section("about")}">About</a>
      <a href="/pages/my-story/"${current("my-story")} data-my-story="header">My Story</a>
      <a class="button nav-cta" data-discovery-call="header" href="https://scheduler.zoom.us/excelsior-llc/prt-discovery-call" target="_blank" rel="noopener noreferrer">Free Discovery Call</a>
    </nav>
  </div>
</header>
`;
}
