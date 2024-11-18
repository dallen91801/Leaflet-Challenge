// API endpoint for recent earthquakes
let queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2024-11-01&endtime=2024-11-18";


// >>>>>>>>>>>>>>>>


// Relative path to tectonic plates GeoJSON file
let tectonicPlatesUrl = "data/PB2002_plates.json";

// Fetch earthquake and tectonic plate data
Promise.all([
  d3.json(queryUrl),           // Fetch recent earthquake data
  d3.json(tectonicPlatesUrl)   // Fetch tectonic plates data
]).then(function([earthquakeData, tectonicData]) {

  // Define base layers
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  let satellite = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution: 'Imagery © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; OpenStreetMap contributors'
  });

  // Create a map centered on the world with a default layer
  let myMap = L.map("map", {
    center: [20, 0], // Centered on the equator
    zoom: 2,
    layers: [street]
  });
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>THIS IS THE END OF THE AI ASSISTED CODE<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
  // Define marker styles based on earthquake magnitude
  function getColor(magnitude) {
    return magnitude > 5 ? 'red' :
           magnitude > 4 ? 'orange' :
           magnitude > 3 ? 'yellow' :
           magnitude > 2 ? 'green' :
           magnitude > 1 ? 'blue' :
                           'purple';
  }

  function getRadius(magnitude) {
    return magnitude === 0 ? 1 : magnitude * 30000; 
  }

  // Add earthquakes to the map
  let earthquakes = L.geoJson(earthquakeData, {
    pointToLayer: function(feature, latlng) {
      return L.circle(latlng, {
        color: getColor(feature.properties.mag),
        fillColor: getColor(feature.properties.mag),
        fillOpacity: 0.8,
        radius: getRadius(feature.properties.mag)
      });
    },
    onEachFeature: function(feature, layer) {
      let time = new Date(feature.properties.time).toLocaleString(); 
      layer.bindPopup(`<h3>${feature.properties.place}</h3>
                       <p>Magnitude: ${feature.properties.mag}</p>
                       <p>Time: ${time}</p>`);
    }
  });

  // Add tectonic plates to the map
  let tectonicPlates = L.geoJson(tectonicData, {
    style: {
      color: "orange",
      weight: 2
    }
  });

  // Base maps object
  let baseMaps = {
    "Street View": street,
    "Satellite View": satellite,
    "Topographic View": topo
  };

  // Overlay maps object
  let overlayMaps = {
    "Earthquakes": earthquakes,
    "Tectonic Plates": tectonicPlates
  };

  // Add earthquake and tectonic plate data to the map by default
  earthquakes.addTo(myMap);
  tectonicPlates.addTo(myMap);

  // Add layer control to the map
  L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(myMap);

  // Add legend to the map
  let legend = L.control({ position: "bottomright" });

  legend.onAdd = function() {
    let div = L.DomUtil.create("div", "info legend");
    let magnitudes = [0, 1, 2, 3, 4, 5];
    let colors = ['purple', 'blue', 'green', 'yellow', 'orange', 'red'];

    div.innerHTML = "<h4>Richter Scale</h4>";
    for (let i = 0; i < magnitudes.length; i++) {
      div.innerHTML += `<i style="background: ${colors[i]}"></i> ${magnitudes[i]}${magnitudes[i + 1] ? '&ndash;' + magnitudes[i + 1] : '+'}<br>`;
    }
    return div;
  };

  legend.addTo(myMap);
}).catch(function(error) {
  console.error("Error loading data:", error);
});
