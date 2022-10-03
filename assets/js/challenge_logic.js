// Add console.log to check to see if our code is working
console.log("working");

// _____

// Define map and tile layers
// _____

// We create the tile layer that will be the background of our map
let streets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
	maxZoom: 18,
	accessToken: API_KEY
});

// We create the second tile layer that will be the background of our map
let satelliteStreets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
	maxZoom: 18,
	accessToken: API_KEY
});

// We create the third tile layer that will be the background of our map
let navigationDay = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/navigation-day-v1/tiles/{z}/{x}/{y}?access_token={accessToken}', {
	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
	maxZoom: 18,
	accessToken: API_KEY
});

// Create the map object with center, zoom level, and default layer
let map = L.map('mapid', {
	center: [40.7, -94.5],
	zoom: 3,
	layers: [streets]
});

// Create a base layer that holds all three maps
let baseMaps = {
  "Streets": streets,
  "Satellite": satelliteStreets,
  "Day Time Navigation": navigationDay
};

// 1. Add 3 MORE LAYER GROUPS
let allEarthquakes = new L.LayerGroup();
let tectonic_plate = new L.LayerGroup();
let major_earthquake = new L.LayerGroup();


// 2. Add a references to the overlays object
let overlays = {
  "Earthquakes": allEarthquakes,
  "Tectonic plates": tectonic_plate,
  "Major Earthquakes": major_earthquake
};

// Then we add a control to the map that will allow the user to change which layers are visible
L.control.layers(baseMaps, overlays).addTo(map);

// _____

// Retrieve, parse, and plot earthquake data
// _____ 

// Retrieve the earthquake GeoJSON data
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function(data) {
    // _____

    // Define mapping functions
    // _____

    // This function returns the style data for each of the earthquakes we plot on the map
    // We pass the magnitude of the earthquake into two separate functions to calculate the color and radius
    function styleInfo(feature) {
        return {
            opacity: 1,
            fillOpacity: 1,
            fillColor: getColor(feature.properties.mag),
            color: "#000000",
            radius: getRadius(feature.properties.mag),
            stroke: true,
            weight: 0.5
        };
    }

    // This function determines the color of the marker based on the magnitude of the earthquake
    function getColor(magnitude) {
        if (magnitude > 5) {
            return "#ea2c2c";
        }
        if (magnitude > 4) {
            return "#ea822c";
        }
        if (magnitude > 3) {
            return "#ee9c00";
        }
        if (magnitude > 2) {
            return "#eecc00";
        }
        if (magnitude > 1) {
            return "#d4ee00";
        }
            return "#98ee00";
    }

    // This function determines the radius of the earthquake marker based on its magnitude
    // If an earthquake has a magnitude of 0, we can define its radius to be 1
    function getRadius(magnitude) {
        if (magnitude === 0) {
            return 1;
        }
            return magnitude * 4;
    }

    // _____

    // Parsing and mapping geoJSON data
    // _____

    // Creating a geoJSON layer with the retrieved data
    L.geoJson(data, {
        // We turn each feature into a circleMarker on the map
        pointToLayer: function(feature, latlng) {
            // console.log(data);
            return L.circleMarker(latlng);
        },
        
        // We set the style for each circleMarker using our styleInfo function.
        style: styleInfo,
        
        // We create a popup for each circleMarker to display the magnitude and location of the earthquake after the marker has been created and styled
        onEachFeature: function(feature, layer) {
            layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
        }
    }).addTo(allEarthquakes);

    // Then we add the earthquake layer to our map
    allEarthquakes.addTo(map);

    // 3. Retrieve the major earthquake GeoJSON data >4.5 mag for the week
    let major_earthquake_raw = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson"

    // Style and plot the major earthquake data (as we did above for all earthquakes)
    d3.json(major_earthquake_raw).then(function(data) {
        // Print the retrieved data
        console.log(data);

        // _____

        // Define mapping functions
        // _____

        // 4. Use the same style as the earthquake data
        function styleInfo(feature) {
            return {
                opacity: 1,
                fillOpacity: 1,
                fillColor: getColor(feature.properties.mag),
                color: "#000000",
                radius: getRadius(feature.properties.mag),
                stroke: true,
                weight: 0.5
            };
        }
        
        // 5. Change the color function to use three colors for the major earthquakes based on the magnitude of the earthquake
        function getColor(magnitude) {
            if (magnitude > 6) {
                return "#000000";
            }
            if (magnitude > 5) {
                return "#ea2c2c";
            }
                return "#ea822c";
        }
        
        // 6. Use the function that determines the radius of the earthquake marker based on its magnitude
        function getRadius(magnitude) {
            if (magnitude === 0) {
            return 1;
            }
            return magnitude * 4;
        }
        
        // 7. Creating a geoJSON layer with the retrieved data that adds a circle to the map, sets the style of the circle, and displays the magnitude and location of the earthquake after the marker has been created and styled 
        L.geoJSON(data, {
            // Add markers to the map
            pointToLayer: function(feature, latlng) {
                return L.circleMarker(latlng);
            },

            // Add styling to the markers
            style: styleInfo,

            // Add a popup to each marker on the map
            onEachFeature: function(feature, layer) {
                layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
            }
        }
        // 8. Add the major earthquakes layer to the map
        ).addTo(major_earthquake);
        
        // 9. Close the braces and parentheses for the major earthquake data
    });

    // Add the major earthquake data to the corresponding map layer
    major_earthquake.addTo(map);

    // Create a legend control object
    let legend = L.control({
        position: "bottomright"
    });

    // Then add all the details for the legend
    legend.onAdd = function() {
        // Create a div to store the map's legend
        let div = L.DomUtil.create("div", "info legend");

        // Define an array for the various earthquake magnitudes
        const magnitudes = [0, 1, 2, 3, 4, 5, 6];

        // Define an array of colors that correspond to the various earthquake magnitudes
        const colors = [
            "#98ee00",
            "#d4ee00",
            "#eecc00",
            "#ee9c00",
            "#ea822c",
            "#ea2c2c",
            "#000000"
        ];

        // Looping through our intervals to generate a label with a colored square for each interval
        for (var i = 0; i < magnitudes.length; i++) {
            // Print the color codes
            console.log(colors[i]);

            // Append a row of information to the legend
            div.innerHTML +=
            "<i style='background: " + colors[i] + "'></i> " +
            magnitudes[i] + (magnitudes[i + 1] ? "&ndash;" + magnitudes[i + 1] + "<br>" : "+");
        }
            
        // Return the populated div
        return div;
    };

    // Add our legend to the map
    legend.addTo(map);

    // Use d3.json to make a call to get our Tectonic Plate geoJSON data
    let tectonic_plates_raw = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

    // Retrieve and add the geoJSON data to the tectonic plate map layer
    d3.json(tectonic_plates_raw).then(function(data) {    
        L.geoJSON(data, {color: "#c83349", weight: 3 }).addTo(tectonic_plate);        
    });

    // Add the tectonic plate map layer to the map
    tectonic_plate.addTo(map);
});