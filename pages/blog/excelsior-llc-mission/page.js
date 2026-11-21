import { Header } from "../../../shared/header.js";
import { PromoBanner } from "../../../shared/promo-banner.js";
import { Footer } from "../../../shared/footer.js";
import { bindMenu } from "../../../shared/menu.js";
import { bindTracking } from "../../../shared/tracking.js";
import { bindNewsletter } from "../../../shared/newsletter.js";
import { PostBody } from "./body.js";

const pageKey = "blog/excelsior-llc-mission";
const app = document.querySelector("#app");

app.innerHTML = [
  PromoBanner(pageKey),
  Header(pageKey),
  `<main id="top">${PostBody()}</main>`,
  Footer(),
].join("\n");

bindMenu();
bindTracking();
bindNewsletter();
