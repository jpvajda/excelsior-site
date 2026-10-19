import { Header } from "../../shared/header.js";
import { PromoBanner } from "../../shared/promo-banner.js";
import { Footer } from "../../shared/footer.js";
import { bindMenu } from "../../shared/menu.js";
import { bindTracking } from "../../shared/tracking.js";
import { bindNewsletter } from "../../shared/newsletter.js";
import { Story } from "./story.js";

const app = document.querySelector("#app");

app.innerHTML = [PromoBanner("my-story"), Header("my-story"), `<main id="top">${Story()}</main>`, Footer()].join(
  "\n",
);

bindMenu();
bindTracking();
bindNewsletter();
