# Idiosyncrasies of the HTML parser

This book is published as a multi-page web book at <https://htmlparser.info/>. The same source also builds a single-page HTML version and an EPUB.

## Building locally

Install dependencies:

```sh
npm install
```

Build the multi-page HTML, single-page HTML, and EPUB:

```sh
npm run build
```

Outputs:

- `_site/` — deployable web site
- `_site/book/` — single-page HTML version
- `_site/downloads/html-parser-book.epub` — EPUB generated from the single-page HTML

Development server:

```sh
npm run serve
```

## Deployment

Netlify uses `netlify.toml` and runs `npm run build`, publishing `_site`.

## Deploy status

[![Netlify Status](https://api.netlify.com/api/v1/badges/cd9e0945-a45e-4645-9736-0d098b2fe9f2/deploy-status)](https://app.netlify.com/sites/htmlparser-info/deploys)
