// Remove TikTok's "continue in the app" overlays/banners.
const RE = /(open|continue|get|use|watch)[^.]{0,40}(tiktok )?app|tiktok app|open tiktok/i;

function sweep() {
  for (const el of document.querySelectorAll("div, section, aside, dialog")) {
    if (el.dataset.ttChecked) continue;
    const st = getComputedStyle(el);
    if (st.position !== "fixed" && st.position !== "sticky") continue;
    el.dataset.ttChecked = "1";
    if (RE.test(el.innerText || "") && (el.innerText || "").length < 300) {
      el.remove();
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
  }
}
new MutationObserver(sweep).observe(document.documentElement, { childList: true, subtree: true });
sweep();
