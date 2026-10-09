export function bindMenu() {
  var button = document.querySelector(".menu-toggle");
  var nav = document.getElementById("site-nav");

  if (!button || !nav) {
    return;
  }

  function setOpen(open) {
    button.setAttribute("aria-expanded", open ? "true" : "false");
    button.textContent = open ? "Close" : "Menu";
    nav.classList.toggle("is-open", open);
  }

  button.addEventListener("click", function () {
    var open = button.getAttribute("aria-expanded") === "true";
    setOpen(!open);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && button.getAttribute("aria-expanded") === "true") {
      setOpen(false);
      button.focus();
    }
  });

  nav.addEventListener("click", function (event) {
    if (event.target.closest("a")) {
      setOpen(false);
    }
  });
}
