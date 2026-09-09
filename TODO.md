# TODO

Open issues and PRs as of 2026-09-09.

## Pull requests

- #95 — Bump brace-expansion 1.1.15 → 1.1.18 (dependabot, mergeable, clean).
- #94 — Bump js-yaml 3.14.2 → 3.15.2 (dependabot, mergeable, clean).
- #41 — WIP scripting. Draft, still mergeable. Adds intro prose and `document.write()` description to `scripting.md`, but leaves an empty `![]()` for the HTML standard's parser diagram, a "TODO discuss nested document.write limit", an empty "The scripting flag and the `noscript` element" section, and the existing bare `TODO`s.
- #24 — Expand on srcset and sizes. **Conflicting**; base predates the current `### Sizes` section in `microsyntaxes.md`, so it needs a rebase. Also has 5 unresolved `TODO`s (CSS value syntax link, media condition vs media query rationale, whether *width* was dropped, `min()`/`max()`/`clamp()` dates and browser support, a min/max example).

## Security chapter

`security.md` is still three bare `TODO`s, so most of these are unwritten rather than incomplete.

- #19 — Explain how changes to the HTML parser can cause XSS problems.
- #76 — Hoisting attributes causes DOM clobbering with `getElementById` (PortSwigger service worker hijacking research).
- #1 — Use the Google `noscript` XSS as an example.
- #55 — Trusted Types.
- #56 — Sanitizer API.
- #74 — CWE over time (NVD visualization; owner later added a 2025 MITRE/CISA "XSS ranked #1" link in the thread).

## Parser and spec content

- #84 — Reader wants detail on special tags: what "namespace boundaries" meant in the 2008 whatwg post, why exactly `mi`/`mo`/`mn`/`ms`/`mtext` are MathML text integration points, and the rationale for the element set in "has an element in scope".
- #45 — Document `document.execCommand` with `insertHTML` under "Other parser APIs" in `scripting.md`. The linked Trusted Types issue is also a case study for the security chapter.
- #44 — Write something about declarative shadow DOM.
- #37 — Add a section about XML declaration character encoding, near "Bogus comments".
- #42 — Clarify SGML vs WebSGML (ENR+WWW) for `/>`. The book's claim that `<link ... />` and `<link ... >>` are equivalent is disputed; the 1998 WebSGML NETENABL / IMMEDNET features are the relevant part. Verify before rewriting.
- #43 — Link the msedgedev post on modernizing Edge's DOM tree, for the IE6 DOM discussion.

## Clarity, from reader confusion

- #29 — Nested forms confused a reader over which element *node* and "current node" refer to. Owner's own conclusion: spec quotes in the book should carry links and mark up variables so it's clear what's a variable.

## Implementations chapter

`implementations.md` is a bare `TODO`.

- #22 — Servo's HTML parser.
- #23 — Cloudflare's LOL HTML rewriter.
- #25 — Flow browser (quirksmode interview: the parser was easier than expected thanks to the spec).
