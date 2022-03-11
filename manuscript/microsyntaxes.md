---
layout: chapter.njk
title: Microsyntaxes
next: bibliography
nextTitle: Bibliography
toc: true
---
# Appendix C. Microsyntaxes

Microsyntaxes in HTML are technically not part of the HTML parser. Instead they are a layer above, (usually) operating on attribute values. For example, boolean attributes have a simple microsyntax, where the allowed value is either the empty string or the same as the attribute name, case-insensitively, and the processing is to ignore the value.

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

* Revamp coords parsing to be more compatible and less insane*

* The old parser tried to mimic IE as close as possible. Now Edge is instead interested in aligning with Gecko/WebKit. This new algorithm was designed by studying implementations as well as invalid Web content.*

* At the same time, support parsing of floating point numbers, as suggested by Travis Leithead in the bug below.*

* Fixes https://www.w3.org/Bugs/Public/show_bug.cgi?id=28148.*

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

A naïve processing would be to split the string on commas and then split on whitespace, to get a list of URLs and their descriptors. However, this would fail to correctly parse URLs that contain commas (for example data: URLs), and, for the purpose of compatibility with possible future complex descriptors, the parsing of those are more involved, too.

The processing is as follows:

* Leading whitespace and commas are skipped. Leading commas are non-conforming.

* If the end of the string is reached, return the parsed candidates.

* Any non-whitespace is collected for the URL.

* If the URL ends with a comma, then all trailing commas are removed (only a single trailing comma is conforming). Otherwise, descriptors for the current item are parsed:

  * A state machine is used to tokenize descriptors. This is to handle whitespace and commas inside parentheses. For example, `size(50, 50, 30)` is tokenized to a single descriptor. A top-level comma ends the tokenizer.

* The tokenized descriptors are parsed into *density*, *width*, and *future-compat-h*. The last one is for gracefully handling future web content that uses not-yet-specified *height* descriptors in addition to *width* descriptors. If any of the descriptors are invalid, the entire candidate is dropped.

* Run the above steps in a loop.

### Sizes

## Colors

## Meta refresh
