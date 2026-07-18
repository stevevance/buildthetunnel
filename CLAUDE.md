# BuildTheTunnel

## Live site

The site is hosted on GitHub Pages at a project path (no custom domain / CNAME):

- **Base URL:** https://stevevance.github.io/buildthetunnel/
- **Trip planner:** https://stevevance.github.io/buildthetunnel/planner/

Do **not** use `buildthetunnel.com` — that domain is not configured for this site.

## Deploys

Pushes to `main` deploy automatically via GitHub Pages. Check build status with:

```
gh api repos/stevevance/buildthetunnel/pages/builds/latest --jq '{status, commit: .commit, error: .error.message}'
```
