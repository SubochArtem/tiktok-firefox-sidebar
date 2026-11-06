for (const el of document.querySelectorAll("[data-i18n]")) {
  el.textContent = browser.i18n.getMessage(el.dataset.i18n);
}

const frame = document.getElementById("tt");
browser.runtime.onMessage.addListener((msg, sender) => {
  // Ignore messages from content scripts or other extensions.
  if (sender.id !== browser.runtime.id || sender.tab) return;
  if (msg && msg.type === "reload-feed") frame.src = "https://www.tiktok.com/";
});

const auto = document.getElementById("auto");
browser.storage.local.get("autoScroll").then((r) => (auto.checked = !!r.autoScroll));
auto.addEventListener("change", () => browser.storage.local.set({ autoScroll: auto.checked }));
