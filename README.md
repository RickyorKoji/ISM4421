# FAU Owls Weather 🦉

A lightweight, FAU-branded weather app defaulting to **Boca Raton, FL** (home of
Florida Atlantic University). Built with plain HTML/CSS/JS — no build step,
no API keys, no server required.

- **Weather data:** [Open-Meteo](https://open-meteo.com/) forecast API (current
  conditions, 24-hour hourly forecast, 7-day daily forecast).
- **Geocoding:** Open-Meteo's free geocoding API, used for the city search box.
- **Location:** Defaults to Boca Raton, FL (26.3683, -80.1289). Users can search
  any city or click "My Location" to use browser geolocation.
- **Branding:** FAU blue (`#003366`) and FAU red (`#CC0000`) color palette.

## Logo note

`assets/fau-owl-logo.svg` and `assets/favicon.svg` are **original, stylized owl
icons** created for this project in FAU's brand colors — they are **not** the
official Florida Atlantic University logo or trademark. If you have rights to
use FAU's official wordmark/logo assets, swap those files in before using this
publicly under an FAU-affiliated name. This project is not an official FAU
website.

## Project structure

```
.
├── index.html       # App markup
├── style.css        # FAU-themed styling
├── app.js           # Open-Meteo fetch logic + rendering
├── assets/
│   ├── fau-owl-logo.svg
│   └── favicon.svg
├── netlify.toml      # Netlify build/publish config
└── README.md
```

## Running locally

No build tools needed. Just serve the folder statically, e.g.:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

or with Node:

```bash
npx serve .
```

## Deploying to Netlify

This repo is ready to deploy as-is — it's a static site with no build command.

**Option A — Netlify UI (Git-connected, recommended):**
1. Push this repo to GitHub (already done if you're reading this in the repo).
2. In Netlify: **Add new site → Import an existing project** → choose this
   GitHub repo.
3. Build settings are auto-detected from `netlify.toml`:
   - Build command: *(none)*
   - Publish directory: `.`
4. Click **Deploy site**. Netlify will give you a live URL immediately, and
   every future push to this branch will auto-deploy.

**Option B — Netlify CLI:**
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```
When prompted for a publish directory, use `.` (the repo root).

**Option C — Drag and drop:**
Zip the project folder (or just drag the folder) into
[app.netlify.com/drop](https://app.netlify.com/drop) for an instant deploy —
no git or CLI required.

No environment variables or secrets are needed since Open-Meteo requires no
API key.
