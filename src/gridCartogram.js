/* -------------------------------------------------
   gridCartogram.js – Hong Kong District Visit Frequency
   (Small Harbour gap + hexagons + no overlap + accurate layout)
   ------------------------------------------------- */
(function () {

  // ---------------------------------------------------------
  // 1. DATA – 18 HK Districts + visits + (x, y) positions
  // ---------------------------------------------------------
  const districts = [
    // === HONG KONG ISLAND (bottom) – slightly closer to Kowloon ===
    { name: "Central and Western", visits: 5,   x: 2.8, y: 5.3, color: "#d5dbdb" },
    { name: "Wan Chai",            visits: 5,   x: 3.8, y: 5.3, color: "#d5dbdb" },
    { name: "Eastern",             visits: 5,   x: 4.8, y: 5.1, color: "#d5dbdb" },
    { name: "Southern",            visits: 5,   x: 3.3, y: 5.8, color: "#d5dbdb" },

    // === KOWLOON (middle) – slightly lower ===
    { name: "Yau Tsim Mong",       visits: 50,  x: 4.0, y: 4.1, color: "#85929e" },
    { name: "Sham Shui Po",        visits: 150, x: 3.2, y: 3.7, color: "#34495e" },
    { name: "Kowloon City",        visits: 40,  x: 4.8, y: 4.1, color: "#85929e" },
    { name: "Wong Tai Sin",        visits: 5,   x: 5.5, y: 3.7, color: "#d5dbdb" },
    { name: "Kwun Tong",           visits: 5,   x: 6.2, y: 4.1, color: "#d5dbdb" },

    // === NEW TERRITORIES (top) ===
    { name: "Kwai Tsing",          visits: 5,   x: 2.8, y: 3.1, color: "#d5dbdb" },
    { name: "Tsuen Wan",           visits: 5,   x: 3.5, y: 2.9, color: "#d5dbdb" },
    { name: "Tuen Mun",            visits: 5,   x: 1.8, y: 2.7, color: "#d5dbdb" },
    { name: "Yuen Long",           visits: 5,   x: 2.2, y: 2.1, color: "#d5dbdb" },
    { name: "North",               visits: 365, x: 4.0, y: 1.8, color: "#2c3e50" }, // Top center
    { name: "Tai Po",              visits: 100, x: 5.2, y: 2.1, color: "#5d6d7e" },
    { name: "Sha Tin",             visits: 5,   x: 4.5, y: 2.7, color: "#d5dbdb" },
    { name: "Sai Kung",            visits: 35,  x: 6.5, y: 2.7, color: "#85929e" },

    // === ISLANDS (bottom-left) ===
    { name: "Islands",             visits: 30,  x: 1.2, y: 5.5, color: "#85929e" }
  ];

  // ---------------------------------------------------------
  // 2. CONTAINER & TITLE
  // ---------------------------------------------------------
  const container = d3.select("#vis-gridCartogram");
  container.selectAll("*").remove();

  const wrapper = container.append("div")
      .attr("class", "cartogram-wrapper")
      .style("max-width", "900px")
      .style("margin", "0 auto")
      .style("text-align", "center");

  wrapper.append("h2")
    .style("margin", "0 0 12px")
    .style("font-size", "24px")
    .style("color", "#2c3e50")
    .style("font-weight", "bold")
    .text("Hong Kong District Visit Frequency");

  wrapper.append("p")
    .style("margin", "0 0 24px")
    .style("font-size", "16px")
    .style("color", "#7f8c8d")
    .text("Geographically accurate cartogram : darker = more frequent visits");

  // ---------------------------------------------------------
  // 3. SVG + SCALING
  // ---------------------------------------------------------
  const width = 800;
  const height = 800;
  const hexRadius = 40;

  const svg = wrapper.append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("width", "100%")
      .style("background", "#fff")
      .style("border-radius", "12px")
      .style("box-shadow", "0 4px 16px rgba(0,0,0,0.1)");

  const xScale = d3.scaleLinear()
      .domain([0, 7.5])
      .range([70, width - 70]);

  const yScale = d3.scaleLinear()
      .domain([0, 6.5])
      .range([100, height - 100]);

  // ---------------------------------------------------------
  // 4. HEXAGON PATH FUNCTION
  // ---------------------------------------------------------
  function hexagonPath(radius) {
    const angle = Math.PI / 3;
    let path = "";
    for (let i = 0; i < 6; i++) {
      const a = angle * i - Math.PI / 6;
      const x = radius * Math.cos(a);
      const y = radius * Math.sin(a);
      path += (i === 0 ? "M" : "L") + x + "," + y;
    }
    return path + "Z";
  }

  // ---------------------------------------------------------
  // 5. DRAW HEXAGONS (Small Harbour gap)
  // ---------------------------------------------------------
  const cells = svg.selectAll(".district")
      .data(districts)
      .enter().append("g")
      .attr("class", "district")
      .attr("transform", d => {
        const x = xScale(d.x);
        let y = yScale(d.y);

        // === SMALL VICTORIA HARBOUR GAP ===
        if (d.y > 5.0) y += 15;        // Push HK Island down slightly
        else if (d.y < 4.5) y -= 10;    // Push Kowloon up slightly

        return `translate(${x},${y})`;
      });

  cells.append("path")
      .attr("d", hexagonPath(hexRadius))
      .attr("fill", d => d.color)
      .attr("stroke", "#fff")
      .attr("stroke-width", 3.5);

  // Multi-line labels
  cells.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.3em")
      .style("font-size", "9px")
      .style("font-weight", "bold")
      .style("fill", "#fff")
      .style("pointer-events", "none")
      .each(function(d) {
        const words = d.name.split(" ");
        const tspan = d3.select(this);
        words.forEach((word, i) => {
          tspan.append("tspan")
            .attr("x", 0)
            .attr("dy", i === 0 ? 0 : "1em")
            .text(word);
        });
      });

  // ---------------------------------------------------------
  // 6. TOOLTIP
  // ---------------------------------------------------------
  const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

  cells.on("mouseover", function(event, d) {
    tooltip.html(`
      <strong>${d.name}</strong><br>
      ${d.visits === 365 ? "Daily (Home)" :
        d.visits === 150 ? "Very Often (CityU)" :
        d.visits === 100 ? "Often (Part-time Job)" :
        d.visits >= 30 ? "Weekend Leisure" :
        "Rarely"}
      <br>~${d.visits} times/year
    `)
    .style("left", (event.pageX + 12) + "px")
    .style("top", (event.pageY - 28) + "px")
    .transition().duration(200).style("opacity", 1);

    d3.select(this).select("path")
      .attr("stroke", "#000")
      .attr("stroke-width", 5);
  })
  .on("mouseout", function() {
    tooltip.transition().duration(400).style("opacity", 0);
    d3.select(this).select("path")
      .attr("stroke", "#fff")
      .attr("stroke-width", 3.5);
  });

  // ---------------------------------------------------------
  // 7. LEGEND
  // ---------------------------------------------------------
  const legend = wrapper.append("div")
      .style("margin-top", "20px")
      .style("font-size", "14px")
      .style("color", "#2c3e50")
      .style("text-align", "center");

  legend.append("span").text("Legend: ");
  legend.append("span").style("color", "#2c3e50").text("Daily (North) ");
  legend.append("span").style("color", "#34495e").text("Very Often (SSP) ");
  legend.append("span").style("color", "#5d6d7e").text("Often (Tai Po) ");
  legend.append("span").style("color", "#85929e").text("Weekend ");
  legend.append("span").style("color", "#d5dbdb").text("Rarely");

})();