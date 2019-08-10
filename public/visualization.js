// define constants
const w = 600;
const h = 400;
const padding = 90;
const api = "/exercise-logs";
const plotButton = document.querySelector("#plot-button");
const svg = d3.select("#svg-area").append("svg").attr("width", w).attr("height", h).call(responsivefy);


// get data
let fullData;
document.addEventListener("DOMContentLoaded", (event) => {
    fetch(api).then((response) => response.json())
        .then((data) => fullData = data).catch(err => console.log("Cannot read data"));
});

// plot the visualization when the user clicks the plotButton    
plotButton.addEventListener("click", () => plot(fullData));
const plot = (fullData) => {
    if (fullData.length == 0) return;

    // clear the previous plot
    d3.selectAll("svg > *").remove();
    let attribute = document.querySelector("#plot-attributes").value;

    // reverse and store the data in an array corresponding to the attribute
    let dataset = [];
    for (let i = fullData.length - 1; i >= 0; --i) {
        dataset.push(Number(fullData[i][attribute]));
    }

    // define scales
    const xScale = d3.scaleLinear().domain([1, dataset.length]).range([padding, w - padding]);
    const yScale = d3.scaleLinear().domain([0, d3.max(dataset)]).range([h - padding, padding]);

    // define axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // create line
    const line = d3.line()
        .x((d, i) => xScale(i + 1))
        .y((d) => yScale(d));

    // append the line
    svg.append("path")
        .datum(dataset)
        .attr("fill", "none")
        .attr("stroke", "navy")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 3)
        .attr("d", line);

    // append the axes
    svg.append("g")
        .attr("transform", "translate(0," + (h - padding) + ")")
        .call(xAxis);

    svg.append("g")
        .attr("transform", "translate(" + padding + ",0)")
        .call(yAxis);

}

// function to make the svg responsive
function responsivefy(svg) {
    // get container + svg aspect ratio
    let container = d3.select(svg.node().parentNode),
        width = parseInt(svg.style("width")),
        height = parseInt(svg.style("height")),
        aspect = width / height;

    // add viewBox and preserveAspectRatio properties,
    // and call resize so that svg resizes on inital page load
    svg.attr("viewBox", "0 0 " + width + " " + height)
        .attr("perserveAspectRatio", "xMinYMid")
        .call(resize);

    // to register multiple listeners for same event type, 
    // you need to add namespace, i.e., 'click.foo'
    // necessary if you call invoke this function for multiple svgs
    // api docs: https://github.com/mbostock/d3/wiki/Selections#on
    d3.select(window).on("resize." + container.attr("id"), resize);

    // get width of container and resize svg to fit it
    function resize() {
        var targetWidth = parseInt(container.style("width"));
        svg.attr("width", targetWidth);
        svg.attr("height", Math.round(targetWidth / aspect));
    }
};

