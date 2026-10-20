import { trackFormErrorDismissed, trackFormErrorShown } from "./tracking.js";

function imagePrefix() {
  return window.location.pathname.includes("/pages/") ? "../../" : "";
}

export function showFormError(status, message, details) {
  const icon = document.createElement("img");
  icon.src = `${imagePrefix()}images/error_icon.png`;
  icon.alt = "";
  icon.width = 512;
  icon.height = 512;
  const text = document.createElement("span");
  text.textContent = message;
  const close = document.createElement("button");
  close.type = "button";
  close.className = "form-error-close";
  close.setAttribute("aria-label", "Dismiss error");
  close.textContent = "X";
  close.addEventListener("click", () => {
    clearFormStatus(status);
    trackFormErrorDismissed(details);
  });
  status.classList.add("form-error");
  status.replaceChildren(icon, text, close);
  trackFormErrorShown(details);
}

export function showFormNote(status, message) {
  status.classList.remove("form-error");
  status.textContent = message;
}

export function clearFormStatus(status) {
  status.classList.remove("form-error");
  status.replaceChildren();
}
