let longitude;
let latitude;
let popup;
let marker;
let map;
let layer;

let pointerArr = [];

let mapOptions = {
    center: pointerArr,
    zoom: 10,
};

let greenIcon = L.icon({
    iconUrl: "leaf-green.png",

    iconSize: [38, 95], // size of the icon
    shadowSize: [50, 64], // size of the shadow
    iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62], // the same for the shadow
    popupAnchor: [-3, -76], // point from which the popup should open relative to the iconAnchor
});

function showPosition(position) {
    pointerArr.push(position.coords.latitude, position.coords.longitude);
}

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
} else {
    alert("Geolocation is not supported by this browser.");
}

function mapWrite() {
    map = new L.map("map", mapOptions).setView(mapOptions.center, 13);
    layer = new L.TileLayer(
        "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    );
    map.addLayer(layer);

    marker = new L.Marker(mapOptions.center)
        .addTo(map)
        .bindPopup("I am a green leaf.");

    // 배열 비워주기
    pointerArr.length = 0;
}

setTimeout(() => {
    mapWrite();
}, 1500);
