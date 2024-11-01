

mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'campground-map',  // Make sure this matches the ID in the show.ejs file
    style: 'mapbox://styles/mapbox/streets-v11',
    center: campground.geometry.coordinates,  // Use the campground's coordinates
    zoom: 10
});

map.addControl(new mapboxgl.NavigationControl());

// Add a marker for the campground's location
new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(`<h5>${campground.title}</h5><p>${campground.location}</p>`)
    )
    .addTo(map);



