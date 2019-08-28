module.exports = function(eleventyConfig) {
  let markdownIt = require("markdown-it");
  let markdownItDeflist = require("markdown-it-deflist");
  let options = {
    html: true
  };
  let markdownLib = markdownIt(options).use(markdownItDeflist);

  eleventyConfig.setLibrary("md", markdownLib);

  eleventyConfig.addPassthroughCopy("_assets");

  return {
    passthroughFileCopy: true,
    dir: {
      input: "manuscript",
      output: "_site",
      includes: "../_includes"
    }
  };
};
