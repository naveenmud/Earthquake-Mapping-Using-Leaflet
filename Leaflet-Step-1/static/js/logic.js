// Store our API
var queryUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_week.geojson';
d3.json(queryUrl, function(data) {
	console.log(data);
	cr_Features(data.features);
});

// Create features for earthquake
function cr_Features(earthquakeData) {
	function onEachFeature(feature, layer) {
		layer.bindPopup(
			'<h3>' + feature.properties.place + '</h3><hr><p>' + new Date(feature.properties.time) + '</p>'
		);
	}

	// Create a GeoJSON layer
	var earthquakes = L.geoJSON(earthquakeData, {
		pointToLayer: function(feature, latlng) {
			return L.circleMarker(latlng, {
				radius: markerSize(feature.properties.mag),
				fillColor: fillColor(feature.properties.mag),
				color: 'black',
				weight: 0.6,
				opacity: 0.4,
				fillOpacity: 0.6
			});
		},

		// Create popups
		onEachFeature: function(feature, layer) {
			return layer.bindPopup(
				`<strong>Place:</strong> ${feature.properties.place}<br><strong>Magnitude:</strong> ${feature.properties
					.mag}`
			);
		}
	});

	createMap(earthquakes);
}

// Creating map
function createMap(earthquakes) {
	// Define streetmap and darkmap layers
	var streetmap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
		attribution:
			'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		maxZoom: 18,
		id: 'mapbox.streets',
		accessToken: API_KEY
	});

	var darkmap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
		attribution:
			'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		maxZoom: 18,
		id: 'mapbox.dark',
		accessToken: API_KEY
	});

	// Hold our base layers in new object
	var baseMaps = {
		'Street Map': streetmap,
		'Dark Map': darkmap
	};

	// Hold our overlay layer in new object
	var overlayMaps = {
		Earthquakes: earthquakes
	};

	var myMap = L.map('map', {
		center: [ 40.22, -74.75 ],
		zoom: 3,
		layers: [ streetmap, earthquakes ]
	});

	// layer toggling

	L.control
		.layers(baseMaps, overlayMaps, {
			collapsed: false
		})
		.addTo(myMap);

	var legend = L.control({ position: 'bottomright' });

	legend.onAdd = function() {
		var div = L.DomUtil.create('div', 'info legend'),
			magnitude = [ 0, 1, 2, 3, 4, 5, 6 ],
			labels = [];

		// loop through our density intervals and generate a label with a colored square for each interval
		for (var i = 0; i < magnitude.length; i++) {
			div.innerHTML +=
				'<i style="background:' +
				fillColor(magnitude[i] + 1) +
				'"></i> ' +
				magnitude[i] +
				(magnitude[i + 1] ? '&ndash;' + magnitude[i + 1] + '<br>' : '+');
		}

		return div;
	};

	legend.addTo(myMap);
}

// Choose color gradient dependent on earthquake magnitude
function fillColor(magnitude) {
	switch (true) {
		case magnitude >= 6.0:
			return 'red';
			break;

		case magnitude >= 5.0:
			return 'orangered';
			break;

		case magnitude >= 4.0:
			return 'darkorange';
			break;

		case magnitude >= 3.0:
			return 'orange';
			break;

		case magnitude >= 2.0:
			return 'gold';
			break;

		case magnitude >= 1.0:
			return 'yellow';
			break;

		default:
			return 'greenyellow';
	}
}

function markerSize(magnitude) {
	return magnitude * 3;
}
