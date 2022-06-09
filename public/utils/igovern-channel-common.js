import socket from "./parts/igovern/igovern-socket.js";

import { channelFirstSpinnerDeleteFunc } from "./parts/igovern/igovern-channelFirstSpinnerDelete.js";
import { mobileDisplayCtr } from "./parts/igovern/igovern-chat.js";
import { f12defense } from "./parts/igovern/igovern-f12defense.js";
import { fileDelivery } from "./parts/igovern/igovern-fileDelivery.js";
import { momentShareFunc } from "./parts/igovern/igovern-momentShare.js";
import { muteUtilsFunc } from "./parts/igovern/igovern-muteUtils.js";
import { recodingDeviceCtrl } from "./parts/igovern/igovern-deviceSettings.js";
import { remoteDisplay } from "./parts/igovern/igovern-remoteDisplay.js";
import { screenShareFunc } from "./parts/igovern/igovern-screenShare.js";
import { whiteBoardFunc } from "./parts/igovern/igovern-whiteBoard.js";
import { mobileReflashClose } from "./parts/igovern/igovern-mobileReflashClose.js";
import { responsiveFunc } from "./parts/igovern/igovern-responsive.js";
import { copyInfo } from "./parts/igovern/igovern-copyUrl.js"; //
import { browserEvent } from "./parts/igovern/igovern-browserEvent.js";
import { SwiperFunc } from "./parts/igovern/igovern-swiper.js";
import { fileHash } from "./parts/igovern/igovern-fileHash.js";
import { contentFunc } from "./parts/igovern/igovern-content.js";
import { pdfFunc } from "./parts/igovern/igovern-pdfShare.js";
import { channelName } from "./parts/igovern/igovern-sessionStorage.js"; 
import { audioMixingAndAudioEffect } from "./parts/igovern/igovern-audioMixingAndAudioEffect.js";

export function closeSocketInstance () {
    socket.emit("igovern-leave-channel", channelName);
};

$(() => {
    channelFirstSpinnerDeleteFunc();
    mobileDisplayCtr();
    f12defense();
    SwiperFunc();
    remoteDisplay();
    responsiveFunc();
    copyInfo();
    mobileReflashClose();
    recodingDeviceCtrl();
    screenShareFunc();
    browserEvent();
    muteUtilsFunc();
    fileDelivery(socket);
    momentShareFunc(socket);
    whiteBoardFunc(socket);
    fileHash(socket);
    contentFunc(socket);
    pdfFunc(socket);
    audioMixingAndAudioEffect(socket)
});