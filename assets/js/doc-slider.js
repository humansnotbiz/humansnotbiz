// Local document page slider (images)
// Looks for: .js-doc-slider containers
// Required data attributes:
// - data-base="/assets/media/epstein/EFTA02362640/"
// - data-ext="webp" (or png)
// - data-pages="20"
// Optional:
// - data-label="Document preview" (updates title)
// - data-source-url="https://...pdf"
// - data-source-text="..."

(function () {
    function pad2(n) {
        return String(n).padStart(2, "0");
    }

    function clamp(n, min, max) {
        return Math.min(Math.max(n, min), max);
    }

    function buildFilename(page, ext) {
        return "p" + pad2(page) + "." + ext;
    }

    function init(container) {
        const img = container.querySelector(".js-doc-slider-img");
        const prev = container.querySelector(".js-doc-slider-prev");
        const next = container.querySelector(".js-doc-slider-next");
        const range = container.querySelector(".js-doc-slider-range");
        const pageLabel = container.querySelector(".js-doc-slider-page");
        const totalLabel = container.querySelector(".js-doc-slider-total");
        const title = container.querySelector(".js-doc-slider-title");
        const sourceLink = container.querySelector(".js-doc-slider-source");

        if (!img || !prev || !next || !range || !pageLabel) return;

        const base = (container.getAttribute("data-base") || "").trim();
        const ext = (container.getAttribute("data-ext") || "webp").trim();
        const pages = Number(container.getAttribute("data-pages") || "1");

        const maxPages = Number.isFinite(pages) && pages > 0 ? pages : 1;

        // Optional title
        const label = container.getAttribute("data-label");
        if (title && label) title.textContent = label;

        // Optional source link
        const sourceUrl = container.getAttribute("data-source-url");
        const sourceText = container.getAttribute("data-source-text");
        if (sourceLink && sourceUrl) sourceLink.href = sourceUrl;
        if (sourceLink && sourceText) sourceLink.textContent = sourceText;

        // Normalize UI in case HTML values were not updated
        range.min = "1";
        range.max = String(maxPages);
        if (totalLabel) totalLabel.textContent = "of " + String(maxPages);

        function setPage(n) {
            const page = clamp(n, 1, maxPages);
            range.value = String(page);
            pageLabel.textContent = String(page);

            const filename = buildFilename(page, ext);
            img.src = base + filename;
        }

        prev.addEventListener("click", function () {
            setPage(Number(range.value) - 1);
        });

        next.addEventListener("click", function () {
            setPage(Number(range.value) + 1);
        });

        range.addEventListener("input", function () {
            setPage(Number(range.value));
        });

        // Keyboard support when the slider is focused
        range.addEventListener("keydown", function (e) {
            if (e.key === "ArrowLeft") setPage(Number(range.value) - 1);
            if (e.key === "ArrowRight") setPage(Number(range.value) + 1);
        });

        // Ensure initial render is consistent
        setPage(Number(range.value) || 1);
    }

    document.addEventListener("DOMContentLoaded", function () {
        document.querySelectorAll(".js-doc-slider").forEach(init);
    });
})();
