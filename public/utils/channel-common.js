import { mobileDisplayCtr } from "./parts/channel/chat.js";
import { f12defense } from "./parts/channel/f12defense.js";
import { fileDelivery } from "./parts/channel/fileDelivery.js";
import { fileShare } from "./parts/channel/fileShare.js";
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

// XFrameByPass
import { xFrameByPass } from "../lib/x-frame-bypass.js";

mobileDisplayCtr();
f12defense();
fileDelivery();
fileShare();
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

xFrameByPass();

// const momentShareBtn = document.querySelector("#momentShare");
// const fileShareBtn = document.querySelector("#fileShareBtn");
// const whiteBoardBtn = document.querySelector("#whiteBoard");
// const fileDeliveryBtn = document.querySelector("#fileDeliveryBtn");
// const deviceSettingBtn = document.querySelector("#deviceSettingBtn");
// const fileHashBtn = document.querySelector("#fileHashBtn");

// momentShareBtn.addEventListener("click", momentShareFunc, false);
// fileShareBtn.addEventListener("click", fileShare, false);
// whiteBoardBtn.addEventListener("click", whiteBoardFunc, false);
// fileDeliveryBtn.addEventListener("click", fileDelivery, false);
// deviceSettingBtn.addEventListener("click", recodingDeviceCtrl, false);
// fileHashBtn.addEventListener("click", fileHash, false);
