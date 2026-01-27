module.exports = function (eleventyConfig) {
    // passthrough
    eleventyConfig.addPassthroughCopy({ assets: "assets" });

    // review status filter (ADD THIS)
    eleventyConfig.addFilter("reviewStatus", function (dateString) {
        if (!dateString) return null;

        const reviewed = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor(
            (now - reviewed) / (1000 * 60 * 60 * 24)
        );

        if (diffDays <= 30) {
            return { icon: "🟢", label: "Reviewed recently" };
        }

        if (diffDays <= 90) {
            return { icon: "🟡", label: "Review recommended" };
        }

        return { icon: "🔴", label: "Needs review" };
    });

    eleventyConfig.addFilter("shortDate", function (dateInput) {
        if (!dateInput) return "";

        // Accept either "YYYY-MM-DD" (string) or a Date-like value
        const d = (dateInput instanceof Date) ? dateInput : new Date(dateInput);

        if (Number.isNaN(d.getTime())) {
            // If parsing fails, just return the original input (honest fallback)
            return String(dateInput);
        }

        // Format like: Tue Jan 27 2026
        return d.toDateString();
    });

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