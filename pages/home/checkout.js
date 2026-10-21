import { clearFormStatus, showFormError } from "../../shared/form-error.js";
import { trackPlanCheckout } from "../../shared/tracking.js";

export const checkoutEndpoint = "https://excelsior-checkout.john-vajda.workers.dev";

const failed = "Could not start checkout. Try again.";

export function bindCheckout() {
  for (const form of document.querySelectorAll("[data-plan-buy]")) {
    const status = form.querySelector("[data-checkout-status]");
    const button = form.querySelector("button");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const plan = form.getAttribute("data-plan-buy");
      const data = new FormData(form);
      const checkoutHp = String(data.get("checkout_hp") || "");
      clearFormStatus(status);
      button.disabled = true;

      try {
        const response = await fetch(checkoutEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan, checkout_hp: checkoutHp }),
        });
        if (!response.ok) {
          showFormError(status, failed, {
            placement: "options",
            reason: "checkout_failed",
            plan,
          });
          return;
        }
        const body = await response.json();
        if (!body.url) {
          showFormError(status, failed, {
            placement: "options",
            reason: "checkout_failed",
            plan,
          });
          return;
        }
        trackPlanCheckout(plan);
        if (typeof window.followCheckout === "function") window.followCheckout(body.url);
        else window.location.assign(body.url);
      } catch {
        showFormError(status, failed, {
          placement: "options",
          reason: "checkout_failed",
          plan,
        });
      } finally {
        button.disabled = false;
      }
    });
  }
}
