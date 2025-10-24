(function(){

/* -------------------------------------------------
   1. DATA – three layers + cross-links
   ------------------------------------------------- */
const layer1 = [{id:"Creative Media", group:"central"}];

const layer2 = [
    {id:"Photography",            group:"media"},
    {id:"Installation",           group:"media"},
    {id:"Coding",                 group:"media"},
    {id:"Video Editing",          group:"media"},
    {id:"Creative Writing",       group:"media"},
    {id:"Socially-Engaged Project",group:"media"}
];

const layer3 = [
    // Photography
    {id:"From One Shore to Another", parent:"Photography", group:"work"},
    {id:"The Circle of Life",        parent:"Photography", group:"work"},
    // Installation
    {id:"Letter",                    parent:"Installation", group:"work"},
    // Coding
    {id:"Bunny&Carrots Game",        parent:"Coding", group:"work"},
    // Video Editing
    {id:"The Great Magic Shows",     parent:"Video Editing", group:"work"},
    {id:"Accompany",                 parent:"Video Editing", group:"work"},
    // Creative Writing
    {id:"Two Views of Back",         parent:"Creative Writing", group:"work"},
    // Socially-Engaged Project
    {id:"Lantau Tomorrow Vision (Peng Chau)", parent:"Socially-Engaged Project", group:"work"},
    {id:"Academic Trauma",                     parent:"Socially-Engaged Project", group:"work"}
];

const nodes = [...layer1, ...layer2, ...layer3];

/* -------------------------------------------------
   2. LINKS – main, child, and cross
   ------------------------------------------------- */
const links = [];

// Central → Media
layer2.forEach(m => links.push({source:"Creative Media", target:m.id, type:"main"}));

// Media → Works
layer3.forEach(w => links.push({source:w.parent, target:w.id, type:"child"}));

// NEW: Cross-relationships
links.push({source: "From One Shore to Another", target: "Letter", type: "cross"});
links.push({source: "Lantau Tomorrow Vision (Peng Chau)", target: "Academic Trauma", type: "cross"});

/* -------------------------------------------------
   3. SVG & TITLE
   ------------------------------------------------- */
const width  = window.innerWidth;
const height = window.innerHeight;

const svg = d3.select("#vis-nodelink")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Title
svg.append("text")
    .attr("x", width/2).attr("y",50)
    .attr("text-anchor","middle")
    .style("font-size","28px").style("font-weight","bold")
    .style("fill","#2c3e50")
    .text("My Previous Artwork at SCM");

svg.append("text")
    .attr("x", width/2).attr("y",78)
    .attr("text-anchor","middle")
    .style("font-size","16px").style("fill","#7f8c8d")
    .text("Explorations in Art, Code & Social Engagement");

/* -------------------------------------------------
   4. ARROWHEAD (only for main links)
   ------------------------------------------------- */
svg.append("defs").append("marker")
    .attr("id","arrow")
    .attr("viewBox","0 -5 10 10")
    .attr("refX",35).attr("refY",0)
    .attr("markerWidth",6).attr("markerHeight",6)
    .attr("orient","auto")
    .append("path")
    .attr("d","M0,-5L10,0L0,5")
    .attr("fill","#2c3e50");

/* -------------------------------------------------
   5. FORCE SIMULATION
   ------------------------------------------------- */
const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d=>d.id)
        .distance(d => d.type==="main"? 200 : d.type==="child"? 120 : 180)
        .strength(d => d.type==="main"? 1 : 0.7))
    .force("charge", d3.forceManyBody()
        .strength(d => d.group==="central"? -1200 :
                     d.group==="media"?   -600 :
                                         -300))
    .force("center", d3.forceCenter(width/2, height/2))
    .force("collision", d3.forceCollide()
        .radius(d => d.group==="central"? 45 :
                     d.group==="media"?   35 : 22));

/* -------------------------------------------------
   6. LINKS (with type-based styling)
   ------------------------------------------------- */
const link = svg.append("g")
    .attr("class","links")
    .selectAll("line")
    .data(links)
    .enter().append("line")
    .attr("class", d => {
        if (d.type === "main") return "link-arrow";
        if (d.type === "child") return "child-link";
        if (d.type === "cross") return "cross-link";
    });

/* -------------------------------------------------
   7. NODES
   ------------------------------------------------- */
const node = svg.append("g")
    .attr("class","nodes")
    .selectAll("g")
    .data(nodes)
    .enter().append("g")
    .attr("class", d => "node " + d.group)
    .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

node.append("circle")
    .attr("r", d => d.group==="central"? 34 :
                    d.group==="media"?   27 : 18)
    .attr("fill", d => d.group==="central"? "#e74c3c" :
                       d.group==="media"?   "#3498db" :
                                            "#27ae60");

node.append("text")
    .attr("dy",".35em")
    .attr("x", d => d.group==="central"? 0 :
                    d.group==="media"?   32 : 22)
    .attr("text-anchor", d => d.group==="central"? "middle":"start")
    .text(d => d.id)
    .style("font-weight", d => d.group==="central"? "bold":"normal")
    .style("font-size", d => d.group==="central"? "16px":
                       d.group==="media"?   "14px":"11px");

/* -------------------------------------------------
   8. TOOLTIP
   ------------------------------------------------- */
const tooltip = d3.select("body").append("div")
    .attr("class","tooltip")
    .style("opacity",0);

node.on("mouseover", (event,d)=>{
    tooltip.transition().duration(200).style("opacity",.9);
    tooltip.html(d.id)
        .style("left",(event.pageX+12)+"px")
        .style("top",(event.pageY-28)+"px");
})
.on("mouseout",()=>tooltip.transition().duration(400).style("opacity",0));

/* -------------------------------------------------
   9. ZOOM
   ------------------------------------------------- 
const zoom = d3.zoom()
    .scaleExtent([0.3,5])
    .on("zoom", ({transform})=>svg.selectAll("g").attr("transform",transform));
svg.call(zoom);
*/

/* -------------------------------------------------
   10. TICK
   ------------------------------------------------- */
simulation.on("tick",()=>{
    link.attr("x1",d=>d.source.x).attr("y1",d=>d.source.y)
        .attr("x2",d=>d.target.x).attr("y2",d=>d.target.y);
    node.attr("transform",d=>`translate(${d.x},${d.y})`);
});

/* -------------------------------------------------
   11. DRAG
   ------------------------------------------------- */
function dragstarted(event,d){
    if(!event.active) simulation.alphaTarget(.3).restart();
    d.fx = d.x; d.fy = d.y;
}
function dragged(event,d){
    d.fx = event.x; d.fy = event.y;
}
function dragended(event,d){
    if(!event.active) simulation.alphaTarget(0);
    d.fx = null; d.fy = null;
}

/* -------------------------------------------------
   12. RESPONSIVE
   ------------------------------------------------- */
window.addEventListener('resize',()=>{
    const w = window.innerWidth, h = window.innerHeight;
    svg.attr("width",w).attr("height",h);
    simulation.force("center", d3.forceCenter(w/2,h/2)).alpha(.3).restart();
});

/* -------------------------------------------------
   13. EXPORT PNG
   ------------------------------------------------- */
document.getElementById('exportBtn').addEventListener('click',()=>{
    const svgEl = document.querySelector('svg');
    const {width,height} = svgEl.getBoundingClientRect();

    const data = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([data],{type:'image/svg+xml;charset=utf-8'});
    const url = URL.createObjectURL(blob);

    const img = new Image();
    img.onload = ()=>{
        const canvas = document.createElement('canvas');
        canvas.width = width*2; canvas.height = height*2;
        const ctx = canvas.getContext('2d');
        ctx.scale(2,2);
        ctx.drawImage(img,0,0);

        canvas.toBlob(blob=>{
            const a = document.createElement('a');
            a.download = 'creative-media-portfolio.png';
            a.href = URL.createObjectURL(blob);
            a.click();
        });
    };
    img.src = url;
});

})();