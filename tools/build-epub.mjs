import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const siteDir = "_site";
const sourceHtml = path.join(siteDir, "book", "index.html");
const outputFile = path.join(siteDir, "downloads", "html-parser-book.epub");
const bookTitle = "Idiosyncrasies of the HTML parser";
const creator = "Simon Pieters";
const language = "en";
const identifier = "urn:uuid:7af424e0-8860-4b18-9e46-5e38b04eb0df";

const mediaTypes = new Map([
  [".gif", "image/gif"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"]
]);

function die(message) {
  console.error(message);
  process.exit(1);
}

function escapeXml(value) {
  return String(value)
    .replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stripTags(value) {
  return String(value)
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractAttribute(tag, name) {
  const quoted = tag.match(new RegExp(`\\b${name}=(['\"])([\\s\\S]*?)\\1`, "i"));
  if (quoted) {
    return quoted[2];
  }

  const unquoted = tag.match(new RegExp(`\\b${name}=([^\\s>]+)`, "i"));
  return unquoted ? unquoted[1] : "";
}

function setAttribute(tag, name, value) {
  const escaped = escapeXml(value);
  const quoted = new RegExp(`\\b${name}=(['\"])[\\s\\S]*?\\1`, "i");
  const unquoted = new RegExp(`\\b${name}=[^\\s>]+`, "i");

  if (quoted.test(tag)) {
    return tag.replace(quoted, `${name}="${escaped}"`);
  }

  if (unquoted.test(tag)) {
    return tag.replace(unquoted, `${name}="${escaped}"`);
  }

  return tag.replace(/\s*\/?>$/, ` ${name}="${escaped}"/>`);
}

function extractMain(html) {
  const match = String(html).match(/<main\b[^>]*id=["']book["'][^>]*>([\s\S]*?)<\/main>/i);
  if (!match) {
    die(`Could not find <main id="book"> in ${sourceHtml}`);
  }

  return match[1].trim();
}

function closeVoidElements(html) {
  const voidElements = [
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr"
  ];

  for (const element of voidElements) {
    html = html.replace(new RegExp(`<${element}\\b([^>]*)>`, "gi"), (match, attrs) => {
      if (/\/\s*>$/.test(match)) {
        return match;
      }
      return `<${element}${attrs}/>`;
    });
  }

  return html;
}

function rewriteAttributeEntities(html) {
  return html.replace(/\b(href|src)=(['"])([^'"]*)\2/g, (_match, name, quote, value) => {
    return `${name}=${quote}${escapeXml(value)}${quote}`;
  });
}

function removeHeadingoffset(html) {
  return html.replace(/ headingoffset="1"/g, "");
}

function makeXhtml(body) {
  body = body
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/href="\/([^"\/?#]+)\/#([^"]+)"/g, 'href="#$2"')
    .replace(/href='\/([^'\/?#]+)\/#([^']+)'/g, "href='#$2'")
    .replace(/href="\/book\/"/g, 'href="#book"')
    .replace(/href='\/book\/'/g, "href='#book'")
    .replace(/href="\/downloads\/html-parser-book\.epub"/g, 'href="https://htmlparser.info/downloads/html-parser-book.epub"')
    .replace(/href='\/downloads\/html-parser-book\.epub'/g, "href='https://htmlparser.info/downloads/html-parser-book.epub'")
    .replace(/href="\/"/g, 'href="https://htmlparser.info/"')
    .replace(/href='\/'/g, "href='https://htmlparser.info/'");

  body = closeVoidElements(body);
  body = rewriteAttributeEntities(body);
  body = removeHeadingoffset(body);

  return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="${language}" xml:lang="${language}">
<head>
  <title>${escapeXml(bookTitle)}</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
  <main id="book">
${body}
  </main>
</body>
</html>
`;
}

function destinationForAsset(assetPath, usedNames) {
  const clean = assetPath.replace(/^\/+/, "").replace(/\\/g, "/");
  const parts = clean.split("/").filter(Boolean);
  let name = parts.join("-").replace(/[^A-Za-z0-9._-]+/g, "-");

  if (!name) {
    name = "asset";
  }

  const ext = path.extname(name);
  const base = ext ? name.slice(0, -ext.length) : name;
  let candidate = name;
  let counter = 2;

  while (usedNames.has(candidate)) {
    candidate = `${base}-${counter}${ext}`;
    counter += 1;
  }

  usedNames.add(candidate);
  return `assets/${candidate}`;
}

function collectImages(xhtml) {
  const images = [];
  const bySource = new Map();
  const usedNames = new Set();

  const rewritten = xhtml.replace(/<img\b[^>]*\bsrc=(['"])([^'"]+)\1[^>]*\/?>/gi, (tag, _quote, src) => {
    if (!src.startsWith("/_assets/")) {
      return tag;
    }

    const assetPath = src.replace(/^\/_assets\//, "");
    const sourcePath = path.join(siteDir, "_assets", assetPath);
    const alt = stripTags(extractAttribute(tag, "alt"));

    if (!fs.existsSync(sourcePath)) {
      console.warn(`Skipping missing EPUB image: ${sourcePath}`);
      return alt ? `<p class="image-alt">[Image: ${escapeXml(alt)}]</p>` : "";
    }

    let href = bySource.get(sourcePath);
    if (!href) {
      href = destinationForAsset(assetPath, usedNames);
      bySource.set(sourcePath, href);
      images.push({ href, sourcePath });
    }

    return setAttribute(tag, "src", href);
  });

  return { xhtml: rewritten, images };
}

function getTocItems(xhtml) {
  return [...xhtml.matchAll(/<h1\s+[^>]*id=["']([^"']+)["'][^>]*>([\s\S]*?)<\/h1>/gi)].map(
    (match) => ({
      id: match[1],
      title: stripTags(match[2])
    })
  );
}

function createNav(tocItems) {
  const items = tocItems
    .map((item) => `      <li><a href="book.xhtml#${escapeXml(item.id)}">${escapeXml(item.title)}</a></li>`)
    .join("\n");

  return `<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="${language}" xml:lang="${language}">
<head>
  <title>${escapeXml(bookTitle)}</title>
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>Contents</h1>
    <ol>
${items}
    </ol>
  </nav>
</body>
</html>
`;
}

function createPackageOpf(images) {
  const modified = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const imageItems = images
    .map((image, index) => {
      const mediaType = mediaTypes.get(path.extname(image.href).toLowerCase());
      if (!mediaType) {
        throw new Error(`Unsupported EPUB image type: ${image.href}`);
      }
      return `    <item id="image-${index + 1}" href="${escapeXml(image.href)}" media-type="${mediaType}"/>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="book-id">${identifier}</dc:identifier>
    <dc:title>${escapeXml(bookTitle)}</dc:title>
    <dc:creator>${escapeXml(creator)}</dc:creator>
    <dc:language>${language}</dc:language>
    <meta property="dcterms:modified">${modified}</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="book" href="book.xhtml" media-type="application/xhtml+xml"/>
    <item id="style" href="style.css" media-type="text/css"/>
${imageItems}
  </manifest>
  <spine>
    <itemref idref="book"/>
  </spine>
</package>
`;
}

const epubCss = `body {
  line-height: 1.5;
  margin: 5%;
}

img {
  max-width: 100%;
  height: auto;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: anywhere;
}

code,
pre {
  font-family: monospace;
}

.book-chapter h1 {
  break-before: page;
  break-after: avoid;
}

h2, h3, h4, h5, h6 {
  break-after: avoid;
}

.image-alt {
  font-style: italic;
}

table {
  border-collapse: collapse;
}

th, td {
  border: 1px solid;
  padding: 0.25em 0.5em;
}

blockquote {
  margin-left: 0;
  border-left: 1px solid;
  padding-left: 1em;
  margin-right: 0;
  padding-right: 0;
}
`;

function crc32(buffer) {
  const table = crc32.table ?? (crc32.table = makeCrcTable());
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc = (crc >>> 8) ^ table[(crc ^ byte) & 0xff];
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function makeCrcTable() {
  const table = new Uint32Array(256);

  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value >>> 0;
  }

  return table;
}

function dosDateTime() {
  const year = 1980;
  const month = 1;
  const day = 1;
  const hour = 0;
  const minute = 0;
  const second = 0;

  return {
    time: (hour << 11) | (minute << 5) | Math.floor(second / 2),
    date: ((year - 1980) << 9) | (month << 5) | day
  };
}

function zipFiles(files) {
  const localParts = [];
  const centralParts = [];
  const { time, date } = dosDateTime();
  let offset = 0;

  for (const file of files) {
    const name = Buffer.from(file.name, "utf8");
    const data = Buffer.isBuffer(file.data) ? file.data : Buffer.from(file.data, "utf8");
    const compressed = file.store ? data : zlib.deflateRawSync(data, { level: 9 });
    const crc = crc32(data);
    const compression = file.store ? 0 : 8;
    const flags = 0x0800;

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(flags, 6);
    localHeader.writeUInt16LE(compression, 8);
    localHeader.writeUInt16LE(time, 10);
    localHeader.writeUInt16LE(date, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(compressed.length, 18);
    localHeader.writeUInt32LE(data.length, 22);
    localHeader.writeUInt16LE(name.length, 26);
    localHeader.writeUInt16LE(0, 28);

    localParts.push(localHeader, name, compressed);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(flags, 8);
    centralHeader.writeUInt16LE(compression, 10);
    centralHeader.writeUInt16LE(time, 12);
    centralHeader.writeUInt16LE(date, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(compressed.length, 20);
    centralHeader.writeUInt32LE(data.length, 24);
    centralHeader.writeUInt16LE(name.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);

    centralParts.push(centralHeader, name);

    offset += localHeader.length + name.length + compressed.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralDirectory, end]);
}

if (!fs.existsSync(sourceHtml)) {
  die(`Missing ${sourceHtml}; run npm run build:html first.`);
}

const source = fs.readFileSync(sourceHtml, "utf8");
const main = extractMain(source);
let xhtml = makeXhtml(main);
const collected = collectImages(xhtml);
xhtml = collected.xhtml;
const tocItems = getTocItems(xhtml);

const files = [
  { name: "mimetype", data: "application/epub+zip", store: true },
  {
    name: "META-INF/container.xml",
    data: `<?xml version="1.0" encoding="utf-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>
`
  },
  { name: "EPUB/package.opf", data: createPackageOpf(collected.images) },
  { name: "EPUB/nav.xhtml", data: createNav(tocItems) },
  { name: "EPUB/book.xhtml", data: xhtml },
  { name: "EPUB/style.css", data: epubCss },
  ...collected.images.map((image) => ({
    name: `EPUB/${image.href}`,
    data: fs.readFileSync(image.sourcePath)
  }))
];

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, zipFiles(files));
console.log(`Wrote ${outputFile}`);
