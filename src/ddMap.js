/* -------------------------------------------------
   ddMap.js – Smaller Red Dots + Thicker Strokes
   ------------------------------------------------- */
(function () {

  const cities = [
    { name: "Hong Kong",   lat: 22.3193, lng: 114.1694, visits: 1000, type: "home" },
    { name: "Guangzhou",   lat: 23.1291, lng: 113.2644, visits: 500,  type: "hometown" },
    { name: "Taipei",      lat: 25.0330, lng: 121.5654, visits: 1,    type: "visited" },
    { name: "Vancouver",   lat: 49.2827, lng: -123.1207, visits: 1,   type: "visited" },
    { name: "Tokyo",       lat: 35.6762, lng: 139.6503, visits: 1,    type: "visited" },
    { name: "Kaohsiung",   lat: 22.6273, lng: 120.3014, visits: 1,    type: "visited" },
    { name: "Tainan",      lat: 22.9908, lng: 120.2133, visits: 1,    type: "visited" },
    { name: "Fukuoka",     lat: 33.5902, lng: 130.4017, visits: 1,    type: "visited" },
    { name: "Sasebo",      lat: 33.1800, lng: 129.7150, visits: 1,    type: "visited" },
    { name: "Nagasaki",    lat: 32.7503, lng: 129.8779, visits: 1,    type: "visited" }
  ];

  const visitOrder = ["Hong Kong", "Guangzhou", "Taipei", "Vancouver", "Tokyo", "Kaohsiung", "Tainan", "Fukuoka", "Sasebo", "Nagasaki"];

  // ---------------------------------------------------------
  // SETUP
  // ---------------------------------------------------------
  const container = d3.select("#vis-ddMap");
  container.selectAll("*").remove();

  const wrapper = container.append("div")
      .style("max-width", "900px")
      .style("margin", "0 auto")
      .style("text-align", "center")
      .style("position", "relative");

  wrapper.append("h2")
      .style("margin", "0 0 12px")
      .style("font-size", "24px")
      .style("color", "#2c3e50")
      .style("font-weight", "bold")
      .text("My Travel Journey");

  wrapper.append("p")
      .style("margin", "0 0 24px")
      .style("font-size", "16px")
      .style("color", "#7f8c8d")
      .text("Drag to pan : + / - ");

  // ---------------------------------------------------------
  // ZOOM + REPLAY BUTTONS
  // ---------------------------------------------------------
  const controls = wrapper.append("div")
      .style("position", "absolute")
      .style("top", "10px")
      .style("right", "10px")
      .style("background", "white")
      .style("padding", "8px")
      .style("border-radius", "8px")
      .style("box-shadow", "0 2px 8px rgba(0,0,0,0.1)")
      .style("display", "flex")
      .style("flex-direction", "column")
      .style("gap", "4px")
      .style("z-index", "10");

  ["+", "Replay", "-"].forEach(txt => {
    controls.append("button")
      .text(txt)
      .style("font-size", txt === "Replay" ? "12px" : "20px")
      .style("width", "36px")
      .style("height", "36px")
      .style("border", "1px solid #ccc")
      .style("border-radius", "6px")
      .style("background", txt === "Replay" ? "#e9ecef" : "#f8f9fa")
      .style("cursor", "pointer")
      .on("click", () => {
        if (txt === "+") zoom(1.5);
        else if (txt === "-") zoom(0.67);
        else replayJourney();
      });
  });

  // ---------------------------------------------------------
  // SVG + LAYERS
  // ---------------------------------------------------------
  const width = 800;
  const height = 500;

  const svg = wrapper.append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("width", "100%")
      .style("background", "#fff")
      .style("border-radius", "12px")
      .style("box-shadow", "0 4px 16px rgba(0,0,0,0.1)")
      .style("display", "block")
      .style("margin", "0 auto")
      .style("cursor", "grab");

  const gGraticule = svg.append("g");
  const gLand      = svg.append("g");
  const gCities    = svg.append("g");

  // ---------------------------------------------------------
  // STATE
  // ---------------------------------------------------------
  let scale = 800;
  let centerX = 115;
  let centerY = 25;
  const initial = { scale: 800, centerX: 115, centerY: 25 };

  function updateProjection() {
    return d3.geoMercator()
        .center([centerX, centerY])
        .scale(scale)
        .translate([width / 2, height / 2]);
  }

  let projection = updateProjection();
  let path = d3.geoPath().projection(projection);

  // ---------------------------------------------------------
  // TOOLTIP
  // ---------------------------------------------------------
  const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background", "rgba(0,0,0,0.85)")
      .style("color", "white")
      .style("padding", "8px 12px")
      .style("border-radius", "8px")
      .style("font-size", "13px")
      .style("pointer-events", "none")
      .style("z-index", "1000");

  // ---------------------------------------------------------
  // UPDATE FUNCTION (smaller dots + thick stroke)
  // ---------------------------------------------------------
  function updateAll() {
    projection = updateProjection();
    path.projection(projection);

    gGraticule.selectAll("path").attr("d", path);
    gLand.selectAll("path").attr("d", path);

    const baseRadius = 3;  // 50% smaller than before (was 6)
    const zoomFactor = scale / 800;
    const currentRadius = baseRadius / Math.sqrt(zoomFactor);

    gCities.selectAll(".city")
      .attr("transform", d => {
        const [x, y] = projection([d.lng, d.lat]);
        return `translate(${x},${y})`;
      });

    gCities.selectAll("circle")
      .attr("r", currentRadius);

    gCities.selectAll("path.marker")
      .attr("d", d => starPath(currentRadius * 2.2));

    // Fixed label size
    gCities.selectAll("text")
      .style("font-size", "11px");
  }

  function zoom(factor) {
    scale *= factor;
    scale = Math.max(300, Math.min(scale, 4000));
    updateAll();
  }

  function resetView() {
    scale = initial.scale;
    centerX = initial.centerX;
    centerY = initial.centerY;
    updateAll();
  }

  function replayJourney() {
    resetView();
    gCities.selectAll(".city").style("opacity", 0);

    visitOrder.forEach((name, i) => {
      setTimeout(() => {
        gCities.selectAll(".city")
          .filter(d => d.name === name)
          .transition()
          .duration(700)
          .ease(d3.easeBounceOut)
          .style("opacity", 1);
      }, i * 800);
    });
  }

  // ---------------------------------------------------------
  // INTERACTIONS
  // ---------------------------------------------------------
  svg.on("wheel", e => {
    e.preventDefault();
    zoom(e.deltaY > 0 ? 0.8 : 1.25);
  });

  let isDragging = false;
  let startX, startY;

  svg
    .on("mousedown", e => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      svg.style("cursor", "grabbing");
    })
    .on("mousemove", e => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      startX = e.clientX;
      startY = e.clientY;
      const k = scale / 800;
      centerX -= (dx / k) * (360 / width);
      centerY += (dy / k) * (180 / height);
      updateAll();
    })
    .on("mouseup mouseleave", () => {
      isDragging = false;
      svg.style("cursor", "grab");
    });

  // ---------------------------------------------------------
  // STAR PATH
  // ---------------------------------------------------------
  function starPath(r) {
    const p = 5, inner = r * 0.4;
    let path = "";
    for (let i = 0; i < p * 2; i++) {
      const radius = i % 2 === 0 ? r : inner;
      const angle = (i * Math.PI) / p;
      const x = radius * Math.sin(angle);
      const y = -radius * Math.cos(angle);
      path += (i === 0 ? "M" : "L") + x + "," + y;
    }
    return path + "Z";
  }

  // ---------------------------------------------------------
  // INITIAL RENDER + ANIMATION
  // ---------------------------------------------------------
  d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
    .then(world => {
      const countries = topojson.feature(world, world.objects.countries);
      const graticule = d3.geoGraticule();

      gGraticule.append("path")
        .datum(graticule)
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "#ddd")
        .attr("stroke-width", 0.5);

      gLand.selectAll("path")
        .data(countries.features)
        .enter().append("path")
        .attr("d", path)
        .attr("fill", "#f0f0f0")
        .attr("stroke", "#ccc");

      const baseRadius = 3;  // 50% smaller

      const cityGroups = gCities.selectAll(".city")
        .data(cities)
        .enter().append("g")
        .attr("class", "city")
        .style("opacity", 0)
        .attr("transform", d => {
          const [x, y] = projection([d.lng, d.lat]);
          return `translate(${x},${y})`;
        });

      cityGroups.each(function(d) {
        const g = d3.select(this);

        let marker;
        if (d.type === "home") {
          marker = g.append("path")
            .attr("class", "marker")
            .attr("d", starPath(baseRadius * 2.2))
            .attr("fill", "#f39c12")
            .attr("stroke", "#e67e22")
            .attr("stroke-width", 2.5);  // THICKER
        } else {
          marker = g.append("circle")
            .attr("r", baseRadius)
            .attr("fill", d.type === "hometown" ? "#3498db" : "#e74c3c")
            .attr("stroke", d.type === "hometown" ? "#2980b9" : "#c0392b")
            .attr("stroke-width", 2.5);  // THICKER
        }

        g.append("text")
          .attr("x", d.type === "home" ? 18 : d.type === "hometown" ? 0 : 14)
          .attr("y", d.type === "home" ? 4 : d.type === "hometown" ? -12 : 3)
          .attr("text-anchor", d.type === "hometown" ? "middle" : "start")
          .style("font-size", "11px")
          .style("font-weight", "600")
          .style("fill", "#2c3e50")
          .style("pointer-events", "none")
          .text(d.name);

        marker
          .on("mouseover", e => {
            tooltip.html(`<strong>${d.name}</strong><br>
              ${d.type === "home" ? "Home (Born & Raised)" :
                d.type === "hometown" ? `Hometown – ${d.visits} visits` :
                `Visited ${d.visits} time${d.visits > 1 ? 's' : ''}`}`)
              .style("left", (e.pageX + 12) + "px")
              .style("top", (e.pageY - 28) + "px")
              .style("opacity", 1);
            marker.attr("stroke-width", 4);  // Bold on hover
          })
          .on("mouseout", () => {
            tooltip.style("opacity", 0);
            marker.attr("stroke-width", 2.5);
          });
      });

      // Initial animation
      replayJourney();

      gCities.raise();
    });

})();