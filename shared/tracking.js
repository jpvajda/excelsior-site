export function bindTracking() {
  document.addEventListener("click", (event) => {
    if (!window.posthog) return;

    const booking = event.target.closest("[data-discovery-call]");
    if (booking) {
      window.posthog.capture("discovery_call_clicked", {
        placement: booking.getAttribute("data-discovery-call"),
      });
    }

    const story = event.target.closest("[data-my-story]");
    if (story) {
      window.posthog.capture("my_story_clicked", {
        placement: story.getAttribute("data-my-story"),
      });
    }

    const video = event.target.closest("[data-promo-video]");
    if (video) {
      window.posthog.capture("promo_video_played", {
        placement: video.getAttribute("data-promo-video"),
      });
    }
  });
}
