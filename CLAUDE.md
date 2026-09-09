# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The book *Idiosyncrasies of the HTML parser* (<https://htmlparser.info/>). Prose lives in `manuscript/*.md`; Eleventy builds three outputs from that one source: the multi-page site, a single-page HTML version at `/book/`, and an EPUB.

## Commands

```sh
npm install
npm run build        # clean + build:html + build:epub
npm run build:html   # Eleventy -> _site/
npm run build:epub   # tools/build-epub.mjs -> _site/downloads/html-parser-book.epub
npm run serve        # dev server with watch
npm run debug        # Eleventy with DEBUG=*
```

Node >= 22 (`.nvmrc` pins 24). There is no test suite and no lint script; the automated checks are the `naked-url` and `curly-quote` linters inside `eleventy.config.mjs`, which print warnings during the build but never fail it. `build:epub` reads `_site/book/index.html`, so `build:html` must run first.

Netlify runs `npm run build` and publishes `_site` (`netlify.toml`).

## Writing style

The prose is Simon's own first-person account of standards work he took part in, so it makes claims about intent and history that only he can make. When drafting, stay inside what the cited sources support; when editing, don't put new first-person assertions in his mouth.

Voice:

- **"I" for the author's own history and research** — "One of my first contributions to the WHATWG, in June 2005, was to propose to change the doctype", "web compatibility research that I did in 2009", "As part of writing this book, I found a bug in Safari and Chrome".
- **"we" to walk the reader through an algorithm** — "Let's check", "Now we consume the `r`", "We clear the form element pointer, step 3 doesn't apply".
- **"you" for the reader's stake** — "You may recall from the Parsing a simple document section", "You may wonder why this attribute is needed in the first place", "Give it a try!".
- **Rhetorical question, then answer** is the main engine of exposition: "That's cool, but what does it have to do with parsing?", "The `input` is not a descendant of the `form`, but it is still associated with it. How?", "So what exactly is going on?"
- **Dry humor in short standalone sentences**, right after a surprise, never explained: "Sad panda.", "Oops.", "Wouldn't it, indeed.", "Everything else is dropped on the floor." Verdicts are stated flatly: "Having locale-specific default encodings on a global information network is, of course, also absurd."

The recurring explanation pattern, in order:

1. Pose a case — often a quiz reproduced from X, otherwise a short markup snippet.
2. The markup in an `html` code fence.
3. The exact governing spec clause as a block quote, introduced by naming it: "The *attribute name state* says:".
4. A numbered walk through the tokenizer or tree-builder states, one step per transition, quoting the current input character: "3. Consume "`p`": Reconsume in the *tag name state*."
5. The resulting DOM in a `dom-tree` code fence.
6. The answer, stated outright: "The correct answer is thus a comment node."

Then *why*, as history: dated links to primary sources — WHATWG and public-html mailing list archives, Bugzilla, WebKit bugs, `whatwg/html` commits, hixie.ch blog posts — often quoting a whole email at length. Browser behavior is attributed to named browsers and versions ("IE6 had an interesting HTML parser", "Firefox was at version 1.5"), with uncertainty hedged in place ("and maybe some other versions", "as far as I know"). #42 is a standing example of what an unsourced claim costs.

Quizzes: block quote the original X post verbatim, `#` escaped as `\#`, options as a bullet list, and don't reveal the answer until after the walkthrough.

Mechanics:

- One paragraph per line, no hard wrapping — lines run past 700 characters.
- Spec algorithm and state names in *italics*: *data state*, *before attribute name state*. Variables use `|foo|`, which renders as `<var>foo</var>`; the older prose still italicizes variables too, so converting those is fair game when touching a passage.
- Code spans distinguish tag from element on purpose: `<img>` and `</script>` for the tag, `p` element and `template` for the element. Single characters get both quotes and a code span: "`<`", "`/>`".
- Spec quotes are block quotes. A spec switch clause is quoted as a definition list — term line, `>`, then `> : consequence` — which `markdown-it-deflist` renders. Nested quotes use `> >`. Mark errors in quoted material with `[sic]` rather than fixing them silently.
- DOM trees go in `dom-tree` code fences with `#document`, `├──`, `│`, `└──`, `DOCTYPE: html`, `#text: `, and `elem attr="value"`. Generate them with `tools/dom-tree.html`. A whitespace-only text node shows as `#text: ` with the trailing space.
- Prose that continues a sentence across a code fence resumes with a leading `...` or `…`: "...is parsed into the following DOM tree:".
- ASCII `'` and `"` throughout; the `curly-quote` linter flags a curly one, except in a block quote (quoted material is verbatim) or in a row of the windows-1252 code point table, where the character is the specimen for its code point. Em dashes are rare (7 in the whole book).
- `e.g.,` and `i.e.,` with the comma. "Note that ..." is used freely.
- en-US spelling. `-ise` endings are mistakes to fix, except inside quoted material, which is reproduced verbatim (Hixie's "realise", Wikipedia's "analysing", and so on stay as written).
- `*` bullets with a blank line between items. Definition-style bullets take a bold lead-in: "**Void elements.** The list of conforming elements is: ...".
- `# Chapter N. Title` or `# Appendix X. Title`, then the chapter image, then `##` sections and `###` subsections. `####` is used twice in the whole book — avoid going deeper.
- Chapter images: one right after the `h1`, alt text a sentence-case sentence ending in a period ("A drawing of an upside-down tree."). Images are ChatGPT-generated, credited in the preface.
- Long quotes from people's private email are used with permission and thanked in the preface's acknowledgements. New ones need the same.

## Chapter structure

`manuscript/Book.txt` is the ordered list of chapter files; it drives the `book` collection, the table of contents, and chapter numbering. A file not listed there is invisible to both the TOC and the single-page build. `index.md` and `book.html` are the site home page and single-page shell, not chapters.

Chapter front matter:

```yaml
layout: chapter.njk
title: The HTML syntax   # short title, no "Chapter N." prefix
next: parser             # slug of the next chapter, or "end" for the last one
nextTitle: The HTML parser
toc: true                # render the per-page collapsible TOC
appendix: C              # optional; makes it "Appendix C." instead of a number
```

Chapter numbers come from position in `Book.txt` (`loop.index - 1`, so the preface is 0), but the `# Chapter 2. The HTML syntax` heading at the top of each file is hand-written. Reordering or inserting a chapter means updating those headings, the `next`/`nextTitle` chain, and any `{% ref %}` titles that spell out a chapter number.

## Cross-references

`{% ref "chapter-slug", "Link text" %}` resolves two ways:

- If the text exactly matches the chapter's `title`, `Chapter N. <title>`, or `Appendix X. <title>`, it links to the chapter page.
- Otherwise it slugifies the text into a fragment: `/<slug>/#<slugified-text>`.

A typo in a heading title therefore produces a silently broken fragment link rather than an error. `slugify` lowercases, collapses whitespace to `-`, and strips only `( ) : . , & ' \`` — other punctuation survives into the id.

## Heading ids and the single-page build

`h1` ids are forced to the file slug; `h2`–`h6` get ids from `markdown-it-anchor` with the same `slugify`. For the single-page version, `singlePageLinks` prefixes every `h2`–`h6` id with the chapter slug and rewrites `/<slug>/#<frag>` links to `#<slug>-<frag>` and `/<slug>/` to `#<slug>`. Duplicate ids across chapters are fine on the multi-page site but collide in the single page and in the EPUB, so keep section titles unique per chapter at minimum.

Single-page chapters are wrapped in `<section class="book-chapter" headingoffset="1">`; `build-epub.mjs` strips the `headingoffset` attribute.

## Markdown handling worth knowing

- `html: true`, plus `markdown-it-deflist` (the bibliography and the DOM node-type list in the introduction use definition lists).
- Images without explicit dimensions get `width`/`height` injected by parsing PNG/JPEG headers directly in `eleventy.config.mjs`. Only those two formats are handled.
- An `ellipsis` transform replaces every literal `...` with `…` across all output, including code blocks.
- A `var` core rule turns `|foo|` into `<var>foo</var>`. The pipes have to hug the content, so the pipes in "HTML 6 | Rubber Duck Engineering" are left alone; code spans are skipped, and so are table cells, since the table rule splits them before this runs. There is no escape for a hugging literal pipe: put it in a code span.
- Quiz blocks are block quotes of the original X posts; `#` is escaped as `\#`.

## EPUB generation

`tools/build-epub.mjs` is self-contained: no epub or zip dependency, it writes the ZIP byte by byte. It extracts `<main id="book">` from the single-page HTML, then converts it to XHTML by regex — closing void elements, escaping attribute entities, dropping `<script>`, and rewriting site-absolute links to fragments or absolute `htmlparser.info` URLs. Consequences:

- Changing the `<main id="book">` wrapper in `book-single.njk` breaks the build (it calls `die`).
- Markup that is valid HTML but not well-formed XML will produce an invalid EPUB, and nothing checks for it — `epubcheck` is not wired in.
- EPUB images must live under `/_assets/` and have a known media type (`.gif .jpg .jpeg .png .svg .webp`); an unknown extension throws, and a missing file degrades to an `[Image: alt]` paragraph.
- The nav/TOC is built from `h1` ids, i.e. one entry per chapter.

## Fixing an issue

One branch per issue, starting from a fresh `main`: `git switch main && git pull`, branch, research what the issue actually needs, fix it, remove the item from `TODO.md`, commit. Don't stack a second issue onto the same branch, and don't branch from whatever happens to be checked out.

## Commits

Subject line and nothing else. Don't describe the change; the diff shows it. Add a body only for something the diff can't hold, such as a measurement, a constraint, or an option that was rejected and why, and keep it to a sentence or two.

When fixing a reported issue, skip the description and just say "Fixes #123.".

A commit that touches `manuscript/` has its subject line posted to [@htmlparserbook](https://x.com/htmlparserbook), so subjects are public and should read on their own. Backticked code in a message is safe (it used to break the workflow, see `post-to-x.yml`).

## Other

- `.github/workflows/post-to-x.yml` posts the subject line of a commit pushed to `main` to [@htmlparserbook](https://x.com/htmlparserbook), so subject lines are public-facing. It only fires when the pushed commit itself touches `manuscript/`, to keep infra changes and dependabot bumps off the timeline.
- `tools/dom-tree.html` is a standalone DOM-tree serializer used while writing examples; it is not part of the build.
