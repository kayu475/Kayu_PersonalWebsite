    const data = [
      { year: 2020, creative: 50 },
      { year: 2021, creative: 75 },
      { year: 2022, creative: 60 },
      { year: 2023, creative: 90 },
    ];

    // Chart dimensions and margins
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG container
    const svg = d3.select("#vis-scatterplot")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // X axis: Year (linear scale)
    const x = d3.scaleLinear()
      .domain([d3.min(data, d => d.year), d3.max(data, d => d.year)]) // Domain: min and max year
      .range([0, width]); // Range: left and right edges of the chart

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(4).tickFormat(d3.format("d"))) // Display all 4 years
      .attr("class", "axis");

    // Y axis: Screative Artwork (linear scale)
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.creative)]) // Domain: 0 to max screative value
      .range([height, 0]); // Range: top and bottom edges of the chart (inverted)

    svg.append("g")
      .call(d3.axisLeft(y))
      .attr("class", "axis");

    // Add dots
    svg.selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.year))
        .attr("cy", d => y(d.creative))
        .attr("r", 5) // Dot radius
        .style("fill", "steelblue");

    // Add X axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 5)
        .style("text-anchor", "middle")
        .text("Year");

    // Add Y axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Creative Artwork");

    // Add chart title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Creative Artwork Over Past 4 Years");