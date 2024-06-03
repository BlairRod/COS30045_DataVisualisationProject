function init() {

    var width = 970;
    var height = 580;

    // Color scale
    // var color = d3.scaleOrdinal(d3.schemeTableau10);
    // var color = d3.scaleOrdinal(d3.schemeSet3);
    // var color = d3.scaleOrdinal(d3.schemeSet2);
    var color = d3.scaleOrdinal(d3.schemeSet2);
    // var color = d3.scaleOrdinal(d3.schemeSet1);

    // Projection
    var projection = d3.geoKavrayskiy7()
        .scale(170)
        .translate([width / 2, height / 2])
        .precision(0.1);

    
    // Path
    var path = d3.geoPath().projection(projection);

    // SVG setup
    var svg = d3.select("#vaccine_map")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    
    // Sphere with grid lines setup
    var graticule = d3.geoGraticule();
    svg.append("defs")
        .append("path")
        .datum({ type: "Sphere" })
        .attr("id", "sphere")
        .attr("d", path);
    
    // Sphere outline stroke using link
    svg.append("use")
        .attr("class", "stroke")
        .attr("xlink:href", "#sphere");
    
    // Sphere outline fill using link
    svg.append("use")
        .attr("class", "fill")
        .attr("xlink:href", "#sphere");
    
    // Grid of sphere
    svg.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", path);

    // async queue to load up multiple files
    queue().defer(d3.json, "world-110m.json")
        .defer(d3.tsv, "world-country-names.tsv")
        .defer(d3.csv, "world_population.csv")
        .await(ready);
    

    function ready(error, world, names, pops) {
        if (error) throw error;

        var countries = topojson.feature(world, world.objects.countries).features;
        var neighbors = topojson.neighbors(world.objects.countries.geometries);

        // Country object
        function countryData(code, name, pop, id) {
            this.code = code;
            this.name = name;
            this.pop = pop;
            this.id = id;
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

        //  Draw the map
        svg.selectAll(".country")
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
                return ("<b>" + countryArr[d.id].name +  "</br>" + "Population: " + countryArr[d.id].pop + "</b>");
            }));
        
        // svg.insert("path", ".graticule")
        //     .datum(topojson.mesh(world, world.objects.countries, function (a, b) {
        //         return a !== b;
        //     }))
        //     .attr("class", "boundary")
        //     .attr("d", path);

        panButtons()
    };
    
    // d3.select(self.frameElement).style("height", height + "px");

    var panButtons = function () {

        // Top button for panning north
        var top_button = svg.append("g")
            .attr("class", "pan")
            .attr("id", "top_button");
        
        top_button.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width)
            .attr("height", 25);
        
        top_button.append("text")
            .attr("x", width / 2)
            .attr("y", 17)
            .html("&#8679;");
        
        // Bottom button for panning south
        var bottom_button = svg.append("g")
            .attr("class", "pan")
            .attr("id", "bottom_button");
        
        bottom_button.append("rect")
            .attr("x", 0)
            .attr("y", height - 25)
            .attr("width", width)
            .attr("height", 25);
        
        bottom_button.append("text")
            .attr("x", width / 2)
            .attr("y", height - 6)
            .html("&#8681;");
        
        // Left button for panning west
        var left_button = svg.append("g")
            .attr("class", "pan")
            .attr("id", "left_button");
        
        left_button.append("rect")
            .attr("x", 0)
            .attr("y", 25)
            .attr("width", 25)
            .attr("height", height - 50);
        
        left_button.append("text")
            .attr("x", 10)
            .attr("y", height / 2)
            .html("&#8678;");
        
        // Right button for panning east
        var right_button = svg.append("g")
            .attr("class", "pan")
            .attr("id", "right_button");
        
        right_button.append("rect")
            .attr("x", width - 25)
            .attr("y", 25)
            .attr("width", 25)
            .attr("height", height - 50);
        
        right_button.append("text")
            .attr("x", width - 11)
            .attr("y", height / 2)
            .html("&#8680;");
        
        // Movement on click function
        d3.selectAll(".pan")
            .on("click", function () {
                // Current position
                var current = projection.translate();
                // Distance to move on click
                var moveDist = 10;
                // Direction to move on click
                var direction = d3.select(this).attr("id")
                switch (direction) {
                    case "top_button":
                        current[1] += moveDist;
                        break;
                    case "bottom_button":
                        current[1] -= moveDist;
                        break;
                    case "left_button":
                        current[0] += moveDist;
                        break;
                    case "right_button":
                        current[0] -= moveDist;
                        break;
                }
                projection.translate(current);
                svg.selectAll("path")
                    .attr("d", path);
                
            });

    }

}

window.onload = init;