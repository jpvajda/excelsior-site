const vimeoSrc =
  "https://player.vimeo.com/video/1235991016?badge=0&autopause=0&autoplay=1&dnt=1";

export function bindPromoVideo() {
  const button = document.querySelector("[data-promo-video]");
  if (!button) return;

  button.addEventListener("click", () => {
    const frame = document.createElement("iframe");
    frame.src = vimeoSrc;
    frame.title = "The pain and fear cycle";
    frame.allow =
      "autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share";
    frame.referrerPolicy = "strict-origin-when-cross-origin";
    frame.setAttribute("allowfullscreen", "");

    const shell = document.createElement("div");
    shell.className = "promo-video-frame";
    shell.append(frame);
    button.replaceWith(shell);
  });
}
