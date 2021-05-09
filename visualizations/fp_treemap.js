//loads data
let dataTree = d3.csv("./visualizations/data/change/change_v1.csv", function(d, i) {

    let formatHourMinute = d3.timeParse("%Y-%m-%d %H:%M:%S");

    return {
        date: formatHourMinute(d.date),
        symbol: d.symbol,
        volumeAsset: +d.VolumeAsset,
        volumeUSDT: +d.VolumeUSDT,
        tradeCount: +d.tradecount,
        change: +d.change,
        family: d.family
    }
});

function toolColorTree(toolDate, toolSymbol, toolVolumeAsset, toolVolumeUSDT, toolTradeCount, toolChange, toolFamily, period) {
    let color = (toolChange == 0) ? "black" : toolChange < 0 ? "#cf314a" : "#24c076";
    let changePercent = toolChange + '%';

    return "<span class='toolTitle' style='color:#191d20'>" + toolSymbol + '</span><br>' +
        "<span style = 'color:#191d20'>Date: </span> <span style='color:#191d20'>" + toolDate + '</span><br>' +
        "<span style = 'color:" + color + "'>Volume USDT: </span> <span style='color:" +
        color + "'>" + toolVolumeUSDT + '</span><br>' + "<span style = 'color:" + color +
        "'>Volume </span> <span style='color:" + color + "'>" + toolSymbol +": "+  toolVolumeAsset + '</span><br>' +
        "<span style = 'color:" + color + "'>Trade Count: </span> <span style='color:" +
        color + "'>" + toolTradeCount + '</span><br>' + "<span style = 'color:" + color +
        "'>Performance </span> <span style='color:" + color + "'>" + period +": "+  changePercent + '</span><br>' +
        "<span style = 'color:" + color + "'>Hashing Algorithm: </span> <span style='color:" +
        color + "'>" + toolFamily + '</span>';
}

function drawTreemap() {

    dataTree.then(function(data) {

        //data
        let margin = {top: 70, right: 110, bottom: 90, left: 70};
        let width = 1400 - margin.left - margin.right;
        let height = 700 - margin.top - margin.bottom;

        let priceChanges = data.map(d => d.change);
        let groupByFamily = d3.group(data, d => d.family);
        let hierarchy = d3.hierarchy(groupByFamily);
        let period = "1-day"

        let negColorScale = d3.scaleSequential()
            .interpolator(d3.interpolateRgb("#aa2121", "#ed7171"))
            .domain([d3.min(priceChanges), 0]);

        let posColorScale = d3.scaleSequential()
            .interpolator(d3.interpolateRgb("#7ec17f", "#225e2c"))
            .domain([0, d3.max(priceChanges)]);

        //canvas
        let svg = d3.select("#treemapSVG")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .style("background-color", '#191c20')
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + (margin.top) + ")");

        let treemapLayout = d3.treemap()
            .size([1250, 650])
            .paddingOuter(2)
            .tile(d3.treemapBinary);

        hierarchy.sum(function(d) {
            console.log(d.volumeUSDT)
            return d.volumeUSDT;
        });

        treemapLayout(hierarchy);

        let nodes = d3.select("#treemapSVG g")
            .selectAll("g")
            .data(hierarchy.descendants())
            .enter()
            .append("g")
            .attr("date", function(d) {
                let date = new Date(d.data.date);
                let month = date.getMonth();
                month = ("0" + month).slice(-2);
                let day = date.getDate();
                day = ("0" + day).slice(-2);
                return month + "/" + day + "/" + date.getFullYear();
            })
            .attr("symbol", d => d.data.symbol)
            .attr("volumeAsset", d => d.data.volumeAsset)
            .attr("volumeUSDT", d => d.data.volumeUSDT)
            .attr("tradeCount", d => d.data.tradeCount)
            .attr("change", d => d.data.change)
            .attr("family", d => d.data.family)
            .attr("period", period)
            .attr("x", d => d.x0 + 240)
            .attr("y", d => d.y0 + 10)
            .attr('transform', function(d) {return 'translate(' + [d.x0 - 25, d.y0-30] + ')'})
            .on("mouseover", function(d) {

                let xPosition = parseFloat(d3.select(this).attr("x"));
                let yPosition = parseFloat(d3.select(this).attr("y"));
                let toolDate = d3.select(this).attr("date");
                let toolSymbol = d3.select(this).attr("symbol");
                let toolVolumeAsset= d3.select(this).attr("volumeAsset");
                let toolVolumeUSDT = d3.select(this).attr("volumeUSDT");
                let toolTradeCount = d3.select(this).attr("tradeCount");
                let toolChange = d3.select(this).attr("change");
                let toolFamily = d3.select(this).attr("family");

                d3.select("#treeTip")
                    .style("left", xPosition + "px")
                    .style("top", yPosition + "px")
                    .style("visibility", "visible")
                    .select("#value3")
                    .html(toolColorTree(toolDate, toolSymbol, toolVolumeAsset, toolVolumeUSDT, toolTradeCount,
                        toolChange, toolFamily, period));

                if(toolVolumeAsset) {
                    d3.select("#treeTip").classed("hidden", false);
                }
            })
            .on("mouseout", function(d) {

                //Hide the tooltip
                d3.select("#treeTip").classed("hidden", true);

            });

        nodes
            .append('rect')
            .attr('width', function(d) { return d.x1 - d.x0; })
            .attr('height', function(d) { return d.y1 - d.y0; })
            .style('fill',function(d) {
                return d.data.change < 0 ? negColorScale(d.data.change) : posColorScale(d.data.change);
            });

        nodes
            .append('text')
            .attr("class", "tree-symbol")
            .attr('dx', 3)
            .attr('dy', 10)
            .style("text-anchor", "left")
            .style("font-size", "10px")
            .style("font-weight", "bold")
            .text(function(d) {
                return (d.data.symbol);
            })
            .style("opacity", function(d) {
                if ((d.x1 - d.x0) <= 22 || (d.y1 - d.y0) <= 10) {
                    return 0;
                } else {
                    return 1;
                }
            });

        nodes
            .append('text')
            .attr("class", "tree-change")
            .attr('dx', 3)
            .attr('dy', 20)
            .style("text-anchor", "left")
            .style("font-size", "9px")
            .text(function(d) {
                return ((typeof d.data.change !== 'undefined' ? (d.data.change + "%") : ""));
            })
            .style("opacity", function(d) {
                if ((d.x1 - d.x0) <= 25 || (d.y1 - d.y0) <= 22) {
                    return 0;
                } else {
                    return 1;
                }
            });

        nodes
            .append('text')
            .attr("class", "tree-volume")
            .attr('dx', 3)
            .attr('dy', 30)
            .style("text-anchor", "left")
            .style("font-size", "9px")
            .text(function(d) {
                return (d.data.volumeUSDT);
            })
            .style("opacity", function(d) {
                if ((d.x1 - d.x0) <= 55 || (d.y1 - d.y0) <= 32) {
                    return 0;
                } else {
                    return 1;
                }
            });
    })
}

drawTreemap();