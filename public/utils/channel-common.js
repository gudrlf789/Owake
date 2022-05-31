import { channelFirstSpinnerDeleteFunc } from "./parts/channel/channelFirstSpinnerDelete.js";

import { mobileDisplayCtr } from "./parts/channel/chat.js";
import { f12defense } from "./parts/channel/f12defense.js";
import { fileDelivery } from "./parts/channel/fileDelivery.js";
import { fileDeliverySafari } from "./parts/channel/fileDelivery-safari.js";
// P2P 개발할 때까지 중단
// import { fileShare } from "./parts/channel/fileShare.js";
import { momentShareFunc1 } from "./parts/channel/momentShare1.js";
// import { momentShareFunc2 } from "./parts/channel/momentShare2.js";
import { muteUtilsFunc } from "./parts/channel/muteUtils.js";
import { recodingDeviceCtrl } from "./parts/channel/devviceSettings.js";
import { remoteDisplay } from "./parts/channel/remoteDisplay.js";
import { screenShareFunc } from "./parts/channel/screenShare.js";
import { whiteBoardFunc } from "./parts/channel/whiteBoard.js";
import { mobileReflashClose } from "./parts/channel/mobileReflashClose.js";
import { responsiveFunc } from "./parts/channel/responsive.js";
import { copyInfo } from "./parts/channel/copyUrl.js";
import { browserEvent } from "./parts/channel/browserEvent.js";
import { gridView } from "./parts/channel/videoViewGridMode.js";
import { SwiperFunc } from "./parts/channel/swiper.js";
// import { shareEditerFunc } from "./parts/channel/shareEditer.js";
import { fileHash } from "./parts/channel/fileHash.js";
import { contentFunc } from "./parts/channel/content.js";
import { pdfFunc } from "./parts/channel/pdfShare.js";
import { deviceScan } from "./parts/channel/deviceScan.js";

$(() => {
    channelFirstSpinnerDeleteFunc();

    mobileDisplayCtr();
    f12defense();
    SwiperFunc();
    remoteDisplay();
    responsiveFunc();
    mobileReflashClose();
    momentShareFunc1();
    recodingDeviceCtrl();
    screenShareFunc();
    whiteBoardFunc();
    browserEvent();
    muteUtilsFunc();
    fileHash();
    contentFunc();
    pdfFunc();
    copyInfo();
});

// FileDelivery Activator Functions
const fileDeliveryBtn = document.querySelector("#fileDeliveryBtn");
const fileDeliveryContainer = document.querySelector("#delivery_container");
const fileDeliveryImg = document.querySelector("#fileDelivery-img");

let deliveryActive = false;
let event = deviceScan();

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
            deliveryActive ? fileDeliveryEnable() : fileDeliveryDisable();
        },
        false
    );
} else {
    fileDeliveryBtn.addEventListener(
        event,
        (e) => {
            deliveryActive = !deliveryActive;
            deliveryActive ? fileDeliverySafariEnable() : fileDeliveryDisable();
        },
        false
    );
}

function fileDeliveryEnable() {
    fileDeliveryContainer.style.setProperty("display", "block");
    fileDeliveryImg.src = "/left/file_a.svg";
    $(document).ready(() => {
        fileDelivery();
    });
}

function fileDeliverySafariEnable() {
    fileDeliveryContainer.style.setProperty("display", "block");
    fileDeliveryImg.src = "/left/file_a.svg";
    $(document).ready(() => {
        fileDeliverySafari();
    });
}

function fileDeliveryDisable() {
    fileDeliveryContainer.style.setProperty("display", "none");
    fileDeliveryImg.src = "/left/file.svg";
}
