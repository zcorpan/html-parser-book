---
layout: chapter.njk
title: Idiosyncrancies of the HTML parser - The HTML Parser Book
---
<header class=book-cover>
<div><img aria-roledescription="book cover image" alt="Sketch of a platypus" src=_assets/img/Platypus_sketch_by_Hmich176.png></div>

# Idiosyncracies of the HTML parser

Simon Pieters

</header>

## About this Book

The HTML parser is a piece of software that processes HTML markup and produces an in-memory tree representation (known as the DOM).

The HTML parser has many strange behaviors. For more than a decade, the HTML standards stated that HTML was an application of SGML, while web browsers used a very different approach to parsing HTML. Then, the WHATWG specified that the HTML parser was much closer to what contemporary web browsers did. Today, all browsers have conforming HTML parsers. This book will highlight the ins and outs of the HTML parser, and contains almost-impossible quizzes.

HTML is not only used by basically all of the web, but it is also part of many modern applications. The HTML parser is part of the foundation of the web platform. HTML parsers can be found in web browsers, but are also implemented in various languages and platforms.

You can [buy the eBook](https://leanpub.com/html-parser-book/) on Leanpub. 50% of royalties go to [Amazon Watch](https://amazonwatch.org/).

> A healthy Amazon rainforest is one of the Earth's best defenses against climate change.

— [Climate and the Amazon](https://amazonwatch.org/work/climate-and-the-amazon)

## Table of Contents

<ol class=toc start=0>
 <li><a href=/preface/>Preface</a>
 <li><a href=/introduction/>Introduction</a>
 <li><a href=/parser/>The HTML parser</a>
 <li><a href=/microsyntaxes/>Microsyntaxes</a>
 <li><a href=/dom-manipulation/>DOM manipulation</a>
 <li><a href=/serializing/>Serializing</a>
 <li value=1 type=A><a href=/implementations/>Implementations</a>
 <li value=2 type=A><a href=/conformance-checkers/>Conformance checkers</a>
</ol>
