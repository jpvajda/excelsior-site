export function Problem() {
  return `
<section id="problem" class="panel">
  <h2>Understanding Chronic Pain</h2>
  <!-- SLOT: problem intro -->
  <p class="problem-intro">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
  <div class="pain-row">
    <article class="pain-card">
      <!-- SLOT: icon false alarm -->
      <div class="icon-slot">Icon later</div>
      <h3>The False Alarm</h3>
      <!-- SLOT: false alarm -->
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.</p>
    </article>
    <article class="pain-card">
      <!-- SLOT: icon feedback loop -->
      <div class="icon-slot">Icon later</div>
      <h3>The Feedback Loop</h3>
      <!-- SLOT: feedback loop -->
      <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip.</p>
    </article>
    <article class="pain-card">
      <!-- SLOT: icon neuroplasticity -->
      <div class="icon-slot">Icon later</div>
      <h3>Neuroplasticity</h3>
      <!-- SLOT: neuroplasticity -->
      <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.</p>
    </article>
  </div>
</section>
`;
}
