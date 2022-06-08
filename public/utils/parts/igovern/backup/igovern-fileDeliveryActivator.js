import { fileDelivery } from "./igovern-fileDelivery.js";
import { fileDeliverySafari } from "./igovern-fileDelivery-safari.js";
import { deviceScan } from "./igovern-deviceScan.js";
import { channelName } from "./igovern-sessionStorage.js";
import { checkIsHost } from './igovern-checkIsHost.js';

// FileDelivery Activator Functions
const fileDeliveryBtn = document.querySelector("#fileDeliveryBtn");
const fileDeliveryContainer = document.querySelector("#delivery_container");
const fileDeliveryImg = document.querySelector("#fileDeliveryImg");

let deliveryActive = false;
let event = deviceScan();
let fileDeliverySocket;

export const setFileDeliverySocket = (socket) => {
    fileDeliverySocket = socket;

    fileDeliverySocket.on("igoven-fileDevery-client", (deliveryActive) => {
        deliveryActive ? fileDeliveryEnable() : fileDeliveryDisable();
    });
};

function fileDeliverySocketEvent(deliveryActive) {
    deliveryActive ? fileDeliveryEnable() : fileDeliveryDisable();
    fileDeliverySocket.emit("igoven-fileDevery", channelName, deliveryActive);
};

let isSafari =
    /constructor/i.test(window.HTMLElement) ||
    (function (p) {
        return p.toString() === "[object SafariRemoteNotification]";
    })(
        !window["safari"] ||
            (typeof safari !== "undefined" && safari.pushNotification)
    );

if (!isSafari) {
    fileDeliveryBtn.addEventListener(
        event,
        (e) => {
            deliveryActive = !deliveryActive;

            if(checkIsHost()){
                fileDeliverySocketEvent(deliveryActive);
            }else{
                alert("Host Only");
            }
        },
        false
    );
} else {
    fileDeliveryBtn.addEventListener(
        event,
        (e) => {
            deliveryActive = !deliveryActive;
            socketEvemt(deliveryActive);
            deliveryActive ? fileDeliverySafariEnable() : fileDeliveryDisable();
        },
        false
    );
}

function fileDeliveryEnable() {
    fileDeliveryContainer.style.setProperty("display", "block");
    fileDeliveryImg.style.setProperty(
        "filter",
        "invert(69%) sepia(56%) saturate(3565%) hue-rotate(310deg) brightness(90%) contrast(106%)"
    );
    $(document).ready(() => {
        fileDelivery();
    });
}

function fileDeliverySafariEnable() {
    fileDeliveryContainer.style.setProperty("display", "block");
    fileDeliveryImg.style.setProperty(
        "filter",
        "invert(69%) sepia(56%) saturate(3565%) hue-rotate(310deg) brightness(90%) contrast(106%)"
    );
    $(document).ready(() => {
        fileDeliverySafari();
    });
}

function fileDeliveryDisable() {
    fileDeliveryContainer.style.setProperty("display", "none");
    fileDeliveryImg.style.setProperty("filter", "none");
}