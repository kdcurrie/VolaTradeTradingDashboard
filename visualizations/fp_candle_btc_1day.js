
//loads data
let dataCandle = d3.csv("./visualizations/data/project/Binance_BTCUSDT_d_reverse.csv", function(d, i) {

    let formatHourMinute = d3.timeParse("%Y-%m-%d %H:%M:%S");

    return {
        date: formatHourMinute(d.date),
        open: +d.open,
        high: +d.high,
        low: +d.low,
        close: +d.close,
        symbol: d.symbol
    }
});

//function to add trailing zeros
function addZeroes(value) {

    let new_value = value * 1;
    new_value = new_value + '';

    let pos = new_value.indexOf('.');
    if (pos == -1) {
        new_value = new_value + '.00';
    }
    else {
        let integer = new_value.substring(0, pos);
        let decimals = new_value.substring(pos+1);
        while(decimals.length < 2) decimals = decimals + '0';
        new_value =  integer + '.' + decimals;
    }
    return new_value;
}

//tool tip color function
function toolColor(toolDate, toolOpen, toolHigh, toolLow, toolClose) {
    let color = (toolOpen == toolClose) ? "silver" : (toolOpen > toolClose) ? "#cf314a" : "#24c076";

    return "<span style = 'color:#8c9197'>Date: </span> <span style='color:#8c9197'>" + toolDate + '</span>' +
        "<span style = 'color:" + color + "'>&nbsp;&nbsp;&nbsp;&nbsp;Open: </span> <span style='color:" + color + "'>" + toolOpen + '</span>' +
        "<span style = 'color:" + color + "'> High: </span> <span style='color:" + color + "'>" + toolHigh + '</span>' +
        "<span style = 'color:" + color + "'> Low: </span> <span style='color:" + color + "'>" + toolLow + '</span>' +
        "<span style = 'color:" + color + "'> Close: </span> <span style='color:" + color + "'>" + toolClose + '</span>';
}

function formatDateCandle(d, dates, months) {
    d = dates[d]
    let hours = d.getHours()
    hours = ("0" + hours).slice(-2);
    let minutes = d.getMinutes()
    minutes = ("0" + minutes).slice(-2);
    let day = d.getDate()
    day = ("0" + day).slice(-2);
    let month = months[d.getMonth()]
    if (hours == "00" && minutes == "00" && day == "01") {
        return month
    }
    month = d.getMonth() + 1;
    month = ("0" + month).slice(-2);
    day = d.getDate()
    day = ("0" + day).slice(-2);
    return month + '/' + day
}

//main
function drawCandle() {

    //constants
    let margin = {top: 70, right: 100, bottom: 60, left: 70};
    let width = 1200 - margin.left - margin.right;
    let height = 600 - margin.top - margin.bottom;
    let candlePadding = 9.7;
    let titlePaddingX = 10;
    let titlePaddingY = -30;

    let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul","Aug", "Sep", "Oct", "Nov", "Dec"];
    let period = ["1 day"];

    dataCandle.then(function(data) {

        //data
        let dates = data.map(d => d.date);
        let symbol = data[0].symbol;

        let yMin = d3.min(data.map(d => d.low));
        let yMax = d3.max(data.map(d => d.high));

        //scales & axis
        let xScale = d3.scaleLinear()
            .domain([-1, dates.length])
            .range([0, width]);

        let xAxis = d3.axisBottom(xScale)
            .tickFormat(function(d) {
                return formatDateCandle(d, dates, months);
            })
            .tickSizeOuter(0);

        let yScale = d3.scaleLinear()
            .domain([yMin, yMax])
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

        //canvas
        let svg = d3.select("#candleSVG")
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

        //subtitle
        svg.append("text")
            .attr("class", "subtitle")
            .attr("x", titlePaddingX)
            .attr("y", titlePaddingY + 20)
            .style("text-anchor", "left")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .text("Period: " + period);

        //axes
        let gX = svg.append("g")
            .attr("class", "axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        let gY = svg.append("g")
            .attr("class", "axis--y")
            .attr("transform", "translate(" + width + ", 0)")
            .call(yAxis);

        //grid
        let xGrid = svg.append("g")
            .attr("class", "grid")
            .attr("clip-path", "url(#clip)")
            .call(d3.axisBottom(xScale)
                .tickSize(height)
                .tickFormat("")
            )

        let yGrid = svg.append("g")
            .attr("class", "grid")
            .attr("clip-path", "url(#clip)")
            .call(d3.axisRight(yScale)
                .tickSize(width)
                .tickFormat("")
            )

        //chart
        let chart = svg.append("g")
            .attr("class", "chart")
            .attr("clip-path", "url(#clip)");

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

        //candles
        let candles = chart
            .selectAll(".candle")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", (d, i) => xScale(i) - xBand.bandwidth() + candlePadding)
            .attr("class", "candle")
            .attr("y", d => yScale(Math.max(d.open, d.close)))
            .attr("width", xBand.bandwidth())
            .attr("height", d => (d.open === d.close) ? 1 : yScale(Math.min(d.open, d.close)) - yScale(Math.max(d.open, d.close)))
            .style("fill", d => (d.open === d.close) ? "silver" : (d.open > d.close) ? "#cf314a" : "#24c076"); //change to get last color


        //annotations
        let annotations = [
            {
                note: { label: "Bitcoin hit its lowest point during the 2018 crash" },
                data: {close: 3211.72, index:362},
                dy: -30,
                dx: 10
            },
            {
                note: { label: "Ethereum begins its bull run temporarily crashing price of Bitcoin"},
                data: {close: 49066.77, index:1224},
                dy: 300,
                dx: -60
            },
            {
                note: { label: "Bitcoin breaks its previous all time high from before the crash, in less than one month it will hit $40,000" },
                data: {close: 19426.43, index:1094},
                dy: -40,
                dx: -60
            },
            {
                note: { label: "New all time high"},
                data: {close: 62959.53, index:1213},
                dy: 0,
                dx: -80
            },
            {
                note: { label: "Warren Buffett says Bitcoin is \"probably rat poison squared\""},
                data: {close: 9714.00, index:138},
                dy: -30,
                dx: 20
            },
        ];

        let timeFormat = d3.timeFormat("%d-%b-%y")

        let makeAnnotations = d3.annotation()
            .editMode(true)
            //also can set and override in the note.padding property
            //of the annotation object
            .notePadding(15)
            .type(d3.annotationLabel)
            .annotations(annotations)
            .accessors({
                x: d => xScale(d.index) - xBand.bandwidth() + candlePadding,
                y: d => yScale(d.close)
            })
            .accessorsInverse({
                date: d => timeFormat(x.invert(d.x)),
                close: d => y.invert(d.y)
            })
            .annotations(annotations)

        let annotation = svg.append("g")
            .attr("class", "annotation-candle")
            .call(makeAnnotations);

        svg.selectAll("g.annotation-connector, g.annotation-note, g.annotation-subject")
            .classed("hidden", false)


        //hidden candles for mouseover of x-axis
        let hiddenCandles = chart
            .selectAll(".hiddenCandles")
            .data(data)
            .enter()
            .append("rect")
            .attr("date", function(d) {
                let month = d.date.getMonth()+1;
                month = ("0" + month).slice(-2);
                let day = d.date.getDate()
                day = ("0" + day).slice(-2);
                return month + "/" + day + "/" + d.date.getFullYear()
            })
            .attr("open", d => addZeroes(d.open))
            .attr("high", d => addZeroes(d.high))
            .attr("low", d => addZeroes(d.low))
            .attr("close", d => addZeroes(d.close))
            .attr("x", (d, i) => xScale(i) - xBand.bandwidth() + candlePadding)
            .attr("class", "hiddenCandles")
            .attr("y", 0)
            .attr("width", xBand.bandwidth())
            .attr("height", height)
            .style("fill", "black")
            .style("opacity", 0)
            .on("mouseover", function(d) {

                let toolDate = d3.select(this).attr("date");
                let toolOpen= d3.select(this).attr("open");
                let toolHigh = d3.select(this).attr("high");
                let toolLow = d3.select(this).attr("low");
                let toolClose = d3.select(this).attr("close");

                //tooltip
                d3.select("#candleTip")
                    .style("visibility", "visible")
                    .select("#value")
                    .html(toolColor(toolDate, toolOpen, toolHigh, toolLow, toolClose));
                    
                d3.select("#candleTip").classed("hidden", false);
            })

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
                        return formatDateCandle(d, dates, months);
                    })
            )

            candles
                .attr("x", (d, i) => xZ(i) - (xBand.bandwidth()*transform.k)/2)
                .attr("width", xBand.bandwidth()*transform.k);

            stems
                .attr("x1", (d, i) => xZ(i) - xBand.bandwidth()/2 + xBand.bandwidth()*0.5)
                .attr("x2", (d, i) => xZ(i) - xBand.bandwidth()/2 + xBand.bandwidth()*0.5);

            hiddenCandles
                .attr("x", (d, i) => xZ(i) - (xBand.bandwidth()*transform.k)/2)
                .attr("width", xBand.bandwidth()*transform.k);

            svg.selectAll("g.annotation-connector, g.annotation-note, g.annotation-subject")
                .classed("hidden", true)

            xGrid.transition()
                .duration(600)
                .call(d3.axisBottom(xZ)
                    .tickSize(height)
                    .tickFormat(""));
        }

        //end of zoom
        function zoomend(event) {
            let transform = event.transform;
            let xZ = transform.rescaleX(xScale);

            let xMin = new Date(xDateScale(Math.floor(xZ.domain()[0])))
            let xMax = new Date(xDateScale(Math.floor(xZ.domain()[1])))
            let filtered = data.filter(function(d) {
                return ((d.date >= xMin) && (d.date <= xMax))
            });
            let minPrice = d3.min(filtered, d => d.low)
            let maxPrice = d3.max(filtered, d => d.high)
            let buffer = Math.floor((maxPrice - minPrice) * 0.1)

            yScale.domain([minPrice - buffer, maxPrice + buffer])

            candles.transition()
                .duration(600)
                .attr("y", (d) => yScale(Math.max(d.open, d.close)))
                .attr("height",  d => (d.open === d.close) ? 1 : yScale(Math.min(d.open, d.close))-yScale(Math.max(d.open, d.close)));

            stems.transition()
                .duration(600)
                .attr("y1", (d) => yScale(d.high))
                .attr("y2", (d) => yScale(d.low))

            hiddenCandles.transition()
                .duration(600)
                .attr("y", 0)
                .attr("height",  height);

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

drawCandle();