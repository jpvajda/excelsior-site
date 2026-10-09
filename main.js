import { Header } from "./components/header.js";
import { Hero } from "./components/hero.js";
import { Problem } from "./components/problem.js";
import { Offer } from "./components/offer.js";
import { HowItWorks } from "./components/how-it-works.js";
import { WhoItsFor } from "./components/who-its-for.js";
import { About } from "./components/about.js";
import { Stories } from "./components/stories.js";
import { Questions } from "./components/questions.js";
import { BookACall } from "./components/book-a-call.js";
import { Footer } from "./components/footer.js";
import { bindMenu } from "./menu.js";

const app = document.querySelector("#app");

app.innerHTML = [
  Header(),
  `<main id="top">
    ${Hero()}
    ${Problem()}
    ${Offer()}
    ${HowItWorks()}
    ${WhoItsFor()}
    ${About()}
    ${Stories()}
    ${Questions()}
    ${BookACall()}
  </main>`,
  Footer(),
].join("\n");

bindMenu();
