// Set the dimensions and margin of the pie chart
const pwidth = 400;
const pheight = 400;
const pmargin = 20;

// Create the SVG canvas
const psvg = d3.select("#vis-pie")
    .append("svg")
    .attr("width", pwidth)
    .attr("height", pheight)
    .append("g")
    .attr("transform", `translate(${pwidth / 2}, ${pheight / 2})`);

// Sample data for personality traits and abilities
const pdata = [
    { name: "Creativity", value: 30 },
    { name: "Technical Skills", value: 25 },
    { name: "Collaboration", value: 20 },
    { name: "Critical Thinking", value: 15 },
    { name: "Adaptability", value: 10 }
];

// Set the color scale
const color = d3.scaleOrdinal(d3.schemeCategory10);

// Create a pie chart layout
const pie = d3.pie()
    .value(d => d.value);

// Create an arc generator
const arc = d3.arc()
    .innerRadius(0) // This makes it a pie chart instead of a donut chart
    .outerRadius(Math.min(pwidth, pheight) / 2 - pmargin);

// Create the arcs and append them to the SVG
const arcs = psvg.selectAll(".arc")
    .data(pie(pdata))
    .enter().append("g")
    .attr("class", "arc");

arcs.append("path")
    .attr("d", arc)
    .style("fill", (d, i) => color(i));

// Add labels to each segment
arcs.append("text")
    .attr("transform", d => `translate(${arc.centroid(d)})`)
    .attr("dy", "0.35em")
    .style("text-anchor", "middle")
    .text(d => d.pdata.name);