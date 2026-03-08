# Copilot Instructions — gurugram.online

## Architecture

This is a **single-file static site** — all HTML, CSS, and JavaScript live in `index.html` (2,266 lines). There is no build step, no bundler, no npm dependencies, and no frameworks. Pure vanilla JS (ES6+), HTML5, CSS3.

- **`<style>` block** inside `<head>` — all CSS
- **`<script>` block** at end of `<body>` — all JavaScript
- **`server.js`** — minimal Node.js HTTP server for local development only
- **`firebase.json`** — deploys the repo root (`.`) as-is to Firebase Hosting

## Running Locally

```bash
# Option 1: Node.js server (port 3000)
node server.js

# Option 2: Firebase local emulator (port 5000)
npx firebase serve --only hosting --port 5000
```

VS Code's Live Server extension uses port 5500 (configured in `.vscode/launch.json`).

There are no tests or linters.

## Deployment

Pushing to `main` automatically deploys to production Firebase Hosting (`gurugram-online1`) via GitHub Actions (`.github/workflows/firebase-hosting-merge.yml`). No manual deploy step needed.

> ⚠️ The PR preview workflow (`.github/workflows/firebase-hosting-pull-request.yml`) references `npm ci && npm run build` but no `package.json` exists — PR checks will fail. Match the merge workflow (skip the build step) if adding PR preview support.

## Key Conventions

### All code goes in `index.html`
Do not create separate `.js` or `.css` files. CSS belongs in the `<style>` block, JavaScript in the `<script>` block at end of `<body>`.

### CSS custom properties — use them for everything
All colors, shadows, spacing, and radii are defined as CSS variables on `:root`. Always use variables instead of hardcoded values:

```css
--accent: #D4A853        /* gold — primary brand color */
--accent2: #00C9B1       /* cyan — secondary accent */
--bg: #0A0F1E            /* primary dark background */
--surface: #1A1A2E       /* card background */
--text: #F5F5F5          /* primary text */
--text2: #9A9A9A         /* secondary text */
--radius: 16px           /* large border radius */
--radius-sm: 10px        /* small border radius */
--glass: rgba(26,26,46,0.6)           /* glassmorphism bg */
--glass-border: rgba(255,255,255,0.08) /* glassmorphism border */
```

### Glassmorphism pattern
Cards and overlays use:
```css
background: var(--glass);
border: 1px solid var(--glass-border);
backdrop-filter: blur(20px) saturate(180%);
border-radius: var(--radius);
```

### Section structure
Each content section follows this pattern:
```html
<section id="sectionname" class="section">
  <div class="container">
    <div class="section-header reveal">
      <h2 class="section-title">Title</h2>
      <p class="section-sub">Subtitle</p>
    </div>
    <div class="grid"> <!-- or specific grid class -->
      <!-- cards -->
    </div>
  </div>
</section>
```

Add `class="reveal"` to elements that should fade in on scroll (handled by IntersectionObserver).

### Badge colors
Use these predefined badge modifier classes: `badge-blue`, `badge-green`, `badge-orange`, `badge-purple`, `badge-red`, `badge-teal`, `badge-gold`.

### Initializing new features
Add function calls at the **very end** of the `<script>` block, after the CSS injection block. Weather and AQI are initialized there as the pattern to follow:
```javascript
loadWeather();
loadAQI();
// add new init calls here
```

### Hardcoded location
The site is hardcoded to Gurugram:
```javascript
const LAT = 28.4595;
const LON = 77.0266;
```

### External APIs (no API keys required)
- **Weather**: `https://api.open-meteo.com/v1/forecast`
- **Air Quality**: `https://air-quality-api.open-meteo.com/v1/air-quality`
- **Reverse Geocoding**: OpenStreetMap Nominatim (`https://nominatim.openstreetmap.org/reverse`)
- **Maps links**: Google Maps URLs opened directly in new tab

### Filtering / hiding cards
Use the `.nm-hidden` class to hide cards (toggled by filter buttons and search). The search system uses `.search-highlight` for matched text.

### Typography
- **Headings**: `'Playfair Display'` (serif)
- **Body**: `'DM Sans'` (sans-serif)
- Both loaded via Google Fonts CDN in `<head>`
