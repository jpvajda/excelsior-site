import { QUESTIONS } from "./score.js";

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function question(item) {
  const name = `q-${item.id}`;
  return `
<li>
  <fieldset class="fit-question">
    <legend>${escapeHtml(item.text)}</legend>
    <div class="fit-choices">
      <label><input type="radio" name="${name}" value="yes"> Yes</label>
      <label><input type="radio" name="${name}" value="no"> No</label>
    </div>
  </fieldset>
</li>`;
}

export function Survey() {
  return `
<section class="panel" id="fit-check">
  <h1 class="fit-heading">Fit Check</h1>
  <p>Answer ten yes or no questions. You get a result on this page about whether you look like a candidate for Pain Reprocessing Therapy and somatic coaching.</p>
  <p>Seven or more yes answers: a strong candidate. Four, five, or six: you could benefit, and you might not be the strongest candidate. Zero to three: not the strongest candidate.</p>
  <p>Your answers stay on this page. They are not saved, and they are not sent. Finishing records only the result band, the same way other button clicks on this site are counted.</p>
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
    <p>If you have new, changing, or worrying symptoms, see your doctor first.</p>
    <div class="fit-actions">
      <a class="button" data-discovery-call="fit-check" href="https://scheduler.zoom.us/excelsior-llc/prt-discovery-call" target="_blank" rel="noopener noreferrer">Book a free discovery call</a>
      <button class="button button-quiet" type="button" data-fit-reset>Start over</button>
    </div>
  </div>
</section>`;
}
