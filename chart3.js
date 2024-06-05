function init() {
    var w = 700;
    var h = 450;
    var padding = 60;

    // Load data from CSV file using D3
    d3.csv("morality_by_age.csv").then(function(data) {
        // Log the loaded data to the console
        console.log(data);
        var deathData = data;

        // Call the barChart function with loaded data
        barChart(deathData);
    });

    // Function to create a bar chart
    function barChart(data) {
        // Create scales for x and y axes
        var xScale = d3.scaleBand()
            .domain(data.map(function(d) { return d.ages; }))
            .range([padding, w - padding]) // Adjusted range to accommodate padding
            .paddingInner(0.1);

        var yScale = d3.scaleLinear()
            .domain([0, d3.max(data, function(d) { return +d.Deaths; }) * 1.1])
            .range([h - padding, padding]);

        // Create a color scale for the bars
        var colorScale = d3.scaleLinear()
            .domain([0, d3.max(data, function(d) { return +d.Deaths; })])
            .range(["yellow", "red"]);

        // Select the chart container and append an SVG element
        var svg = d3.select("#deaths_by_age")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

        // Create rectangles for each data point
        svg.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", function(d) { return xScale(d.ages); })
            .attr("y", h - padding) // Initial y position at the bottom of the chart
            .attr("width", xScale.bandwidth())
            .attr("height", 0) // Initial height is 0
            .attr("fill", function(d) { return colorScale(d.Deaths); })
            .transition() // Start transition
            .duration(1000) // Duration of the transition
            .attr("y", function(d) { return yScale(d.Deaths); })
            .attr("height", function(d) { return h - padding - yScale(d.Deaths); });

        // Add text labels on top of each bar
        svg.selectAll("text")
            .data(data)
            .enter()
            .append("text")
            .text(function(d) { return d.Deaths; })
            .attr("x", function(d) { return xScale(d.ages) + xScale.bandwidth() / 2; })
            .attr("y", h - padding - 5) // Initial y position at the bottom of the chart
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("fill", "black")
            .attr("text-anchor", "middle")
            .transition() // Start transition
            .duration(1000) // Duration of the transition
            .attr("y", function(d) { return yScale(d.Deaths) - 5; });

        // Create y-axis label
        svg.append("text")
            .attr("x", w / 2)
            .attr("y", h - padding / 2)
            .attr("text-anchor", "middle")
            .text("Age Groups");

        // Create x-axis label
        svg.append("text")
            .attr("x", padding / 7)
            .attr("y", h - padding * 7)
            .text("Number of Deaths")
            .attr("fill", "black");

        // Create y-axis
        svg.append("g")
            .attr("transform", "translate(" + padding + ",0)")
            .call(d3.axisLeft(yScale));

        // Create x-axis
        svg.append("g")
            .attr("transform", "translate(0," + (h - padding) + ")")
            .call(d3.axisBottom(xScale));
    }
}

window.onload = init;
