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

function prefixFragment(chapterSlug, fragment) {
  if (!chapterSlug || !fragment) {
    return fragment;
  }

  const decoded = decodeURIComponent(String(fragment));

  if (decoded.startsWith(`${chapterSlug}-`)) {
    return fragment;
  }

  return `${chapterSlug}-${fragment}`;
}

function rewriteHeadingIds(html, chapterSlug) {
  if (!chapterSlug) {
    return String(html);
  }

  return String(html).replace(
    /<h([2-6])([^>]*?)\s+id=(['"])([^'"]+)\3([^>]*)>/gi,
    (match, level, before, quote, id, after) => {
      return `<h${level}${before} id=${quote}${prefixFragment(chapterSlug, id)}${quote}${after}>`;
    }
  );
}

function rewriteForSinglePage(html, chapterSlug = "") {
  return rewriteHeadingIds(html, chapterSlug)
    .replace(/href="\/([^"\/?#]+)\/#([^"]+)"/g, (match, pageSlug, fragment) => {
      return `href="#${prefixFragment(pageSlug, fragment)}"`;
    })
    .replace(/href="\/([^"\/?#]+)\/"/g, (match, pageSlug) => {
      return `href="#${pageSlug}"`;
    });
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

  const defaultHeadingOpen =
    md.renderer.rules.heading_open ||
    ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));

  md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx];

    if (token.tag === "h1" && env?.page?.fileSlug) {
      token.attrSet("id", env.page.fileSlug);
    }

    return defaultHeadingOpen(tokens, idx, options, env, self);
  };

  eleventyConfig.setLibrary("md", md);
  eleventyConfig.addPassthroughCopy("_assets");

  eleventyConfig.addGlobalData("bookTitle", bookTitle);

  eleventyConfig.addFilter("slugify", slugify);
  eleventyConfig.addFilter("toc", tableOfContents);
  eleventyConfig.addFilter("singlePageLinks", rewriteForSinglePage);

  const chapterLinkTitlesBySlug = new Map();

  eleventyConfig.addCollection("book", function (collectionApi) {
    const byFileName = new Map();

    for (const item of collectionApi.getAll()) {
      if (item.inputPath && item.inputPath.endsWith(".md")) {
        byFileName.set(fileNameFromInputPath(item.inputPath), item);
      }
    }

    const book = readBookOrder()
      .map((fileName) => byFileName.get(fileName))
      .filter(Boolean);

    chapterLinkTitlesBySlug.clear();

    for (const [index, chapter] of book.entries()) {
      const chapterNum = chapter.data.appendix ?? index;
      const titles = new Set([chapter.data.title]);

      if (chapter.data.appendix) {
        titles.add(`Appendix ${chapter.data.appendix}. ${chapter.data.title}`);
      } else if (chapterNum !== 0) {
        titles.add(`Chapter ${chapterNum}. ${chapter.data.title}`);
      }

      chapterLinkTitlesBySlug.set(chapter.fileSlug, titles);
    }

    return book;
  });

  eleventyConfig.addShortcode("ref", function (page, title) {
    const escapedTitle = escapeHtml(title);

    if (chapterLinkTitlesBySlug.get(page)?.has(title)) {
      return `<a href="/${page}/">${escapedTitle}</a>`;
    }

    return `<a href="/${page}/#${slugify(title)}">${escapedTitle}</a>`;
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
