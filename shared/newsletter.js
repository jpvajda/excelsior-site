import { clearFormStatus, showFormError, showFormNote } from "./form-error.js";
import { trackNewsletterSignup } from "./tracking.js";

export const newsletterEndpoint = "https://excelsior-signup.john-vajda.workers.dev";

export function bindNewsletter() {
  const form = document.querySelector("[data-newsletter]");
  if (!form) return;

  const status = form.querySelector("[data-newsletter-status]");
  const button = form.querySelector("button");
  const emailInput = form.querySelector("input[type='email']");

  emailInput.addEventListener("invalid", (event) => {
    event.preventDefault();
    showFormError(status, emailInput.validationMessage, {
      placement: "footer",
      reason: "invalid_email",
    });
  });

  emailInput.addEventListener("input", () => {
    if (
      emailInput.value.trim() === "" &&
      status.querySelector("span")?.textContent === "Could not sign up. Try again."
    ) {
      clearFormStatus(status);
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.checkValidity()) return;

    const data = new FormData(form);
    const email = String(data.get("email") || "").trim();
    const signupHp = String(data.get("signup_hp") || "");
    clearFormStatus(status);
    button.disabled = true;

    try {
      const response = await fetch(newsletterEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, signup_hp: signupHp }),
      });
      if (!response.ok) {
        showFormError(status, "Could not sign up. Try again.", {
          placement: "footer",
          reason: "signup_failed",
        });
        return;
      }
      trackNewsletterSignup();
      showFormNote(status, "You're signed up.");
      form.reset();
    } catch {
      showFormError(status, "Could not sign up. Try again.");
    } finally {
      button.disabled = false;
    }
  });
}
