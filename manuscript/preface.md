---
layout: chapter.njk
title: Preface
next: introduction
nextTitle: Introduction
---
{#preface}
# Preface

{#intended-audience}
## Intended audience

This is not an HTML beginner's book. The intended audience is web developers who want to gain a deeper understanding of how the HTML parser works, or the history and rationale behind certain behaviors. Some prior knowledge of HTML and the DOM is assumed. If you are going to implement your own HTML parser (awesome!), then this book will hopefully be helpful, but please implement from the [HTML standard](https://html.spec.whatwg.org/multipage/). If you contribute to a browser engine or to web standards (awesome!), then this book will hopefully be helpful. If nothing else, I hope it will at least be an interesting read.

{#definition}
## Definition

Dictionary.com offers the following [definition](https://www.dictionary.com/browse/parse) of *parse* in the context of computers:

> to analyze (a string of characters) in order to associate groups of characters with the syntactic units of the underlying grammar.

The Wikipedia page for [Parsing](https://en.wikipedia.org/wiki/Parsing) offers the following:

> *Parsing*, *syntax analysis* or *syntactic analysis* is the process of analysing a string of symbols, either in natural language, computer languages or data structures, conforming to the rules of a formal grammar. The term parsing comes from Latin pars (orationis), meaning part (of speech).

In the context of HTML, the *HTML parser* is responsible for the process of converting a stream of characters (the HTML markup) to an tree representation known as the Document Object Model (the DOM).

{#scope}
## Scope

This book covers the history of HTML parsers, how to write syntactically correct HTML, how an HTML parser works, including error handling, what can be done with the parsed DOM representation, and how to serialize it back to a string. It also covers parsing of some HTML *microsyntaxes* (parsing of some attribute values), which are strictly speaking not part of the HTML parser, but a layer above. It further discusses implementations and conformance checkers.

Parsing of other languages, such as XML, JavaScript, JSX (React's HTML-like syntax), or CSS, is not covered in this book.

{#practical-application}
## Practical application

Knowing exactly how the HTML parser works is not necessary to be a successful web developer. However, some things can be good to know, and having a deeper understanding makes it easier to reason about its behavior. It can also be good to know that you should usually pull in an HTML parser instead of writing a [regular expression to "parse" HTML](https://stackoverflow.com/a/1732454).

The following is a non-exhaustive list of things that would be good for most web developers to understand about the HTML parser.

* **How `</script>` works.** "`</script>`" in a script block does not always close the script. This is discussed in the [Script states](#script-states) section in [Chapter 2. The HTML parser](#chapter-2-the-html-parser).

* **Implied tags/omitted tags.** Some tags are optional, and some tags are implied without being optional. This explains why, for example, it's not possible to nest an `<ul>` in `<p>`. This is discussed in the [Implied tags](#implied-tags) section in [Chapter 2. The HTML parser](#chapter-2-the-html-parser).

* **`document.body` being null.** Before the `<body>` has been parsed, `document.body` is null. See [Chapter 4. DOM manipulation](#chapter-4-dom-manipulation).

* **Scripting and styling.** Knowing what the DOM will look like helps with working with the DOM with script or writing selectors in CSS. This has some overlap with implied tags. For example, `<tbody>` is implied in `<table>` even if that tag is not present.

* **Writing correct HTML.** Knowing how the parser works may give you more confidence in how to write HTML. For example, a relatively common error is to use "`/>`" syntax on a non-void HTML element (`br` is a void element, `div` is not void), although that is not supported (it will be treated as a regular start tag, ignoring the slash). See [The HTML syntax](#the-html-syntax) section in [Chapter 1. Introduction](#chapter-1-introduction).

* **Security.** For example, cross-site scripting (XSS) attacks sometimes target holes in sanitizers. Such attacks may be prevented by using an HTML parser-based sanitizer. See [Appendix A. Implementations](#appendix-a-implementations) for examples of such sanitizers.

* **Web compatibility.** The HTML parser specification is known to be compatible with HTML as it is used on the web. When Opera implemented the specified HTML parser, it eliminated [20% of its web compatibility bugs](https://dev.opera.com/blog/opera-mini-server-upgrade/) (of any kind).

{#about-the-author}
## About the author

Simon started contributing to the WHATWG in 2005, worked at Opera Software on Quality Assurance and web standards between 2007 and 2017, and currently works with web standards and web platform testing at [Bocoup](https://bocoup.com/). He contributed to the design of some aspects of the HTML parser specification, such as how SVG in HTML works and finding a web-compatible way to tokenize `script` elements. He edited the specification for the `picture` element from 2014 onwards and is currently an editor of the WHATWG [HTML standard](https://html.spec.whatwg.org/) and the WHATWG [Quirks Mode standard](https://quirks.spec.whatwg.org/). His Twitter handle is [@zcorpan](https://twitter.com/zcorpan).

{#acknowledgements}
## Acknowledgements

Thanks to Mathias Bynens for suggesting the platypus for the front cover (I asked on Twitter "If the HTML parser were an animal, what would it be?").

The [platypus sketch](https://en.wikipedia.org/wiki/File:Platypus_sketch_by_Hmich176.gif) on the front cover is from Wikipedia, by Hmich176, with the following licenses:

> GNU Free Documentation License
>
> Creative Commons Attribution-ShareAlike 3.0

The font used on the front cover is [Archistico](https://www.fontsquirrel.com/fonts/archistico), by [Archistico](https://www.archistico.com/), and has the following license:

> You can use the font for commercial purposes, but not sell it! Every once in a comment on the page would be nice.

This book contains quotes from the [WHATWG HTML Standard](https://html.spec.whatwg.org/multipage/) which has the following copyright and license:

> Copyright © 2018 WHATWG (Apple, Google, Mozilla, Microsoft). This work is licensed under a [Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/).

Thanks to Ian Hickson and Henri Sivonen for letting me quote their emails, blog posts, etc. in this book.

Thanks to Ingvar Stepanyan for letting me use some of his Twitter quizzes in this book.

Thanks to Mike Smith for providing a raw log from a validator instance for the [Most common errors](#most-common-errors) section in [Appendix B. Conformance checkers](#appendix-b-conformance-checkers).

Thanks to Marcos Caceres, Sam Sneddon, Taylor Hunt, Mike Smith, Anne van Kesteren, Marie Staver, Ian Hickson, Mathias Bynens, Henri Sivonen, and Philip Jägenstedt for reviewing this book.

{#contribute}
## Contribute

The source code for this book is [available on GitHub](https://github.com/zcorpan/html-parser-book/). This book and the source code is [licensed under CC-BY-4.0](https://github.com/zcorpan/html-parser-book/blob/master/LICENSE). Feel free to report issues, submit pull requests, fork, etc.! If you wish to make a translation or otherwise reuse the work, you are welcome to do so (as allowed by the license). Please report an issue, to avoid duplicate work and so I can help get you set up.

In the [web version of this book](https://htmlparser.info/), there is a feedback link in the bottom-right corner. You can select some text and click the feedback link to create a new issue about the selected text in the GitHub repository. The link has `accesskey="1"` so it can be activated with the keyboard — how to activate it depends on the browser and OS, see [documentation on MDN about `accesskey`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/accesskey).

If you use Twitter, you can provide feedback or ask questions there at [@htmlparserbook](https://twitter.com/htmlparserbook). You can follow this account if you want to be notified about new commits.
