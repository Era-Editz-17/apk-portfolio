# Developer Portfolio & APK Showcase

A modern, fast, responsive personal website designed to showcase Android apps, provide direct `.apk` downloads, display social profiles, and generate revenue through ads & developer tips.

---

## 📁 Project Structure

```text
apk-portfolio/
├── index.html        # Main webpage (About me, socials, APK cards, ad slots)
├── styles.css        # Sleek dark-theme styling & responsive design
├── app.js            # Interactivity (copy wallet, download notifications, toast alerts)
└── downloads/        # (Optional) Folder where you can drop your local .apk files
```

---

## 📲 How to Connect Your `.apk` Downloads

You have two simple, free ways to host your APK files:

### Option 1: GitHub Releases (Recommended for unlimited bandwidth & large files)
1. In your GitHub repository, click **Releases** → **Draft a new release**.
2. Tag a version (e.g., `v1.0.0`) and upload your `.apk` file (GitHub allows up to **2 GB per file** for free).
3. Right-click the uploaded `.apk` link on GitHub and copy the direct URL.
4. In `index.html`, find the `<a class="download-btn" href="#">` and replace `#` with that direct URL:
   ```html
   <a href="https://github.com/yourusername/app/releases/download/v1.0.0/app-release.apk" class="btn btn-primary download-btn" download>
   ```

### Option 2: Local `downloads/` Folder
1. Create a `downloads` folder inside this project folder:
   ```text
   apk-portfolio/downloads/my-app.apk
   ```
2. In `index.html`, set the link:
   ```html
   <a href="downloads/my-app.apk" class="btn btn-primary download-btn" download>
   ```

---

## 💰 How to Earn Money (Monetization Guide)

### 1. Website Ads
* **Google AdSense**: Apply once your website is deployed. Note: AdSense prefers sites with some text content and clean navigation. When approved, copy your AdSense script and paste it inside the `<div class="ad-placeholder">` sections in `index.html`.
* **Adsterra / Infolinks / EthicalAds**: Faster approval alternatives for developers and tech-oriented websites.

### 2. In-App Ads (Highest Earning for Android Developers)
* Rather than relying solely on website traffic, the most profitable route is to integrate **Google AdMob** or **AppLovin** directly inside your Android app code before compiling the `.apk`. That way, you earn revenue every time a user opens the app or views banner/interstitial ads on their phone.

### 3. Developer Support / Tips
* **Buy Me a Coffee / Ko-fi**: Replace `yourusername` in `index.html` with your actual username.
* **Crypto Tips**: Replace the placeholder wallet addresses in `index.html` (lines ~265) with your actual USDT/BTC/ETH addresses.

---

## 🚀 How to Publish for Free (Zero Cost)

### Method A: Netlify Drop (Easiest - takes 30 seconds)
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop) (create a free account if you haven't).
2. Drag and drop the `apk-portfolio` folder into the browser window.
3. Your site is instantly live with a free SSL certificate and a URL like `https://random-name.netlify.app`.
4. Go to **Site settings** → **Change site name** to pick your own custom name (e.g., `https://mydevname.netlify.app`).

### Method B: GitHub Pages
1. Create a new repository on [github.com](https://github.com).
2. Upload the files (`index.html`, `styles.css`, `app.js`).
3. Go to **Settings** → **Pages** → under **Branch**, choose `main` and click **Save**.
4. Your site will be live at `https://yourusername.github.io/repository-name/`.
