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
