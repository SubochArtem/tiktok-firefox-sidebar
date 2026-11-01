// Removes TikTok's "continue in the app" overlays. Runs only inside the sidebar frame.
if (window.top !== window) {
  const APP_PROMPT = /(open|continue|get|use|watch)[^.]{0,40}(tiktok )?app|tiktok app|open tiktok/i;

  function sweep() {
    for (const el of document.querySelectorAll("div, section, aside, dialog")) {
      if (el.dataset.ttChecked) continue;
      const position = getComputedStyle(el).position;
      if (position !== "fixed" && position !== "sticky") continue;
      el.dataset.ttChecked = "1";
      const text = el.innerText || "";
      if (text.length < 300 && APP_PROMPT.test(text)) {
        el.remove();
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
      }
    }
  }

  let timer = null;
  new MutationObserver(() => {
    if (timer) return;
    timer = setTimeout(() => {
      timer = null;
      sweep();
    }, 500);
  }).observe(document.documentElement, { childList: true, subtree: true });
  sweep();
}
