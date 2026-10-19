export function Footer() {
  return `
<footer class="site-footer">
  <div class="footer-top">
    <div class="footer-brand">
      <p class="footer-name">Excelsior LLC</p>
      <p class="disclaimer">&copy; 2026 Excelsior LLC. All rights reserved.</p>
    </div>
    <form class="newsletter" data-newsletter>
      <p class="newsletter-label">Sign up for our newsletter</p>
      <div class="newsletter-row">
        <input id="newsletter-email" name="email" type="email" autocomplete="email" aria-label="Email" required>
        <button class="button" type="submit">Sign up</button>
      </div>
      <p class="newsletter-status" data-newsletter-status role="status" aria-live="polite"></p>
      <div class="newsletter-hp" aria-hidden="true">
        <label for="newsletter-hp">Leave blank</label>
        <input id="newsletter-hp" name="signup_hp" type="text" tabindex="-1" autocomplete="off">
      </div>
    </form>
  </div>
  <nav class="footer-links" aria-label="Further reading">
    <a href="https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2809959" target="_blank" rel="noopener noreferrer">See the Research</a>
    <a href="https://www.nih.gov/news-events/nih-research-matters/retraining-brain-treat-chronic-pain" target="_blank" rel="noopener noreferrer">Retrain the Brain to Treat Chronic Pain</a>
    <a href="https://www.youtube.com/watch?v=_S7w2eg0DYw" target="_blank" rel="noopener noreferrer">A Deeper Look at PRT</a>
    <a href="https://www.amazon.com/Way-Out-Revolutionary-Scientifically-Approach/dp/059308683X" target="_blank" rel="noopener noreferrer">The Way Out</a>
    <a href="https://www.amazon.com/Unlearn-Your-Pain-Recovering-Depression/dp/0593994361" target="_blank" rel="noopener noreferrer">Unlearn Your Pain</a>
    <a href="https://www.painreprocessingtherapy.com/painreprocessingtherapy-com-podcast" target="_blank" rel="noopener noreferrer">The PRT Podcast</a>
  </nav>
</footer>
`;
}
