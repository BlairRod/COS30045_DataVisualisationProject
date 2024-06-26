function init() {

    var width = 970;
    var height = 580;

    // Color scale
    // var color = d3.scaleOrdinal(d3.schemeTableau10);
    // var color = d3.scaleOrdinal(d3.schemeSet3);
    // var color = d3.scaleOrdinal(d3.schemeSet2);
    var color = d3.scaleOrdinal(d3.schemeSet2);
    // var color = d3.scaleOrdinal(d3.schemeSet1);

    // Format for thousan value (1000 => 1,000)
	var thousandFormat = d3.format(",");

    // Projection
    var projection = d3.geoKavrayskiy7()
        .scale(50)
        .translate([width / 2, height / 2])
        .precision(0.1);

    // Path
    var path = d3.geoPath().projection(projection);

    // SVG setup
    var svg = d3.select("#vaccine_map")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Function for panning and zooming
    var zooming = function (d) {

        // Offset array
        var offset = [
            d3.event.transform.x,
            d3.event.transform.y
        ];

        // Calculates scale
        var newScale = d3.event.transform.k * 2000;

        // Update projection
        projection.translate(offset)
            .scale(newScale);

        // Update path
        svg.selectAll("path")
            .attr("d", path);
    }

    // Definition of zoom behaviour
    var zoom = d3.zoom()
        .scaleExtent([0.07, 1.0])
        .translateExtent([[-5500, -3200],[5500, 3200]])
        .on("zoom", zooming);
    
    // Map center
    var center = projection([485.0, 290.0]);

    // SVG group container for pannable and zoomable elemens
    var map = svg.append("g")
        .attr("id", "map")
        .call(zoom)
        .call(zoom.transform, d3.zoomIdentity
            .translate(width / 2, height  / 2)
            .scale(0.08)
            .translate(-center[0], -center[1])
        );
    
    // Invisible rect to catch mouse events
    map.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height)
        .attr("opacity", 0);

    // Sphere with grid lines setup
    var graticule = d3.geoGraticule();
    map.append("defs")
        .append("path")
        .datum({ type: "Sphere" })
        .attr("id", "sphere")
        .attr("d", path);
    
    // Sphere outline stroke using link
    map.append("use")
        .attr("class", "stroke")
        .attr("xlink:href", "#sphere");
    
    // Sphere outline fill using link
    map.append("use")
        .attr("class", "fill")
        .attr("xlink:href", "#sphere");
    
    // Grid of sphere
    map.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", path);

    // async queue to load up multiple files
    queue().defer(d3.json, "world-110m.json")
        .defer(d3.tsv, "world-country-names.tsv")
        .defer(d3.csv, "world_population.csv")
        .defer(d3.csv, "vaccine-locations.csv")
        .await(ready);
        
    function ready(error, world, names, pops, vaccines) {
        if (error) throw error;

        var countries = topojson.feature(world, world.objects.countries).features;
        var neighbors = topojson.neighbors(world.objects.countries.geometries);

        // Country object
        function countryData(code, name, pop, id, vaccine, source) {
            this.code = code;
            this.name = name;
            this.pop = pop;
            this.id = id;
            this.vaccine = vaccine;
            this.source = source;
        }

        // Array of country objects
        var countryArr = [];

        // Map countries to data used on the map
        // Use country ids as index position in array
        names.forEach(function (i) {
            countryArr[i.id] = new countryData("", i.name, "", i.id);
        });

        // Pull the rest of the data from files
        countryArr.forEach(function (i) {
            pops.forEach(function (j) {
                if (i.name == j.name) {
                    i.code = j.code;
                    i.pop = j.pop;
                }
            });
        });

        countryArr.forEach(function (i) {
            vaccines.forEach(function (j) {
                if (i.name == j.location) {
                    i.vaccine = j.vaccines;
                    i.source = j.source_website;
                }
            });
        });

        
        //  Draw the map
        map.selectAll(".country")
            .data(countries)
            .enter()
            .insert("path", ".graticule")
            .attr("class", "country")
            .attr("d", path)
            .style("fill", function (d, i) {
                return color((d.color = (d3.max(neighbors[i], function (n) {
                    return countries[n].color;
                }) + 1) | 0));
            })
            .call(d3.helper.tooltip(function (d, i) {
                // Info shown in tooltip, currently "country name: country population"
                return ("<b>" + countryArr[d.id].name + "</br>");
            }))
            .on("click", function (d) {
                showCountryData(countryArr[d.id])
            })

        panButtons()
        zoomButtons();
    };

    // Creates buttons for panning
    var panButtons = function () {

        // Top button for panning north
        var top_button = svg.append("g")
            .attr("class", "pan")
            .attr("id", "top_button")
            .attr("transform", "translate(" + (75) + "," + (height - 85) + ")");
        
        top_button.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 20)
            .attr("height", 25);
        
        top_button.append("text")
            .attr("x", 10)
            .attr("y", 18)
            .html("&#8679;");
        
        // Bottom button for panning south
        var bottom_button = svg.append("g")
            .attr("class", "pan")
            .attr("id", "bottom_button")
            .attr("transform", "translate(" + (75) + "," + (height - 40) + ")");
        
        bottom_button.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 20)
            .attr("height", 25);
        
        bottom_button.append("text")
            .attr("x", 10)
            .attr("y", 18)
            .html("&#8681;");
        
        // Left button for panning west
        var left_button = svg.append("g")
            .attr("class", "pan")
            .attr("id", "left_button")
            .attr("transform", "translate(" + (50) + "," + (height - 60) + ")");
        
        left_button.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 25)
            .attr("height", 20);
        
        left_button.append("text")
            .attr("x", 11)
            .attr("y", 15)
            .html("&#8678;");
        
        // Right button for panning east
        var right_button = svg.append("g")
            .attr("class", "pan")
            .attr("id", "right_button")
            .attr("transform", "translate(" + (95) + "," + (height - 60) + ")");
        
        right_button.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 25)
            .attr("height", 20);
        
        right_button.append("text")
            .attr("x", 12)
            .attr("y", 15)
            .html("&#8680;");
        
        // Movement on click function
        d3.selectAll(".pan")
            .on("click", function () {
                // Distance to move on click
                var moveDist = 100;
                var x = 0;
                var y = 0;
                // Direction to move on click
                var direction = d3.select(this).attr("id")
                switch (direction) {
                    case "top_button":
                        y += moveDist;
                        break;
                    case "bottom_button":
                        y -= moveDist;
                        break;
                    case "left_button":
                        x += moveDist;
                        break;
                    case "right_button":
                        x -= moveDist;
                        break;
                }

                map.transition()
                    .call(zoom.translateBy, x, y);
                
            });

    }

    // Creates buttons for zooming
    var zoomButtons = function () {

        // Top button for zooming in
        var zoom_in = svg.append("g")
            .attr("class", "zoom")
            .attr("id", "zoom_in")
            .attr("transform", "translate(" + (width - 110) + "," + (height - 70) + ")");
        
        zoom_in.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("rx", 15)
            .attr("ry", 15)
            .attr("width", 30)
            .attr("height", 30);
        
        zoom_in.append("text")
            .attr("x", 15)
            .attr("y", 20)
            .html("&#43;");
        
        // Bottom button for zooming out
        var zoom_out = svg.append("g")
            .attr("class", "zoom")
            .attr("id", "zoom_out")
			.attr("transform", "translate(" + (width - 70) + "," + (height - 70) + ")");
        
        zoom_out.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("rx", 15)
            .attr("ry", 15)
            .attr("width", 30)
            .attr("height", 30);
        
        zoom_out.append("text")
            .attr("x", 15)
            .attr("y", 20)
            .html("&#8722;");
        

        // Zoom button function
        d3.selectAll(".zoom")
            .on("click", function () {
                var scaleFactor;

                var direction = d3.select(this).attr("id");

                switch (direction) {
                    case "zoom_in":
                        scaleFactor = 1.5;
                        break;
                    case "zoom_out":
                        scaleFactor = 0.75;
                        break;
                    default:
                        break;
                }
                map.transition()
                    .call(zoom.scaleBy, scaleFactor);

            });
    }

    // Button that positions to Australia
    d3.select("#aus_btn")
        .on("click", function () {
            map.transition()
                .call(zoom.transform, d3.zoomIdentity
                    .translate(width / 2, height / 2)
                    .scale(0.48)
                    .translate(-3900, -1000)
            );
        });
    
    // Button that positions to USA
    d3.select("#usa_btn")
        .on("click", function () {
            map.transition()
                .call(zoom.transform, d3.zoomIdentity
                    .translate(width / 2, height / 2)
                    .scale(0.29)
                    .translate(2800, 1700)
            );
        });
    
    // Button that positions to USA
    d3.select("#reset_btn")
        .on("click", function () {
            map.transition()
                .call(zoom.transform, d3.zoomIdentity
                    .translate(width / 2, height / 2)
                    .scale(0.08)
                    .translate(-center[0], -center[1])
                );
        });
    
    // Displays information for clicked countries next to map
    function showCountryData(country) {
        var countryInfo = document.getElementById("location_info");
        countryInfo.innerHTML = "<h4>" + country.name + "</h4>" +
            "<p>Population: " + thousandFormat(country.pop) + "</p>" +
            "<p>Vaccines: " + country.vaccine + "</br>" +
            "<p><a href=" + country.source + ">Source</a></p>";
    
    }


}

window.onload = init;