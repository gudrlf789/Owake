import { mobileDisplayCtr } from "./parts/channel/chat.js";
import { f12defense } from "./parts/channel/f12defense.js";
import { fileDelivery } from "./parts/channel/fileDelivery.js";
import { fileDeliverySafari } from "./parts/channel/fileDelivery-safari.js";
// P2P 개발할 때까지 중단
// import { fileShare } from "./parts/channel/fileShare.js";
import { momentShareFunc1 } from "./parts/channel/momentShare1.js";
// import { momentShareFunc2 } from "./parts/channel/momentShare2.js";
import { muteUtilsFunc } from "./parts/channel/muteUtils.js";
import { optionsBtn } from "./parts/channel/options-btn.js";
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

const fileDeliveryBtn = document.querySelector("#fileDeliveryBtn");
const fileDeliveryContainer = document.querySelector("#delivery_container");

mobileDisplayCtr();
f12defense();

let deliveryActive = false;

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
        "click",
        (e) => {
            deliveryActive = !deliveryActive;
            deliveryActive ? fileDeliveryEnable() : fileDeliveryDisable();
        },
        false
    );
} else {
    fileDeliveryBtn.addEventListener(
        "click",
        (e) => {
            deliveryActive = !deliveryActive;
            deliveryActive ? fileDeliverySafariEnable() : fileDeliveryDisable();
        },
        false
    );
}

function fileDeliveryEnable() {
    fileDeliveryContainer.style.setProperty("display", "block");
    jqueryUIScriptLoad();
    fileDelivery();

    deliveryContainerDraggable();
}

function fileDeliverySafariEnable() {
    fileDeliveryContainer.style.setProperty("display", "block");
    jqueryUIScriptLoad();
    fileDeliverySafari();

    deliveryContainerDraggable();
}

function fileDeliveryDisable() {
    jqueryUIScriptRemove();
    fileDeliveryContainer.style.setProperty("display", "none");
}

function jqueryUIScriptLoad() {
    const link = document.createElement("link");
    const script1 = document.createElement("script");
    const script2 = document.createElement("script");

    link.setAttribute("rel", "stylesheet");
    link.setAttribute(
        "href",
        "https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.css"
    );

    script1.setAttribute("type", "text/javascript");
    script1.setAttribute(
        "src",
        "https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"
    );
    script2.setAttribute(
        "src",
        "https://raw.githubusercontent.com/furf/jquery-ui-touch-punch/master/jquery.ui.touch-punch.js"
    );
    document.head.appendChild(link);
    document.body.appendChild(script1);
    document.body.appendChild(script2);
}

function jqueryUIScriptRemove() {
    let selectLink = document.querySelectorAll("link");
    let selectScript = document.querySelectorAll("script");
    let selectJqueryUI;
    let selectJqueryTouchPunch;
    let selectLinkUI;

    for (let k = 0; k < selectLink.length; k++) {
        selectLinkUI = selectLink[k].href.includes("jquery-ui.min");
        if (selectLinkUI === true) {
            console.log(selectLink[k]);
            selectLink[k].remove();
        }
    }

    for (let i = 0; i < selectScript.length; i++) {
        selectJqueryUI = selectScript[i].src.includes("jquery-ui.min");
        selectJqueryTouchPunch = selectScript[i].src.includes(
            "jquery.ui.touch-punch.js"
        );
        if (selectJqueryUI === true) {
            console.log(selectScript[i]);
            selectScript[i].remove();
        }
        if (selectJqueryTouchPunch === true) {
            console.log(selectScript[i]);
            selectScript[i].remove();
        }
    }
}

function deliveryContainerDraggable() {
    $(() => {
        $("#delivery_container").draggable();
    });
}

// fileShare();
momentShareFunc1();
// momentShareFunc2();
optionsBtn();
recodingDeviceCtrl();
remoteDisplay();
screenShareFunc();
whiteBoardFunc();
mobileReflashClose();
responsiveFunc();
copyInfo();
browserEvent();
gridView();
muteUtilsFunc();
// shareEditerFunc();--------------------- 서버에 올리면 Lisence 문제로 사용 불가능 구매해야 됨.
SwiperFunc();
fileHash();
contentFunc();
