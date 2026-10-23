# CancerEmbed website

Static research companion for CancerEmbed. This folder contains only the website, paper, published figures, aggregate results, and synthetic interface examples.

## Publish on GitHub Pages

1. Create a public repository named `CancerEmbed` (or use a project organization).
2. Upload this folder's contents into the repository root, with `index.html` at the top level. Do not upload the ZIP itself.
3. Under Settings → Pages, select Deploy from a branch, then main and /(root), and Save.
4. Use the live URL displayed in Settings → Pages after deployment completes.

A project repository uses https://OWNER.github.io/CancerEmbed/. For an organization homepage, name the repository OWNER.github.io instead; its URL is https://OWNER.github.io/.

The assets and scripts use relative paths and support both homepage and project-repository deployments. No build tools, backend, credentials, or patient data are required.

## Preview locally

```bash
python3 -m http.server 8080
```

Open http://localhost:8080.
