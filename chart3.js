var country = "Worldwide";
var filename = "mortality_by_age_" + country + ".csv";
var svg, width = 700, height = 450, padding = 60;

function init() {
    // Set up the svg
    svg = d3.select("#deaths_by_age")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Load initial data and draw the chart
    updateChart();
}

function SetCountry_age() {
    country = document.getElementById("country_dropdown_age").value;
    console.log("Country: " + country);
    filename = "mortality_by_age_" + country + ".csv";
    updateChart();
}

function updateChart() {
    d3.csv(filename).then(function(data) {
        // Draw the updated chart
        barChart(data);
    });
}

function barChart(data) {
    // Create scales for x and y axes
    var xScale = d3.scaleBand()
        .domain(data.map(function(d) { return d.ages; }))
        .range([padding, width - padding])
        .paddingInner(0.1);

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return +d.Deaths; }) * 1.1])
        .range([height - padding, padding]);

    var colorScale = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return +d.Deaths; })])
        .range(["yellow", "red"]);

    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("padding", "8px")
        .style("background-color", "white")
        .style("border", "1px solid #ccc")
        .style("border-radius", "4px")
        .style("pointer-events", "none");

    // Bind data to rectangles (bars)
    var bars = svg.selectAll("rect")
        .data(data, function(d) { return d.ages; });

    // Remove exiting bars
    bars.exit()
        .transition()
        .duration(1000)
        .attr("y", height - padding)
        .attr("height", 0)
        .style("fill-opacity", 0.1)
        .remove();

    // Update existing bars
    bars.transition()
        .duration(1000)
        .attr("x", function(d) { return xScale(d.ages); })
        .attr("y", function(d) { return yScale(d.Deaths); })
        .attr("width", xScale.bandwidth())
        .attr("height", function(d) { return height - padding - yScale(d.Deaths); })
        .attr("fill", function(d) { return colorScale(d.Deaths); });

    // Enter new bars
    bars.enter().append("rect")
        .attr("x", function(d) { return xScale(d.ages); })
        .attr("y", height - padding)
        .attr("width", xScale.bandwidth())
        .attr("height", 0)
        .attr("fill", function(d) { return colorScale(d.Deaths); })
        .on("mouseover", function(event, d) {
            d3.select(this).attr("fill", "orange");
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html("Age Group: " + d.ages + "<br>Deaths: " + d.Deaths)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            d3.select(this).attr("fill", function(d) { return colorScale(d.Deaths); });
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .transition()
        .duration(1000)
        .attr("y", function(d) { return yScale(d.Deaths); })
        .attr("height", function(d) { return height - padding - yScale(d.Deaths); });

    // Add text labels on top of each bar
    var labels = svg.selectAll("text.label")
        .data(data, function(d) { return d.ages; });

    // Remove exiting labels
    labels.exit()
        .transition()
        .duration(1000)
        .attr("y", height - padding)
        .style("fill-opacity", 0.1)
        .remove();

    // Update existing labels
    labels.transition()
        .duration(1000)
        .attr("x", function(d) { return xScale(d.ages) + xScale.bandwidth() / 2; })
        .attr("y", function(d) { return yScale(d.Deaths) - 5; })
        .text(function(d) { return d.Deaths; });

    // Enter new labels
    labels.enter().append("text")
        .attr("class", "label")
        .attr("x", function(d) { return xScale(d.ages) + xScale.bandwidth() / 2; })
        .attr("y", height - padding)
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .text(function(d) { return d.Deaths; })
        .transition()
        .duration(1000)
        .attr("y", function(d) { return yScale(d.Deaths) - 5; });

    // Create x-axis label
    svg.selectAll("text.x-label").remove();
    svg.append("text")
        .attr("class", "x-label")
        .attr("x", width / 2)
        .attr("y", height - padding / 2)
        .attr("text-anchor", "middle")
        .text("Age Groups");

    // Create y-axis label
    svg.selectAll("text.y-label").remove();
    svg.append("text")
        .attr("class", "y-label")
        .attr("x", height / 6.5)
        .attr("y", padding / 1.75)
        .attr("transform", "rotate(0)")
        .attr("text-anchor", "middle")
        .text("Number of Deaths")
        .attr("fill", "black");

    // Create y-axis
    svg.selectAll("g.y-axis").remove();
    svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", "translate(" + padding + ",0)")
        .call(d3.axisLeft(yScale));

    // Create x-axis
    svg.selectAll("g.x-axis").remove();
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + (height - padding) + ")")
        .call(d3.axisBottom(xScale));
}

window.onload = init;
