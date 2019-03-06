# Appendix B. Conformance checkers

## DTD-based validators

TODO

## Validator.nu

TODO

### Most common errors

I asked Mike Smith, who contributes to the Validator.nu code base and maintains validator.w3.org and checker.html5.org, about error logs from the validator. He kindly gave me raw logs for one of the instances. I filtered for the messages that come from the Validator.nu HTML parser and normalized the error messages by replacing variable parts with "X", then counted a particular error for a given URL only once. The distribution of these errors are given in the table below.

| Percent | Message | Example | Error correction
|---------|---------|---------|-------------
| 21.15%  | Stray end tag "X". | `<div></span></div>` | `<div></div>`
| 11.97%  | Start tag "X" seen but an element of the same type was already open. | `<a>foo <a>bar</a>` | `<a>foo </a><a>bar</a>`
| 9.57%   | No "X" element in scope but a "X" end tag seen. | `<div></p></div>` | `<div><p></p></div>`
| 9.11%   | End tag "X" seen, but there were open elements. | `<div><span></div>` | `<div><span></span></div>`
| 6.69%   | No space between attributes. | `<div class=""title="">` | `<div class="" title="">`
| 5.77%   | Bad start tag in "X" in "head". | `<head><noscript><div>` | `<head><noscript></noscript></head><body><div>`
| 5.40%   | Duplicate attribute "X". | `<div role="none" role="navigation">` | `<div role="none">`
| 4.50%   | Stray start tag "X". | `<div><tr></div>` | `<div></div>`
| 3.32%   | End tag for "X" seen, but there were unclosed elements. | `<i>(EOF)` | `<i></i></body></html>(EOF)`
| 2.58%   | Quote "X" in attribute name. Probable cause: Matching quote missing somewhere earlier. | `<div class=" title="">` | `<div class=" title=" "="">`
| 2.46%   | Self-closing syntax ("`/>`") used on a non-void HTML element. Ignoring the slash and treating as a start tag. | `<div/>` | `<div>`
| 2.43%   | End tag "br". | `</br>` | `<br>`
| 2.30%   | End tag "X" violates nesting rules. | `<i><p></i>` | Adoption agency algorithm
| 1.40%   | Named character reference was not terminated by a semicolon. (Or "`&`" should have been escaped as "`&amp;`".) | `&nbsp` | `&nbsp;`
| 1.39%   | "X" in an unquoted attribute value. Probable causes: Attributes running together or a URL query string in an unquoted attribute value. | `<a href=?x=y>` | `<a href="?x=y">`
| 1.25%   | Saw "`<`" when expecting an attribute name. Probable cause: "`>`" missing immediately before. | `<div <p>` | `<div <p="">`
| 0.98%   | A slash was not immediately followed by "`>`". | `<div / >` | `<div>`
| 0.93%   | Stray doctype. | `<div><!doctype html></div>` | `<div></div>`
| 0.92%   | Saw "`<!--`" within a comment. Probable cause: Nested comment (not allowed). | `<!-- <!-- --> -->` | The comment is closed on first `-->`
| 0.71%   | "X" element between "head" and "body". | `<head></head><link>` | `<head><link></head>`
| 0.71%   | End tag "X" implied, but there were open elements. | `<ul><li><span><li></ul>` | `<ul><li><span></span><li></ul>
| 0.70%   | Non-space character inside "noscript" inside "head". | `<head><noscript>X` | `<head><noscript></noscript></head><body>X`
| 0.62%   | Start tag "X" seen in "table". | `<table><div>` | `<div></div><table>`
| 0.56%   | Saw "X" when expecting an attribute name. Probable cause: Missing "`=`" immediately before. | `<div class="" ">` | `<div class="" "="">`
| 0.53%   | Bad character "X" after "`<`". Probable cause: Unescaped "`<`". Try escaping it as "`&lt;`". | `2<5` | `2&lt;5`
| 0.41%   | Bogus comment. | `<!x>` | `<!--x-->`
| 0.33%   | "X" start tag in table body. | `<table><td>` | `<table><tbody><tr><td>`
| 0.31%   | Heading cannot be a child of another heading. | `<div><h2>Foo<h2><p>bar</p></div>` | `<div><h2>Foo</h2><h2><p>bar</p></h2></div>`
| 0.23%   | End of file seen and there were open elements. | `<div>(EOF)` | `<div></div>(EOF)`
| 0.23%   | Character reference was not terminated by a semicolon. | `&#xD` | `&#xD;`
| 0.23%   | End tag had attributes. | `</div foo>` | `</div>`
| 0.15%   | A numeric character reference expanded to the C1 controls range. | `&#x80;` | `&#x20AC;`
| 0.15%   | Saw a "form" start tag, but there was already an active "form" element. Nested forms are not allowed. Ignoring the tag. | `<form class="outer"><form class="inner">` | `<form class="outer">`

The table is truncated at 0.1%.

About 73% of the errors are about mismatched tags (e.g., the first 4 errors, "Bad start tag in "X" in "head".", "Stray start tag "X".", and so on).

The error "No space between attributes." is pretty harmless. In fact it was conforming in HTML4 to omit space between attributes (when they use single or double quotes).

"Duplicate attribute "X"." is pretty high in the list. Only the first attribute is used, subsequent attributes with the same name are ignored.

"Quote "X" in attribute name. Probable cause: Matching quote missing somewhere earlier." means that the author likely somehow messed up quoting around attribute values.

"Self-closing syntax ("`/>`") used on a non-void HTML element. Ignoring the slash and treating as a start tag." means that "`/>`" was incorrectly used on a regular HTML element, which is not supported. It might help to avoid using "`/>`" syntax altogether in HTML (except for SVG and MathML).
