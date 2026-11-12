import { QUESTIONS, choicesFor } from "./score.js";

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function question(item) {
  const name = `q-${item.id}`;
  const choices = choicesFor(item)
    .map(
      (choice) =>
        `<label><input type="radio" name="${name}" value="${choice.value}"> ${escapeHtml(choice.label)}</label>`,
    )
    .join("\n      ");
  return `
<li>
  <fieldset class="fit-question">
    <legend>${escapeHtml(item.text)}</legend>
    <div class="fit-choices">
      ${choices}
    </div>
  </fieldset>
</li>`;
}

export function Survey() {
  return `
<section class="panel" id="prt-survey">
  <h1 class="fit-heading">PRT Survey</h1>
  <p>Answer all 13 questions in this survey and you will get a result that indicates if you are a good candidate for Pain Reprocessing Therapy and somatic coaching.</p>
  <p>Your answers only occur on this page and are not stored, saved, or sent anywhere.</p>
  <p>This is not medical care and not a diagnosis. It does not promise a result. If you have new, changing, or worrying symptoms, see your doctor first.</p>
  <form id="fit-form" class="ph-no-capture" autocomplete="off">
    <ol class="fit-questions">
      ${QUESTIONS.map(question).join("\n")}
    </ol>
    <p id="fit-status" class="fit-status" role="status" aria-live="polite"></p>
    <button class="button" type="submit">See my result</button>
  </form>
  <div id="fit-result" class="fit-result ph-no-capture" hidden>
    <h2 tabindex="-1" data-fit-title></h2>
    <p data-fit-body></p>
    <div class="fit-actions">
      <a class="button" data-discovery-call="prt-survey" href="https://scheduler.zoom.us/excelsior-llc/prt-discovery-call" target="_blank" rel="noopener noreferrer">Book a free discovery call</a>
      <button class="button button-quiet" type="button" data-fit-reset>Start over</button>
    </div>
  </div>
</section>`;
}
