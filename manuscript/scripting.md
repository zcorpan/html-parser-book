---
layout: chapter.njk
title: Scripting complications
next: serializing
nextTitle: Serializing
toc: true
---
{#chapter-4-scripting-complications}
# Chapter 4. Scripting complications

{#revised-overview-of-the-html-parser}
## Revised overview of the HTML parser

TODO

{#documentwrite}
## `document.write()`

TODO

{#blocking-the-parser}
### Blocking the parser

TODO

{#speculative-parsing-aka-preload-scanner}
### Speculative parsing a.k.a. preload scanner

TODO

{#other-parser-apis}
## Other parser APIs

TODO

Window DOMParser
Element,ShadowRoot innerHTML
Element outerHTML
Element insertAdjasentHTML
Range createContextualFragment


{#innerhtml-and-friends}
### `innerHTML` and friends

TODO some introduction before getting into the weeds…

> [\#htmlpubquiz](https://twitter.com/zcorpan/status/207345250744803328) How do you get a Siamese twins document (i.e. two `<head>`s and two `<body>`s) using only `innerHTML`/`outerHTML`?

Correct answer:

```html
<!DOCTYPE html>
<script>
document.head.outerHTML = '';
document.body.outerHTML = '';
</script>
```

When the parser reaches `</script>`, before running the script, the `body` element hasn't been created yet:

```
#document
├── DOCTYPE: html
└── html
    └── head
        └── script
            └── #text:  document.head.outerHTML = ''; document.body.outerHTML = '';
```

The first line in the script sets `document.head.outerHTML` to the empty string. `outerHTML` is like `innerHTML` but it replaces the element with the parsed nodes. The spec for [`outerHTML`](https://w3c.github.io/DOM-Parsing/#dom-element-outerhtml) will invoke the [fragment parsing algorithm](https://w3c.github.io/DOM-Parsing/#dfn-fragment-parsing-algorithm) on the given value, and then call the DOM [replace](https://dom.spec.whatwg.org/#concept-node-replace) algorithm on the [context object](https://dom.spec.whatwg.org/#context-object) with the parsed result.

The fragment parsing algorithm then calls the [HTML fragment parsing algorithm](https://html.spec.whatwg.org/multipage/parsing.html#html-fragment-parsing-algorithm), with *context* being the `html` element (the parent of the `head` element). This will set up a new instance of the HTML parser, with the state of the HTML parser as appropriate for *context*. In particular, this step:

> 10. Reset the parser's insertion mode appropriately.

…which [says](https://html.spec.whatwg.org/multipage/parsing.html#reset-the-insertion-mode-appropriately):

> 15. If *node* is an `html` element, run these substeps:
>
>     1. If the head element pointer is null, switch the insertion mode to "before head" and return. (fragment case)

So when this parser parses the markup given (the empty string), it starts in the "before head" insertion mode. It immediately reaches EOF, so steps through the usual states and appends a `head` and a `body` element.

At this point, if we were to inspect the DOM right after the `document.head.outerHTML` assignment, it looks like this:

```
#document
├── DOCTYPE: html
└── html
    ├── head
    └── body
```

The parser-created `head` has been replaced by fragment parser-created `head` and `body` elements. Now, `document.body` is no longer null, since a `body` element exists, even though the still running main parser hasn't created one yet.

Next, the `document.body.outerHTML = ''` line does basically the same thing but for the new `body` element: replace it with new `head` and `body` elements:

```
#document
├── DOCTYPE: html
└── html
    ├── head
    ├── head
    └── body
```

The first `head` didn't go away; `outerHTML` only replaces the element you call it on, not other siblings.

Now the script is done, and the main parser is allowed to continue. The insertion mode is "in head", since the `script` element was in `head`. The next token is end-of-file, so the insertion mode switches to "after head", where it inserts a `body` element and switches to "in body", and then it stops parsing.

```
#document
├── DOCTYPE: html
└── html
    ├── head
    ├── head
    ├── body
    └── body
```


{#dom-manipulation}
## DOM manipulation

TODO

{#modifying-the-dom-during-parsing}
### Modifying the DOM during parsing

Script can execute during parsing, and those scripts can modify the DOM. This can lead to some interesting effects.

Simple example:

```html
<!doctype html>
<body>
<script>
 document.body.remove();
</script>
Oops.
```

The resulting DOM is:

```
#document
├── DOCTYPE: html
└── html
    └── head
```

At least it didn't lose its head…

Note that the text "Oops.", which the parser processed *after* running the script, is not in the DOM. It was inserted into the `body` element, that the script had removed.

> [\#HTMLQuiz](https://twitter.com/zcorpan/status/775616491379187712) what happens?
> ```html
> <iframe id=x></iframe>
> <script>
> x.contentDocument.body.appendChild(x);
> </script>
> ```
>
> * wild `DOMException` appears
> * `iframe` escapes

Correct answer: `iframe` escapes.

Nothing prevents the `iframe` element from being moved to its own document (`about:blank` is same-origin). So the `iframe` element is removed from its original document.

The spec for [`appendChild()`](https://dom.spec.whatwg.org/#dom-node-appendchild) does have various checks in place to make sure that the resulting DOM wouldn't violate invariants; e.g., if you tried to append an element to a text node, that would throw. But appending an element to another element is allowed, even across (same-origin) documents.

When an `iframe` is removed from a document, its [browsing context](https://html.spec.whatwg.org/multipage/browsers.html#windows) disappears. So the child document does not have a browsing context when the `iframe` element is inserted into it. Therefore the `iframe`, after the move, does not have a new child browsing context (there's no infinite recursion happening). The [spec for the `iframe` element](https://html.spec.whatwg.org/multipage/embedded-content.html#the-iframe-element
) says:

> When an iframe element is removed from a document, the user agent must discard the element's nested browsing context, if it is not null, and then set the element's nested browsing context to null.

If the script had [saved a reference](http://software.hixie.ch/utilities/js/live-dom-viewer/saved/4461) to the `iframe`'s `window`, the script would still be able to access it, its document, and the moved `iframe` element, after the move.

