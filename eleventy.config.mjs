import fs from "node:fs";
import path from "node:path";

import MarkdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import markdownItDeflist from "markdown-it-deflist";

const bookTitle = "Idiosyncrasies of the HTML parser";
const bookFile = path.join("manuscript", "Book.txt");

function slugify(value) {
  const slug = String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[():.,&'`]/g, "");

  return encodeURIComponent(slug);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
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

function readBookOrder() {
  return fs
    .readFileSync(bookFile, "utf8")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function fileNameFromInputPath(inputPath) {
  return path.basename(String(inputPath).replace(/\\/g, "/"));
}

function firstHeadingId(html) {
  const quoted = String(html).match(/<h1\s+[^>]*id=["']([^"']+)["'][^>]*>/i);
  if (quoted) {
    return quoted[1];
  }

  const unquoted = String(html).match(/<h1\s+[^>]*id=([^\s>]+)[^>]*>/i);
  return unquoted ? unquoted[1] : "";
}

function rewriteForSinglePage(html) {
  return String(html)
    .replace(/href="\/([^"\/?#]+)\/#([^"]+)"/g, 'href="#$2"')
    .replace(/href='\/([^'\/?#]+)\/#([^']+)'/g, "href='#$2'");
}

function tableOfContents(html) {
  const headings = [...String(html).matchAll(/<h([2-6])\s+[^>]*id=["']([^"']+)["'][^>]*>([\s\S]*?)<\/h\1>/gi)];

  if (!headings.length) {
    return "";
  }

  const items = headings
    .map((match) => {
      const level = Number(match[1]);
      const id = match[2];
      const text = stripTags(match[3]);
      return `<li class="toc-level-${level}"><a href="#${escapeHtml(id)}">${escapeHtml(text)}</a></li>`;
    })
    .join("\n");

  return `<ol class="table-of-contents">\n${items}\n</ol>`;
}

export default function (eleventyConfig) {
  const md = new MarkdownIt({ html: true })
    .use(markdownItAnchor, {
      slugify,
      tabIndex: false
    })
    .use(markdownItDeflist);

  eleventyConfig.setLibrary("md", md);
  eleventyConfig.addPassthroughCopy("_assets");

  eleventyConfig.addGlobalData("bookTitle", bookTitle);

  eleventyConfig.addShortcode("ref", function (page, title) {
    return `<a href="/${page}/#${slugify(title)}">${escapeHtml(title)}</a>`;
  });

  eleventyConfig.addFilter("slugify", slugify);
  eleventyConfig.addFilter("toc", tableOfContents);
  eleventyConfig.addFilter("firstHeadingId", firstHeadingId);
  eleventyConfig.addFilter("singlePageLinks", rewriteForSinglePage);

  eleventyConfig.addCollection("book", function (collectionApi) {
    const byFileName = new Map();

    for (const item of collectionApi.getAll()) {
      if (item.inputPath && item.inputPath.endsWith(".md")) {
        byFileName.set(fileNameFromInputPath(item.inputPath), item);
      }
    }

    return readBookOrder()
      .map((fileName) => byFileName.get(fileName))
      .filter(Boolean);
  });

  eleventyConfig.addTransform("ellipsis", function (content) {
    return content.replace(/\.\.\./g, "\u2026");
  });

  eleventyConfig.addLinter("naked-url", function (content, inputPath) {
    const file = this.inputPath ?? inputPath ?? "";

    if (!file.endsWith(".md")) {
      return;
    }

    const nakedUrlRegexp = /(?:[^<>";]|^)(https?:(?:[^<\s]+))/g;
    const found = [...content.matchAll(nakedUrlRegexp)].map((match) => match[1]);

    if (found.length) {
      console.warn(`Naked URL Linter (${file}):`);
      console.warn(` ${found.join("\n ")}`);
    }
  });

  return {
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dir: {
      input: "manuscript",
      output: "_site",
      includes: "../_includes"
    }
  };
}
