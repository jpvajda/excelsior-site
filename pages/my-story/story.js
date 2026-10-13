export function Story() {
  return `
<article class="story">
  <figure class="story-banner">
    <img src="../../images/comic_hero_banner.png" alt="Comic banner of John P. Vajda in a blue suit and red cape, with Excelsior LLC and PRT for a better tomorrow." width="2170" height="725">
  </figure>
  <div class="story-body">
    <h1 id="story-title">My Story</h1>
    <p class="story-byline">John Vajda, Pain Reprocessing Therapy Coach</p>
    <!-- SLOT: story intro -->
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
    <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
  </div>
  <div class="story-body">
    <!-- SLOT: story heading 1 -->
    <h2>Section one</h2>
    <!-- SLOT: story section 1 -->
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.</p>
    <p>Donec ullamcorper nulla non metus auctor fringilla. Cras mattis consectetur purus sit amet fermentum. Aenean lacinia bibendum nulla sed consectetur.</p>
  </div>
  <figure class="story-figure" id="story-image-1">
    <!-- SLOT: story image 1. Replace the placeholder with an img. -->
    <div class="story-image-slot">Image later</div>
    <!-- SLOT: story image 1 caption -->
    <figcaption>Caption later</figcaption>
  </figure>
  <div class="story-body">
    <p>Vestibulum id ligula porta felis euismod semper. Maecenas faucibus mollis interdum. Nullam quis risus eget urna mollis ornare vel eu leo.</p>
  </div>
  <div class="story-body">
    <!-- SLOT: story heading 2 -->
    <h2>Section two</h2>
    <!-- SLOT: story section 2 -->
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur blandit tempus porttitor. Etiam porta sem malesuada magna mollis euismod.</p>
    <p>Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh.</p>
  </div>
  <figure class="story-figure" id="story-image-2">
    <!-- SLOT: story image 2. Replace the placeholder with an img. -->
    <div class="story-image-slot">Image later</div>
    <!-- SLOT: story image 2 caption -->
    <figcaption>Caption later</figcaption>
  </figure>
  <div class="story-body">
    <p>Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Cum sociis natoque penatibus et magnis dis parturient montes.</p>
  </div>
  <div class="story-body">
    <!-- SLOT: story heading 3 -->
    <h2>Section three</h2>
    <!-- SLOT: story section 3 -->
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed posuere consectetur est at lobortis. Donec sed odio dui. Cras justo odio, dapibus ac facilisis in.</p>
    <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.</p>
  </div>
  <figure class="story-figure" id="story-image-3">
    <!-- SLOT: story image 3. Replace the placeholder with an img. -->
    <div class="story-image-slot">Image later</div>
    <!-- SLOT: story image 3 caption -->
    <figcaption>Caption later</figcaption>
  </figure>
  <div class="story-body">
    <!-- SLOT: story close -->
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet.</p>
  </div>
</article>
`;
}
