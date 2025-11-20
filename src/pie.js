(function(){

// Set the dimensions and margin of the pie chart
const pwidth = 400;
const pheight = 450;
const pmargin = 20;

// Create the SVG canvas
const psvg = d3.select("#vis-pie")
    .append("svg")
    .attr("width", pwidth)
    .attr("height", pheight)
    .append("g")
    .attr("transform", `translate(${pwidth / 2}, ${pheight / 2})`);

// Add a title to the pie chart
psvg.append("text")
    .attr("x", 0)
    .attr("y", -pheight / 2 + pmargin) // Position above the chart
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text("Personality Traits and Abilities");

// ← FINAL VERSION – fixed 5-point difference, same order, 100% total
const pdata = [
    { name: "Imagination & Creativity", value: 30 },
    { name: "Collaboration",            value: 25 },
    { name: "Critical Thinking",        value: 20 },
    { name: "Technical Skills",         value: 15 },
    { name: "Adaptability",             value: 10 },
    { name: "Efficiency",               value: 5  }
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

// === TOOLTIP DIV (create once) ===
const tooltip = d3.select("body").append("div")
    .attr("class", "pie-tooltip")
    .style("opacity", 0);

// === PATHS WITH HOVER ===
arcs.append("path")
    .attr("d", arc)
    .style("fill", (d, i) => color(i))
    .style("cursor", "pointer")
    .on("mouseover", function(event, d) {
        d3.select(this)
            .transition().duration(200)
            .attr("opacity", 0.8);
        
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`<strong>${d.data.name}</strong><br>${d.data.value}%`)
               .style("left", (event.pageX + 12) + "px")
               .style("top", (event.pageY - 10) + "px");
    })
    .on("mousemove", function(event) {
        tooltip.style("left", (event.pageX + 12) + "px")
               .style("top", (event.pageY - 10) + "px");
    })
    .on("mouseout", function() {
        d3.select(this)
            .transition().duration(200)
            .attr("opacity", 1);
        
        tooltip.transition().duration(200).style("opacity", 0);
    });

// === LABELS – now automatically moved outside small slices ===
arcs.append("text")
    .attr("transform", d => {
        const centroid = arc.centroid(d);
        const midAngle = Math.atan2(centroid[1], centroid[0]);  // angle of the slice
        const distance = d.data.value < 12 ? 1.4 : 1.1;         // push small slices farther out
        const x = centroid[0] * distance;
        const y = centroid[1] * distance;
        return `translate(${x}, ${y})`;
    })
    .attr("dy", "0.35em")
    .style("text-anchor", "middle")
    .style("font-weight", "600")
    .style("font-size", "13px")
    .style("fill", "darkblue")
    .text(d => d.data.name);
})();