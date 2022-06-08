## 2022.6.6 패치노트

# CSS 수정

수정함: public/css/channel.css
수정함: public/css/channel/content.css
삭제함: public/css/channel/fileDelivery.css
수정함: public/css/channel/momentShare.css
수정함: public/css/channel/pdfShare.css
수정함: public/css/channel/settings.css
수정함: public/css/lib/bootstrap.min.css
새 파일: public/css/mainpage/create.css
새 파일: public/css/mainpage/delete.css
새 파일: public/css/mainpage/join.css
새 파일: public/css/mainpage/navbar.css
새 파일: public/css/mainpage/update.css

# SVG 추가

새 파일: public/icons/svg/cam.svg
새 파일: public/icons/svg/chat(1).svg
새 파일: public/icons/svg/chat.svg
새 파일: public/icons/svg/chat_active.svg
새 파일: public/icons/svg/check.svg
새 파일: public/icons/svg/file.svg
새 파일: public/icons/svg/file_share.svg
새 파일: public/icons/svg/file_share_active.svg
새 파일: public/icons/svg/govern(w).svg
새 파일: public/icons/svg/govern.svg
새 파일: public/icons/svg/identifire(1).svg
새 파일: public/icons/svg/identifire.svg
새 파일: public/icons/svg/identifire_active.svg
새 파일: public/icons/svg/media.svg
새 파일: public/icons/svg/media_share.svg
새 파일: public/icons/svg/media_share_active.svg
새 파일: public/icons/svg/menu_btn.svg
새 파일: public/icons/svg/mic.svg
새 파일: public/icons/svg/mobile_private_btn.svg
새 파일: public/icons/svg/mobile_public_btn.svg
새 파일: public/icons/svg/navbtn.svg
새 파일: public/icons/svg/pdf.svg
새 파일: public/icons/svg/pdf_share.svg
새 파일: public/icons/svg/pdf_share_active.svg
새 파일: public/icons/svg/screen.svg
새 파일: public/icons/svg/state (1).svg
새 파일: public/icons/svg/state (2).svg
새 파일: public/icons/svg/state (3).svg
새 파일: public/icons/svg/state (4).svg
새 파일: public/icons/svg/state (5).svg
새 파일: public/icons/svg/state (6).svg
새 파일: public/icons/svg/web.svg
새 파일: public/icons/svg/web_share.svg
새 파일: public/icons/svg/web_share_active.svg
새 파일: public/icons/svg/whiteboard(1).svg
새 파일: public/icons/svg/whiteboard.svg
새 파일: public/icons/svg/whiteboard_active.svg
새 파일: "public/icons/svg/\354\233\220.svg"

# PNG 삭제

삭제함: public/img/KronWorld.png
새 파일: public/img/mainpage/bottom-symbol.gif
새 파일: public/img/mainpage/govern(w).svg
새 파일: public/img/mainpage/govern.svg
새 파일: public/img/mainpage/logo.png
새 파일: public/img/mainpage/logo.svg
새 파일: public/img/mainpage/logo_w.svg
새 파일: public/img/mainpage/mobile-slider.png
새 파일: public/img/mainpage/navbtn.svg
새 파일: public/img/mainpage/web-slider.png

# JS 기능 수정

수정함: public/utils/channel-common.js
수정함: public/utils/parts/channel/content.js
수정함: public/utils/parts/channel/fileHash.js
수정함: public/utils/parts/channel/momentShare1.js
수정함: public/utils/parts/channel/pdfShare.js
수정함: public/utils/parts/channel/screenShare.js

# Channel UI에 맞춰서 기능 수정

수정함: public/utils/parts/channelCreate.js
수정함: public/utils/parts/channelJoin.js

# Channel List 기능 통합

삭제함: public/utils/parts/channelKronosa.js
수정함: public/utils/parts/channelList.js
새 파일: public/utils/parts/channelKronosa_back.js
새 파일: public/utils/parts/channelList_back.js

# I Govern 기능 추가

수정함: server/server.js
새 파일: public/utils/parts/igovern/backup/igovern-fileDelivery-safari.js
새 파일: public/utils/parts/igovern/backup/igovern-fileDelivery.js
새 파일: public/utils/parts/igovern/backup/igovern-fileDeliveryActivator.js
새 파일: public/utils/parts/igovern/igovern-browserEvent.js
새 파일: public/utils/parts/igovern/igovern-channelFirstSpinnerDelete.js
새 파일: public/utils/parts/igovern/igovern-chat.js
새 파일: public/utils/parts/igovern/igovern-checkIsHost.js
새 파일: public/utils/parts/igovern/igovern-content.js
새 파일: public/utils/parts/igovern/igovern-copyUrl.js
새 파일: public/utils/parts/igovern/igovern-deviceScan.js
새 파일: public/utils/parts/igovern/igovern-deviceSettings.js
새 파일: public/utils/parts/igovern/igovern-f12defense.js
새 파일: public/utils/parts/igovern/igovern-fileDelivery.js
새 파일: public/utils/parts/igovern/igovern-fileHash.js
새 파일: public/utils/parts/igovern/igovern-mobileReflashClose.js
새 파일: public/utils/parts/igovern/igovern-momentShare.js
새 파일: public/utils/parts/igovern/igovern-muteUtils.js
새 파일: public/utils/parts/igovern/igovern-pdfShare.js
새 파일: public/utils/parts/igovern/igovern-remoteDisplay.js
새 파일: public/utils/parts/igovern/igovern-responsive.js
새 파일: public/utils/parts/igovern/igovern-screenShare.js
새 파일: public/utils/parts/igovern/igovern-sessionStorage.js
새 파일: public/utils/parts/igovern/igovern-socket.js
새 파일: public/utils/parts/igovern/igovern-swiper.js
새 파일: public/utils/parts/igovern/igovern-whiteBoard.js
새 파일: public/utils/igovern-channel-common.js
새 파일: public/utils/igovernRtcClient.js
새 파일: public/utils/igovernRtmClient.js

# RTCClient 기능 추가

수정함: public/utils/rtcClient.js - client 변수에 export 추가

# EJS

삭제함: views/all.ejs
삭제함: views/businessList.ejs
삭제함: views/container/bodyContainer.ejs
수정함: views/channel.ejs
삭제함: views/channelList.ejs

수정함: views/index.ejs
수정함: views/jsparts/main-parts.ejs
수정함: views/popup/channelDelete.ejs
수정함: views/popup/channelPrivateJoin.ejs
수정함: views/popup/channelPublicCreate.ejs
수정함: views/popup/channelPublicJoin.ejs
수정함: views/popup/channelUpdate.ejs
수정함: views/popup/deviceSettings.ejs

새 파일: views/container/body.ejs
새 파일: views/container/content.ejs
새 파일: views/container/left.ejs
새 파일: views/container/selectChannel.ejs
새 파일: views/container/slider.ejs
새 파일: views/igovern-channel.ejs
새 파일: views/jsparts/igovern-channel-parts.ejs
새 파일: views/popup/channelDelete_back.ejs
새 파일: views/popup/channelPublicCreate_back.ejs
새 파일: views/popup/channelUpdate_back.ejs

# 새 기능 추가

수정함: server/server.js

새 파일: public/utils/parts/channel/audioMixingAndAudioEffect.js
새 파일: views/map.html
새 파일: public/utils/parts/map.js
