
//loads datas
let dataVolume = d3.csv("./visualizations/data/ethereum/Binance_ETH_d_reverse.csv", function(d, i) {

    let formatHourMinute = d3.timeParse("%Y-%m-%d %H:%M:%S");

    return {
        date: formatHourMinute(d.date),
        volume: +d["Volume USDT"],
        open: +d.open,
        close: +d.close,
        symbol: d.symbol
    }
});


//tool tip color function
function toolColorVolume(toolDate, toolOpen, toolClose, toolVolume) {
    let color = (toolOpen == toolClose) ? "silver" : (toolOpen > toolClose) ? "#cf314a" : "#24c076";

    return "<span style = 'color:#191d20'>Date: </span> <span style='color:#191d20'>" + toolDate + '</span><br>' +
        "<span style = 'color:" + color + "'>&nbsp;&nbsp;&nbsp;&nbsp;Volume: </span> <span style='color:" + color + "'>" + toolVolume + '</span>';
}

//main
function drawVolume() {

    //constants
    let margin = {top: 70, right: 100, bottom: 60, left: 70};
    let width = 1200 - margin.left - margin.right;
    let height = 600 - margin.top - margin.bottom;
    let barPadding = 9.7;
    let titlePaddingX = 10;
    let titlePaddingY = -30;

    let months = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
    let period = ["1 day"];

    dataVolume.then(function(data) {



        //data
        let dates = data.map(d => d.date);
        let symbol = data[0].symbol;

        let yMax = d3.max(data.map(d => d.volume));


        //scales & axis
        let xScale = d3.scaleLinear()
            .domain([-1, dates.length])
            .range([0, width]);

        let xAxis = d3.axisBottom(xScale)
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

        let yScale = d3.scaleLinear()
            .domain([0, yMax])
            .range([height, 0])
            .nice();

        let yAxis = d3.axisRight(yScale)
            .tickSizeOuter(0);

        let xDateScale = d3.scaleQuantize()
            .domain([0, dates.length])
            .range(dates);

        let xBand = d3.scaleBand()
            .domain(d3.range(-1, dates.length))
            .range([0, width])
            .padding(0.3);

        let xHiddenBand = d3.scaleBand()
            .domain(d3.range(-1, dates.length))
            .range([0, width]);

        //canvas
        let svg = d3.select("#volumeSVG")
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
            .text("Volume " + symbol);

        svg.append("text")
            .attr("class", "subtitle")
            .attr("x", titlePaddingX)
            .attr("y", titlePaddingY + 20)
            .style("text-anchor", "left")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .text("Period: " + period);

        let yGrid = svg.append("g")
            .attr("class", "grid")
            .attr("clip-path", "url(#clip)")
            .call(d3.axisRight(yScale)
                .tickSize(width)
                .tickFormat("")
            )

        //axes
        let gX = svg.append("g")
            .attr("class", "axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        let gY = svg.append("g")
            .attr("class", "axis--y")
            .attr("transform", "translate(" + width + ", 0)")
            .call(yAxis);

        //chart
        let chart = svg.append("g")
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
            .style("fill", (d, i) => (d.open === d.close) ? "silver" : (d.open > d.close) ? "#cf314a" : "#24c076") //change to get last color
            // .on("mouseover", function() {
            //         d3.select(this)
            //             .attr("fill", "orange");
            //     });

        //hidden bars for mouseover
        let hiddenBars = chart
            .selectAll(".hiddenBars")
            .data(data)
            .enter()
            .append("rect")
            .attr("date", function(d) {
                month = months[d.date.getMonth()]
                month = ("0" + month).slice(-2);
                day = d.date.getDate();
                day = ("0" + day).slice(-2);
                return month + "/" + day + "/" + d.date.getFullYear();
            })
            .attr("open", d => d.open)
            .attr("close", d => d.close)
            .attr("volume", d => d.volume)
            .attr("x", (d, i) => xScale(i) - xHiddenBand.bandwidth() + barPadding)
            .attr("class", "hiddenBars")
            .attr("id", (d, i) => i)
            .attr("y", d => yScale(d.volume))
            .attr("width", xHiddenBand.bandwidth())
            .attr("height", d => height - yScale(d.volume))
            .attr("fill", "#76169a")
            .style("opacity", 0) //change to get last color
            .on("mouseover", function(d) {

                d3.select(this).style("opacity", 1).attr("fill", "#76169a");

                //Get this bar's x/y values, then augment for the tooltip
                var xPosition = parseFloat(d3.select(this).attr("x")) + xBand.bandwidth() + 150;
                var yPosition = parseFloat(d3.select(this).attr("y")) + 30;
                let toolDate = d3.select(this).attr("date");
                let toolOpen= d3.select(this).attr("open");
                let toolClose = d3.select(this).attr("close");
                let toolVolume= d3.select(this).attr("volume");

                //Update the tooltip position and value
                d3.select("#volumeTip")
                    .style("left", xPosition + "px")
                    .style("top", yPosition + "px")
                    .style("visibility", "visible")
                    .select("#value2")
                    .html(toolColorVolume(toolDate, toolOpen, toolClose, toolVolume));

                //Show the tooltip
                d3.select("#volumeTip").classed("hidden", false);

            })
            .on("mouseout", function(d) {

                //Hide the tooltip
                d3.select("#volumeTip").classed("hidden", true);
                d3.select(this).style("opacity", 0);

            });

        //clip path
        svg.append("defs")
            .append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height)

        //zoom
        let zoom = d3.zoom()
            .scaleExtent([1, 40])
            .extent([[0, 0], [width, height]])
            .translateExtent([[0, 0], [width, height]])
            .on("zoom", zoomed)
            .on("zoom.end", zoomend)

        svg.call(zoom)

        //zoomed
        function zoomed(event) {
            let transform = event.transform;
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

            hiddenBars
                .attr("x", (d, i) => xZ(i) - (xHiddenBand.bandwidth()*transform.k)/2)
                .attr("width", xHiddenBand.bandwidth()*transform.k);
        }

        //end of zoom
        function zoomend(event) {
            let transform = event.transform;
            let xZ = transform.rescaleX(xScale);

            let xMin = new Date(xDateScale(Math.floor(xZ.domain()[0])))
            let xMax = new Date(xDateScale(Math.floor(xZ.domain()[1])))
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

            hiddenBars.transition()
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


drawVolume();