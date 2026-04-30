let data;

const setupSingleDisc = (paper, i) => {
    const discSVGId = `disc-${i}`;
    const containerWidth = document.getElementById(discSVGId).clientWidth;
    const containerHeight = document.getElementById(discSVGId).clientHeight;

    const margin = {
        top: 0 * containerHeight,
        right: 0 * containerWidth,
        bottom: 0 * containerHeight,
        left: 0 * containerWidth
    };

    const width = containerWidth - (margin.right + margin.left);
    const height = containerHeight - (margin.top + margin.bottom);

    const svg = d3.select(`#${discSVGId}`);
    const chartArea = svg.append('g');

    const colourMap = {
        no: "#874000",
        yes: "#E5446D",
        maybe: "#004F2D"
    };

    const band = containerWidth / 9;
    const reviews = [];
    let ringOffset = 0;
    paper.submissions.forEach(s => {
        s.forEach(r => {
            r.offset = ringOffset;
            reviews.push(r);
            ringOffset += band;
        });
        ringOffset += 2 * band;
    });

    chartArea.attr('transform', `translate(${margin.left + (width - ringOffset) / 2},${margin.top})`);

    const radiusScale = d3.scaleLinear().domain([1, 5]).range([width / 35, width / 7]);
    chartArea.selectAll(".ring")
        .data(reviews)
        .join("path")
        .attr("stroke", d => colourMap[d.result])
        .attr("stroke-width", width / 100)
        .attr("fill", "none")
        .attr("d", d => {
            const angleScale = d3.scaleLinear().domain([0, d.reviews.length]).range([0, 2 * Math.PI]);
            return d3.line()
                .x((d, i) => radiusScale(d) * Math.cos(angleScale(i)))
                .y((d, i) => radiusScale(d) * Math.sin(angleScale(i)))
                .curve(d3.curveCardinalClosed)
                (d.reviews);
        })
        .attr("transform", d => `translate(${d.offset + width / 7}, ${height / 2})`);
};

const renderVisualization = () => {
    const container = d3.select("#visualization-container");
    const discs = container.selectAll(".disc")
        .data(data)
        .join("div")
        .attr("class", "disc")
        .style("text-align", "center");

    discs.selectAll(".disc-title")
        .data(d => [d])
        .join("p")
        .attr("class", "disc-title")
        .text(d => d.title);

    discs.selectAll(".disc-date")
        .data(d => [d].filter(d => d.date !== ""))
        .join("i")
        .attr("class", "disc-date")
        .text(d => `Published on ${d.date}`);

    discs.selectAll("br.one")
        .data(d => [d].filter(d => d.date !== ""))
        .join("br")
        .attr("class", "one");

    discs.selectAll(".disc-url")
        .data(d => [d].filter(d => d.url !== ""))
        .join("a")
        .attr("class", "disc-url")
        .attr("href", d => d.url)
        .text(d => d.url);

    discs.selectAll("br.two")
        .data(d => [d].filter(d => d.url !== ""))
        .join("br")
        .attr("class", "two");

    discs.selectAll(".disc-svg")
        .data(d => [d])
        .join("svg")
        .attr("class", "disc-svg")
        .attr("id", d => `disc-${d.index}`);

    data.forEach(setupSingleDisc);
};

const resizeAndRender = () => {
    d3.selectAll("#visualization-container > *").remove();

    renderVisualization();
};

window.onresize = resizeAndRender;

Promise.all([d3.json('data/data.json')]).then(([_data]) => {
    data = _data;

    data.forEach((d, i) => d.index = i);

    resizeAndRender();
});