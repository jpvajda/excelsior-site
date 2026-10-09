export function Stories() {
  return `
<section id="stories" class="panel">
  <h2>Stories</h2>
  <div class="bubbles">
    <figure class="bubble">
      <!-- SLOT: story 1 -->
      <blockquote>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
      </blockquote>
      <figcaption>Sample — replace with a real story</figcaption>
      <svg class="tail" viewBox="0 0 48 32" aria-hidden="true">
        <path d="M4 2h40L18 30z" />
        <path d="M9 2h26L18 22z" />
      </svg>
    </figure>
    <figure class="bubble">
      <!-- SLOT: story 2 -->
      <blockquote>
        <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
      </blockquote>
      <figcaption>Sample — replace with a real story</figcaption>
      <svg class="tail" viewBox="0 0 48 32" aria-hidden="true">
        <path d="M4 2h40L18 30z" />
        <path d="M9 2h26L18 22z" />
      </svg>
    </figure>
  </div>
</section>
`;
}
