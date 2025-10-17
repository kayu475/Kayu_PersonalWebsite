// Set the dimensions and margin for the sunburst diagram
const swidth = 500;
const sheight = 600;
const sradius = Math.min(swidth, sheight) / 2;

// Create the SVG canvas
const ssvg = d3.select("#vis-sunburst")
    .append("svg")
    .attr("width", swidth)
    .attr("height", sheight)
    .attr("viewBox", [-swidth / 2, -sheight / 2, swidth, sheight])
    .style("font", "10px sans-serif");

// Add a title to the sunburst diagram
ssvg.append("text")
    .attr("x", 0)
    .attr("y", -sheight / 2 + 20) // Position above the chart
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text("My Skills and Competencies");

// Hierarchical data representing skills and competencies
const sdata = {
    "name": "Skills",
    "children": [
        {
            "name": "Creative Media",
            "children": [
                { "name": "Graphic Design", "value": 10 },
                { "name": "Video Editing", "value": 15 },
                { "name": "Animation", "value": 12 },
                { "name": "Storytelling", "value": 18 }
            ]
        },
        {
            "name": "Film Enthusiasm",
            "children": [
                { "name": "Film Analysis", "value": 20 },
                { "name": "Scriptwriting", "value": 14 },
                { "name": "Cinematography", "value": 16 }
            ]
        },
        {
            "name": "Animal Interests",
            "children": [
                { "name": "Wildlife Photography", "value": 8 },
                { "name": "Animal Behavior", "value": 7 },
                { "name": "Pet Care", "value": 5 }
            ]
        },
        {
            "name": "General Competencies",
            "children": [
                { "name": "Communication", "value": 10 },
                { "name": "Teamwork", "value": 9 },
                { "name": "Problem Solving", "value": 11 }
            ]
        }
    ]
};

// Create the hierarchy and partition layout
const root = d3.hierarchy(sdata)
    .sum(d => d.value)
    .sort((a, b) => b.value - a.value);

const partition = d3.partition()
    .size([2 * Math.PI, sradius]);

partition(root);

// Color scale for different categories
const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, root.children.length + 1));

// Arc generator
const arc = d3.arc()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
    .padRadius(sradius)
    .innerRadius(d => d.y0)
    .outerRadius(d => d.y1);

// Append the arcs
ssvg.append("g")
    .selectAll("path")
    .data(root.descendants().filter(d => d.depth))
    .enter().append("path")
    .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
    .attr("d", arc)
    .append("title") // Tooltip for each segment
    .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\nValue: ${d.value}`);

// Add labels to each segment
ssvg.append("g")
    .attr("pointer-events", "none")
    .attr("text-anchor", "middle")
    .selectAll("text")
    .data(root.descendants().filter(d => d.depth && (d.y0 + d.y1) / 2 * (d.x1 - d.x0) > 10))
    .enter().append("text")
    .attr("transform", d => {
        const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
        const y = (d.y0 + d.y1) / 2;
        return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    })
    .attr("dy", "0.35em")
    .text(d => d.data.name);