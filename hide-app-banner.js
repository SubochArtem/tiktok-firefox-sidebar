// Run only inside an embedded frame (the sidebar), never in a normal TikTok tab.
if (window.top !== window) {
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
let timer = null;
new MutationObserver(() => {
  if (timer) return;
  timer = setTimeout(() => { timer = null; sweep(); }, 500); // debounce
}).observe(document.documentElement, { childList: true, subtree: true });
sweep();

}
