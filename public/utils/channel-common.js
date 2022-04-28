import { mobileDisplayCtr } from "./parts/channel/chat.js";
import { f12defense } from "./parts/channel/f12defense.js";
import { fileDelivery } from "./parts/channel/fileDelivery.js";
import { fileDeliverySafari } from "./parts/channel/fileDelivery-safari.js";
// P2P 개발할 때까지 중단
// import { fileShare } from "./parts/channel/fileShare.js";
import { momentShareFunc } from "./parts/channel/momentShare.js";
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

mobileDisplayCtr();
f12defense();

let isSafari =
    /constructor/i.test(window.HTMLElement) ||
    (function (p) {
        return p.toString() === "[object SafariRemoteNotification]";
    })(
        !window["safari"] ||
            (typeof safari !== "undefined" && safari.pushNotification)
    );

if (!isSafari) {
    fileDeliveryBtn.addEventListener("click", fileDelivery, false);
} else {
    fileDeliveryBtn.addEventListener("click", fileDeliverySafari, false);
}

// fileShare();
momentShareFunc();
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
