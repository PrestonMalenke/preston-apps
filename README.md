# Preston Apps

Standalone apps hub with a compact directory and independent application routes.

## Applications

- Water Explorer (external standalone project)
- Poudre River: `/standalone/poudre-fishing-dashboard.html`
- Avs Hub: `/apps/avs-hub/`
- Fall Cocktails: `/apps/fall-cocktails/`

## Development

```sh
npm install
npm run dev
npm run build
```

## Cloudflare Pages

- Production branch: `main`
- Build command: `npm run build`
- Output: `dist`
- Cloudflare Pages Function: `/api/avs` supplies NHL data to Avs Hub
- Public URL: https://preston-apps.pages.dev

PWE continues to host the original apps during migration verification. Keep API keys and private records out of this public repository.
