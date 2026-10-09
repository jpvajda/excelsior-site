export function About() {
  return `
<section id="about" class="panel">
  <h2>About</h2>
  <div class="about-grid">
    <div>
      <p class="coach-name">John Vajda</p>
      <p class="coach-role">Pain Reprocessing Therapy Coach</p>
      <!-- SLOT: bio -->
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
    </div>
    <img class="photo-frame" src="design/jv_comic_book_profile_vibrant.png" alt="Comic portrait of John Vajda" width="1254" height="1254">
  </div>
</section>
`;
}
