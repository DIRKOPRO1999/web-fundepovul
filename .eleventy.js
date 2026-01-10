module.exports = function(eleventyConfig) {
  
  // 1. COPIA DE ARCHIVOS ESTÁTICOS (Passthrough Copy)
  // Estas líneas aseguran que Eleventy copie tus estilos e imágenes al sitio final
  // Sin esto, el navegador no encuentra el diseño "Golden Hour"
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/img");
  eleventyConfig.addPassthroughCopy("admin");

  // 2. CONFIGURACIÓN DE MOTORES DE PLANTILLAS
  // Establecemos Nunjucks (.njk) como el motor para procesar HTML y datos
  eleventyConfig.setTemplateFormats(["njk", "md", "html"]);
  
  // 3. OBSERVACIÓN DE CAMBIOS (Watch Targets)
  // Si haces cambios en el CSS, el servidor los detectará automáticamente
  eleventyConfig.addWatchTarget("./src/css/");

  // 4. ESTRUCTURA DE DIRECTORIOS
  return {
    dir: {
      input: "src",          // Carpeta donde trabajas
      includes: "_includes", // Donde está base.njk
      data: "_data",         // Donde está home.json
      output: "_site"        // Carpeta que Cloudflare publicará
    },
    // Forzamos que todo el HTML se procese con Nunjucks para usar las variables del CMS
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk"
  };
};
