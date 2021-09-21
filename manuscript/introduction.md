---
layout: chapter.njk
title: Introduction
next: syntax
nextTitle: The HTML syntax
---
# Chapter 1. Introduction

## The DOM, parsing, and serialization

The Document Object Model (DOM) is a representation of a document as a tree of nodes. Some kinds of nodes can have child nodes (thus forming a tree).

These are the different kinds of nodes that the HTML parser can produce, and which nodes they are allowed to have as children, if any:

`Document`
: The root node. Allowed children: `Comment`, `DocumentType`, `Element`

`DocumentType`
: The doctype (e.g., `<!doctype html>`). No children.

`Element`
: An element (e.g., `<p>Hello</p>`). Allowed children: `Element`, `Text`, `Comment`.

`DocumentFragment`
: Used when parsing {% ref "parser", "`template`s" %}. Allowed children: `Element`, `Text`, `Comment`.

`Text`
: A text node (e.g., `Hello`). No children.

`Comment`
: A comment (e.g., `<!-- hello -->`). No children.

Nodes can also have certain properties; for example:

* `Element` nodes have a `namespaceURI` and `localName` which together represent the element type (e.g., "an HTML `p` element"), and a list of attributes (e.g., `<html lang="en">` has one attribute).
* `Text` and `Comment` nodes have `data` which holds the node's text contents.

The DOM also includes APIs to traverse and mutate the tree with script. For example, the `divElement.remove()` method removes a node from its parent, `footerElement.append(div)` inserts `divElement` into `footerElement` as the last child. This is discussed in {% ref "scripting", "Chapter 4. Scripting complications" %}.

Parsing HTML means to turn a string of characters (the markup) into a DOM tree.

For example, the following document:

```html
<!DOCTYPE HTML>
<html lang="en">
 <head>
  <title>Hello</title>
 </head>
 <body>
  <p>Test.</p>
 </body>
</html>
```

…is parsed into the following DOM tree:

```dom-tree
#document
├── DOCTYPE: html
└── html lang="en"
    ├── head
    │   ├── #text:
    │   ├── title
    │   │   └── #text: Hello
    │   └── #text:
    ├── #text:
    └── body
        ├── #text:
        ├── p
        │   └── #text: Test.
        └── #text:
```

How this works is discussed in {% ref "parser", "Chapter 3. The HTML parser" %}.

Serializing HTML means to do the opposite of parsing, i.e., start with a DOM representation of a document, and turning it to a string. This is discussed in {% ref "serializing", "Chapter 5. Serializing" %}.

A tool that is handy for quickly trying what DOM tree is produced for a piece of HTML markup is the [*Live DOM Viewer*](http://software.hixie.ch/utilities/js/live-dom-viewer/), which Ian Hickson created when he was writing the HTML parser specification. Give it a try!

## History of HTML parsers

### SGML & early HTML

The earliest documentation on HTML, as far as I know, is [HyperText Mark-up Language](http://info.cern.ch/hypertext/WWW/MarkUp/MarkUp.html), from CERN, 1992 ([also hosted on w3.org](https://www.w3.org/History/19921103-hypertext/hypertext/WWW/MarkUp/MarkUp.html)). The first paragraph reads:

> The WWW system uses marked-up text to represent a hypertext document for transmision over the network. The hypertext mark-up language is an SGML format. WWW parsers should ignore tags which they do not understand, and ignore attributes which they do not understand of tags which they do understand.

Already here, it is established that HTML is an SGML format, but that parsers should ignore tags and attributes they don't understand.

The next few drafts are at IETF:
* [Hypertext Markup Language (HTML)](https://tools.ietf.org/id/draft-ietf-iiir-html-00.txt), also known as "draft-ietf-iiir-html-00", June 1993
* [HyperText Markup Language Specification - 2.0](https://datatracker.ietf.org/doc/html/draft-ietf-html-spec-00), November 1994

These maintain that HTML is an SGML document type, however draft-ietf-iiir-html-00 also says:

> Conversely, to implement an HTML parser, one need only implement those parts of an SGML parser that are needed to parse an instance after parsing the HTML DTD.

Standard Generalized Markup Language (SGML) is a syntax framework for defining markup languages which predates HTML and the web, defined in 1986. HTML was originally inspired by SGML (in particular the [SGMLguid](https://en.wikipedia.org/wiki/SGMLguid) language, an application of SGML), and later defined to be a proper application of SGML. However, web browsers have never used an actual SGML parser to parse HTML.

To parse a document, SGML required a Document Type Definition (DTD), which was specified in the doctype declaration. The DTD specifies which tags are optional, which attributes are allowed (and their values for enumerated attributes), how elements are allowed to be nested, and so forth. HTML user agents roughly integrated the DTD semantics directly into the parser without caring about how things were formally defined, and were able to parse HTML regardless of the doctype declaration.

SGML has some convenience markup features that browsers did not implement for HTML. For example, a feature called SHORTTAG allowed syntax like this:

```html
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN">
<html>
<title/Misinterpreted/
<p/Little-known SGML markup features/
</html>
```

…which is, per SGML rules, equivalent to:

```html
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN">
<html>
<title>Misinterpreted</title>
<p>Little-known SGML markup features</p>
</html>
```

But browsers parse it as a `title` start tag with a bunch of attributes, until they find a `>`:

```dom-tree
#document
├── DOCTYPE: html
└── html
    ├── head
    │   └── title misinterpreted="" <p="" little-known="" sgml="" markup="" features="" <="" html=""
    └── body
```

You may have come in contact with an SGML parser when validating your markup, for example at [validator.w3.org](https://validator.w3.org). Up to and including HTML4, it used a DTD-based validator for HTML, which used an SGML parser. The example above would thus validate but not work in browsers. More recently, validator.w3.org started to emit warnings whenever the SHORTTAG feature was used.

As an interesting aside, when using the XML "`/>`" syntax in HTML, according to SGML rules it would trigger the SHORTTAG feature. When used on a void element, the slash just marks the end of the start tag, and the "`>`" is text content. Therefore, the following are equivalent:

```html
<link rel="stylesheet" href="style.css" />
```

```html
<link rel="stylesheet" href="style.css">>
```

Note the extra "`>`" at the end. This is equivalent to having the "`>`" escaped as a character reference:

```html
<link rel="stylesheet" href="style.css">&gt;
```

Since the "`>`" (or `&gt;`) is text, and text is not allowed in `head`, this implicitly opens the `body` element (the start and end tags of `head` and `body` are optional). However, note that web browsers never supported the SHORTTAG feature, and would instead basically ignore the slash, so it has not been any problem in practice to use "`/>`" on void elements (such as `link`) in HTML.

SGML is incompatible with HTML in other ways as well. For example, enumerated attributes can be shortened to only the *value* per SGML, but HTML user agents parse it as an *attribute name*.

```html
<input checkbox>
```

…is per SGML rules equivalent to:

```html
<input type="checkbox">
```

…but HTML parsers treat it as:

```html
<input checkbox="">
```

SGML also did not specify any error handling behavior. Meanwhile, web content was overwhelmingly erroneous and relied on error handling that browsers employed.

The HTML standard has the following note about the relationship to SGML:

> While the HTML syntax described in this specification bears a close resemblance to SGML and XML, it is a separate language with its own parsing rules.
>
> Some earlier versions of HTML (in particular from HTML2 to HTML4) were based on SGML and used SGML parsing rules. However, few (if any) web browsers ever implemented true SGML parsing for HTML documents; the only user agents to strictly handle HTML as an SGML application have historically been validators. The resulting confusion — with validators claiming documents to have one representation while widely deployed Web browsers interoperably implemented a different representation — has wasted decades of productivity. This version of HTML thus returns to a non-SGML basis.
>
> Authors interested in using SGML tools in their authoring pipeline are encouraged to use XML tools and the XML serialization of HTML.

In 2000, before Netscape 6 was released, [Gecko had a parser mode](https://bugzilla.mozilla.org/show_bug.cgi?id=40190) called "Strict DTD" that enforced stricter rules for HTML for documents with certain doctypes. This was quickly found to be incompatible with existing web content, and was [removed](https://bugzilla.mozilla.org/show_bug.cgi?id=50070) only two months after the parser mode was turned on in beta.

### XML & XHTML

XML is, like SGML, a syntax framework for defining markup languages, and is a simplification of SGML. Unlike SGML, XML defined error handling – a syntax error must halt normal processing. It omitted many features of SGML, such as SHORTTAG and optional tags. This allowed for parsing documents without reading the DTD. DTDs were retained in XML to allow for validation, although better schema languages were developed later. In hindsight it would have been a good opportunity to drop DTD support from XML, as it complicates the parser quite a bit.

XHTML 1.0 is a reformulation of HTML 4.01 in XML. It has all the same features as HTML 4.01. Although it is technically XML, most XHTML web content was using the HTML MIME type `text/html`, which meant that browsers would use the HTML parser. The XHTML 1.0 specification has an appendix that specifies guidelines for how to write XHTML 1.0 documents while being compatible with HTML user agents. For example, section C.2. says:

> Include a space before the trailing `/` and `>` of empty elements, e.g. `<br />`, `<hr />` and `<img src="karen.jpg" alt="Karen" />`. Also, use the minimized tag syntax for empty elements, e.g. `<br />`, as the alternative syntax `<br></br>` allowed by XML gives uncertain results in many existing user agents.

Indeed, the HTML standard now specifies that `</br>` is to be parsed as `<br>`. The space before the slash was for compatibility with Netscape 4, which would parse `<br/>` as an element `br/` which is not a known HTML element.

### Internet Explorer, Firefox, Safari & Opera

When the HTML parser was first specified [in 2006](http://ln.hixie.ch/?start=1137740632&count=1), Internet Explorer was at version 6.

IE6 had an interesting HTML parser. It did not necessarily produce a tree; rather it would produce a graph, to more faithfully preserve author intent. Ill-formed markup, e.g., `<em><p></em></p>`, would result in an ill-formed DOM. This could cause scripts to go into infinite loops by just trying to iterate over the DOM.

In early 2006, Firefox was at version 1.5. Its HTML parser had its own interesting effects, but unlike IE it would always produce a strict DOM tree. Safari was similar to Mozilla, but had a different approach to handling misnested blocks in inlines. Opera also had its own approach, which involved styling nodes in ways that could not be explained by looking at the DOM tree alone. To understand what was going on, let's go back and read what Ian Hickson, then the editor of the HTML standard, [found when he was specifying the HTML parser](http://ln.hixie.ch/?start=1138169545&count=1).

> Imagine the following (invalid) markup:
>
> ```html
> <!DOCTYPE html><em><p>XY</p></em>
> ```
>
> What should the DOM look like? The general consensus is that the DOM should look like this:
>
> ```dom-tree
> #document
> ├── DOCTYPE: html
> └── html
>     ├── head
>     └── body
>         └── em
>             └── p
>                 └── #text: XY
> ```
>
> That is, the p element should be completely inside (that is, a child of) the em element.
>
> No problem so far.
>
> Now consider this markup:
>
> ```html
> <!DOCTYPE html><em><p>X</em>Y</p>
> ```
>
> What should the DOM look like?
>
> This is where things start getting hairy. I've covered [a similar case](http://ln.hixie.ch/?start=1037910467&count=1) before, so I'll just summarise the results:
>
> Windows Internet Explorer
>
> The DOM is not a tree. The text node for the "Y" is a child of both the p element and the body element. Violates the DOM Core specifications.
>
> Opera
>
> The DOM is a simple tree, the same as for the first case, but the "Y" is not emphasised. Violates the CSS specifications.
>
> Mozilla and Safari
>
> The DOM looks like this:
>
> ```dom-tree
> #document
> ├── DOCTYPE: html
> └── html
>     ├── head
>     └── body
>         ├── em
>         └── p
>             ├── em
>             │   └── #text: X
>             └── #text: Y
> ```
>
> …which basically means that malformed invalid markup gets handled differently than well-formed invalid markup.
>
> In the past, I would have stopped here, made some wry comment about the insanity that is the Web, and called it a day.
>
> But I'm **trying to spec this**. Stopping is not an option.
>
> What IE does is insane. What Opera does is also insane. Neither of those options is something that I can put in a specification with a straight face.
>
> This leaves the Mozilla/Safari method.
>
> It's weird, though. If you look at the two examples above, you'll notice that their respective markups start the same — both of them start with this markup:
>
> ```html
> <!DOCTYPE html><em><p>X
> ```
>
> Yet the end result is quite different, with one of the elements (the p) having different parents in the two cases. So when do the browsers decide what to do? They can't be buffering content up and deciding what to do later, since that would break incremental rendering. So what exactly is going on?
>
> Well, let's check. What do Mozilla and Safari do for that truncated piece of markup?
>
> Mozilla
>
> ```dom-tree
> #document
> ├── DOCTYPE: html
> └── html
>     ├── head
>     └── body
>         ├── em
>         └── p
>             └── em
>                 └── #text: X
> ```
>
> Safari
>
> ```dom-tree
> #document
> └── html
>     └── body
>         └── em
>             └── p
>                 └── #text: X
> ```
>
> Hrm. They disagree. Mozilla is using the "malformed" version, and Safari is using the "well-formed" version. Why? How do they decide?
>
> Let's look at Safari first, by running a script while the parser is running. First, the simple case:
>
> ```html
> <!DOCTYPE html>
> <em>
>  <p>
>   XY
>   <script>
>    var p = document.getElementsByTagName('p')[0];
>    p.title = p.parentNode.tagName;
>   </script>
>  </p>
> </em>
> ```
>
> Result:
>
> ```dom-tree
> #document
> └── html
>     └── body
>         └── em
>             ├── #text:
>             ├── p title="EM"
>             │   ├── #text:  XY
>             │   ├── script
>             │   │   └── #text:  var p = document.getElementsByTagName('p')[0]; p.title = p.parentNode.tagName;
>             │   └── #text:
>             └── #text:
> ```
>
> Exactly as we'd expect. The parentNode of the p element as shown in the DOM tree view is the same as shown in the title attribute value, namely, the `em` element.
>
> Now let's try the bad markup case:
>
> ```html
> <!DOCTYPE html>
> <em>
>  <p>
>   X
>   <script>
>    var p = document.getElementsByTagName('p')[0];
>    p.title = p.parentNode.tagName;
>   </script>
>  </em>
>  Y
> </p>
> ```
>
> Result:
>
> ```dom-tree
> #document
> └── html
>     └── body
>         ├── em
>         │   └── #text:
>         └── p title="EM"
>             ├── em
>             │   ├── #text:  X
>             │   ├── script
>             │   │   └── #text:  var p = document.getElementsByTagName('p')[0]; p.title = p.parentNode.tagName;
>             │   └── #text:
>             └── #text:  Y
> ```
>
> Wait, what?
>
> When the embedded script ran, the parent of the `p` was the `em`, but when the parser had finished, the DOM had changed, and the parent was no longer the `em` node!
>
> If we look a little closer:
>
> ```html
> <!DOCTYPE html>
> <em>
>  <p>
>   X
>   <script>
>    var p = document.getElementsByTagName('p')[0];
>    p.setAttribute('a', p.parentNode.tagName);
>   </script>
>  </em>
>  Y
>  <script>
>   var p = document.getElementsByTagName('p')[0];
>   p.setAttribute('b', p.parentNode.tagName);
>  </script>
> </p>
> ```
>
> …we find:
>
> ```dom-tree
> #document
> └── html
>     └── body
>         ├── em
>         │   └── #text:
>         └── p a="EM" b="BODY"
>             ├── em
>             │   ├── #text:  X
>             │   ├── script
>             │   │   └── #text:  var p = document.getElementsByTagName('p')[0]; p.setAttribute('a', p.parentN…
>             │   └── #text:
>             ├── #text:  Y
>             ├── script
>             │   └── #text:  var p = document.getElementsByTagName('p')[0]; p.setAttribute('b', p.parentN…
>             └── #text:
> ```
>
> …which is to say, the parent changes half way through! (Compare the a and b attributes.)
>
> What actually happens is that Safari notices that something bad has happened, and moves the element around in the DOM. After the fact. (If you remove the p element from the DOM in that first script block, then [Safari crashes](http://bugs.webkit.org/show_bug.cgi?id=6778).)
>
> How about Mozilla? Let's try the same trick. The result:
>
> ```dom-tree
> #document
> └── html
>     └── body
>         ├── em
>         │   └── #text:
>         └── p a="BODY" b="BODY"
>             ├── em
>             │   ├── #text:  X
>             │   ├── script
>             │   │   └── #text:  var p = document.getElementsByTagName('p')[0]; p.setAttribute('a', p.parentN…
>             │   └── #text:
>             ├── #text:  Y
>             ├── script
>             │   └── #text:  var p = document.getElementsByTagName('p')[0]; p.setAttribute('b', p.parentN…
>             └── #text:
> ```
>
> It doesn't reparent the node. So what does Mozilla do?
>
> It turns out that Mozilla does a pre-parse of the source, and if a part of it is well-formed, it creates a well-formed tree for it, but if the markup isn't well-formed, or if there are any script blocks, or, for that matter, if the TCP/IP packet boundary happens to fall in the wrong place, or if you write the document out in two document.write()s instead of one, then it'll make the more thorough nesting that handles ill-formed content.
>
> Who would have thought that you would find Heisenberg-like quantum effects in an HTML parser. I mean, I knew they were obscure, but this is just taking the biscuit.
>
> The problem is I now have to determine which of these four options to make the other three browsers implement (that is, which do I put in the spec). What do you think is the most likely to be accepted by the others? As a reminder, the options are incestual elements that can be their own uncles, elements who have secret lives in the rendering engine, elements that change their mind about who their parents are half-way through their childhood, and quantum elements whose parents change depending on whether you observe their birth or not.
>
> The key requirements are probably:
>
> * Coherence: scripts that rely on DOM invariants (like the fact that the DOM is a tree) shouldn't go off into infinite loops.
>
> * Transparency: we shouldn't have to describe a whole extra section that explains how the CSS rendering engine applies to HTML DOMs; CSS should just work on the real DOM as you would see it from script.
>
> * Predictability: it shouldn't depend on, e.g., the protocol or network conditions — every browser should get the same DOM for the same original markup in all situations.
>
> The least worse [sic] option is probably the Safari-style on-the-fly reparenting, I think, but I'm not sure. It's the only one that fits those requirements. Is there a fifth option I'm missing?

Well, it appeared that there wasn't a fifth option, as the Safari approach was what was adopted. This is called the Adoption Agency Algorithm in the HTML standard.

## The HTML parser is specified

A couple of years prior to the HTML parser being specified, in June 2004, the W3C decided to discontinue work on HTML at a workshop on [Web Applications and Compound Documents](https://www.w3.org/2004/04/webapps-cdf-ws/). In response, Opera, Mozilla, and Apple set up the Web Hypertext Application Technology Working Group (WHATWG), an initiative, open for anyone to contribute, to extend HTML in a backwards-compatible manner (in contrast with the W3C XForms and XHTML 2.0 specifications, which were [by design not backwards compatible](https://wiki.whatwg.org/wiki/W3C#History)). One of the grounding principles of the WHATWG was well-defined error handling, which had not been addressed for HTML previously.

In February 2006, Ian Hickson [announced on the WHATWG mailing list](https://lists.w3.org/Archives/Public/public-whatwg-archive/2006Feb/0111.html) that "the first draft of the HTML5 Parsing spec is ready". He had done what had never been attempted before; define how to parse HTML.

> So…
>
> The first draft of the HTML5 Parsing spec is ready.
>
> I plan to start implementing it at some point in the next few months, to see how well it fares.
>
> It is, in theory, more compatible with IE than Safari, Mozilla, and Opera, but there are places where it makes intentional deviations (e.g. the comment parsing, and it doesn't allow `<object>` in the `<head>` -- browsers are inconsistent about this at the moment, and we're dropping declare="" in HTML5 anyway so it isn't needed anymore; I plan to look for data on how common this is in the Web at some point in the future to see if it's ok for us to do this).
>
> It's not 100% complete. Some of the things that need work are:
>
> * Interaction with document.open/write/close is undefined
>
> * How to determine the character encoding
>
> * Integration with quirks mode problems
>
> * `<style>` parsing needs tweaking if we want to exactly match IE
>
> * `<base>` parsing needs tweaking to handle multiple `<base>`s
>
> * `<isindex>` needs some prose in the form submission section
>
> * No-frames and no-script modes aren't yet defined
>
> * Execution of `<script>` is not yet defined
>
> * New HTML5 elements aren't yet defined
>
> * There are various cases (marked) where EOF handling is undefined
>
> * Interaction with the "load" event is undefined
>
> However, none of the above are particularly critical to the parsing.
>
> If you have any comments, please send them. This part of the spec should be relatively stable now, so now is a good time to review it if you want to. And if anyone wants to implement it to test it against the real live Web content out there, that's encouraged too. :-)
>
> The more evidence we have that this parsing model is solid and works with the real Web, the more likely we are to be able to convince Apple/Safari/Mozilla to implement it. And if all the browsers implement the same parsing model, then HTML interoperability on the Web will take a huge leap forward. T'would be save [sic] everyone a lot of time.

Wouldn't it, indeed.

The following table shows when each browser shipped with a new HTML parser implementation, conforming to the specification.

| Browser           | Version | Release date |
|-------------------|---------|--------------|
| Firefox           | 4       | 2011-03-22   |
| Safari            | 5.1     | 2011-07-20   |
| Opera             | 12      | 2012-08-30   |
| Internet Explorer | 10      | 2012-09-04   |
