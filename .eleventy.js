module.exports = function(eleventyConfig) {
  // Copiar archivos estáticos directamente al build final
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/img");
  eleventyConfig.addPassthroughCopy("admin");

  return {
    dir: {
      input: "src",
      output: "_site"
    }
  };
};
