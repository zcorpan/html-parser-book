module.exports = function(eleventyConfig) {

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
