(function() {

  // -----------------------------
  // 1. DATA: Nodes & Links
  // -----------------------------
  const nodes = [
    "Creative Media",
    "Photography", "Installation", "Coding",
    "From One Shore", "Letter", "Bunny Game", "Academic Trauma"
  ];

  const links = [
    {source: "Creative Media", target: "Photography"},
    {source: "Creative Media", target: "Installation"},
    {source: "Creative Media", target: "Coding"},
    {source: "Photography", target: "From One Shore"},
    {source: "Installation", target: "Letter"},
    {source: "Coding", target: "Bunny Game"},
    {source: "From One Shore", target: "Letter"},
    {source: "Bunny Game", target: "Academic Trauma"}
  ];

  // -----------------------------
  // 2. BUILD MATRIX
  // -----------------------------
  const n = nodes.length;
  const matrix = Array(n).fill().map(() => Array(n).fill(0));

  links.forEach(link => {
    const i = nodes.indexOf(link.source);
    const j = nodes.indexOf(link.target);
    if (i > -1 && j > -1) {
      matrix[i][j] = 1;
      matrix[j][i] = 1; // undirected
    }
  });

  // -----------------------------
  // 3. SVG SETUP
  // -----------------------------
  const margin = {top: 270, right: 80, bottom: 80, left: 100};
  const width = 700;
  const height = 900;
  const innerSize = Math.min(width - margin.left - margin.right, height - margin.top - margin.bottom);
  const cellSize = innerSize / n;

  const svg = d3.select("#vis-AdjMatrix").append("svg")
      .attr("width", width)
      .attr("height", height);

  // Title
  svg.append("text")
      .attr("class", "title")
      .attr("x", width / 2)
      .attr("y", 40)
      .text("Adjacency Matrix");

  svg.append("text")
      .attr("class", "subtitle")
      .attr("x", width / 2)
      .attr("y", 60)
      .text("Hover to highlight connections");

  const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  // -----------------------------
  // 4. SCALES
  // -----------------------------
  const x = d3.scaleBand().domain(d3.range(n)).range([0, n * cellSize]);
  const y = d3.scaleBand().domain(d3.range(n)).range([0, n * cellSize]);
  const color = d3.scaleSequential(d3.interpolateBlues).domain([0, 1]);

  // -----------------------------
  // 5. CELLS
  // -----------------------------
  const rows = g.selectAll(".row")
      .data(matrix)
      .enter().append("g")
      .attr("class", "row")
      .attr("transform", (d, i) => `translate(0,${y(i)})`);

  rows.selectAll(".cell")
      .data((d, i) => d.map((v, j) => ({value: v, i, j})))
      .enter().append("rect")
      .attr("class", "cell")
      .attr("x", d => x(d.j))
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("fill", d => d.value ? color(1) : "#fff")
      .attr("stroke", "#ddd");

  // -----------------------------
  // 6. LABELS
  // -----------------------------
  // Row labels (left)
  g.selectAll(".row-label")
      .data(nodes)
      .enter().append("text")
      .attr("class", "label")
      .attr("x", -8)
      .attr("y", (d, i) => y(i) + cellSize / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .text(d => d.length > 15 ? d.slice(0,13)+"..." : d);

  // Column labels (top, rotated)
  g.selectAll(".col-label")
      .data(nodes)
      .enter().append("text")
      .attr("class", "label")
      .attr("x", (d, i) => x(i) + cellSize /2)
      .attr("y", -8)
      .attr("text-anchor", "end")
      .attr("transform", (d, i) => `translate(${x(i) + cellSize/2}, -8) rotate(-45)`)
      .text(d => d.length > 12 ? d.slice(0,10)+"..." : d);

  // -----------------------------
  // 7. TOOLTIP & HOVER
  // -----------------------------
  const tooltip = d3.select("body").append("div")
      .style("position", "absolute")
      .style("background", "rgba(0,0,0,0.8)")
      .style("color", "white")
      .style("padding", "8px 12px")
      .style("border-radius", "6px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("opacity", 0);

  rows.selectAll(".cell")
      .on("mouseover", function(event, d) {
        if (!d.value) return;
        const src = nodes[d.i], tgt = nodes[d.j];
        tooltip.html(`<strong>${src}</strong> ↔ <strong>${tgt}</strong>`)
               .style("left", (event.pageX + 12) + "px")
               .style("top", (event.pageY - 28) + "px")
               .transition().duration(200).style("opacity", 0.9);

        d3.selectAll(".cell")
          .filter(c => c.i === d.i || c.j === d.j)
          .attr("stroke", "#000")
          .attr("stroke-width", 2);
      })
      .on("mouseout", function() {
        tooltip.transition().duration(400).style("opacity", 0);
        d3.selectAll(".cell")
          .attr("stroke", "#ddd")
          .attr("stroke-width", 1);
      });

})();