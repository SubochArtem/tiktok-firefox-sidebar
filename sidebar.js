const frame = document.getElementById("tt");
browser.runtime.onMessage.addListener((msg) => {
  if (msg && msg.type === "reload-feed") frame.src = "https://www.tiktok.com/";
});
