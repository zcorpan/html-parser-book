---
layout: chapter.njk
title: Idiosyncrancies of the HTML parser - The HTML Parser Book
---
<header class=book-cover>
<h1 role="presentation">
<svg viewBox="0 -100 1000 800" role="presentation" focusable="false" id="book-cover-svg">
  <style>
    #book-cover-svg { background: white; border-radius: 30px; box-shadow: 0 0 30px rgba(0, 0, 0, 0.2); }
    #book-cover-svg #book-title {
      font-weight: 900;
      font-size: 100px;
    }
    #book-cover-svg text {
      font-family: system-ui, sans-serif;
      opacity: 0.6;
    }
    #book-cover-svg #book-author {
      font-weight: 700;
      font-size: 25px;
    }
    #book-cover-svg > * { mix-blend-mode: multiply }
  </style>
  <rect fill=darkseagreen x=0 y=190 width=1000 height=610 />
  <image role="img" aria-roledescription="book cover image" aria-label="Sketch of a platypus." xlink:href="_assets/img/Platypus_sketch_by_Hmich176.png" x="382" y="0" width="568" height="574"/>
  <g text-anchor=end id=book-title role="heading" aria-level="1">
    <text x=800 y=120>Idiosyncracies</text>
    <text x=700 y=220>of the</text>
    <text x=600 y=320>HTML</text>
    <text x=500 y=420>parser</text>
  </g>
  <g id=book-author>
    <text role=paragraph text-anchor=middle x=500 y=675>Simon Pieters</text>
  </g>
</svg>
</h1>

</header>

## About this Book

The HTML parser is a piece of software that processes HTML markup and produces an in-memory tree representation (known as the DOM).

The HTML parser has many strange behaviors. For more than a decade, the HTML standards stated that HTML was an application of SGML, while web browsers used a very different approach to parsing HTML. Then, the WHATWG specified that the HTML parser was much closer to what contemporary web browsers did. Today, all browsers have conforming HTML parsers. This book will highlight the ins and outs of the HTML parser, and contains almost-impossible quizzes.

HTML is not only used by basically all of the web, but it is also part of many modern applications. The HTML parser is part of the foundation of the web platform. HTML parsers can be found in web browsers, but are also implemented in various languages and platforms.

You can [buy the eBook](https://leanpub.com/html-parser-book/) on Leanpub. 50% of royalties go to [Amazon Watch](https://amazonwatch.org/).

> A healthy Amazon rainforest is one of the Earth's best defenses against climate change.

— [Climate and the Amazon](https://amazonwatch.org/work/climate-and-the-amazon)

## Table of Contents

<ul class=toc>
 <li><a href=/preface/>Preface</a> <span>0</span>
 <li><a href=/introduction/>Introduction</a> <span>1</span>
 <li><a href=/parser/>The HTML parser</a> <span>2</span>
 <li><a href=/microsyntaxes/>Microsyntaxes</a> <span>3</span>
 <li><a href=/dom-manipulation/>DOM manipulation</a> <span>4</span>
 <li><a href=/serializing/>Serializing</a> <span>5</span>
 <li><a href=/implementations/>Implementations</a> <span>A</span>
 <li><a href=/conformance-checkers/>Conformance checkers</a> <span>B</span>
</ul>
