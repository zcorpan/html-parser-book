# Appendix B. Conformance checkers

## DTD-based validators

TODO

## Validator.nu

TODO

### Most common errors

I asked Mike Smith, who contributes to the Validator.nu code base and maintains validator.w3.org and checker.html5.org, about error logs from the validator. He kindly gave me raw logs for one of the instances. I filtered for the messages that come from the Validator.nu HTML parser and normalized the error messages by replacing variable parts with "X", then counted a particular error for a given URL only once. The distribution of these errors are given in the table below.

| Percent | Message
|---------|--------
| 21.15%  | Stray end tag "X".
| 11.97%  | Start tag "X" seen but an element of the same type was already open.
| 9.57%   | No "X" element in scope but a "X" end tag seen.
| 9.11%   | End tag "X" seen, but there were open elements.
| 6.69%   | No space between attributes.
| 5.77%   | Bad start tag in "X" in "head".
| 5.40%   | Duplicate attribute "X".
| 4.50%   | Stray start tag "X".
| 3.32%   | End tag for "X" seen, but there were unclosed elements.
| 2.58%   | Quote "X" in attribute name. Probable cause: Matching quote missing somewhere earlier.
| 2.46%   | Self-closing syntax ("`/>`") used on a non-void HTML element. Ignoring the slash and treating as a start tag.
| 2.43%   | End tag "br".
| 2.30%   | End tag "X" violates nesting rules.
| 1.40%   | Named character reference was not terminated by a semicolon. (Or "`&`" should have been escaped as "`&amp;`".)
| 1.39%   | "X" in an unquoted attribute value. Probable causes: Attributes running together or a URL query string in an unquoted attribute value.
| 1.25%   | Saw "`<`" when expecting an attribute name. Probable cause: "`>`" missing immediately before.
| 0.98%   | A slash was not immediately followed by "`>`".
| 0.93%   | Stray doctype.
| 0.92%   | Saw "`<!--`" within a comment. Probable cause: Nested comment (not allowed).
| 0.71%   | "X" element between "head" and "body".
| 0.71%   | End tag "X" implied, but there were open elements.
| 0.70%   | Non-space character inside "noscript" inside "head".
| 0.62%   | Start tag "X" seen in "table".
| 0.56%   | Saw "X" when expecting an attribute name. Probable cause: Missing "`=`" immediately before.
| 0.53%   | Bad character "X" after "`<`". Probable cause: Unescaped "`<`". Try escaping it as "`&lt;`".
| 0.41%   | Bogus comment.
| 0.33%   | "X" start tag in table body.
| 0.31%   | Heading cannot be a child of another heading.
| 0.23%   | End of file seen and there were open elements.
| 0.23%   | Character reference was not terminated by a semicolon.
| 0.23%   | End tag had attributes.
| 0.15%   | A numeric character reference expanded to the C1 controls range.
| 0.15%   | Saw a "form" start tag, but there was already an active "form" element. Nested forms are not allowed. Ignoring the tag.

The table is truncated at 0.1%.

About 73% of the errors are about mismatched tags (e.g., the first 4 errors, "Bad start tag in "X" in "head".", "Stray start tag "X".", and so on).

The error "No space between attributes." is pretty harmless. In fact it was conforming in HTML4 to omit space between attributes (when they use single or double quotes).

"Duplicate attribute "X"." is pretty high in the list. Only the first attribute is used, subsequent attributes with the same name are ignored.

"Quote "X" in attribute name. Probable cause: Matching quote missing somewhere earlier." means that the author likely somehow messed up quoting around attribute values.

"Self-closing syntax ("`/>`") used on a non-void HTML element. Ignoring the slash and treating as a start tag." means that "/>" was incorrectly used on a regular HTML element, which is not supported. It might help to avoid using "/>" syntax altogether in HTML (except for SVG and MathML).

"End tag "br"." is treated as a start tag. For example, `<br></br>` is equivalent to `<br><br>`.

"Named character reference was not terminated by a semicolon. (Or "`&`" should have been escaped as "`&amp;`".)" means that `&foo` was parsed as a supported named character reference, but the `;` was omitted.
