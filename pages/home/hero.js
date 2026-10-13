export function Hero() {
  return `
<section class="hero" aria-labelledby="site-title">
  <div class="hero-burst" aria-hidden="true"></div>
  <img class="hero-poster" src="images/comic_corner_box.png" alt="Comic-style poster of John P. Vajda, PRT: For a better tomorrow" width="910" height="1728">
  <img class="code-stamp" src="images/prt_coach_stamp.png" alt="Certified PRT Coach" width="405" height="615">
  <div class="hero-copy">
    <h1 id="site-title">Excelsior</h1>
    <p class="offer-line">Pain Reprocessing Therapy Coaching</p>
    <!-- SLOT: hero subhead -->
    <img class="hero-sub" src="images/prt_comic_text_panel.png" alt="PRT is an evidence-based psychological treatment that aims to change the brain’s response to pain signals. It involves techniques designed to help the brain process and reinterpret body signals accurately, thereby reducing or eliminating the pain experience." width="1085" height="720">
  </div>
</section>
`;
}
