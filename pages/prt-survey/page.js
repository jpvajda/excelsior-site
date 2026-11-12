import { Header } from "../../shared/header.js";
import { PromoBanner } from "../../shared/promo-banner.js";
import { Footer } from "../../shared/footer.js";
import { bindMenu } from "../../shared/menu.js";
import { bindTracking } from "../../shared/tracking.js";
import { bindNewsletter } from "../../shared/newsletter.js";
import { Survey } from "./survey.js";
import { bindSurvey } from "./bind-survey.js";

const app = document.querySelector("#app");

app.innerHTML = [
  PromoBanner("prt-survey"),
  Header("prt-survey"),
  `<main id="top">${Survey()}</main>`,
  Footer(),
].join("\n");

bindMenu();
bindTracking();
bindNewsletter();
bindSurvey();
