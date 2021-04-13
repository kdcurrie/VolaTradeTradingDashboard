//constants
const margin = {top: 80, right: 270, bottom: 80, left: 70};
const width = 1170 - margin.left - margin.right;
const height = 1000 - margin.top - margin.bottom;

//loads data
const data = d3.csv("./data/airlines.csv", function(d) {
    if (d.airportcode == "ATL" || d.airportcode == "LAX" || d.airportcode == "JFK") {
        return {
            x: d3.timeParse("%Y/%m")(d.timelabel),
            y: +d.cancelled,
            code: d.airportcode,
        }
    }
})

//main
function main() {

    data.then(function(data) {

        //data
        let x = data.map(d => d.x);
        let y = data.map(d => d.y);
        let codes = ["ATL", "LAX", "JFK"];
        // let y1 = data.filter(function (d) {
        //     return d.code === "ATL";}).map(d => d.y);
        // let y2 = data.filter(function (d) {
        //     return d.code === "LAX";}).map(d => d.y);
        // let y3 = data.filter(function (d) {
        //     return d.code === "JFK";}).map(d => d.y);

        console.log(x);
        // console.log(y1);
        // console.log(y2);
        // console.log(y3);

        //scales
        let xScale = d3.scaleTime()
            .domain(d3.extent(data, function(d) {
                return d.x;
            }))
            .range([0, width]);

        let xAxis = d3.axisBottom(xScale)
            .tickSizeOuter(0);

        let yScale = d3.scaleLinear()
            .domain([0, d3.max(y)])
            .range([height, 0]);

        console.log(d3.max(y))

        let yAxis = d3.axisLeft(yScale)
            .tickSizeOuter(0);

        let colorScale = d3.scaleOrdinal()
            .domain(codes)
            .range([`#bf212f`,`#f9a63e`,`#264b96`]);

        //canvas
        let svg = d3.select("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .style("background-color", '#eaf3f1')
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + (margin.top) + ")");

        //title
        svg.append("text")
            .attr("x", width/2)
            .attr("y", -40)
            .style("text-anchor", "middle")
            .style("font-size", "20px")
            .style("font-weight", "bold")
            .text("Atlanta Airport Cancelled Flights 2003 to 2016");

        //axes
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .call(yAxis);

        //grid
        // svg.append("g")
        //     .attr("class", "grid")
        //     .call(d3.axisBottom(xScale)
        //         .tickSize(height)
        //         .tickFormat("")
        //     )

        //axes labels
        svg.append("text")
            .attr("transform",
                "translate(" + (width/2 - 10) + " ," +
                (height + margin.top - 20) + ")")
            .style("text-anchor", "middle")
            .text("Month");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left + 10)
            .attr("x", 0 - ((height / 2) + 10))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("# of Cancelled Flights");


        // var line = d3.line()
        //      // set the x values for the line generator
        //     .y(function(d) { return yScale(d.y); })
        //     .curve(d3.curveMonotoneX);

        //var dataset = d3.range(152).map(function(d) { return {"y": d.y } })
        //line
        svg.append("path")
            .datum(d3.group(data, d => d.code))
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke", function(d){ return colorScale(d.code) })
            .attr("class", "line")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(function(d) { return xScale(d.x); })
                .y(function(d) { return yScale(d.y); })
            )
    })
}

main();