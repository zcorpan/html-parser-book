---
layout: chapter.njk
title: The HTML syntax
next: parser
nextTitle: The HTML parser
---
{#chapter-2-the-html-syntax}
# Chapter 2. The HTML syntax

This chapter covers the syntax of HTML, i.e. how to write HTML. This chapter is similar to the [Writing HTML documents](https://html.spec.whatwg.org/multipage/syntax.html#writing) section of the HTML standard.

{#the-doctype}
## The doctype

The doctype is required because without a doctype, browsers use quirks mode for the document, which changes some behavior, mainly in CSS. Quirks mode was introduced by IE5 for Mac, released in 2000, in an attempt to both be compatible with the contemporary legacy and with the CSS1 specification. This approach was then copied by all browsers and has now been specified. There are now three rendering modes for HTML:

* quirks mode,

* limited-quirks mode,

* no-quirks mode.

[Activating Browser Modes with Doctype](https://hsivonen.fi/doctype/) by Henri Sivonen has more information on doctype switching. The WHATWG [Quirks Mode standard](https://quirks.spec.whatwg.org/) specifies some of the effects of the quirks mode.

The doctype can be either:

```html
<!doctype html>
```

…case-insensitive, or:

```html
<!doctype html system "about:legacy-compat">
```

Also case-insensitive, except for the "about:legacy-compat" part.

The purpose of the longer doctype is for compatibility with markup generators that are unable to produce the short doctype. If you don't find yourself in such a situation, just use the short doctype.

Prior versions of HTML had other doctypes that are now defined to trigger one of the different rendering modes. For example, this HTML 4.01 doctype trigger no-quirks mode:

```html
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"
"http://www.w3.org/TR/html4/strict.dtd">
```

One of my first [contributions](https://lists.w3.org/Archives/Public/public-whatwg-archive/2005Jun/0109.html) to the WHATWG, in June 2005, was to propose to change the doctype to `<!doctype html>`. Finally a doctype that can be remembered! (Though, for some reason, I still remember how to type `<!doctype html public "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">`. Sigh.)

{#elements}
## Elements

HTML defines the following kinds of elements:

* **Void elements.** The list of conforming elements is: `area`, `base`, `br`, `col`, `embed`, `hr`, `img`, `input`, `link`, `meta`, `param`, `source`, `track`, `wbr`. Non-conforming elements that parse and serialize like void elements are: `basefont`, `bgsound`, `frame`, `keygen`.

* **The `template` element.** This element has a category of its own.

* **Raw text elements.** The list of conforming elements is: `script`, `style`. The `iframe` element parses and serializes like raw text elements, however, in conforming documents, the `iframe` element must be empty. The non-conforming elements that parse and serialize like raw text elements are: `xmp`, `noembed`, `noframes`, `noscript` (if scripting is enabled). The non-conforming `plaintext` element serializes like raw text element, but it has special parsing rules such that from a parsing perspective, it has a category of its own.

* **Escapable raw text elements.** `textarea`, `title`.

* **Foreign elements.** SVG and MathML elements.

* **Normal elements.** All other HTML elements.

All kinds of elements can have a start tag, although for some elements the start tag is optional.

Void elements consist of just a start tag.

```html
<br>
```

The `template` element is special because its contents are parsed into a separate `DocumentFragment` instead of being children of the element itself. This is discussed in more detail in the [Templates](#templates) section in [Chapter 3. The HTML parser](#chapter-3-the-html-parser).

```html
<template><img src="[[ src ]]" alt="[[ alt ]]"></template>
```

Raw text elements, escapable raw text elements and normal elements have a start tag, some contents, and an end tag (but some elements have optional end tags, or optional start and end tags). Raw text means that the contents are treated as text instead of as markup, except for the end tag, and except that script has pretty special parsing rules (see *Script states* of the *Tokenizer*). Escapable raw text is like raw text, except that character references work.

```html
<title>SpiderMonkey &amp; the GC Jitters</title>
```

Normal elements can have text (except `<` and ambiguous ampersand), character references, other elements, and comments.

The `pre` and `textarea` elements have a special rule: they may begin with a newline that will be ignored by the HTML parser. To have content that actually starts with a newline, two newlines thus have to be used. (A newline in HTML is a line feed, a carriage return, or a CRLF pair.) For example, the following is equivalent to `<pre>Use the force</pre>` (without a newline):

```html
<pre>
Use the force</pre>
```

Foreign elements are slightly closer to XML in their syntax: "`/>`" works (self-closing start tag), CDATA sections work (`<![CDATA[ … ]]>`, the contents are like raw text). But note that other aspects still work like HTML; element names and attribute names are case-insensitive, and XML namespaces don't work (only some namespaced attributes work with a predefined prefix).

```html
<p>Circling the drain.
 <svg viewBox="-1 -1 2 2" width=16><circle r=1 /></svg>
</p>
```

{#documents}
## Documents

An HTML document consists of a doctype followed by an `html` element, and there may be whitespace and comments before, between, and after. The following example is a complete and conforming HTML document:

```html
<!-- a comment -->
<!doctype html>
<html lang=en>
 <head>
  <title>Key to success</title>
 </head>
 <body>
  <p>Such like these, unless combined, are inane.</p>
 </body>
</html>
```

{#start-tags}
## Start tags

A start tag has this format:

`<`, the tag name (case-insensitive), whitespace (if there are attributes), any number of attributes separated by whitespace, optionally some whitespace, `>`. (In the HTML syntax, whitespace means [ASCII whitespace](https://infra.spec.whatwg.org/#ascii-whitespace), i.e., tab, line feed, form feed, carriage return, or space.)

```html
<p class="warning">
```

For void elements, the tag may end with either `>` or `/>`, although the slash makes no difference.

```html
<hr/>
```

Foreign elements (SVG and MathML) support self-closing start tags, which end with `/>` and means there are no contents and no end tag. The element name for foreign elements is case-insensitive in the HTML syntax.

```html
<CIRCLE r="1"/>
```

{#end-tags}
## End tags

An end tag has this format:

`</`, the tag name (case-insensitive), optionally whitespace, `>`.

```html
</p>
```

Attributes are not allowed on end tags.

{#attributes}
## Attributes

Attributes come in a few different formats.

* **Empty attribute syntax.** This is just the attribute name. The value in the DOM will be the empty string. This syntax is often used for boolean attributes, but is allowed for any attribute (provided that the empty string is an allowed value). For example:

  ```
  <video preload>
  ```

* **Unquoted attribute value syntax.** The attribute name, optionally whitespace, `=`, optionally whitespace, then the value, which can't be the empty string and is not allowed to contain whitespace or these characters: `"` `'` `=` `<` `>` and \`. If this is the last attribute and the start tag ends with `/>` (which is allowed on void elements and foreign elements), there has to be whitespace before the slash (otherwise the slash becomes part of the value). For example:

  ```
  <source src=bbb_sunflower_2160p_60fps_normal.mp4 />
  ```

* **Single-quoted attribute value syntax.** The attribute name, optionally whitespace, `=`, optionally whitespace, `'`, the value not containing `'`, then `'`. For example:

  ```
  <track src='big-buck-bunny.webvtt'>
  ```

* **Double-quoted attribute value syntax.** The attribute name, optionally whitespace, `=`, optionally whitespace, `"`, the value not containing `"`, then `"`. For example:

  ```
  <a href="https://peach.blender.org/download/">Download Big Buck Bunny</a>
  ```

All attribute names are case-insensitive, including attributes on SVG and MathML elements.

All attribute values support character references. This can be particularly relevant for URLs in attributes, which sometimes contain `&` that should be escaped as `&amp;`, lest it be interpreted as a character reference.

```html
<a href="?title=Lone+Surrogates&amp;reg">
```

If the ampersand was unescaped in this example, like this:

```html
<a href="?title=Lone+Surrogates&reg">
```

…then `&reg` would be interpreted as a named character reference, which expands to "®", i.e., it's equivalent to:

```html
<a href="?title=Lone+Surrogates®">
```

Duplicate attributes, i.e., two attributes with the same name, are not allowed.

```html
<p class="cool" class="uncool">
```

Foreign elements support the following namespaced attributes (with fixed prefixes): xlink:actuate, xlink:arcrole, xlink:href, xlink:role, xlink:show, xlink:title, xlink:type, xml:lang, xml:space, xmlns (without prefix but is a namespaced attribute), xmlns:xlink.

```html
<svg xmlns="http://www.w3.org/2000/svg">
```

Note that in the HTML syntax, it's optional to declare the namespace.

```html
<svg>
```

{#optional-tags}
## Optional tags

Certain tags can be omitted if the resulting DOM doesn't change if they are so omitted, including "minor" changes such as where whitespace ends up or where a comment ends up. The rules for when they can be omitted are slightly convoluted, but they assume that the DOM is not allowed to change by omitting a tag. It is however conforming to intentionally move a tag such that omitting it no longer changes the DOM.

For example, consider this snippet:

```html
<p>Can a paragraph be one word long?</p>
<p>Yes.</p>
```

Because there is a line feed between the paragraphs, there will be a `Text` node for it in the DOM. Omitting the end tags will cause the line feed to be part of the first paragraph instead:

```html
<p>Can a paragraph be one word long?
<p>Yes.
```

However, in most cases this makes no difference at all. (It can make a difference if you style the paragraphs as `display: inline-block`, for example.)

For the exact rules on when tags can be omitted, please consult the HTML standard.

Here are the tags that may (sometimes) be omitted:

| Element    | Start tag | End tag   |
|------------|-----------|-----------|
| `html`     | Omissible | Omissible |
| `head`     | Omissible | Omissible |
| `body`     | Omissible | Omissible |
| `li`       |           | Omissible |
| `dt`       |           | Omissible |
| `dd`       |           | Omissible |
| `p`        |           | Omissible |
| `rt`       |           | Omissible |
| `rp`       |           | Omissible |
| `optgroup` |           | Omissible |
| `option`   |           | Omissible |
| `colgroup` | Omissible | Omissible |
| `caption`  |           | Omissible |
| `thead`    |           | Omissible |
| `tbody`    | Omissible | Omissible |
| `tfoot`    |           | Omissible |
| `tr`       |           | Omissible |
| `td`       |           | Omissible |
| `th`       |           | Omissible |

{#character-references}
## Character references

There are three kinds of character references:

* **Named character reference.** `&`, the name, `;`. There are over two thousand names to choose from. These are case-sensitive, although a few characters have character reference names in both all-lowercase and all-uppercase (e.g., `&lt;` and `&LT;`).

```html
&nbsp;
```

* **Decimal numeric character reference.** `&#`, a decimal number of a code point, `;`.

```html
&#160;
```

* **Hexadecimal numeric character reference.** `&#x` or `&#X`, a hexadecimal number of a code point, `;`. The hexadecimal number is case-insensitive.

```html
&#xA0;
```

HTML has a concept of an ambiguous ampersand, which is `&`, alphanumerics (a-zA-Z0-9), `;`, when this is not a known named character reference. Ambiguous ampersands are not allowed. The following is an example of an ambiguous ampersand:

```html
I've sent a support request to AT&T; no reply, yet.
```

However, other unescaped ampersands are technically allowed:

```html
Ind. Unrealisk & Ind. Brunn
```

{#cdata-sections}
## CDATA sections

CDATA sections can only be used in foreign content, and have this format:

`<![CDATA[` (case-sensitive), text not containing `]]>`, then `]]>`.

```html
<svg><title><![CDATA[ The <html>, <head>, & <title> elements ]]></title> … </svg>
```

{#comments}
## Comments

Comments have this format:

`<!--` followed by any text (with some restrictions, detailed below), then `-->`.

```html
<!-- Hello -->
```

The text is not allowed to contain `-->` since that would end the comment.

A somewhat recent change to comment syntax is that `--` is now allowed in the text. This is not allowed in XML.

```html
<!-- Hello -- there -->
```

The text is not allowed to contain `<!--` since that is an indicator of a nested comment, and nested comments don't work.

```html
<!-- <!-- this is an error --> -->
```

The text is not allowed to start with `>` or `->` or contain `--!>` because the HTML parser will end the comment at that point.
