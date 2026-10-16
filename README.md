# Shan Graphix

Website and admin app for Shan Graphix. React + Vite + Firebase (free plan only).

- **Public site:** Home, Work, Services, Order, About. Phones get a bottom bar; computers get a top bar.
- **Admin:** open `your-site-address/#/admin` once (the address then cleans itself), or tap the logo 5 times on the About page. Google sign-in for `vimukthih55@gmail.com` only.
- **Images** are compressed in your browser and stored inside Firestore, so Firebase Storage (paid) is not used.

## Firebase (one time)

1. **Authentication > Sign-in method:** turn on **Google**.
2. **Firestore Database:** create a database in production mode.
3. **Firestore > Rules:** paste the whole of `firestore.rules`, click **Publish**.
4. **Authentication > Settings > Authorized domains:** add `YOUR-USERNAME.github.io`.

## Publish on GitHub Pages

1. Create a new GitHub repository and upload the project files (keep the `.github` folder).
2. Repository **Settings > Pages > Build and deployment > Source: GitHub Actions**.
3. Every push to the `main` branch builds and publishes automatically.
4. Your site is at `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/`.

## Run on your computer

```bash
npm install
npm run dev
```

## Free plan limits to know

- Each design is stored as a small preview plus one full image (about 100 to 300 KB). Firestore gives 1 GB free, which is thousands of designs.
- The free plan allows 50,000 reads a day. A visit to the portfolio reads one item per design, so hundreds of daily visitors are fine.

## Security checklist

- [ ] Rules published.
- [ ] Restrict the browser API key to your site address (Google Cloud Console > APIs & Services > Credentials).
- [ ] Turn on 2-step verification for your admin Google account.
- [ ] Never share a service account key. This app does not need one.

The admin signs out after 30 minutes of no activity (`IDLE_LOGOUT_MS` in `src/config.js`).
