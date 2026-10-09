export function Hero() {
  return `
<section class="hero" aria-labelledby="site-title">
  <div class="hero-burst" aria-hidden="true"></div>
  <p class="code-stamp">
    <svg class="stamp-cut" viewBox="0 0 120 148" aria-hidden="true">
      <defs>
        <mask id="stamp-perf" maskUnits="userSpaceOnUse">
          <rect width="120" height="148" fill="white" />
          <g fill="black">
            <circle cx="18" cy="6" r="5" /><circle cx="32" cy="6" r="5" /><circle cx="46" cy="6" r="5" /><circle cx="60" cy="6" r="5" /><circle cx="74" cy="6" r="5" /><circle cx="88" cy="6" r="5" /><circle cx="102" cy="6" r="5" />
            <circle cx="18" cy="142" r="5" /><circle cx="32" cy="142" r="5" /><circle cx="46" cy="142" r="5" /><circle cx="60" cy="142" r="5" /><circle cx="74" cy="142" r="5" /><circle cx="88" cy="142" r="5" /><circle cx="102" cy="142" r="5" />
            <circle cx="6" cy="20" r="5" /><circle cx="6" cy="34" r="5" /><circle cx="6" cy="48" r="5" /><circle cx="6" cy="62" r="5" /><circle cx="6" cy="76" r="5" /><circle cx="6" cy="90" r="5" /><circle cx="6" cy="104" r="5" /><circle cx="6" cy="118" r="5" /><circle cx="6" cy="132" r="5" />
            <circle cx="114" cy="20" r="5" /><circle cx="114" cy="34" r="5" /><circle cx="114" cy="48" r="5" /><circle cx="114" cy="62" r="5" /><circle cx="114" cy="76" r="5" /><circle cx="114" cy="90" r="5" /><circle cx="114" cy="104" r="5" /><circle cx="114" cy="118" r="5" /><circle cx="114" cy="132" r="5" />
          </g>
        </mask>
      </defs>
      <rect x="6" y="6" width="108" height="136" fill="#fffdf6" stroke="#141414" stroke-width="2.5" mask="url(#stamp-perf)" />
    </svg>
    <span class="code-stamp-title">Certified<br>PRT Coach</span>
    <span class="code-seal">
      <img src="design/prt-logo.png" alt="" width="232" height="222">
    </span>
  </p>
  <div class="hero-copy">
    <h1 id="site-title">Excelsior</h1>
    <p class="offer-line">Pain Reprocessing Therapy Coaching</p>
    <!-- SLOT: hero subhead -->
    <p class="hero-sub">PRT is an evidence-based psychological treatment that aims to change the brain’s response to pain signals. It involves techniques designed to help the brain process and reinterpret body signals accurately, thereby reducing or eliminating the pain experience.</p>
    <a class="button" href="#contact">Start here</a>
  </div>
</section>
`;
}
