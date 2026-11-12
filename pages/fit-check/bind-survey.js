import { clearFormStatus, showFormError } from "../../shared/form-error.js";
import { trackFitCheckCompleted } from "../../shared/tracking.js";
import { QUESTIONS, resultForYesCount } from "./score.js";

function readYesCount(form) {
  let yes = 0;
  for (const question of QUESTIONS) {
    const selected = form.querySelector(`input[name="q-${question.id}"]:checked`);
    if (!selected || (selected.value !== "yes" && selected.value !== "no")) return null;
    if (selected.value === "yes") yes += 1;
  }
  return yes;
}

export function bindSurvey() {
  const form = document.querySelector("#fit-form");
  const status = document.querySelector("#fit-status");
  const result = document.querySelector("#fit-result");
  if (!form || !status || !result) return;

  const title = result.querySelector("[data-fit-title]");
  const body = result.querySelector("[data-fit-body]");
  const reset = result.querySelector("[data-fit-reset]");

  form.addEventListener("change", () => {
    result.hidden = true;
    result.removeAttribute("data-band");
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const yesCount = readYesCount(form);
    const scored = yesCount === null ? null : resultForYesCount(yesCount);
    if (!scored) {
      showFormError(status, "Answer every question.", {
        placement: "fit-check",
        reason: "incomplete",
      });
      result.hidden = true;
      result.removeAttribute("data-band");
      form.querySelector("fieldset:not(:has(input:checked)) input")?.focus();
      return;
    }

    clearFormStatus(status);
    title.textContent = scored.title;
    body.textContent = scored.body;
    result.dataset.band = scored.band;
    result.hidden = false;
    trackFitCheckCompleted(scored.band);
    title.focus();
  });

  reset?.addEventListener("click", () => {
    form.reset();
    clearFormStatus(status);
    result.hidden = true;
    result.removeAttribute("data-band");
    form.querySelector("input")?.focus();
  });
}
