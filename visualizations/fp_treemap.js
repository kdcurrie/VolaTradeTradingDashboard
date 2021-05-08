//loads data
let dataTree = d3.csv("./visualizations/data/change/change_v1.csv", function(d, i) {

    let formatHourMinute = d3.timeParse("%Y-%m-%d %H:%M:%S");

    return {
        date: formatHourMinute(d.date),
        symbol: d.symbol,
        VolumeAsset: +d.VolumeAsset,
        VolumeUSDT: +d.VolumeUSDT,
        tradeCount: +d.tradecount,
        change: +d.change,
        family: d.family
    }
});

function drawTreemap() {

    dataTree.then(function(data) {

        //data
        let margin = {top: 70, right: 110, bottom: 90, left: 70};
        let width = 1200 - margin.left - margin.right;
        let height = 600 - margin.top - margin.bottom;

        groupByFamily = d3.group(data, d => d.family)
        let hierarchy = d3.hierarchy(groupByFamily)
        console.log(hierarchy.data)
        console.log(hierarchy.height)

        //data
        let priceChanges = data.map(d => d.change);
        console.log("max: " + d3.max(priceChanges))
        console.log("min: " + d3.min(priceChanges))

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
            .size([1100, 515])
            .paddingOuter(2)
            // .paddingTop(4)
            .tile(d3.treemapBinary);

        hierarchy.sum(function(d) {
            console.log(d.VolumeUSDT)
            return d.VolumeUSDT;
        });

        treemapLayout(hierarchy);

        let nodes = d3.select("#treemapSVG g")
            .selectAll("g")
            .data(hierarchy.descendants())
            .enter()
            .append("g")
            .attr('transform', function(d) {return 'translate(' + [d.x0 - 25, d.y0-30] + ')'});

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
                    let box = this.getBBox();
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
                let box = this.getBBox();
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
                return (d.data.VolumeUSDT);
            })
            .style("opacity", function(d) {
                let box = this.getBBox();
                if ((d.x1 - d.x0) <= 55 || (d.y1 - d.y0) <= 32) {
                    return 0;
                } else {
                    return 1;
                }
            });
    })
}

drawTreemap();