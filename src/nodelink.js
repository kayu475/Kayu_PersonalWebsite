(function () {

    /* -------------------------------------------------
       1. DATA – three layers + cross-links
       ------------------------------------------------- */
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

    /* -------------------------------------------------
       2. LINKS
       ------------------------------------------------- */
    const links = [];
    layer2.forEach(m => links.push({ source: "Creative Media", target: m.id, type: "main" }));
    layer3.forEach(w => links.push({ source: w.parent, target: w.id, type: "child" }));
    links.push({ source: "From One Shore to Another", target: "Letter", type: "cross" });
    links.push({ source: "Lantau Tomorrow Vision (Peng Chau)", target: "Academic Trauma", type: "cross" });
    links.push({ source: "Glimpse of Anxious Time", target: "Photography", type: "cross" });

    /* -------------------------------------------------
       3. SVG & TITLE
       ------------------------------------------------- */
    const width = window.innerWidth;
    const height = window.innerHeight;

    const svg = d3.select("#vis-nodelink")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    svg.append("text")
        .attr("x", width / 2).attr("y", 50)
        .attr("text-anchor", "middle")
        .style("font-size", "28px").style("font-weight", "bold")
        .style("fill", "#2c3e50")
        .text("My Previous Artwork at SCM");

    svg.append("text")
        .attr("x", width / 2).attr("y", 78)
        .attr("text-anchor", "middle")
        .style("font-size", "16px").style("fill", "#7f8c8d")
        .text("Explorations in Art, Technology & Social Engagement");

    /* -------------------------------------------------
       4. ARROWHEAD + SIMULATION
       ------------------------------------------------- */
    svg.append("defs").append("marker")
        .attr("id", "arrow").attr("viewBox", "0 -5 10 10")
        .attr("refX", 35).attr("refY", 0).attr("markerWidth", 6).attr("markerHeight", 6).attr("orient", "auto")
        .append("path").attr("d", "M0,-5L10,0L0,5").attr("fill", "#2c3e50");

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id)
            .distance(d => d.type === "main" ? 200 : d.type === "child" ? 120 : 180)
            .strength(d => d.type === "main" ? 1 : 0.7))
        .force("charge", d3.forceManyBody().strength(d => d.group === "central" ? -1200 : d.group === "media" ? -600 : -300))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(d => d.group === "central" ? 45 : d.group === "media" ? 35 : 22));

    /* -------------------------------------------------
       5. LINKS + NODES
       ------------------------------------------------- */
    const link = svg.append("g").attr("class", "links").selectAll("line").data(links).enter().append("line")
        .attr("class", d => d.type === "main" ? "link-arrow" : d.type === "child" ? "child-link" : "cross-link");

    const node = svg.append("g").attr("class", "nodes").selectAll("g").data(nodes).enter().append("g")
        .call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended));

    node.append("circle")
        .attr("r", d => d.group === "central" ? 34 : d.group === "media" ? 27 : 18)
        .attr("fill", d => d.group === "central" ? "#e74c3c" : d.group === "media" ? "#3498db" : "#27ae60")
        .style("cursor", d => d.group === "work" ? "pointer" : "move");

    node.append("text")
        .attr("dy", ".35em").attr("x", d => d.group === "central" ? 0 : d.group === "media" ? 32 : 22)
        .attr("text-anchor", d => d.group === "central" ? "middle" : "start")
        .text(d => d.id)
        .style("font-weight", d => d.group === "central" ? "bold" : "normal")
        .style("font-size", d => d.group === "central" ? "16px" : d.group === "media" ? "14px" : "11px")
        .style("cursor", d => d.group === "work" ? "pointer" : "default")
        .style("pointer-events", d => d.group === "work" ? "all" : "none");

    /* -------------------------------------------------
       6. TOOLTIP
       ------------------------------------------------- */
    const tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);
    node.on("mouseover", (e, d) => {
        tooltip.transition().duration(200).style("opacity", .9);
        tooltip.html(d.id).style("left", (e.pageX + 12) + "px").style("top", (e.pageY - 28) + "px");
    }).on("mouseout", () => tooltip.transition().duration(400).style("opacity", 0));

    /* -------------------------------------------------
       7. FILTER PANEL
       ------------------------------------------------- */
    const categories = ["Photography", "Installation", "Coding", "Video Editing", "Creative Writing", "Socially-Engaged Project"];
    const filterBox = svg.append("g").attr("transform", `translate(${width - 220},${height - 240})`);
    filterBox.append("rect").attr("width", 200).attr("height", 220).attr("rx", 12)
        .attr("fill", "white").attr("stroke", "#ddd").attr("stroke-width", 2)
        .style("box-shadow", "0 4px 12px rgba(0,0,0,0.1)");
    filterBox.append("text").attr("x", 100).attr("y", 28).attr("text-anchor", "middle")
        .style("font-size", "16px").style("font-weight", "bold").style("fill", "#2c3e50")
        .text("Filter by Medium");

    const filterItems = filterBox.selectAll(".filter-item").data(categories).enter().append("g")
        .attr("transform", (d, i) => `translate(20,${50 + i * 28})`).style("cursor", "pointer");
    filterItems.append("rect").attr("width", 160).attr("height", 24).attr("rx", 6)
        .attr("fill", "#f8f9fa").attr("stroke", "#ccc");
    filterItems.append("text").attr("x", 12).attr("y", 16)
        .style("font-size", "13px").style("fill", "#2c3e50").text(d => d);

    let activeFilter = null;
    filterItems.on("click", function (e, category) {
        activeFilter = activeFilter === category ? null : category;
        filterItems.select("rect").attr("fill", "#f8f9fa");
        if (activeFilter) d3.select(this).select("rect").attr("fill", "#e3f2fd");

        node.transition().duration(600).style("opacity", d =>
            !activeFilter || d.id === "Creative Media" || d.id === activeFilter || d.parent === activeFilter ? 1 : 0.1);
        link.transition().duration(600).style("opacity", d => {
            if (!activeFilter) return 1;
            const s = d.source.id || d.source;
            const t = d.target.id || d.target;
            const srcOk = s === "Creative Media" || s === activeFilter || nodes.find(n => n.id === s)?.parent === activeFilter;
            const tgtOk = t === activeFilter || nodes.find(n => n.id === t)?.parent === activeFilter;
            return srcOk && tgtOk ? 1 : 0.1;
        });
    });

    /* -------------------------------------------------
       8. SIDEBAR – Final polished preview (half size, white text, no Bunny preview)
       ------------------------------------------------- */
    const sidebar = d3.select("body").append("div")
        .attr("id", "artwork-sidebar")
        .style("position", "fixed").style("top", 0).style("left", 0)
        .style("width", window.innerWidth / 3 + "px").style("height", "100vh")
        .style("background", "#ffffff").style("box-shadow", "4px 0 20px rgba(0,0,0,0.2)")
        .style("transform", "translateX(-100%)")
        .style("transition", "transform 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)")
        .style("z-index", 2000).style("overflow-y", "auto")
        .style("padding", "60px 40px").style("box-sizing", "border-box")
        .style("font-family", "'Helvetica Neue', Arial, sans-serif").style("color", "#2c3e50");

    sidebar.append("div")
        .style("position", "absolute").style("top", "20px").style("right", "20px")
        .style("font-size", "36px").style("cursor", "pointer").style("color", "#999")
        .html("×")
        .on("click", () => {
            sidebar.style("transform", "translateX(-100%)");
            hidePreview();
        });

    const content = sidebar.append("div");

    // SMALL PREVIEW BOX – 190×107px, white text
    const previewBox = d3.select("body").append("div")
        .attr("id", "link-preview")
        .style("position", "absolute")
        .style("pointer-events", "none")
        .style("opacity", 0)
        .style("transition", "opacity 0.3s ease")
        .style("z-index", 3000)
        .style("background", "white")
        .style("border-radius", "10px")
        .style("box-shadow", "0 12px 35px rgba(0,0,0,0.35)")
        .style("overflow", "hidden")
        .style("width", "190px")
        .style("height", "107px");

    function showPreview(event, url, title) {
        if (!url || url === "#" || title === "Bunny&Carrots Game") return;

        let previewHTML = "";

        if (url.includes("youtu.be") || url.includes("youtube.com")) {
            const videoId = url.match(/(?:youtu\.be\/|youtube\.com.*v=)([^&\n?#]+)/)?.[1] || "";
            previewHTML = `
                <div style="width:190px; height:107px; background:#000; position:relative; overflow:hidden;">
                    <img src="https://img.youtube.com/vi/${videoId}/hqdefault.jpg" 
                         style="width:100%; height:100%; object-fit:cover;">
                    <div style="position:absolute; bottom:0; left:0; right:0; padding:6px 8px; 
                                background:linear-gradient(transparent, rgba(0,0,0,0.8)); 
                                color:white; font-size:11px; line-height:1.3;">
                        <strong>YouTube Video</strong><br>Click to watch
                    </div>
                </div>`;
        }
        else if (url.includes("substack.com")) {
            previewHTML = `
                <div style="width:190px; height:107px; background:#0f0f0f; color:white; 
                            display:flex; align-items:center; justify-content:center; padding:12px; text-align:center; font-size:12px; line-height:1.4;">
                    <div>
                        <div style="font-size:20px; margin-bottom:4px;">Substack</div>
                        <em>“${title}”</em><br>
                        <span style="color:#87cefa;">Tap to read</span>
                    </div>
                </div>`;
        }
        else {
            previewHTML = `
                <div style="width:190px; height:107px; background:#1a1a1a; color:white; 
                            display:flex; align-items:center; justify-content:center; padding:10px; text-align:center; font-size:11px;">
                    <div>
                        <strong>External Link</strong><br>
                        ${title}
                    </div>
                </div>`;
        }

        previewBox.html(previewHTML)
            .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 125) + "px")
            .transition().duration(250)
            .style("opacity", 1);
    }

    function hidePreview() {
        previewBox.transition().duration(300).style("opacity", 0);
    }

    const artworkData = {
        "From One Shore to Another": {
            type: "Video, Photography, Stop Motion Animation",
            theme: "Migration & Social identity",
            link: "https://youtu.be/E_woeWQC-m4",
            page: "https://kayulauren.substack.com/p/from-one-shore-to-another"
        },
        "Bunny&Carrots Game": { type: "Interactive Coding", theme: "Easter, Playfulness", link: "https://youtube.com/shorts/UJzqJmTUd50?feature=share" },
        "The Great Magic Shows": { type: "Films Remix", theme: "Cruel Reality vs Sweet Lies", link: "https://youtu.be/XYVFJBD6lbU" },
        "Accompany": { type: "Production, Video Editing", theme: "Companionship", link: "https://youtu.be/ve37QFmOpJQ" },
        "Gossip Gambler": { type: "Production, Video Editing", theme: "Comedy & Rumor", link: "https://youtu.be/42Fur6VHkXk" },
        "Two Views of Back": { type: "Chinese Creative Writing", theme: "Observation, Association", link: "https://portland-my.sharepoint.com/:w:/g/personal/kylau277-c_my_cityu_edu_hk/EZucVJ48xQlAhenQea-ys6gBqQKpu85knm89OGTpR5linQ?e=Xpb6gK" },
        "The Circle of Life": { type: "Photography", theme: "Ups and Downs in Life" },
        "Letter": { type: "Installation", theme: "Pandemic, Communication" },
        "Glimpse of Anxious Time": { type: "Installation, Photography", theme: "Family of Origin, Attachment Pattern" },
        "Lantau Tomorrow Vision (Peng Chau)": { type: "Exhibition Plan", theme: "Urban Development" },
        "Academic Trauma": { type: "Participatory Project", theme: "Emotions & Education" }
    };

    node.on("click", function (event, d) {
        if (d.group !== "work") return;
        event.stopPropagation();

        const data = artworkData[d.id] || { type: "Artwork", theme: "—" };
        const hasLink = data.link !== undefined;
        const isSpecial = d.id === "From One Shore to Another";

        content.html(`
            <h2 style="margin-top:0; font-size:28px; color:#e74c3c; margin-bottom:20px;">${d.id}</h2>
            <ul style="font-size:18px; line-height:2.2; padding-left:22px; margin:0;">
                <li><strong>Art Type:</strong> ${data.type}</li>
                <li><strong>Theme:</strong> ${data.theme}</li>
                ${hasLink ? `
                    <li><strong>Work Link:</strong> 
                        <a href="${data.link}" target="_blank" class="preview-link">View Project</a>
                    </li>
                ` : ''}
                ${isSpecial ? `
                    <li><strong>Webpage:</strong> 
                        <a href="${data.page}" target="_blank" class="preview-link">Read Full Story</a>
                    </li>
                ` : ''}
            </ul>
        `);

        // Hover magic
        content.selectAll(".preview-link")
            .style("color", "#3498db")
            .style("text-decoration", "none")
            .style("border-bottom", "2px solid transparent")
            .style("padding-bottom", "3px")
            .style("transition", "all 0.25s")
            .on("mouseenter", function (e) {
                const url = this.getAttribute("href");
                const title = d.id;
                d3.select(this).style("border-bottom", "2px solid #3498db");
                showPreview(e, url, title);
            })
            .on("mouseleave", function () {
                d3.select(this).style("border-bottom", "2px solid transparent");
                hidePreview();
            });

        sidebar.style("transform", "translateX(0)");
    });

    d3.select("body").on("click.sidebar", (e) => {
        if (!e.target.closest("#artwork-sidebar") && !e.target.closest(".node")) {
            sidebar.style("transform", "translateX(-100%)");
            hidePreview();
        }
    });

    /* -------------------------------------------------
       9–13. TICK, DRAG, RESIZE, EXPORT
       ------------------------------------------------- */
    simulation.on("tick", () => {
        link.attr("x1", d => d.source.x).attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
        node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(e, d) { if (!e.active) simulation.alphaTarget(.3).restart(); d.fx = d.x; d.fy = d.y; }
    function dragged(e, d) { d.fx = e.x; d.fy = e.y; }
    function dragended(e, d) { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; }

    window.addEventListener('resize', () => {
        const w = window.innerWidth, h = window.innerHeight;
        svg.attr("width", w).attr("height", h);
        simulation.force("center", d3.forceCenter(w / 2, h / 2)).alpha(.3).restart();
        filterBox.attr("transform", `translate(${w - 220},${h - 240})`);
        sidebar.style("width", w / 3 + "px");
    });

    document.getElementById('exportBtn')?.addEventListener('click', () => {
        const svgEl = document.querySelector('#vis-nodelink svg');
        const data = new XMLSerializer().serializeToString(svgEl);
        const blob = new Blob([data], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'kayu-lau-artwork-network.png'; a.click();
        URL.revokeObjectURL(url);
    });

    d3.selectAll(".intro_button")
        .style("transition", "background-color .25s")
        .on("mouseover", function () { d3.select(this).style("background-color", "#e67e68"); })
        .on("mouseout", function () { d3.select(this).style("background-color", "lightsalmon"); });

})();