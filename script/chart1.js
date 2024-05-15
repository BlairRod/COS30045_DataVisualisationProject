// Country the chart will show
var country = "australia";
// Year the chart will show
var year = "2020";

var filename = "datasets/" + country + "_" + year+ ".csv"

var dataset, width, height, padding, svg, xScale, yScale, xAxis, yAxis, line, area;

// Called when country dropdown is selected, changes charts country.
function SetCountry() {
    country = document.getElementById("country_dropdown").value;

    // TODO: call function showChasrt(country)
    console.log("Country: " + country + ", Year: " + year);
    filename = "datasets/" + country + "_" + year+ ".csv"
    console.log(filename);
    updateChart()
}

// Called when year dropdown is selected, changes charts year.
function SetYear() {
    year = document.getElementById("year_dropdown").value;

    // TODO: call function showChart(country)
    console.log("Country: " + country + ", Year: " + year);
    filename = "datasets/" + country + "_" + year+ ".csv"
    console.log(filename);
    updateChart()
}

function updateChart() {
    dataset = []

    svg.selectAll("path")
        .data(dataset)
        .exit()
        .remove();
    
    drawChart();
}

function drawChart(){
    // Get data from file
    d3.csv(filename, function (d) {
        return {
            week: +d.Week,
            deaths: +d.Deaths,
            vaccinations: +d.Vaccinations
        };
        }).then(function (data) {
            dataset = data;

            // Set up scale for x
            xScale = d3.scaleTime()
                .domain([
                    d3.min(dataset, function (d) { return d.week; }),
                    d3.max(dataset, function (d) { return d.week; })
                ])
                .range([padding, width]);
    
            // Set up scale for y
            yScale = d3.scaleLinear()
                .domain([0, d3.max(dataset, function (d) { return d.deaths; })])
                .range([height - padding, 0]);
            
            // Deaths area chart
            DeathChart(dataset)

            // Vaccinations line chart
            VaccinationChart(dataset)

            // test console call of table for selected country and year of week and death
            console.log("Country: " + country + ", Year: " + year);
            // console.table(dataset, ["week", "deaths", "vaccinations"]);
        });

}

// Area chart for mortalities
function DeathChart(dataset) {

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
    
    // Set up x axis
    // TODO

    // Set up y axis
    // TODO

    // Create x axis
    // TODO

    // Create y axis
    // TODO


    // TODO: finish area chart

}


// Line chart for vaccinations
function VaccinationChart(dataset) {
    
    // Set up scale for y
    yScale = d3.scaleLinear()
        .domain([0, d3.max(dataset, function (d) { return d.vaccinations; })])
        .range([height - padding, 0]);
    
    // Set up the line
    line = d3.line()
        .x(function (d) { return xScale(d.week); })
        .y(function (d) { return yScale(d.vaccinations); });
    
    // Set up the path
    svg.append("path")
        .datum(dataset)
        .attr("class", "line")
        .attr("d", line);
    
    // TODO: finish line chart

}


function init() {

    // Height and width of svg
    width = 600;
    height = 300;
    padding = 55;

    // Set up the svg
    svg = d3.select("#mortality_vs_vaccination_chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "svg");
    

    // TODO: move to function showChart then call
    drawChart();

   
        // Map

        // Bar
        
}

window.onload = init;