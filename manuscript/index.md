---
layout: chapter.njk
title: Idiosyncrasies of the HTML parser - The HTML Parser Book
toc: false
---
<link rel=preload as=font crossorigin href=/_assets/fonts/Archistico_Bold.woff>
<header class=book-cover>
<h1 role="presentation">
<svg viewBox="-50 -350 1100 1600" role="presentation" focusable="false" id="book-cover-svg">
  <!--
    font    <https://www.fontsquirrel.com/fonts/archistico>
    licence <https://www.fontsquirrel.com/license/archistico>
  -->
  <style>
    @font-face {
      font-family: Archistico;
      src: url('/_assets/fonts/Archistico_Bold.woff') format('woff'),
           url('/_assets/fonts/Archistico_Bold.ttf') format('truetype');
    }
    #book-cover-svg #book-title {
      font-size: 100px;
    }
    #book-cover-svg text {
      font-family: Archistico, sans-serif;
      font-weight: normal;
    }
    #book-cover-svg #book-author {
      font-size: 50px;
    }
    #book-cover-svg image { mix-blend-mode: multiply }
  </style>
  <defs>
    <filter id="book-cover-shadow">
      <feDropShadow dx="0" dy="0" stdDeviation="15" flood-opacity="0.3"></feDropShadow>
    </filter>
    <linearGradient id="book-cover-bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="33%" stop-color="white"></stop>
      <stop offset="33%" stop-color="darkseagreen"></stop>
    </linearGradient>
  </defs>
  <rect fill="url(#book-cover-bg)" x="0" y="-300" width="1000" height="1500" rx="10" filter="url(#book-cover-shadow)"></rect>
  <image role="img" aria-label="Sketch of a platypus." xlink:href="/_assets/img/Platypus_sketch_by_Hmich176.png" x="382" y="0" width="568" height="574"></image>
  <g text-anchor="end" id="book-title" role="heading" aria-level="1">
    <text x="820" y="120">Idiosyncrasies</text>
    <text x="720" y="220">of the</text>
    <text x="620" y="320">HTML</text>
    <text x="520" y="420">parser</text>
  </g>
  <g id="book-author">
    <text role="paragraph" text-anchor="middle" x="500" y="875">Simon Pieters</text>
  </g>
</svg>
</h1>

</header>

## About this Book

The HTML parser is a piece of software that processes HTML markup and produces an in-memory tree representation (known as the DOM).

The HTML parser has many strange behaviors. This book will highlight the ins and outs of the HTML parser, and contains almost-impossible quizzes.

HTML is not only used by basically all of the web, but it is also part of many modern applications. The HTML parser is part of the foundation of the web platform.

You can [buy the eBook](https://leanpub.com/html-parser-book/) on Leanpub. 50% of royalties go to [Amazon Watch](https://amazonwatch.org/).

<a role=button href=https://leanpub.com/html-parser-book/>Buy the eBook</a>

## Table of Contents

<ul class=toc>
 <li><a href=/preface/>Preface</a> <span>0</span>
 <li><a href=/introduction/>Introduction</a> <span>1</span>
 <li><a href=/syntax/>The HTML syntax</a> <span>2</span>
 <li><a href=/parser/>The HTML parser</a> <span>3</span>
 <li><a href=/scripting/>Scripting complications</a> <span>4</span>
 <li><a href=/serializing/>Serializing</a> <span>5</span>
 <li><a href=/security/>Security implications</a> <span>6</span>
 <li><a href=/implementations/>Implementations</a> <span>A</span>
 <li><a href=/conformance-checkers/>Conformance checkers</a> <span>B</span>
 <li><a href=/microsyntaxes/>Microsyntaxes</a> <span>C</span>
 <li><a href=/bibliography/>Bibliography</a> <span>D</span>
</ul>
