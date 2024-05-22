// Country the chart will show
var country = "australia";
// Year the chart will show
var year = "2020";

var filename = "./datasets/" + country + "_" + year + ".csv"

var dataset, width, height, padding, svg, xScale, yScale, xAxis, yAxis, line, area;

// Called when country dropdown is selected, changes charts country.
function SetCountry() {
    country = document.getElementById("country_dropdown").value;

    // TODO: call function showChasrt(country)
    console.log("Country: " + country + ", Year: " + year);
    filename = "datasets/" + country + "_" + year + ".csv"
    // console.log(filename);
    updateChart()
}

// Called when year dropdown is selected, changes charts year.
function SetYear() {
    year = document.getElementById("year_dropdown").value;

    // TODO: call function showChart(country)
    console.log("Country: " + country + ", Year: " + year);
    filename = "datasets/" + country + "_" + year + ".csv"
    // console.log(filename);
    updateChart()
}

function updateChart() {
    // Clear the data
    dataset = []

    svg.selectAll("path")
        .data(dataset)
        .exit()
        .remove();
    
    // Clear the axis
    svg.selectAll("g.x.axis").remove();
    svg.selectAll("g.y.axis").remove();

    // Clear the labels
    svg.selectAll("text.x.axis.label").remove();
    svg.selectAll("text.y.axis.label").remove();
    
    DrawChart();
}

function DrawChart(){
    // Get data from file
    d3.csv(filename, function (d) {
        return {
            week: +d.Week,
            deaths: +d.Deaths
        };
        }).then(function (data) {
            dataset = data;

            // Set up scale for x
            xScale = d3.scaleLinear()
                .domain([0, d3.max(dataset, function (d) { return d.week; })])
                .range([padding, width - 5]);
                    
            // Set up scale for y
            yScale = d3.scaleLinear()
                .domain([0, d3.max(dataset, function (d) { return d.deaths; })])
                .range([height - padding, 0]);

            // Set up the area
            area = d3.area()
                .x(function (d) { return xScale(d.week); })
                .y0(function () { return yScale.range()[0]; })
                .y1(function (d) { return yScale(d.deaths); });
            
            // Create area
            svg.append("path")
                .datum(dataset)
                .attr("class", "area")
                .attr("d", area);

            // Axis
            DrawAxis();

            // test console call of table for selected country and year of week and death
            console.table(dataset, ["week", "deaths"]);

            console.log("Country: " + country + ", Year: " + year);
        });

}


function DrawAxis() {
    // Set up x axis
    xAxis = d3.axisBottom()
        .ticks(52)
        .scale(xScale);
    
    // Set up y axis
    yAxis = d3.axisLeft()
        .scale(yScale);
    
    // Create x axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(" + 0 + ", " + (height - padding) + ")")
        .call(xAxis);
    
    // Create y axis
    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + padding + ", " + 0 + ")")
        .call(yAxis);
    
    // x label
    svg.append("text")
        .attr("class", "x axis label")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height)
        .text("Week Number");
    
    // y mortalities label
    svg.append("text")
        .attr("class", "y axis label")
        .attr("text-anchor", "middle")
        .attr("x", -height / 2)
        .attr("y", 5)
        .attr("dy", ".5em")
        .text("Moratlities")
        .attr("transform", "rotate(-90)");
}


function init() {

    // Height and width of svg
    width = 1100;
    height = 410;
    padding = 55;

    // Set up the svg
    svg = d3.select("#mortality_chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "svg");
    
    // TODO: move to function showChart then call
    DrawChart();

}

window.onload = init;