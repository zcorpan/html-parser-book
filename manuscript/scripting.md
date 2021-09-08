---
layout: chapter.njk
title: Scripting complications
next: serializing
nextTitle: Serializing
---
# Chapter 4. Scripting complications

Implementations of HTML that do not need to support executing scripts are exempt from various complications, in particular the necessary hoops for `document.write()`. Browsers that wish to be compatible with the vast majority of the web will have to support scripting, and jump through the hoops with elegance.

## Revised overview of the HTML parser

Because of `document.write()`, the  {% ref "parser", "overview of the HTML parser" %} in {% ref "parser", "Chapter 3. The HTML parser" %} is incomplete.

The HTML standard has this diagram:

![]()

## `document.write()`

A script in an inline `<script>` is executed by the tree builder, while handling the `</script>` end tag. The parser is blocked until the script has completed. If the script calls `document.write()`, the characters passed in are added to the parser's input stream. The algorithm for `document.write()` makes the HTML parser consume those characters, before returning (i.e., before allowing the next statement in the script run).

What if those characters are `<script>...</script>`? Then you have to execute that script before the `document.write()` can return. What if that script `document.write()`s another script? Yes, I suppose you get the picture. (TODO discuss nested document.write limit.)

TODO

### Blocking the parser

TODO

### Speculative parsing a.k.a. preload scanner

TODO

## The scripting flag and the `noscript` element

## Other parser APIs

TODO

Window DOMParser
Element,ShadowRoot innerHTML
Element outerHTML
Element insertAdjasentHTML
Range createContextualFragment


### `innerHTML` and friends

TODO some introduction before getting into the weeds...

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

```dom-tree
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

...which [says](https://html.spec.whatwg.org/multipage/parsing.html#reset-the-insertion-mode-appropriately):

> 15. If *node* is an `html` element, run these substeps:
>
>     1. If the head element pointer is null, switch the insertion mode to "before head" and return. (fragment case)

So when this parser parses the markup given (the empty string), it starts in the "before head" insertion mode. It immediately reaches EOF, so steps through the usual states and appends a `head` and a `body` element.

At this point, if we were to inspect the DOM right after the `document.head.outerHTML` assignment, it looks like this:

```dom-tree
#document
├── DOCTYPE: html
└── html
    ├── head
    └── body
```

The parser-created `head` has been replaced by fragment parser-created `head` and `body` elements. Now, `document.body` is no longer null, since a `body` element exists, even though the still running main parser hasn't created one yet.

Next, the `document.body.outerHTML = ''` line does basically the same thing but for the new `body` element: replace it with new `head` and `body` elements:

```dom-tree
#document
├── DOCTYPE: html
└── html
    ├── head
    ├── head
    └── body
```

The first `head` didn't go away; `outerHTML` only replaces the element you call it on, not other siblings.

Now the script is done, and the main parser is allowed to continue. The insertion mode is "in head", since the `script` element was in `head`. The next token is end-of-file, so the insertion mode switches to "after head", where it inserts a `body` element and switches to "in body", and then it stops parsing.

```dom-tree
#document
├── DOCTYPE: html
└── html
    ├── head
    ├── head
    ├── body
    └── body
```


## DOM manipulation

TODO

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

```dom-tree
#document
├── DOCTYPE: html
└── html
    └── head
```

At least it didn't lose its head...

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

