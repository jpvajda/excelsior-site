import { Header } from "./components/header.js";
import { Hero } from "./components/hero.js";
import { Understanding } from "./components/understanding.js";
import { Options } from "./components/options.js";
import { Process } from "./components/process.js";
import { WhoItsFor } from "./components/who-its-for.js";
import { About } from "./components/about.js";
import { Data } from "./components/data.js";
import { Questions } from "./components/questions.js";
import { BookACall } from "./components/book-a-call.js";
import { Footer } from "./components/footer.js";
import { bindMenu } from "./menu.js";

const app = document.querySelector("#app");

app.innerHTML = [
  Header(),
  `<main id="top">
    ${Hero()}
    ${Understanding()}
    ${Options()}
    ${Process()}
    ${WhoItsFor()}
    ${About()}
    ${Data()}
    ${Questions()}
    ${BookACall()}
  </main>`,
  Footer(),
].join("\n");

bindMenu();

document.addEventListener("click", (event) => {
  const link = event.target.closest("[data-discovery-call]");
  if (!link || !window.posthog) return;
  window.posthog.capture("discovery_call_clicked", {
    placement: link.getAttribute("data-discovery-call"),
  });
});
