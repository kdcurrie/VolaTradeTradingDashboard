//constants
const margin = {top: 70, right: 110, bottom: 90, left: 70};
const width = 1200 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;
const barPadding = 9.7;

const months = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

//loads data
const data = d3.csv("./data/bitcoin/Binance_BTCUSDT_d_reverse_short.csv", function(d, i) {

    var formatHourMinute = d3.timeParse("%Y-%m-%d %H:%M:%S");

    return {
        date: formatHourMinute(d.date),
        volume: +d["Volume BTC"],
        open: +d.open,
        close: +d.close,
        id: i
    }
});



//main
function main() {

    data.then(function(data) {

        //data
        let dates = data.map(d => d.date);
        let x = data.map(d => d.x);
        let y = data.map(d => d.y);
        var xMin = d3.min(data.map(d => d.date.getTime()));
        var xMax = d3.max(data.map(d => d.date.getTime()));
        var yMin = d3.min(data.map(d => d.volume));
        var yMax = d3.max(data.map(d => d.volume));

        console.log(yMin)
        console.log(yMax)


        //scales & axis
        var xScale = d3.scaleLinear()
            .domain([-1, dates.length])
            .range([0, width]);

        var xAxis = d3.axisBottom(xScale)
            .tickFormat(function(d) {
                d = dates[d]
                hours = d.getHours()
                hours = ("0" + hours).slice(-2);
                minutes = d.getMinutes()
                minutes = ("0" + minutes).slice(-2);
                if (hours == "00" && minutes == "00") {
                    month = months[d.getMonth()]
                    month = ("0" + month).slice(-2);
                    day = d.getDate()
                    day = ("0" + day).slice(-2);
                    return month + '/' + day
                }
                return hours + ':' + minutes
            })
            .tickSizeOuter(0);

        var yScale = d3.scaleLinear()
            .domain([0, yMax])
            .range([height, 0])
            .nice();

        var yAxis = d3.axisRight(yScale)
            .tickSizeOuter(0);

        xDateScale = d3.scaleQuantize()
            .domain([0, dates.length])
            .range(dates);

        xBand = d3.scaleBand()
            .domain(d3.range(-1, dates.length))
            .range([0, width])
            .padding(0.3);

        //canvas
        let svg = d3.select("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .style("background-color", '#191c20')
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + (margin.top) + ")");

        //clip path
        svg.append("rect")
            .attr("id","rect")
            .attr("width", width)
            .attr("height", height)
            .style("fill", "none")
            .style("pointer-events", "all")
            .attr("clip-path", "url(#clip)");

        //title
        svg.append("text")
            .attr("class", "title")
            .attr("x", width/2)
            .attr("y", -30)
            .style("text-anchor", "middle")
            .style("font-size", "20px")
            .style("font-weight", "bold")
            .text("Volume Bar Chart (1min)");

        var yGrid = svg.append("g")
            .attr("class", "grid")
            .call(d3.axisRight(yScale)
                .tickSize(width)
                .tickFormat("")
            )

        //axes
        var gX = svg.append("g")
            .attr("class", "axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        var gY = svg.append("g")
            .attr("class", "axis--y")
            .attr("transform", "translate(" + width + ", 0)")
            .call(yAxis);


        //axes labels
        svg.append("text")
            .attr("class", "axis label")
            .attr("transform",
                "translate(" + (width/2 + 20) + " ," +
                (height + margin.top - 10) + ")")
            .style("text-anchor", "middle")
            .text("Time");

        svg.append("text")
            .attr("class", "axis label")
            .attr("transform", "rotate(-90)")
            .attr("y", width + 70)
            .attr("x", 0 - ((height / 2)))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Volume (BTC)");

        //chart
        var chart = svg.append("g")
            .attr("class", "chart")
            .attr("clip-path", "url(#clip)");

        //bars
        let bars = chart
            .selectAll(".bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", (d, i) => xScale(i) - xBand.bandwidth() + barPadding)
            .attr("class", "bar")
            .attr("id", (d, i) => i)
            .attr("y", d => yScale(d.volume))
            .attr("width", xBand.bandwidth())
            .attr("height", d => height - yScale(d.volume))
            .style("fill", (d, i) => (d.open === d.close) ? "silver" : (d.open > d.close) ? "red" : "green"); //change to get last color


        //clip path
        svg.append("defs")
            .append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height)

        //zoom
        var zoom = d3.zoom()
            .scaleExtent([1, 40])
            .extent([[0, 0], [width, height]])
            .translateExtent([[0, 0], [width, height]])
            .on("zoom", zoomed)
            .on("zoom.end", zoomend)

        svg.call(zoom)

        //zoomed
        function zoomed(event) {
            var transform = event.transform;
            let xZ = transform.rescaleX(xScale);

            gX.call(
                d3.axisBottom(xZ)
                    .tickSizeOuter(0)
                    .tickFormat((d) => {
                        if (d >= 0 && d <= dates.length-1) {
                            d = dates[d]
                            hours = d.getHours()
                            hours = ("0" + hours).slice(-2);
                            minutes = d.getMinutes()
                            minutes = ("0" + minutes).slice(-2);
                            if (hours == "00" && minutes == "00") {
                                month = months[d.getMonth()]
                                month = ("0" + month).slice(-2);
                                day = d.getDate()
                                day = ("0" + day).slice(-2);
                                return month + '/' + day
                            }
                            return hours + ':' + minutes
                        }
                    })
            )

            bars
                .attr("x", (d, i) => xZ(i) - (xBand.bandwidth()*transform.k)/2)
                .attr("width", xBand.bandwidth()*transform.k);
        }

        //end of zoom
        function zoomend(event) {
            var transform = event.transform;
            let xZ = transform.rescaleX(xScale);

            var xMin = new Date(xDateScale(Math.floor(xZ.domain()[0])))
            var xMax = new Date(xDateScale(Math.floor(xZ.domain()[1])))
            filtered = data.filter(function(d) {
                return ((d.date >= xMin) && (d.date <= xMax))
            });
            minVolume = d3.min(filtered, d => d.volume)
            maxVolume = d3.max(filtered, d => d.volume)
            buffer = Math.floor((maxVolume - minVolume) * 0.02)

            yScale.domain([0, maxVolume + buffer])
            bars.transition()
                .duration(600)
                .attr("y", (d) => yScale(d.volume))
                .attr("height", d => height - yScale(d.volume))

            gY.transition()
                .duration(600)
                .call(d3.axisRight(yScale)
                    .tickSizeOuter(0));

            yGrid.transition()
                .duration(600)
                .call(d3.axisRight(yScale)
                    .tickSize(width)
                    .tickFormat(""));
        }
    })
}


main();