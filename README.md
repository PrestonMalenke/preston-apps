# Preston Apps

A lightweight, standalone directory for Preston's personal web applications.

## Current status
- **Water Explorer:** live, links to its existing standalone site.
- **Poudre River, Avs Hub, Fall Cocktails:** placeholders until the apps are migrated out of PWE.

## Deployment
This hub currently uses plain HTML and CSS (no build framework or environment variables).

For **Cloudflare Pages** with Git integration:
- Production branch: `main`
- Framework preset: None
- Build command: leave blank
- Build output directory: `/` (repository root)

The existing PWE code remains untouched until each migrated application is working in this hub.

## Adding apps
Add an app card to `index.html`; add or update the page assets as needed. Avoid exposing API keys or private data in this public repository.
