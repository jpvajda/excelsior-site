# Excelsior LLC

One-page site for Pain Reprocessing Therapy coaching.

## Development

Run it locally from this folder:

```bash
python3 -m http.server 3000
```

Then open http://127.0.0.1:3000.


## Testing

Run the checks:

```bash
pnpm test
```

GitHub runs these on every pull request.

Edit a section in `components/`. Each file is a JavaScript function for that part of the page.

GitHub Pages: Settings → Pages → Deploy from a branch → `main` → `/ (root)`.

## Todos

Custom domain, after Pages is publishing from `main`:

1. At the domain host, point the name at GitHub. For `www.example.com`, add a CNAME record to `jpvajda.github.io`. For a bare name like `example.com`, use the A records in the GitHub Pages docs.
2. In the repo, go to Settings → Pages, enter the domain under Custom domain, and save.
3. After GitHub verifies the DNS, check Enforce HTTPS.

Relative links already work on that domain. Saving the domain writes a `CNAME` file into the repo.
