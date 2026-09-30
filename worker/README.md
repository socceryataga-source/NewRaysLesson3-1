# Cloudflare Worker setup

This Worker keeps the DeepL API key off GitHub Pages.

## Required

- Cloudflare account
- DeepL API key (DeepL API Free is sufficient for light classroom use)

## Cloudflare dashboard setup

1. Cloudflare > Workers & Pages
2. Create a Worker
3. Replace the default Worker code with `cloudflare-worker.js`
4. Deploy
5. Open Worker > Settings > Variables and Secrets
6. Add a SECRET:
   - Name: `DEEPL_API_KEY`
   - Value: your DeepL API key
7. Recommended: add a plain-text variable:
   - Name: `ALLOWED_ORIGINS`
   - Value: your GitHub Pages origin only

Example:

```text
https://your-account.github.io
```

If your Pages site uses a custom domain, use that origin instead.

8. Optional:
   - `DEEPL_PLAN=free` (default)
   - use `pro` only if you use DeepL API Pro

## Connect the site to the Worker

Copy your deployed Worker URL, for example:

```text
https://visualizing-translate.your-subdomain.workers.dev
```

Then edit `config.js`:

```js
translationEndpoint: "https://visualizing-translate.your-subdomain.workers.dev",
```

Do NOT put the DeepL API key in `config.js`, `app.js`, HTML, or any GitHub file.
