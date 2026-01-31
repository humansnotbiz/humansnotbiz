/**
 * HumansNotBiz site JS
 *  1) Markers come from /assets/data/markers.json instead of being hardcoded.
 *  2) Safe to run on pages that don't have the map (typing still works).
 *  3) Map UI can be removed from HTML (map still renders).
 */
(function () {
    // One-switch feature flag:
    // ARCHIVE DISABLED: archived markers are hidden everywhere.
    const ENABLE_ARCHIVE = false;

    // Grab DOM elements (some pages may not have all of them)
    const svg = window.d3?.select?.("#causeMap");
    const toggle = ENABLE_ARCHIVE ? document.getElementById("toggleArchived") : null;
    const placeFilter = document.getElementById("placeFilter");
    const typedTarget = document.getElementById("typedTarget");

    // Non-fatal checks (only visible in DevTools console)
    try {
        console.assert(!!typedTarget, "#typedTarget should exist (homepage header)");
    } catch (_) { }

    /**
     * Typing animation for the header motto.
     */
    function startTyping() {
        if (!typedTarget) return;

        const prefersReducedMotion =
            window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        const lines = ["governments.", "borders.", "politics.", "businesses.", "capitalism."];

        if (prefersReducedMotion) {
            typedTarget.textContent = lines[0];
            return;
        }

        // Prevent double-starts (e.g., if script is re-injected)
        if (typedTarget.dataset.typingStarted === "1") return;
        typedTarget.dataset.typingStarted = "1";

        let lineIndex = 0;
        let charIndex = 0;
        let deleting = false;

        function tick() {
            const current = lines[lineIndex];

            if (!deleting) {
                charIndex += 1;
                typedTarget.textContent = current.slice(0, charIndex);

                if (charIndex >= current.length) {
                    deleting = true;
                    setTimeout(tick, 1400);
                    return;
                }
                setTimeout(tick, 100);
            } else {
                charIndex -= 1;
                typedTarget.textContent = current.slice(0, Math.max(0, charIndex));

                if (charIndex <= 0) {
                    deleting = false;
                    lineIndex = (lineIndex + 1) % lines.length;
                    setTimeout(tick, 250);
                    return;
                }
                setTimeout(tick, 40);
            }
        }

        setTimeout(tick, 350);
    }

    /**
     * Scroll-to-top button behavior.
     * Markup is expected to exist (via shared layout include).
     */
    function initScrollToTop() {
        const btn = document.getElementById("scrollToTop");
        if (!btn) return;

        const prefersReducedMotion =
            window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        function toggleVisibility() {
            btn.style.display = window.scrollY > 300 ? "flex" : "none";
        }

        btn.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: prefersReducedMotion ? "auto" : "smooth",
            });
        });

        window.addEventListener("scroll", toggleVisibility, { passive: true });
        toggleVisibility();
    }

    startTyping();
    initScrollToTop();

    // Stop here if map dependencies are missing
    if (!svg?.node?.() || !window.d3 || !window.topojson) return;

    async function loadMarkers() {
        const res = await fetch("/assets/data/markers.json", { cache: "no-cache" });
        if (!res.ok) throw new Error("Failed to load /assets/data/markers.json");
        return await res.json();
    }

    function markerHref(d) {
        const raw = String(d.id).replace(/^cause-/, "");
        return `profiles/causes/${raw}.html`;
    }

    async function run() {
        const markers = await loadMarkers();

        const width = svg.node().clientWidth || 900;
        const height = svg.node().clientHeight || 380;
        svg.attr("viewBox", `0 0 ${width} ${height}`);

        const padding = Math.max(6, Math.min(width, height) * 0.02);
        const projection = d3.geoNaturalEarth1().fitExtent(
            [
                [padding, padding],
                [width - padding, height - padding],
            ],
            { type: "Sphere" }
        );

        const geoPath = d3.geoPath(projection);

        function drawFrame() {
            svg.append("path")
                .attr("d", geoPath({ type: "Sphere" }))
                .attr("fill", "rgba(23,26,33,0.6)")
                .attr("stroke", "rgba(38,42,54,1)");
        }

        function drawLand(countries) {
            svg.append("g")
                .selectAll("path")
                .data(countries.features)
                .enter()
                .append("path")
                .attr("d", geoPath)
                .attr("fill", "rgba(230,232,238,0.06)")
                .attr("stroke", "rgba(160,166,184,0.25)")
                .attr("stroke-width", 0.5);
        }

        function filteredMarkers(showArchived) {
            const allowArchived = ENABLE_ARCHIVE && showArchived;
            return markers.filter((m) => m.status === "active" || allowArchived);
        }

        function drawMarkers(showArchived) {
            svg.select("g.markers").remove();
            const data = filteredMarkers(showArchived);

            const g = svg.append("g").attr("class", "markers");

            g.selectAll("circle")
                .data(data, (d) => d.id)
                .enter()
                .append("circle")
                .attr("r", (d) => (d.status === "archived" ? 4 : 5))
                .attr("cx", (d) => projection(d.coords)[0])
                .attr("cy", (d) => projection(d.coords)[1])
                .attr("fill", (d) =>
                    d.status === "archived" ? "rgba(160,166,184,0.7)" : "var(--accent)"
                )
                .attr("opacity", (d) => (d.status === "archived" ? 0.6 : 0.9))
                .style("cursor", "pointer")
                .on("click", (_, d) => {
                    window.location.href = markerHref(d);
                });
        }

        async function render(showArchived = false) {
            svg.selectAll("*").remove();
            drawFrame();

            try {
                const res = await fetch(
                    "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"
                );
                const topo = await res.json();
                const countries = topojson.feature(topo, topo.objects.countries);
                drawLand(countries);
            } catch (_) {
                // Ignore, render frame + markers only (offline/blocked)
            }

            drawMarkers(showArchived);
        }

        render(false);
    }

    run().catch((err) => console.error(err));
})();
