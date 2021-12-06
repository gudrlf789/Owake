import { screenShareFunc } from "./parts/screenShare.js";
import { remoteDisplay } from "./parts/remoteDisplay.js";
import { mobileDisplayCtr } from "./parts/chat.js";
import { f12defender } from "./parts/f12defense.js";
import { fileShare } from "./parts/fileShare.js";
import { momentShare } from "./parts/momentShare.js";
import { muteOptions } from "./parts/muteUtils.js";
import { optionsBtnFunc } from "./parts/options-btn.js";
import { deviceSettings } from "./parts/recodingDeviceCtrl.js";

screenShareFunc();
remoteDisplay();
mobileDisplayCtr();
f12defender();
fileShare();
momentShare();
muteOptions();
optionsBtnFunc();
deviceSettings();
