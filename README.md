# USSS Elite Training Tracker

React + Vite app for United States Secret Service training records.

## Főbb funkciók

- Névsor és státuszkezelés
- Modul teljesítés jelölése 
- Dátum, oktató és lejárat napló
- Próbaidő figyelése
- CSV export jelentéshez
- Modul érvényesség hónapokban

## Használat

1. Telepítés

   ```bash
   cd usss-training
   npm install
   ```

2. Futtatás

   ```bash
   npm run dev
   ```

3. Előnézet

   - Nyisd meg a konzolban megjelenő `localhost` URL-t.

## GitHub Pages weboldal

A projekt automatikusan telepíthető GitHub Pages-re GitHub Actions használatával.

1. Hozd létre a repository-t GitHubon.
2. Állítsd be a távoli címet:

   ```bash
   git remote add origin https://github.com/<felhasználó>/<repo>.git
   git push -u origin main
   ```

3. A `main` branch minden frissítése után a GitHub Actions automatikusan felépíti és közzéteszi az appot a `dist` mappából.

4. A GitHub Pages beállításaiban válaszd a `gh-pages` branch-et, majd mentsd el.

> Ha nem telepített a `git`, előbb telepítsd a Git-et és a Node.js-t, majd futtasd a fenti parancsokat.

## GitHub feltöltés

1. Inicializáld a git tárolót:

   ```bash
   git init
   git add .
   git commit -m "Initial USSS training tracker"
   ```

2. Hozz létre egy repository-t GitHubon, majd állítsd be a távoli címet:

   ```bash
   git remote add origin https://github.com/<felhasználó>/<repo>.git
   git push -u origin main
   ```
