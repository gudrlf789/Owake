import { socketInitFunc } from "./channel/socket.js";

let socket = socketInitFunc();

let longitude;
let latitude;
let popup;
let marker;
let map;
let layer;
let pointer;

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

const markerCard = (id) => {
    let card = `
        <div class="card" style="width: 18rem;">
            <div class="card-body">
            <h5 class="card-title">${id}</h5>
            <p class="card-text">Hello</p>
            <input type="button" id="peer__call" class="btn btn-primary" value="Call"/>
        </div>
    </div>
    `;

    return card;
};

function mapWrite() {
    map = new L.map("map", mapOptions).setView(mapOptions.center, 13);
    layer = new L.TileLayer(
        "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    );
    map.addLayer(layer);

    marker = new L.Marker(mapOptions.center)
        .addTo(map)
        .bindPopup(markerCard(socket.id));

    socket.emit("map-point", {
        peerID: socket.id,
        point: mapOptions.center,
    });

    // 배열 비워주기
    pointerArr.length = 0;
}

socket.on("receive-point", (params) => {
    console.log(params.peerID, params.point);
    marker = new L.Marker(params.point)
        .addTo(map)
        .bindPopup(markerCard(params.peerID));
});

function callAction() {
    socket.emit("Caller", socket.id);
}

socket.on("Recipients", (params) => {
    alert(`I got a call from ${params}`);
});

setTimeout(() => {
    mapWrite();
}, 500);
