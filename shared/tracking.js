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

    const dataSection = event.target.closest("[data-data-section]");
    if (dataSection) {
      window.posthog.capture("data_section_clicked", {
        placement: dataSection.getAttribute("data-data-section"),
      });
    }

    const email = event.target.closest("[data-support-email]");
    if (email) {
      window.posthog.capture("support_email_clicked", {
        placement: email.getAttribute("data-support-email"),
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

export function trackNewsletterSignup() {
  if (!window.posthog) return;
  window.posthog.capture("newsletter_signup", { placement: "footer" });
}

export function trackPlanCheckout(plan) {
  if (!window.posthog) return;
  window.posthog.capture("plan_checkout_started", { plan });
}

export function trackFormErrorShown({ placement, reason, plan } = {}) {
  if (!window.posthog) return;
  const properties = { placement, reason };
  if (plan) properties.plan = plan;
  window.posthog.capture("form_error_shown", properties);
}

export function trackFormErrorDismissed({ placement, reason, plan } = {}) {
  if (!window.posthog) return;
  const properties = { placement, reason };
  if (plan) properties.plan = plan;
  window.posthog.capture("form_error_dismissed", properties);
}
