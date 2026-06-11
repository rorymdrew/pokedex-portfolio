# RORY DEX — Pokédex Portfolio

A personal portfolio for **Rory Drew**, styled after the HeartGold/SoulSilver Pokédex.
Pure HTML/CSS/JS — no frameworks, no npm, no build step. The only external dependency
is Google Fonts (Press Start 2P + VT323).

## File structure

```
index.html    — all content (fully selectable/copyable text, ATS-friendly)
style.css     — HG/SS Pokédex styling, responsive layout, CRT overlay
script.js     — boot animation, panel navigation, Empoleon pixel sprite, stat bars
assets/       — drop headshot.jpg here (the site falls back to a placeholder if missing)
```

## Run locally

Just open `index.html` in any browser. No server needed.

## Deploy to GitHub Pages

1. **Create the repo.** On [github.com/new](https://github.com/new), create a public
   repository — e.g. `pokedex-portfolio`. Don't add a README (you already have one).

2. **Push the files.** From this folder:

   ```bash
   git init
   git add .
   git commit -m "Initial commit: RORY DEX portfolio"
   git branch -M main
   git remote add origin https://github.com/rorymdrew/pokedex-portfolio.git
   git push -u origin main
   ```

   (Or skip the terminal: on the empty repo page click **"uploading an existing file"**
   and drag this folder's contents in.)

3. **Enable Pages.** In the repo: **Settings → Pages → Build and deployment**.
   Set **Source** to "Deploy from a branch", **Branch** to `main` / `(root)`, and save.

4. **Wait ~1 minute**, then visit:

   ```
   https://rorymdrew.github.io/pokedex-portfolio/
   ```

   The pattern is always `https://rorymdrew.github.io/[repo-name]/`.

   > Tip: name the repo `rorymdrew.github.io` instead and the site deploys to the
   > root URL `https://rorymdrew.github.io/` with no suffix.

5. **Custom domain (optional).** In **Settings → Pages → Custom domain**, enter your
   domain. Then at your DNS provider, add a `CNAME` record pointing `www` (or a
   subdomain) to `rorymdrew.github.io`. Check "Enforce HTTPS" once the cert issues.

## Trainer portrait

The trainer-card portrait is `assets/brock.png` (Brock's HG/SS VS sprite). To swap
it, replace that file with any image; the gold frame and pixelated rendering apply
automatically. If the file is missing, a pixel-art placeholder shows instead.

## Customizing

- **Content** — everything lives in `index.html` as plain HTML; edit text directly.
- **Stat values** — change `data-value="92"` on each `.stat-row` in `index.html`.
- **Colors** — all palette values are CSS variables at the top of `style.css`.
- **Sprite** — the Empoleon pixel map is the `SPRITE` array in `script.js`
  (one character per pixel: `N`avy, `S`teel, `G`old, `W`hite, `K` outline, `.` empty).
