module.exports = function(eleventyConfig) {
  
  // 1. COPIA DE ARCHIVOS ESTÁTICOS (Passthrough Copy)
  // Esto le dice a Eleventy que copie estas carpetas directamente al resultado final (_site)
  // sin intentar procesarlas como plantillas.
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/img");
  eleventyConfig.addPassthroughCopy("admin");

  // 2. CONFIGURACIÓN DE NUNJUCKS
  // Permite que usemos lógica avanzada y datos del CMS en el HTML
  eleventyConfig.setTemplateFormats(["njk", "md", "html"]);
  
  // 3. WATCH TARGETS
  // Hace que el servidor de desarrollo se refresque si cambias el CSS o JS
  eleventyConfig.addWatchTarget("./src/css/");
  eleventyConfig.addWatchTarget("./src/js/");

  // 4. CONFIGURACIÓN DE DIRECTORIOS
  return {
    dir: {
      input: "src",          // Donde escribes el código
      includes: "_includes", // Donde viven los layouts (base.njk)
      data: "_data",         // Donde vive home.json (los datos del CMS)
      output: "_site"        // Donde Netlify buscará el sitio listo
    },
    // Definimos que el motor principal para todo sea Nunjucks
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
  };
};
