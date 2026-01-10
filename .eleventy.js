module.exports = function(eleventyConfig) {
  
  // 1. COPIA DE ARCHIVOS ESTÁTICOS (Passthrough Copy)
  // Agregamos "src/js" para que tus scripts pasen al sitio final
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/img");
  eleventyConfig.addPassthroughCopy("src/js"); // <--- NUEVO: Copia los scripts
  eleventyConfig.addPassthroughCopy("admin");

  // 2. CONFIGURACIÓN DE MOTORES DE PLANTILLAS
  eleventyConfig.setTemplateFormats(["njk", "md", "html"]);
  
  // 3. OBSERVACIÓN DE CAMBIOS (Watch Targets)
  // Si modificas JS o CSS, el navegador se refrescará
  eleventyConfig.addWatchTarget("./src/css/");
  eleventyConfig.addWatchTarget("./src/js/"); // <--- NUEVO: Vigila cambios en JS

  // 4. ESTRUCTURA DE DIRECTORIOS
  return {
    dir: {
      input: "src",          
      includes: "_includes", 
      data: "_data",         
      output: "_site"        
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk"
  };
};
