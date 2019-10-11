module.exports = function(eleventyConfig) {
  let markdownIt = require("markdown-it");
  let markdownItDeflist = require("markdown-it-deflist");
  let markdownItAnchor = require("markdown-it-anchor");
  let pluginTOC = require('eleventy-plugin-toc')
  let slugify = function (s) {
    let newStr = String(s).trim().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[():.,&'`]/g, '');
    return encodeURIComponent(newStr);
  }
  let markdownItAnchorOpts = {
    slugify,
  };
  let options = {
    html: true,
  };

  eleventyConfig.addShortcode("ref", function(page, title) {
    return `<a href="/${page}/#${slugify(title)}">${title}</a>`;
  });

  eleventyConfig.setLibrary("md", markdownIt(options)
    .use(markdownItAnchor, markdownItAnchorOpts)
    .use(markdownItDeflist)
  );

  eleventyConfig.addPassthroughCopy("_assets");

  eleventyConfig.addPlugin(pluginTOC);

  return {
    passthroughFileCopy: true,
    dir: {
      input: "manuscript",
      output: "_site",
      includes: "../_includes"
    }
  };
};
