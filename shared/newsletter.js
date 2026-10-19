import { trackNewsletterSignup } from "./tracking.js";

export const newsletterEndpoint = "https://excelsior-signup.john-vajda.workers.dev";

export function bindNewsletter() {
  const form = document.querySelector("[data-newsletter]");
  if (!form) return;

  const status = form.querySelector("[data-newsletter-status]");
  const button = form.querySelector("button");
  const emailInput = form.querySelector("input[type='email']");

  emailInput.addEventListener("input", () => {
    if (
      emailInput.value.trim() === "" &&
      status.textContent === "Could not sign up. Try again."
    ) {
      status.textContent = "";
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = new FormData(form);
    const email = String(data.get("email") || "").trim();
    const signupHp = String(data.get("signup_hp") || "");
    status.textContent = "";
    button.disabled = true;

    try {
      const response = await fetch(newsletterEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, signup_hp: signupHp }),
      });
      if (!response.ok) {
        status.textContent = "Could not sign up. Try again.";
        return;
      }
      trackNewsletterSignup();
      status.textContent = "You're signed up.";
      form.reset();
    } catch {
      status.textContent = "Could not sign up. Try again.";
    } finally {
      button.disabled = false;
    }
  });
}
