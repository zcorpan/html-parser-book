const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
module.exports = function(eleventyConfig) {

  eleventyConfig.addPassthroughCopy("_assets");
  eleventyConfig.addPlugin(syntaxHighlight, {
    init: function({ Prism }) {
      Prism.languages['dom-tree'] = {
        branch: /[└─├│]+/
      };
    }});

  return {
    passthroughFileCopy: true,
    dir: {
      input: "manuscript",
      output: "_site",
      includes: "../_includes"
    }
  };
};
