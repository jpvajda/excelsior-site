export function Header() {
  return `
<header class="site-header">
  <div class="header-inner">
    <a class="corner-box" href="#top">
      <span class="corner-box-title">Excelsior</span>
      <span class="corner-box-sub">LLC</span>
    </a>
    <button type="button" class="menu-toggle" aria-expanded="false" aria-controls="site-nav">Menu</button>
    <nav id="site-nav" class="site-nav" aria-label="On this page">
      <a href="#options">Options</a>
      <a href="#process">The Process</a>
      <a href="#about">About</a>
      <a class="button nav-cta" href="https://scheduler.zoom.us/excelsior-llc/prt-discovery-call" target="_blank" rel="noopener noreferrer">Book a Discovery Call</a>
    </nav>
  </div>
</header>
`;
}
