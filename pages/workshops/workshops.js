export const workshopInterestForm =
  "https://docs.google.com/forms/d/e/1FAIpQLSfVeUX0v6dp-Gq9xOvARHVypW99JEgCyEF5PvtAiMafOe6B4w/viewform";

const workshops = [
  {
    id: "prt-intro",
    title: "W1: Introduction to Pain Reprocessing Therapy and Somatic Therapy",
    meta: ["Free", "60 minutes", "Live on Zoom", { label: "Date TBD", className: "workshop-meta-date" }],
    summary:
      "This workshop is an introduction to Pain Reprocessing Therapy (PRT) and Somatic Therapy.",
    agenda: [
      "A short somatic practice to connect with our bodies",
      "Learn about what neuroplastic pain is",
      "Learn the fundamentals of Pain Reprocessing Therapy (PRT) and Somatic Therapy",
      "One volunteer will be coached through a live demo",
      "Q&A",
    ],
    signup: true,
  },
  {
    id: "coming-soon",
    title: "Coming soon",
    summary: "Additional workshops will be made available soon!",
    soon: true,
  },
];

function metaItem(item) {
  const label = typeof item === "string" ? item : item.label;
  const className = typeof item === "string" ? "" : ` class="${item.className}"`;
  return `<li${className}>${label}</li>`;
}

function card(workshop) {
  const meta = workshop.meta
    ? `<ul class="workshop-meta">${workshop.meta.map(metaItem).join("")}</ul>`
    : "";
  const agenda = workshop.agenda
    ? `<h3>What we will do</h3><ul>${workshop.agenda.map((item) => `<li>${item}</li>`).join("")}</ul>`
    : "";
  const signup = workshop.signup
    ? `<a class="button" data-workshop-signup="${workshop.id}" href="${workshopInterestForm}" target="_blank" rel="noopener noreferrer">Get on the list</a>`
    : "";
  const soon = workshop.soon ? " workshop-soon" : "";
  const agendaBlock = agenda ? `<div class="workshop-agenda">${agenda}</div>` : "";

  return `
<article class="caption workshop-card${soon}" id="${workshop.id}">
  <h2>${workshop.title}</h2>
  ${meta}
  <div class="workshop-body">
    <div class="workshop-copy">
      <p>${workshop.summary}</p>
      ${signup}
    </div>
    ${agendaBlock}
  </div>
</article>`;
}

export function Workshops() {
  return `
<section class="panel" id="workshops">
  <h1 class="workshop-heading">Workshops</h1>
  <p class="workshop-intro">
    <img src="../../images/workshop-lightbulb-icon.png" alt="" width="1254" height="1254">
    Free live workshops on Pain Reprocessing Therapy (PRT) and Somatic Therapy to introduce you to the basics of the practice and to provide a community for connection and healing.
  </p>
  <div class="workshop-list">
    ${workshops.map(card).join("\n")}
  </div>
</section>`;
}
