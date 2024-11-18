// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2024-09-11&endtime=2024-09-13&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";

// Perform a GET request to the query URL.
d3.json(queryUrl).then(function (data) {
  console.log(data.features);

  // Define the tile layers for "Street Map" and "Topographic Map"
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  // Create a baseMaps object to hold the street and topographic layers
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Initialize the map with default settings
  let myMap = L.map("map", {
    center: [37.09, -95.71], // Centered on the United States
    zoom: 5,
    layers: [street] // Default layer
  });

  // Define a function to determine the marker color based on earthquake magnitude
  function getColor(magnitude) {
    return magnitude > 5 ? 'red' :
           magnitude > 4 ? 'orange' :
           magnitude > 3 ? 'yellow' :
           magnitude > 2 ? 'green' :
           magnitude > 1 ? 'blue' :
                           'purple';
  }

  // Define a function to determine the marker radius based on earthquake magnitude
  function getRadius(magnitude) {
    return magnitude * 20000; // Scale for better visibility
  }

  // Add a legend to the map
  let legend = L.control({ position: "bottomright" });

  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");
    let magnitudes = [0, 1, 2, 3, 4, 5];
    let colors = ['purple', 'blue', 'green', 'yellow', 'orange', 'red'];

    // Create a title for the legend
    div.innerHTML = "<h4>Richter Scale</h4>";

    // Loop through the magnitude intervals and generate labels with colored squares
    for (let i = 0; i < magnitudes.length; i++) {
      div.innerHTML +=
        `<i style="background: ${colors[i]}"></i> ` +
        `${magnitudes[i]}${magnitudes[i + 1] ? '&ndash;' + magnitudes[i + 1] : '+'}<br>`;
    }

    return div;
  };

  // Add the legend to the map
  legend.addTo(myMap);

  // Create a GeoJSON layer containing the features array from the earthquake data
  let earthquakes = L.geoJson(data, {
    // Use pointToLayer to create circle markers
    pointToLayer: function (feature, latlng) {
      return L.circle(latlng, {
        color: getColor(feature.properties.mag),       // Outline color based on magnitude
        fillColor: getColor(feature.properties.mag),   // Fill color based on magnitude
        fillOpacity: 0.75,
        radius: getRadius(feature.properties.mag)      // Radius based on magnitude
      });
    },
    // Use onEachFeature to bind a popup to each marker
    onEachFeature: function (feature, layer) {
      let time = new Date(feature.properties.time).toLocaleString(); // Convert time to readable format
      layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>Magnitude: ${feature.properties.mag}</p><p>Time: ${time}</p>`);
    }
  });

  // Create an overlayMaps object to hold the earthquake layer
  let overlayMaps = {
    "Earthquakes": earthquakes
  };

  // Add the earthquakes layer to the map
  earthquakes.addTo(myMap);

  // Add a layer control containing the baseMaps and overlayMaps, and add it to the map
  L.control.layers(baseMaps, overlayMaps).addTo(myMap);
});
