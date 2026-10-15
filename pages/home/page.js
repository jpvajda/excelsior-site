import { Header } from "../../shared/header.js";
import { PromoBanner } from "../../shared/promo-banner.js";
import { Footer } from "../../shared/footer.js";
import { bindMenu } from "../../shared/menu.js";
import { bindTracking } from "../../shared/tracking.js";
import { bindPromoVideo } from "./promo-video.js";
import { Hero } from "./hero.js";
import { Understanding } from "./understanding.js";
import { Options } from "./options.js";
import { Process } from "./process.js";
import { WhoItsFor } from "./who-its-for.js";
import { About } from "./about.js";
import { Data } from "./data.js";
import { Questions } from "./questions.js";
import { BookACall } from "./book-a-call.js";

const app = document.querySelector("#app");

app.innerHTML = [
  PromoBanner(),
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
bindTracking();
bindPromoVideo();
