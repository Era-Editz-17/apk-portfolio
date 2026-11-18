# NEXORA — iOS & Web Liquid Glass PWA (`web-pwa/`)

**THINK. SOLVE. MASTER.** • **COMBINED MATHEMATICS • PHYSICS • CHEMISTRY.**

This folder is a standalone, zero-build **iOS Safari Progressive Web App (PWA)** version of NEXORA that:
- Uses native Safari `backdrop-filter` Apple Liquid Glass (Light & Dark adaptive).
- Supports **Add to Home Screen** on iPhone & iPad (`manifest.webmanifest`, `apple-mobile-web-app-capable`, `sw.js`).
- Syncs with the **same Firebase project & Firestore database** (`gen-lang-client-0825946280` / `ai-studio-android-luminaai-b56decd0-dfb6-4290-89e6-09abe46bcdbe`), plus includes **Device-Only Mode** if opened locally.
- Bundles offline **KaTeX + Noto Sans Sinhala** so Sinhala inside LaTeX (`\text{...}`) never renders blank.
- Renders interactive zoomable **STEM SVG diagrams** and connects all 11 usable free-tier models (`gemini-4-hydrogen`, `gemini-3.8-flash`, `gemini-3.5-flash-lite`, `gemma-4-31b-it`, etc.) with each user's personal Gemini API key.

## Deploy to Firebase Hosting (Recommended for iPhone Friends)
From the project root:
```bash
firebase deploy --only hosting
```
Then open the resulting `https://gen-lang-client-0825946280.web.app` link on iPhone Safari and tap **Share → Add to Home Screen**.

## Or Test Locally
```bash
npx serve web-pwa
```
