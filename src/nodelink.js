(function () {
    // ===============================================
    // 1. DATA & NODES
    // ===============================================
    const layer1 = [{ id: "Creative Media", group: "central" }];
    const layer2 = [
        { id: "Photography", group: "media" },
        { id: "Installation", group: "media" },
        { id: "Coding", group: "media" },
        { id: "Video Editing", group: "media" },
        { id: "Creative Writing", group: "media" },
        { id: "Socially-Engaged Project", group: "media" }
    ];

    const layer3 = [
        { id: "From One Shore to Another", parent: "Photography", group: "work" },
        { id: "The Circle of Life", parent: "Photography", group: "work" },
        { id: "Letter", parent: "Installation", group: "work" },
        { id: "Glimpse of Anxious Time", parent: "Installation", group: "work" },
        { id: "Bunny&Carrots Game", parent: "Coding", group: "work" },
        { id: "The Great Magic Shows", parent: "Video Editing", group: "work" },
        { id: "Accompany", parent: "Video Editing", group: "work" },
        { id: "Gossip Gambler", parent: "Video Editing", group: "work" },
        { id: "Two Views of Back", parent: "Creative Writing", group: "work" },
        { id: "Lantau Tomorrow Vision (Peng Chau)", parent: "Socially-Engaged Project", group: "work" },
        { id: "Academic Trauma", parent: "Socially-Engaged Project", group: "work" }
    ];

    const nodes = [...layer1, ...layer2, ...layer3];
    const links = [];
    layer2.forEach(m => links.push({ source: "Creative Media", target: m.id, type: "main" }));
    layer3.forEach(w => links.push({ source: w.parent, target: w.id, type: "child" }));
    links.push({ source: "From One Shore to Another", target: "Letter", type: "cross" });
    links.push({ source: "Lantau Tomorrow Vision (Peng Chau)", target: "Academic Trauma", type: "cross" });
    links.push({ source: "Glimpse of Anxious Time", target: "Photography", type: "cross" });

    // ===============================================
    // 2. SVG & LAYOUT
    // ===============================================
    const width = window.innerWidth;
    const height = window.innerHeight;

    const svg = d3.select("#vis-nodelink")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("background", "#fafafa");

    // Title
    svg.append("text")
        .attr("x", width / 2).attr("y", 50)
        .attr("text-anchor", "middle")
        .style("font-size", "28px").style("font-weight", "bold")
        .style("fill", "#2c3e50")
        .text("My Previous Artwork at SCM");

    svg.append("text")
        .attr("x", width / 2).attr("y", 78)
        .attr("text-anchor", "middle")
        .style("font-size", "16px").style("fill", "#5d6d7e")
        .style("font-style", "italic")
        .text("Click on the green circles to explore my artworks");

    // Arrow marker
    svg.append("defs").append("marker")
        .attr("id", "arrow").attr("viewBox", "0 -5 10 10")
        .attr("refX", 35).attr("refY", 0)
        .attr("markerWidth", 6).attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path").attr("d", "M0,-5L10,0L0,5").attr("fill", "#2c3e50");

    // ===============================================
    // 3. FILTER PANEL (your exact design — bottom right)
    // ===============================================
    const categories = ["Photography", "Installation", "Coding", "Video Editing", "Creative Writing", "Socially-Engaged Project"];

    const filterBox = svg.append("g")
        .attr("transform", `translate(${width - 220},${height - 260})`)
        .style("pointer-events", "all");

    filterBox.append("rect")
        .attr("width", 200).attr("height", 240).attr("rx", 12)
        .attr("fill", "white").attr("stroke", "#ddd").attr("stroke-width", 2)
        .style("box-shadow", "0 4px 20px rgba(0,0,0,0.15)");

    filterBox.append("text")
        .attr("x", 100).attr("y", 32)
        .attr("text-anchor", "middle")
        .style("font-size", "16px").style("font-weight", "bold").style("fill", "#2c3e50")
        .text("Filter by Medium");

    const filterItems = filterBox.selectAll(".filter-item")
        .data(categories).enter().append("g")
        .attr("transform", (d, i) => `translate(20,${54 + i * 32})`)
        .style("cursor", "pointer");

    filterItems.append("rect")
        .attr("width", 160).attr("height", 28).attr("rx", 8)
        .attr("fill", "#f8f9fa").attr("stroke", "#ddd");

    filterItems.append("text")
        .attr("x", 14).attr("y", 18)
        .style("font-size", "13px").style("fill", "#2c3e50")
        .text(d => d);

    let activeFilter = null;

    filterItems.on("click", function (event, category) {
        activeFilter = activeFilter === category ? null : category;

        // Update visual highlight
        filterItems.select("rect")
            .transition().duration(200)
            .attr("fill", "#f8f9fa");
        if (activeFilter) {
            d3.select(this).select("rect")
                .transition().duration(200)
                .attr("fill", "#e3f2fd");
        }

        // Filter nodes
        node.transition().duration(600)
            .style("opacity", d => {
                if (!activeFilter) return 1;
                if (d.id === "Creative Media") return 1;
                if (d.id === activeFilter) return 1;
                if (d.parent === activeFilter) return 1;
                return 0.12;
            });

        // Filter links
        link.transition().duration(600)
            .style("opacity", d => {
                if (!activeFilter) return 0.9;
                const source = typeof d.source === "object" ? d.source.id : d.source;
                const target = typeof d.target === "object" ? d.target.id : d.target;

                const sourceNode = nodes.find(n => n.id === source);
                const targetNode = nodes.find(n => n.id === target);

                const sourceVisible = source === "Creative Media" || source === activeFilter || (sourceNode && sourceNode.parent === activeFilter);
                const targetVisible = target === activeFilter || (targetNode && targetNode.parent === activeFilter);

                return (sourceVisible || targetVisible) ? 0.9 : 0.08;
            });
    });

    // ===============================================
    // 4. SIMULATION & NODES/LINKS
    // ===============================================
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id)
            .distance(d => d.type === "main" ? 220 : d.type === "child" ? 130 : 200)
            .strength(1))
        .force("charge", d3.forceManyBody().strength(d => 
            d.group === "central" ? -1400 : d.group === "media" ? -700 : -350))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(d => 
            d.group === "central" ? 50 : d.group === "media" ? 40 : 25));

    const link = svg.append("g").selectAll("line").data(links).enter().append("line")
        .attr("stroke", "#95a5a6")
        .attr("stroke-width", d => d.type === "main" ? 3 : 2)
        .attr("marker-end", d => d.type !== "cross" ? "url(#arrow)" : null)
        .style("stroke-dasharray", d => d.type === "cross" ? "6,4" : null)
        .style("opacity", 0.9);

    const node = svg.append("g").selectAll("g").data(nodes).enter().append("g")
        .call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended));

    node.append("circle")
        .attr("r", d => d.group === "central" ? 36 : d.group === "media" ? 30 : 20)
        .attr("fill", d => d.group === "central" ? "#e74c3c" : d.group === "media" ? "#3498db" : "#27ae60")
        .style("stroke", "#fff").style("stroke-width", 3)
        .style("cursor", d => d.group === "work" ? "pointer" : "move");

    node.append("text")
        .attr("dy", ".35em")
        .attr("x", d => d.group === "central" ? 0 : d.group === "media" ? 38 : 26)
        .attr("text-anchor", d => d.group === "central" ? "middle" : "start")
        .text(d => d.id)
        .style("font-family", "Helvetica Neue, Arial, sans-serif")
        .style("font-size", d => d.group === "central" ? "17px" : d.group === "media" ? "15px" : "12px")
        .style("font-weight", d => d.group === "central" ? "bold" : "500")
        .style("fill", "#2c3e50")
        .style("pointer-events", "none");

    // ===============================================
    // 5. SIDEBAR & ARTWORK DATA
    // ===============================================
    const sidebar = d3.select("body").append("div")
        .attr("id", "artwork-sidebar")
        .style("position", "fixed").style("top", 0).style("left", 0)
        .style("width", window.innerWidth < 900 ? "100%" : "420px")
        .style("height", "100vh")
        .style("background", "#fff")
        .style("box-shadow", "4px 0 30px rgba(0,0,0,0.25)")
        .style("transform", "translateX(-100%)")
        .style("transition", "transform 0.7s cubic-bezier(0.25, 0.8, 0.25, 1)")
        .style("z-index", 2000)
        .style("overflow-y", "auto")
        .style("padding", "80px 45px")
        .style("box-sizing", "border-box");

    sidebar.append("div")
        .style("position", "absolute").style("top", "20px").style("right", "30px")
        .style("font-size", "42px").style("cursor", "pointer").style("color", "#999")
        .html("×")
        .on("click", () => sidebar.style("transform", "translateX(-100%)"));

    const content = sidebar.append("div");

    const artworkData = {
        "From One Shore to Another": { type: "Video, Photography, Stop Motion", theme: "Migration & Social Identity", link: "https://youtu.be/E_woeWQC-m4", page: "https://kayulauren.substack.com/p/from-one-shore-to-another" },
        "Bunny&Carrots Game": { type: "Interactive Coding", theme: "Easter, Playfulness", link: "https://youtube.com/shorts/UJzqJmTUd50?feature=share" },
        "The Great Magic Shows": { type: "Film Remix", theme: "Cruel Reality vs Sweet Lies", link: "https://youtu.be/XYVFJBD6lbU" },
        "Accompany": { type: "Video Production", theme: "Companionship", link: "https://youtu.be/ve37QFmOpJQ" },
        "Gossip Gambler": { type: "Video Production", theme: "Comedy & Rumour", link: "https://youtu.be/42Fur6VHkXk" },
        "Two Views of Back": { type: "Chinese Creative Writing", theme: "Observation", link: "https://portland-my.sharepoint.com/..." },
        "The Circle of Life": { type: "Photography", theme: "Ups and Downs in Life", photos: ["pictures/life1.JPG", "pictures/life2.JPG"] },
        "Letter": { type: "Installation", theme: "Pandemic & Communication", photos: ["pictures/letter1.jpeg", "pictures/letter2.jpeg"] },
        "Glimpse of Anxious Time": { type: "Installation + Photography", theme: "Family of Origin, Attachment", photos: ["pictures/glimpse1.jpeg", "pictures/glimpse2.jpeg"] },
        "Lantau Tomorrow Vision (Peng Chau)": { type: "Exhibition Planning", theme: "Urban Development & Community", photos: ["pictures/lantau1.jpeg", "pictures/lantau2.JPG"] },
        "Academic Trauma": { type: "Participatory Project", theme: "Education & Mental Health", photos: ["pictures/trauma1.jpg", "pictures/trauma2.jpg"] }
    };

    const showcaseWorks = ["The Circle of Life", "Letter", "Glimpse of Anxious Time", "Lantau Tomorrow Vision (Peng Chau)", "Academic Trauma"];

    node.on("click", function (event, d) {
        if (d.group !== "work") return;
        event.stopPropagation();

        const data = artworkData[d.id] || {};
        const photos = data.photos || [];
        const isShowcase = showcaseWorks.includes(d.id);

        let galleryHTML = "";
        if (isShowcase && photos.length === 2) {
            galleryHTML = `
                <div style="margin:50px 0 30px; text-align:center;">
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
                        <img src="${photos[0]}" loading="lazy" alt="Photo 1" style="width:100%; border-radius:14px; box-shadow:0 8px 30px rgba(0,0,0,0.25);">
                        <img src="${photos[1]}" loading="lazy" alt="Photo 2" style="width:100%; border-radius:14px; box-shadow:0 8px 30px rgba(0,0,0,0.25);">
                    </div>
                </div>`;
        }

        content.html(`
            <h2 style="margin:0 0 22px; font-size:30px; color:#e74c3c; line-height:1.3;">${d.id}</h2>
            <ul style="font-size:18px; line-height:2.3; padding-left:24px; margin:0 0 30px;">
                <li><strong>Type:</strong> ${data.type || "—"}</li>
                <li><strong>Theme:</strong> ${data.theme || "—"}</li>
                ${data.link ? `<li style="margin-top:16px;"><a href="${data.link}" target="_blank" class="project-btn main">View Project</a></li>` : ""}
                ${data.page ? `<li style="margin-top:10px;"><a href="${data.page}" target="_blank" class="project-btn secondary">Read Full Story</a></li>` : ""}
            </ul>
            ${galleryHTML}
        `);

        content.selectAll(".project-btn")
            .style("padding", "12px 26px").style("border-radius", "8px")
            .style("text-decoration", "none").style("font-weight", "600")
            .style("display", "inline-block").style("margin-right", "12px")
            .style("transition", "all 0.3s")
            .on("mouseover", function () { d3.select(this).style("transform", "translateY(-4px)").style("box-shadow", "0 8px 25px rgba(0,0,0,0.3)"); })
            .on("mouseout", function () { d3.select(this).style("transform", "none").style("box-shadow", "none"); });

        content.selectAll(".project-btn.main")
            .style("background", "#e74c3c").style("color", "white");

        content.selectAll(".project-btn.secondary")
            .style("background", "#3498db").style("color", "white");

        sidebar.style("transform", "translateX(0)");
    });

    // Close sidebar
    d3.select("body").on("click.sidebar", function (event) {
        if (!d3.select(event.target).closest("#artwork-sidebar, svg").node()) {
            sidebar.style("transform", "translateX(-100%)");
        }
    });

    // ===============================================
    // 6. TICK, DRAG, RESIZE
    // ===============================================
    simulation.on("tick", () => {
        link.attr("x1", d => d.source.x).attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
        node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(e, d) { if (!e.active) simulation.alphaTarget(.3).restart(); d.fx = d.x; d.fy = d.y; }
    function dragged(e, d) { d.fx = e.x; d.fy = e.y; }
    function dragended(e, d) { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; }

    window.addEventListener("resize", () => {
        const w = window.innerWidth, h = window.innerHeight;
        svg.attr("width", w).attr("height", h);
        simulation.force("center", d3.forceCenter(w / 2, h / 2)).alpha(0.3).restart();
        sidebar.style("width", w < 900 ? "100%" : "420px");
        filterBox.attr("transform", `translate(${w - 220},${h - 260})`);
    });
})();