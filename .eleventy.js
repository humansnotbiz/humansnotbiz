module.exports = function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy({ assets: "assets" });

    return {
        dir: {
            input: ".",
            includes: "_includes",
            output: "_site"
        },
        templateFormats: ["njk", "md", "html"],
        markdownTemplateEngine: "njk",
        htmlTemplateEngine: "njk"
    };
};
