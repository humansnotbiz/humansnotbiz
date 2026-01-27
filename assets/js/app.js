/**
 * HumansNotBiz site JS
 *  1) Markers come from /assets/data/markers.json instead of being hardcoded.
 *  2) The file is safe to run on pages that don't have the map (typing still works).
 */
(function () {
    // Grab DOM elements (some pages may not have all of them)
    const svg = window.d3?.select?.('#causeMap');
    const toggle = document.getElementById('toggleArchived');
    const placeFilter = document.getElementById('placeFilter');
    const typedTarget = document.getElementById('typedTarget');

    // --- Non-fatal checks (only visible in DevTools console) ---
    try {
        console.assert(!!typedTarget, '#typedTarget should exist (homepage header)');
    } catch (_) { }

    /**
     * Typing animation for the header motto.
     * Cycles through: governments · borders · politics · businesses · capitalism
     */
    function startTyping() {
        if (!typedTarget) return;

        const prefersReducedMotion =
            window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const lines = ['governments.', 'borders.', 'politics.', 'businesses.', 'capitalism.'];

        if (prefersReducedMotion) {
            typedTarget.textContent = lines[0];
            return;
        }

        // Prevent double-starts (e.g., if script is re-injected)
        if (typedTarget.dataset.typingStarted === '1') return;
        typedTarget.dataset.typingStarted = '1';

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
                setTimeout(tick, 45);
            } else {
                charIndex -= 1;
                typedTarget.textContent = current.slice(0, Math.max(0, charIndex));

                if (charIndex <= 0) {
                    deleting = false;
                    lineIndex = (lineIndex + 1) % lines.length;
                    setTimeout(tick, 250);
                    return;
                }
                setTimeout(tick, 22);
            }
        }

        setTimeout(tick, 350);
    }

    startTyping();

    // Map needs these elements + d3/topojson; if missing, stop here (typing can still run).
    if (!svg?.node?.() || !toggle || !placeFilter || !window.d3 || !window.topojson) return;

    async function loadMarkers() {
        const res = await fetch('/assets/data/markers.json', { cache: 'no-cache' });
        if (!res.ok) throw new Error('Failed to load /assets/data/markers.json');
        return await res.json();
    }

    function markerHref(d) {
        // Convention: /profiles/causes/<slug>.html
        const raw = String(d.id).replace(/^cause-/, '');
        return `profiles/causes/${raw}.html`;
    }

    async function run() {
        const markers = await loadMarkers();

        // More non-fatal checks
        try {
            console.assert(Array.isArray(markers) && markers.length > 0, 'markers should be a non-empty array');
            console.assert(markers.every(m => m.status === 'active' || m.status === 'archived'), 'marker status must be active|archived');
        } catch (_) { }

        const width = svg.node().clientWidth || 900;
        const height = svg.node().clientHeight || 380;
        svg.attr('viewBox', `0 0 ${width} ${height}`);

        // Natural Earth projection fit to the SVG box, with tighter padding for better density
        const padding = Math.max(6, Math.min(width, height) * 0.02);
        const projection = d3.geoNaturalEarth1()
            .fitExtent([[padding, padding], [width - padding, height - padding]], { type: 'Sphere' });
        const geoPath = d3.geoPath(projection);

        function drawFrame() {
            svg.append('path')
                .attr('d', geoPath({ type: 'Sphere' }))
                .attr('fill', 'rgba(23,26,33,0.6)')
                .attr('stroke', 'rgba(38,42,54,1)');
        }

        function drawLand(countries) {
            svg.append('g')
                .selectAll('path')
                .data(countries.features)
                .enter()
                .append('path')
                .attr('d', geoPath)
                .attr('fill', 'rgba(230,232,238,0.06)')
                .attr('stroke', 'rgba(160,166,184,0.25)')
                .attr('stroke-width', 0.5);
        }

        function populatePlaceFilter() {
            const places = Array.from(new Set(markers.map(m => m.place)))
                .sort((a, b) => a.localeCompare(b));

            // Keep existing "All" option; append the rest
            for (const place of places) {
                const opt = document.createElement('option');
                opt.value = place;
                opt.textContent = place;
                placeFilter.appendChild(opt);
            }
        }

        function filteredMarkers(showArchived) {
            const show = markers.filter(m => m.status === 'active' || showArchived);
            const sel = placeFilter.value || 'all';
            if (sel === 'all') return show;
            return show.filter(m => m.place === sel);
        }

        function drawMarkers(showArchived) {
            svg.select('g.markers').remove();
            const data = filteredMarkers(showArchived);

            const g = svg.append('g').attr('class', 'markers');
            const circles = g.selectAll('circle')
                .data(data, d => d.id)
                .enter()
                .append('circle')
                .attr('r', d => d.status === 'archived' ? 4 : 5)
                .attr('cx', d => projection(d.coords)[0])
                .attr('cy', d => projection(d.coords)[1])
                .attr('fill', d => d.status === 'archived' ? 'rgba(160,166,184,0.7)' : 'var(--accent)')
                .attr('opacity', d => d.status === 'archived' ? 0.6 : 0.9)
                .style('cursor', 'pointer');

            circles.append('title').text(d => `${d.label} (${d.status})`);

            circles.on('click', (_, d) => {
                window.location.href = markerHref(d);
            });
        }

        async function render(showArchived = false) {
            svg.selectAll('*').remove();
            drawFrame();

            try {
                const res = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
                const topo = await res.json();
                const countries = topojson.feature(topo, topo.objects.countries);
                drawLand(countries);
            } catch (_) {
                // Offline or blocked: show frame + markers only
            }

            drawMarkers(showArchived);
        }

        placeFilter.addEventListener('change', () => render(toggle.checked));
        toggle.addEventListener('change', () => render(toggle.checked));

        populatePlaceFilter();
        render(false);
    }

    run().catch((err) => console.error(err));
})();
