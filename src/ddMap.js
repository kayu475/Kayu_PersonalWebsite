/* -------------------------------------------------
   ddMap.js – Interactive Zoomable Travel Map
   (Hong Kong = Star, Guangzhou = Blue, Labels + Zoom)
   ------------------------------------------------- */
(function () {

    // ---------------------------------------------------------
    // 1. DATA – your cities
    // ---------------------------------------------------------
    const cities = [
        { name: "Hong Kong", lat: 22.3193, lng: 114.1694, visits: 1000, type: "home" },
        { name: "Guangzhou", lat: 23.1291, lng: 113.2644, visits: 500, type: "hometown" },
        { name: "Taipei", lat: 25.0330, lng: 121.5654, visits: 1, type: "visited" },
        { name: "Tainan", lat: 22.9908, lng: 120.2133, visits: 1, type: "visited" },
        { name: "Kaohsiung", lat: 22.6273, lng: 120.3014, visits: 1, type: "visited" },
        { name: "Tokyo", lat: 35.6762, lng: 139.6503, visits: 1, type: "visited" },
        { name: "Fukuoka", lat: 33.5902, lng: 130.4017, visits: 1, type: "visited" },
        { name: "Nagasaki", lat: 32.7503, lng: 129.8779, visits: 1, type: "visited" },
        { name: "Sasebo", lat: 33.1800, lng: 129.7150, visits: 1, type: "visited" },
        { name: "Vancouver", lat: 49.2827, lng: -123.1207, visits: 1, type: "visited" }
    ];

    // ---------------------------------------------------------
    // 2. CONTAINER & WRAPPER
    // ---------------------------------------------------------
    const container = d3.select("#vis-ddMap");
    container.selectAll("*").remove();

    const wrapper = container.append("div")
        .attr("class", "map-wrapper")
        .style("max-width", "900px")
        .style("margin", "0 auto")
        .style("text-align", "center")
        .style("position", "relative");

    wrapper.append("h2")
        .style("margin", "0 0 12px")
        .style("font-size", "24px")
        .style("color", "#2c3e50")
        .style("font-weight", "bold")
        .text("My Travel Map");

    wrapper.append("p")
        .style("margin", "0 0 24px")
        .style("font-size", "16px")
        .style("color", "#7f8c8d")
        .text("Zoom in/out with mouse wheel or buttons. Vancouver is visible when zoomed out.");

    // ---------------------------------------------------------
    // 3. ZOOM BUTTONS
    // ---------------------------------------------------------
    const zoomControls = wrapper.append("div")
        .style("position", "absolute")
        .style("top", "10px")
        .style("right", "10px")
        .style("background", "white")
        .style("border-radius", "8px")
        .style("box-shadow", "0 2px 8px rgba(0,0,0,0.1)")
        .style("padding", "8px");

    zoomControls.append("button")
        .text("+")
        .style("font-size", "20px")
        .style("width", "36px")
        .style("height", "36px")
        .style("margin", "0 0 4px 0")
        .style("border", "1px solid #ccc")
        .style("border-radius", "6px")
        .style("background", "#f8f9fa")
        .style("cursor", "pointer")
        .on("click", () => zoomed(1.5));

    zoomControls.append("button")
        .text("−")
        .style("font-size", "20px")
        .style("width", "36px")
        .style("height", "36px")
        .style("border", "1px solid #ccc")
        .style("border-radius", "6px")
        .style("background", "#f8f9fa")
        .style("cursor", "pointer")
        .on("click", () => zoomed(0.67));

    // ---------------------------------------------------------
    // 4. SVG + PROJECTION
    // ---------------------------------------------------------
    const width = 800;
    const height = 500;

    const svg = wrapper.append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .style("width", "100%")
        .style("height", "auto")
        .style("background", "#fff")
        .style("border-radius", "12px")
        .style("box-shadow", "0 4px 16px rgba(0,0,0,0.1)")
        .style("display", "block")
        .style("margin", "0 auto");

    // Initial projection
    const projection = d3.geoMercator()
        .center([115, 25])
        .scale(800)
        .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([0.5, 10])  // Min 0.5x, Max 10x
        .on("zoom", (event) => {
            g.attr("transform", event.transform);
        });

    svg.call(zoom);

    // Zoom function for buttons
    function zoomed(factor) {
        svg.transition().duration(500).call(zoom.scaleBy, factor);
    }

    // ---------------------------------------------------------
    // 5. GROUPS
    // ---------------------------------------------------------
    const g = svg.append("g");

    // ---------------------------------------------------------
    // 6. LOAD WORLD MAP
    // ---------------------------------------------------------
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
        .then(world => {
            const countries = topojson.feature(world, world.objects.countries);

            g.append("g")
                .attr("class", "countries")
                .selectAll("path")
                .data(countries.features)
                .enter().append("path")
                .attr("d", path)
                .attr("fill", "#f0f0f0")
                .attr("stroke", "#ccc")
                .attr("stroke-width", 0.5);

            const graticule = d3.geoGraticule();
            g.append("path")
                .datum(graticule)
                .attr("class", "graticule")
                .attr("d", path)
                .attr("fill", "none")
                .attr("stroke", "#ddd")
                .attr("stroke-width", 0.5);

            // ---------------------------------------------------------
            // 7. DOT SIZE
            // ---------------------------------------------------------
            const smallDotRadius = 6;

            // ---------------------------------------------------------
            // 8. MARKERS & LABELS
            // ---------------------------------------------------------
            const markers = g.append("g").attr("class", "markers");
            const labels = g.append("g").attr("class", "labels");

            // ---------------------------------------------------------
            // 9. STAR PATH
            // ---------------------------------------------------------
            function starPath(radius) {
                const points = 5;
                const inner = radius * 0.4;
                let path = "";
                for (let i = 0; i < points * 2; i++) {
                    const r = i % 2 === 0 ? radius : inner;
                    const angle = (i * Math.PI) / points;
                    const x = r * Math.sin(angle);
                    const y = -r * Math.cos(angle);
                    path += (i === 0 ? "M" : "L") + x + "," + y;
                }
                return path + "Z";
            }

            // ---------------------------------------------------------
            // 10. DRAW MARKERS + LABELS
            // ---------------------------------------------------------
            cities.forEach(d => {
                const [x, y] = projection([d.lng, d.lat]);
                if (!x || !y) return;

                let marker, labelX, labelY, anchor;

                if (d.type === "home") {
                    // Hong Kong = Golden Star
                    marker = markers.append("path")
                        .attr("d", starPath(smallDotRadius * 2.2))
                        .attr("transform", `translate(${x},${y})`)
                        .attr("fill", "#f39c12")
                        .attr("stroke", "#e67e22")
                        .attr("stroke-width", 2)
                        .attr("class", "marker home");

                    labelX = x + 18;
                    labelY = y + 4;
                    anchor = "start";

                } else if (d.type === "hometown") {
                    // Guangzhou = Blue Dot
                    marker = markers.append("circle")
                        .attr("cx", x)
                        .attr("cy", y)
                        .attr("r", smallDotRadius)
                        .attr("fill", "#3498db")
                        .attr("stroke", "#2980b9")
                        .attr("stroke-width", 1.5)
                        .attr("class", "marker hometown");

                    labelX = x;
                    labelY = y - 12;
                    anchor = "middle";

                } else {
                    // Visited = Red Dot
                    marker = markers.append("circle")
                        .attr("cx", x)
                        .attr("cy", y)
                        .attr("r", smallDotRadius)
                        .attr("fill", "#e74c3c")
                        .attr("stroke", "#c0392b")
                        .attr("stroke-width", 1.5)
                        .attr("class", "marker visited");

                    labelX = x + 14;
                    labelY = y + 3;
                    anchor = "start";
                }

                // Label
                labels.append("text")
                    .attr("x", labelX)
                    .attr("y", labelY)
                    .attr("text-anchor", anchor)
                    .style("font-size", "11px")
                    .style("font-weight", "600")
                    .style("fill", "#2c3e50")
                    .style("pointer-events", "none")
                    .text(d.name);

                // Events
                marker
                    .on("mouseover", handleMouseOver)
                    .on("mouseout", handleMouseOut);
            });

            // ---------------------------------------------------------
            // 11. TOOLTIP
            // ---------------------------------------------------------
            const tooltip = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

            function handleMouseOver(event, d) {
                tooltip.html(`
    <strong>${d.name}</strong><br>
    ${d.type === "home" ? "Home (Born & Raised)" :
                        d.type === "hometown" ? `Hometown – ${d.visits} visits` :
                            `Visited ${d.visits} time${d.visits > 1 ? 's' : ''}`}
  `)
                    .style("left", (event.pageX + 12) + "px")
                    .style("top", (event.pageY - 28) + "px")
                    .transition().duration(200).style("opacity", 1);

                d3.select(this)
                    .attr("stroke-width", d.type === "home" ? 4 : 3)
                    .raise();
            }

            function handleMouseOut() {
                tooltip.transition().duration(400).style("opacity", 0);
                d3.select(this).attr("stroke-width", d =>
                    d.type === "home" ? 2 : 1.5
                );
            }

        })
        .catch(err => {
            console.error("Failed to load world map:", err);
            wrapper.append("p")
                .style("color", "red")
                .text("Error: World map could not be loaded.");
        });

})();