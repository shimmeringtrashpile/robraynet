# Deployment (production)

This site is a static Astro build. Production is the **`dist/`** folder, uploaded to Cloudflare **R2** bucket **`robray-net`** using the **MinIO Client** (`mc`).

## Prerequisites

- **Node.js ≥ 22.12** (see `.nvmrc`). From the repo root: `nvm use`
- Dependencies: `npm install`
- **MinIO Client** (`mc`) installed and on your `PATH`
- An **R2 API token** with permission to read/write objects in the buckets you deploy to

## One-time: `mc` alias for R2

An alias is a short name for your R2 endpoint plus credentials.

1. In the Cloudflare dashboard, open **R2** and note your **Account ID**.
2. Create an **R2 API token** (read/write as needed). Save the **Access Key ID** and **Secret Access Key** when shown.
3. R2 S3 API endpoint:

   ```text
   https://<ACCOUNT_ID>.r2.cloudflarestorage.com
   ```

4. Choose an alias name (example: `robray-r2`) and run:

   ```bash
   mc alias set robray-r2 https://<ACCOUNT_ID>.r2.cloudflarestorage.com <ACCESS_KEY_ID> <SECRET_ACCESS_KEY>
   ```

5. Confirm:

   ```bash
   mc alias list
   mc ls robray-r2
   ```

You should see the **`robray-net`** bucket in the listing.

Treat the secret key like a password. If it leaks, revoke the token in Cloudflare and create a new one.

## Build the static site

From the repository root:

```bash
nvm use
npm install
npm run build
```

This writes **`dist/`** (HTML, assets, sitemap, and legacy `*.html` redirect stubs).

### Public URL for sitemap and canonical links

The build uses your real site URL for the sitemap and redirect stubs. By default that is **`https://robray.net`**. To override for one build:

```bash
SITE=https://robray.net npm run build
```

(`PUBLIC_SITE_URL` is also supported.)

## Upload to R2

Sync **only** `dist/` into the bucket. Replace **`robray-r2`** with the alias you chose above.

```bash
mc mirror ./dist robray-r2/robray-net --overwrite
```

- **`./dist`** — local build output (what Astro produced).
- **`robray-r2/robray-net`** — `alias` / `bucket-name`.
- **`--overwrite`** — replace objects that already exist when files changed.

## Optional checks before or after upload

- **Local preview of the production build** (after `npm run build`):

  ```bash
  npm run preview
  ```

- After upload, open the live site in a browser and spot-check the home page, one inner page, and **`/sitemap-index.xml`** if you rely on search indexing.

## Quick reference (routine deploy)

```bash
nvm use
npm run build
mc mirror ./dist robray-r2/robray-net --overwrite
```

Change **`robray-r2`** if your alias name is different.
