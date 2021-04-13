//constants
const margin = {top: 80, right: 270, bottom: 80, left: 70};
const width = 1170 - margin.left - margin.right;
const height = 1000 - margin.top - margin.bottom;

//loads data
const data = d3.csv("./data/earthquakes.csv", function(d) {
    if ((d.location == "California" || d.location == "Alaska" || d.location == "Nevada" || d.location == "Washington")) {
        return {
            x: +d.depth,
            y: +d.magnitude,
            r: +d.significance,
            location: [d.location]
        }
    }
})

//main
function main() {

    data.then(function(data) {

        //data
        let x = data.map(d => d.x);
        let y = data.map(d => d.y);
        let r = data.map(d => d.r);
        let locations = ["Washington", "Nevada", "California", "Alaska"];
        let sizes = [5, 25, 125];

        //scales
        let xScale = d3.scaleLinear()
            .domain([0, d3.max(x) + 50])
            .range([0, width]);

        let xAxis = d3.axisBottom(xScale)
            .tickSizeOuter(0);

        let yScale = d3.scaleLinear()
            .domain([0, d3.max(y) + 0.16])
            .range([height, 0]);

        let yAxis = d3.axisLeft(yScale)
            .tickSizeOuter(0);

        let rScale = d3.scaleLinear()
            .domain([0, d3.max(r)])
            .range([3, 30]);

        let colorScale = d3.scaleOrdinal()
            .domain(locations)
            .range([`#116f3c`,`#bf212f`,`#f9a63e`,`#264b96`]);

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
            .text("Earthquake Depth v. Magnitude");

        //axes
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .call(yAxis);

        //grid
        svg.append("g")
            .attr("class", "grid")
            .call(d3.axisBottom(xScale)
                .tickSize(height)
                .tickFormat("")
            )

        //axes labels
        svg.append("text")
            .attr("transform",
                "translate(" + (width/2 - 10) + " ," +
                (height + margin.top - 20) + ")")
            .style("text-anchor", "middle")
            .text("Magnitude");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left + 10)
            .attr("x", 0 - ((height / 2) + 10))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Depth (km)");

        //bubbles
        svg.append("g")
            .selectAll("bubble")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", d => xScale(d.x) + 50)
            .attr("cy", d => yScale(d.y))
            .attr("r", d => rScale(d.r))
            .style("fill", d => colorScale(d.location))
            .style("opacity", "0.6")
            .attr("stroke", "black");

        //legends
        svg.selectAll("colorlegend")
            .data(locations)
            .enter()
            .append("circle")
            .attr("cx", 900)
            .attr("cy", (d, i) => 60 + i*25)
            .attr("r", 7)
            .style("fill", d => colorScale(d));

        svg.selectAll("colorlabels")
            .data(locations)
            .enter()
            .append("text")
            .attr("x", 920)
            .attr("y", (d,i) => 60 + i*25)
            .text(d => d)
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle");

        svg.selectAll("sizelegend")
            .data(sizes)
            .enter()
            .append("circle")
            .attr("cx", 900)
            .attr("cy", (d, i) => 180 + (i ** 1.4) * 20)
            .attr("r", d => rScale(d));

        svg.selectAll("sizelabels")
            .data(sizes)
            .enter()
            .append("text")
            .attr("x", 925)
            .attr("y", (d,i) => 180 + (i ** 1.2) * 25)
            .text(d => "Significance: " + d)
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle");
    })
}

main();