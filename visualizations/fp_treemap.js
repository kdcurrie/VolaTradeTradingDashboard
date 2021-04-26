//constants
const margin = {top: 70, right: 110, bottom: 90, left: 70};
const width = 1600 - margin.left - margin.right;
const height = 1200 - margin.top - margin.bottom;

const months = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

const x = d3.scaleLinear().rangeRound([0, width]);
const y = d3.scaleLinear().rangeRound([0, height]);

//loads data
const data = d3.csv("./data/change/change_v1.csv", function(d, i) {

    var formatHourMinute = d3.timeParse("%Y-%m-%d %H:%M:%S");

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

//main
function main() {

    data.then(function(data) {

        //console.log(data);

        groupByFamily = d3.group(data, d => d.family)
        var hierarchy = d3.hierarchy(groupByFamily)
        console.log(hierarchy.data)
        console.log(hierarchy.height)
       //console.log(groupByFamily)

        //data
        let priceChanges = data.map(d => d.change);
        console.log("max: " + d3.max(priceChanges))
        console.log("min: " + d3.min(priceChanges))

        //
        // var xMin = d3.min(data.map(d => d.date.getTime()));
        // var xMax = d3.max(data.map(d => d.date.getTime()));
        // var yMin = d3.min(data.map(d => d.low));
        // var yMax = d3.max(data.map(d => d.high));
        //
        //
        // console.log(dates)
        // console.log(xMin)
        // console.log(xMax)
        // console.log(yMin)
        // console.log(yMax)
        //
        // //scales
        //
        // var
        // var xScale = d3.scaleLinear()
        //     .domain([-1, dates.length])
        //     .range([0, width]);
        //
        // var xAxis = d3.axisBottom(xScale)
        //     .tickFormat(function(d) {
        //         d = dates[d]
        //         hours = d.getHours()
        //         hours = ("0" + hours).slice(-2);
        //         minutes = d.getMinutes()
        //         minutes = ("0" + minutes).slice(-2);
        //         if (hours == "00" && minutes == "00") {
        //             month = months[d.getMonth()]
        //             month = ("0" + month).slice(-2);
        //             day = d.getDate()
        //             day = ("0" + day).slice(-2);
        //             console.log(d)
        //             return month + '/' + day
        //         }
        //         return hours + ':' + minutes
        //     })
        //     .tickSizeOuter(0);
        //
        // var yScale = d3.scaleLinear()
        //     .domain([yMin, yMax])
        //     .range([height, 0])
        //     .nice();
        //
        // var yAxis = d3.axisRight(yScale)
        //     .tickSizeOuter(0);
        //
        // xDateScale = d3.scaleQuantize()
        //     .domain([0, dates.length])
        //     .range(dates);
        //
        // xBand = d3.scaleBand()
        //     .domain(d3.range(-1, dates.length))
        //     .range([0, width])
        //     .padding(0.3);

        let negColorScale = d3.scaleSequential()
            .interpolator(d3.interpolateRgb("#aa2121", "#ed7171"))
            .domain([d3.min(priceChanges), 0]);

        let posColorScale = d3.scaleSequential()
            .interpolator(d3.interpolateRgb("#7ec17f", "#225e2c"))
            .domain([0, d3.max(priceChanges)]);

        //canvas
        let svg = d3.select("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            // .style("background-color", '#191c20')
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + (margin.top) + ")");

        var treemapLayout = d3.treemap()
            .size([1000, 700])
            // .paddingOuter(2)
            // .paddingTop(4)
            .tile(d3.treemapBinary);

        hierarchy.sum(function(d) {
            console.log(d.VolumeUSDT)
            return d.VolumeUSDT;
        });

        treemapLayout(hierarchy);

        var nodes = svg
            .selectAll("g")
            .data(hierarchy.descendants())
            .enter()
            .append("g")
            .attr('transform', function(d) {return 'translate(' + [d.x0, d.y0] + ')'});

            nodes
                .append('rect')
                .attr('width', function(d) { return d.x1 - d.x0; })
                .attr('height', function(d) { return d.y1 - d.y0; })
                .style('fill',function(d) {
                    return d.data.change < 0 ? negColorScale(d.data.change) : posColorScale(d.data.change);
                });

            nodes
                .append('text')
                .attr('dx', 4)
                .attr('dy', 14)
                .text(function(d) {
                    return d.data.symbol;
                })
                .style("opacity", function(d) {
                    if ((d.x1 - d.x0) <= 22 || (d.y1 - d.y0) <= 10) {
                        return 0;
                    } else {
                        return 1;
                    }
                });
    })
}

main();