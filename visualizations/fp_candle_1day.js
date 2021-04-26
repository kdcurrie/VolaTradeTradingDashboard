//constants
const margin = {top: 70, right: 100, bottom: 60, left: 70};
const width = 1200 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;
const candlePadding = 9.7;
const titlePaddingX = 10;
const titlePaddingY = -30;

const months = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul","Aug", "Sep", "Oct", "Nov", "Dec"];
const period = ["1 day"];

//loads data
const data = d3.csv("./data/bitcoin/Binance_BTCUSDT_d_reverse.csv", function(d, i) {

    var formatHourMinute = d3.timeParse("%Y-%m-%d %H:%M:%S");

    return {
        date: formatHourMinute(d.date),
        open: +d.open,
        high: +d.high,
        low: +d.low,
        close: +d.close,
        id: i,
        symbol: d.symbol
    }
});



//main
function main() {

    data.then(function(data) {

        //data
        let dates = data.map(d => d.date);
        const symbol = data[0].symbol;

        var yMin = d3.min(data.map(d => d.low));
        var yMax = d3.max(data.map(d => d.high));

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
                day = d.getDate()
                day = ("0" + day).slice(-2);
                if (hours == "00" && minutes == "00" && day == "01") {
                    month = monthNames[d.getMonth()]
                    return month
                }
                month = months[d.getMonth()]
                month = ("0" + month).slice(-2);
                day = d.getDate()
                day = ("0" + day).slice(-2);
                return month + '/' + day
            })
            .tickSizeOuter(0);

        var yScale = d3.scaleLinear()
            .domain([yMin, yMax])
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
            .attr("x", titlePaddingX)
            .attr("y", titlePaddingY)
            .style("text-anchor", "left")
            .style("font-size", "20px")
            .style("font-weight", "bold")
            .text("Candlestick " + symbol);

        svg.append("text")
            .attr("class", "subtitle")
            .attr("x", titlePaddingX)
            .attr("y", titlePaddingY + 20)
            .style("text-anchor", "left")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .text("Period: " + period);

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
        // svg.append("text")
        //     .attr("class", "axis label")
        //     .attr("transform",
        //         "translate(" + (-40) + " ," +
        //         (height + margin.bottom - 85) + ")")
        //     .style("text-anchor", "middle")
        //     .text("Date");
        //
        // svg.append("text")
        //     .attr("class", "axis label")
        //     .attr("transform", "rotate(-90)")
        //     .attr("y", width + 70)
        //     .attr("x", 0 - ((height / 2)))
        //     .attr("dy", "1em")
        //     .style("text-anchor", "middle")
        //     .text("Price");

        //grid
        var xGrid = svg.append("g")
            .attr("class", "grid")
            .attr("clip-path", "url(#clip)")
            .call(d3.axisBottom(xScale)
                .tickSize(height)
                .tickFormat("")
            )

        var yGrid = svg.append("g")
            .attr("class", "grid")
            .attr("clip-path", "url(#clip)")
            .call(d3.axisRight(yScale)
                .tickSize(width)
                .tickFormat("")
            )

        //chart
        var chart = svg.append("g")
            .attr("class", "chart")
            .attr("clip-path", "url(#clip)");

        //candles
        let candles = chart
            .selectAll(".candle")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", (d, i) => xScale(i) - xBand.bandwidth() + candlePadding)
            .attr("class", "candle")
            .attr("id", (d, i) => i)
            .attr("y", d => yScale(Math.max(d.open, d.close)))
            .attr("width", xBand.bandwidth())
            .attr("height", d => (d.open === d.close) ? 1 : yScale(Math.min(d.open, d.close)) - yScale(Math.max(d.open, d.close)))
            .style("fill", (d, i) => (d.open === d.close) ? "silver" : (d.open > d.close) ? "#cf314a" : "#24c076"); //change to get last color

        //stems
        let stems = chart
            .selectAll(".stem")
            .data(data)
            .enter()
            .append("line")
            .attr("class", "stem")
            .attr("x1", (d, i) => xScale(i) - xBand.bandwidth()/2 + candlePadding)
            .attr("x2", (d, i) => xScale(i) - xBand.bandwidth()/2 + candlePadding)
            .attr("y1", d => yScale(d.high))
            .attr("y2", d => yScale(d.low))
            .attr("stroke", d => (d.open === d.close) ? "silver" : (d.open > d.close) ? "#cf314a" : "#24c076");

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
                        day = d.getDate()
                        day = ("0" + day).slice(-2);
                        if (hours == "00" && minutes == "00" && day == "01") {
                            month = monthNames[d.getMonth()]
                            return month
                        }
                        month = months[d.getMonth()]
                        month = ("0" + month).slice(-2);
                        day = d.getDate()
                        day = ("0" + day).slice(-2);
                        return month + '/' + day
                    }
                })
            )

            candles
                .attr("x", (d, i) => xZ(i) - (xBand.bandwidth()*transform.k)/2)
                .attr("width", xBand.bandwidth()*transform.k);

            stems
                .attr("x1", (d, i) => xZ(i) - xBand.bandwidth()/2 + xBand.bandwidth()*0.5)
                .attr("x2", (d, i) => xZ(i) - xBand.bandwidth()/2 + xBand.bandwidth()*0.5);

            xGrid.transition()
                .duration(600)
                .call(d3.axisBottom(xZ)
                    .tickSize(height)
                    .tickFormat(""));
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
            minPrice = d3.min(filtered, d => d.low)
            maxPrice = d3.max(filtered, d => d.high)
            buffer = Math.floor((maxPrice - minPrice) * 0.1)

            yScale.domain([minPrice - buffer, maxPrice + buffer])
            candles.transition()
                .duration(600)
                .attr("y", (d) => yScale(Math.max(d.open, d.close)))
                .attr("height",  d => (d.open === d.close) ? 1 : yScale(Math.min(d.open, d.close))-yScale(Math.max(d.open, d.close)));

            stems.transition()
                .duration(600)
                .attr("y1", (d) => yScale(d.high))
                .attr("y2", (d) => yScale(d.low))

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