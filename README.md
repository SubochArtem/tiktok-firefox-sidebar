# TikTok Sidebar

Firefox extension that shows TikTok in the sidebar.

## Run
- Temporary: `about:debugging` → This Firefox → Load Temporary Add-on → pick `manifest.json`
- Or: `npx web-ext run`

Toggle the sidebar with the toolbar button or `View → Sidebar → TikTok`.

## How it works
`sidebar.html` embeds tiktok.com in an iframe. `background.js` removes `X-Frame-Options` /
CSP `frame-ancestors` from TikTok sub-frame responses.

## Notes
- If login doesn't stick, log in once on tiktok.com in a normal tab; Firefox's cookie
  partitioning can affect third-party frames.
- Personal-use tool; TikTok may change its embedding rules at any time.
