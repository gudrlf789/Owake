import { socketInitFunc } from "./channel/socket.js";

let socket = socketInitFunc();

let marker;
let map;
let layer;

let pointerArr = [];

let mapOptions = {
    center: pointerArr,
    zoom: 10,
};
let popup;
let peerCallBtn;
let popupContent;
let callBtn;

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
    // Socket Start
    socket.emit("map-point", {
        peerID: socket.id,
        point: mapOptions.center,
    });

    map = new L.map("map", mapOptions).setView(mapOptions.center, 13);
    layer = new L.TileLayer(
        "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    );
    map.addLayer(layer);

    popup = markerCard(socket.id);
    marker = new L.Marker(mapOptions.center).addTo(map).bindPopup(popup);

    // 배열 비워주기
    pointerArr.length = 0;
}

socket.on("receive-point", (params) => {
    console.log(params.peerID, params.point);
});

socket.on("Recipients", (params) => {
    console.log(params);
    alert(`I got a call from ${params}`);
});

setTimeout(() => {
    mapWrite();
}, 500);
