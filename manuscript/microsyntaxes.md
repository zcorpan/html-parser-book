---
layout: chapter.njk
title: Microsyntaxes
next: end
---
# Appendix C. Microsyntaxes

Microsyntaxes in HTML are technically not part of the HTML parser. Instead they are a layer above, operating on (usually) attribute values. For example, boolean attributes have a simple microsyntax, where the allowed value is either the empty string or the same as the attribute name, case-insensitively, and the processing is to ignore the value.

These are thus valid:

```html
<input disabled="">
<input disabled="disabled">
<input disabled="DISABLED">
```

This is invalid, but is treated the same as the above (the input is disabled):

```html
<input disabled="false">
```

Some of the more interesting microsyntaxes are explained in this chapter.

## Numbers

HTML has the following kinds of numbers:

* Integers

    * Signed integers

    * Non-negative integers

* Dimensions

    * Percentages and lengths

* Non-zero percentages and lengths

* Floating-point numbers

It further specifies lists of floating-point numbers (used for {% ref "microsyntaxes", "image map coordinates" %}), and lists of dimensions (used by the `cols` and `rows` attributes on `frameset`, not covered in this book).

### Integers

The format of a signed integer is an optional "-" followed by one or more ASCII digits. The format of non-negative integers is just ASCII digits.

The processing of signed integers is as follows:

* Leading whitespace is skipped.

* A "+" sign before the number is ignored (and is non-conforming).

* A "-" sign before the number makes the number negative.

* The following ASCII digits, if any, are collected.

* Trailing garbage is ignored.

* If there is leading garbage, or if there is no number, then an error is returned. Otherwise the parsed number is returned.

The processing of non-negative integers is the same as that of signed integers, except that negative values result in an error.

### Dimensions

The allowed format for dimensions in HTML (for example for the `width` attribute of `img`) is simply that of non-negative integers.

The processing allows for fractions and percentages, but that is non-conforming to use.

* Leading whitespace is skipped.

* A "+" sign before the number is ignored (and is non-conforming).

* A "-" sign before the number makes the number negative.

* The following ASCII digits, and the fraction (if any), are collected.

* If there is a "%" sign after the number, it marks the number as a percentage.

* Trailing garbage is ignored.

* If there is leading garbage, or if there is no number, then an error is returned. Otherwise the return value is the parsed number and the kind of value (percentage or length).

The processing of non-zero dimensions is the same as that of dimensions, except that negative values result in an error.

### Floating-point numbers

HTML, JavaScript and CSS all have their own definitions of floating-point numbers. HTML differs from the other two in the format in that a leading "+" sign is not allowed, and if the number is a fraction of one, the leading "0" cannot be omitted. HTML and CSS further cannot represent the Infinity or NaN values.

The following are examples of HTML floating-point numbers.

1

-5.2

1.9e3

1.9E+3

1.9e-3

The numbers with an "e" are using so-called scientific notation, and means the number before the "e" times 10 to the power of the number after the "e". 1.9e3 thus means 1900.

The processing is as follows:

* Leading whitespace is skipped.

* A "+" sign before the number is ignored (and is non-conforming).

* A "-" sign before the number makes the number negative.

* The following ASCII digits, the fraction (if any), the "e" or "E" and the exponent (if any), are collected.

* Trailing garbage is ignored.

* If there is leading garbage, or if there is no number, then an error is returned. Otherwise the parsed number is returned, converted to a finite IEEE 754 double-precision floating-point value. (TODO link)

## Image map coordinates

The `area` element represents an area of an image that is a hyperlink. The coordinates of this area is described using the `coords` attributes, which is a list of floating-point numbers, each separated by a "," character (and no other characters, e.g, no whitespace).

```html
<img src="cats.jpg" alt="The cats Hedral and Pillar" usemap="#cats">
<map name="cats">
 <area href="hedral.html" shape="rect" coords="50,50,150,200" alt="Hedral">
 <area href="pillar.html" shape="circle" coords="300,150,100" alt="Pillar">
</map>
```

The processing is as follows:

* Leading whitespace, commas and semicolons are ignored.

* For each value in the list:

    * Leading garbage (anything but whitespace, comma, semicolon, ASCII digits, "." or "-") is ignored.

    * The number is parsed as a floating-point number. If that returns an error, zero is used instead.

    * Trailing garbage is ignored.

    * Whitespace, comma, or semicolon separates one value from the next.

In January 2016, I changed the specification for parsing lists of floating-point numbers (TODO link ead6cfe392d338b66ed85fa84855061fd0990431). The commit message is as follows:

*Revamp coords parsing to be more compatible and less insane*

*The old parser tried to mimic IE as close as possible. Now Edge is instead interested in aligning with Gecko/WebKit. This new algorithm was designed by studying implementations as well as invalid Web content.*

*At the same time, support parsing of floating point numbers, as suggested by Travis Leithead in the bug below.*

*Fixes https://www.w3.org/Bugs/Public/show_bug.cgi?id=28148.*

Before the change, only integers were allowed, and using a fraction in a number caused that value to be ignored, which was not particularly useful. The handling of bogus values was also especially strange, sometimes dropping all subsequent values.

## Responsive images

In May 2012, Ian Hickson added a `srcset` attribute to the `img` element, to address the needs of being able to use images of different resolution depending on the resolution of the screen, and images of different size depending on the viewport size.

Separately, a group of web developers were advocating for an element-based solution instead (`picture`), similar to the markup for the `audio` and `video` elements, citing that the proposed `srcset` syntax was hard to grasp. The Responsive Images Community Group (RICG) was started. TODO link

In the end (2014), both the `picture` element and the `srcset` attribute were specified, since they could complement each other. A `sizes` attribute was also added, to be used together with "width" descriptors in the `srcset` attribute. For an introduction to responsive images, see the relevant section in the HTML standard TODO link, or TODO other link.

### Srcset

The format of the srcset attribute is as follows:

* One or more *image candidate strings*, separated by a comma.

* An *image candidate string* has this format:

    * Optional whitespace.

    * A non-empty URL that doesn't start or end with a comma.

    * Optionally a descriptor:

        * A *width descriptor*: Whitespace, a non-negative integer, and a "w" character.

        * A *pixel density descriptor*: Whitespace, a floating-point number, and an "x" character.

    * Optional whitespace.

* If an *image candidate string* has no descriptors and no trailing whitespace, then the next *image candidate string* must begin with whitespace (otherwise it would get jammed together with the previous URL).

The `srcset` microsyntax doesn't have legacy baggage (other than URLs) to attribute its complexity to. It was a new attribute and the syntax was designed. However, a number of requirements led to complexity anyway:

* graceful error handling: in the spirit of HTML, an error somewhere shouldn't cause the entire attribute value to be ignored.

* compatibility with URLs: URLs can contain basically any character and should still work. A naïve processing would be to split the string on commas and then split on whitespace, to get a list of URLs and their descriptors. However, this would fail to correctly parse URLs that contain commas (for example, `data:` URLs).

* support future extensions: it should be possible to add new descriptors in the future without causing unexpected behavior in legacy user agents that don't support the new descriptor. One such anticipated descriptor is a descriptor analogous to the `integrity` attribute on `script` and `link` -- integrity checks would need to be per URL, so for images, each URL in `srcset` would need to be annotated individually.

The processing is as follows:

* Leading whitespace and commas are skipped. Leading commas are non-conforming.

* If the end of the string is reached, return the parsed candidates.

* Any non-whitespace is collected for the URL.

* If the URL ends with a comma, then all trailing commas are removed (only a single trailing comma is conforming). Otherwise, descriptors for the current item are parsed:

    * A state machine is used to tokenize descriptors. This is to handle whitespace and commas inside parentheses. For example, `size(50, 50, 30)` is tokenized to a single descriptor. A top-level comma ends the descriptors tokenizer.

* The tokenized descriptors are parsed into *density*, *width*, and *future-compat-h*. If any of the descriptors are invalid, the entire candidate is dropped. The *future-compat-h* descriptor is for gracefully handling future web content that uses not-yet-specified *height* descriptors in addition to *width* descriptors. Instead of dropping the candidate when seeing a "h" descriptor, only that descriptor is ignored.

* Run the above steps in a loop until reaching the end of the string.

### Sizes

The `sizes` attribute is used in conjuction with the `srcset` attribute when *width* descriptors are used. The *width* descriptor tells the browser the width of the image resource, and the `sizes` attribute tells the browser what the *intended* layout size is for the image.

You may wonder why this attribute is needed in the first place. Can't the browser just use the layout information that is provided in the CSS to decide which image to load?

To answer this question, we first need to know a bit about how browsers load web pages. When navigating to a web page, the browser will first receive the HTML, and it will subsequently fetch further resources as it finds them in the HTML. For most kinds of resources, the HTML parser will continue processing while the subresource is being fetched. So for a simple document that includes an external stylesheet and then an image, the browser will fetch both in parallel.

```html
<!doctype html>
<link rel=stylesheet href=style.css>
<img src=image.png alt="wow">
```

This means that the browser can't wait for `style.css` to be available before starting to load the image, as that would regress page load performance.

There are other scenarios to consider as well, but the above is the simplest one and is enough to justify the `sizes` attribute.

A more complicated scenario involves `script` elements that block the HTML parser and an optimization that browsers have, the speculative tokenizer or speculative parser, that speculatively continues to process HTML past a blocking `script` element and speculatively fetch further subresources found, such as scripts, stylesheets, and images. A `script` element blocks the HTML parser if it is external (has a `src` attribute) and is a classic script (not `type="module"`) and does not use `async` or `defer` attributes.

```html
<!doctype html>
<script src=script.js></script>
<link rel=stylesheet href=style.css>
<img src=image.png alt="wow">
```

The reason scripts can block the HTML parser is that scripts can call `document.write()`, which can change the state of the HTML parser and thus change the meaning of all markup after the `</script>` end tag. Consider `script.js` being the script `document.write('<!--');`. This would cause the rest of the page to be commented out, and thus not reference any subresources. Any speculative fetches would be invalidated and discarded.

In this scenario, the impact for image fetches is the same as before: stylesheets may not be available at the time the browser wants to start an image fetch (speculatively or not). However, browsers wanted to not regress page load performance even for speculative image fetches. This was a requirement that a solution for responsive images needed to address somehow. We ended up with the `sizes` attribute to encode intended layout size for each image.

In the simplest case, the `sizes` attribute has a single value, which is a CSS `<length>`. In the following example, `50vw` means half the width of the viewport.

```html
<img srcset="small.jpg 640w, large.jpg 1280w" sizes="50vw">
```

The intended layout size of an image often depends on how much space is available. In CSS, page layout can be made fluid, e.g., by using percentage widths. The layout can be further adapted to better suit different viewport sizes using *breakpoints*: using media queries, the page can switch to a single column layout for narrow viewports and a multiple column layout for wider viewports.

To support this, the `sizes` attribute can provide several widths for different breakpoints.

The syntax is a `<source-size-list>`, defined as follows:

```css-value-syntax-definition
<source-size-list> = [ <source-size># , ]? <source-size-value>
<source-size> = <media-condition> <source-size-value>
<source-size-value> = <length>
```

This uses CSS value syntax definition (TODO link). CSS syntax features work in this attribute, e.g., character escapes and CSS comments.

In English, the syntax is:

* optionally, a comma-separated list of one or more `<source-size>`, followed by a comma
* a `<source-size-value>` (a CSS length)

A `<source-size>` is a media condition, a space, and then a `<source-size-value>` (a CSS length).

However, the parsing doesn't use the normal CSS property value rules. For a CSS property, a syntax error causes the entire declaration to be ignored. This wouldn't allow for graceful degradation in legacy browsers when new features are added to `sizes`, which wouldn't be ideal. Instead, `sizes` uses an approach similar to how CSS parses media query lists: an error in one media query causes only that media query to be ignored, not the entire list of media queries.

```css
@media (min-width: 500px), (unknown-feature: 123), print { ... }
```

`(unknown-feature: 123)` is invalid, so it is dropped, but the `(min-width: 500px)` and `print` media queries can still apply.

Side note: *media condition* (used in `sizes`) is different from *media query* (used in `@media` and HTML `media` attributes). The difference is that media conditions do not include media types such as `screen` and `print`. TODO rationale

So the `sizes` attribute has its own algorithm to gracefully parse its value:

> When asked to parse a sizes attribute from an element, with a fallback width *width*, [parse a comma-separated list of component values](https://drafts.csswg.org/css-syntax/#parse-a-comma-separated-list-of-component-values) from the value of the element's sizes attribute (or the empty string, if the attribute is absent), and let unparsed sizes list be the result. [CSSSYNTAX]
>
> For each *unparsed size* in *unparsed sizes list*:
>
> 1. Remove all consecutive `<whitespace-token>`s from the end of *unparsed size*. If *unparsed size* is now empty, that is a parse error; continue to the next iteration of this algorithm.

This just trims trailing whitespace, and skips over empty *unparsed size*s.

> 2. If the last [component value](https://drafts.csswg.org/css-syntax/#component-value) in *unparsed size* is a valid non-negative `<source-size-value>`, let size be its value and remove the component value from unparsed size. Any CSS function other than the [math functions](https://drafts.csswg.org/css-values/#math-function) is invalid. Otherwise, there is a parse error; continue to the next iteration of this algorithm.

This takes the last component value and checks if it's a valid `<source-size-value>`, and removes it from *unparsed size*. If it isn't valid, it skips to the next *unparsed size*.

> 3. Remove all consecutive `<whitespace-token>`s from the end of *unparsed size*. If *unparsed size* is now empty, return *size* and exit this algorithm. If this was not the last item in *unparsed sizes list*, that is a parse error.

Trim trailing whitespace again. At this point, there are two valid possibilities: *unparsed size* is not the last item and matches `<source-size>`, or it *is* the last item and matches `<source-size-value>`. *unparsed size* being empty at this point means it matches `<source-size-value>`, so that is returned. If it wasn't the last value, it means there is further stuff afterwards which will be ignored.

> 4. Parse the remaining component values in *unparsed size* as a `<media-condition>`. If it does not parse correctly, or it does parse correctly but the `<media-condition>` evaluates to false, continue to the next iteration of this algorithm. [MQ]

Reaching this step means we expect *unparsed size* (mutated to remove the trailing `<source-size-value>` and whitespace) to be a media condition. If it is and it matches the current environment, we carry on with the next step (which returns *size*). If not, we skip to the next *unparsed size*.

> 5. Return *size* and exit this algorithm.
>
> If the above algorithm exhausts *unparsed sizes list* without returning a *size* value, follow these steps:
>
> 1. If *width* is not null, return a `<length>` with the value *width* and the unit 'px'.
>
> 2. Return `100vw`.

This happens if there is no `sizes` attribute at all, or if all items are invalid, or don't match and there's no trailing `<source-size-value>` item.

TODO was *width* dropped?

The math functions aspect is interesting, since it allows using `calc()`, and as of recently (TODO date), `min()`, `max()`, `clamp()`, etc. Technically they should work both in the media condition and the `<source-size-value>`, but TODO browser support.

TODO example with min/max.

## Colors

## Meta refresh
