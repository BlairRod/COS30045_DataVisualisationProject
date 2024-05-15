function init() {

    var width = 960;
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

    // Spharical grid
    var graticule = d3.geoGraticule();

    var svg = d3.select("#vaccine_map")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    
    svg.append("defs")
        .append("path")
        .datum({ type: "Sphere" })
        .attr("id", "sphere")
        .attr("d", path);
    
    svg.append("use")
        .attr("class", "stroke")
        .attr("xlink:href", "#sphere");
    
    svg.append("use")
        .attr("class", "fill")
        .attr("xlink:href", "#sphere");
    
    svg.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", path);

    // async queue to load up multiple files
    queue().defer(d3.json, "../files/world-110m.json")
        .defer(d3.tsv, "../files/world-country-names.tsv")
        .defer(d3.csv, "../files/world_population.csv")
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
        
        svg.insert("path", ".graticule")
            .datum(topojson.mesh(world, world.objects.countries, function (a, b) {
                return a !== b;
            }))
            .attr("class", "boundary")
            .attr("d", path);
    };
    
    d3.select(self.frameElement).style("height", height + "px");
}

window.onload = init;