import { userName } from "./igovern-sessionStorage.js";
import { checkIsHost } from "./igovern-checkIsHost.js";

/**
 * @author 박형길
 * @version 1.1
 * @data 2022 05.09
 * @description
 * --------------- 수정사항 ---------------
 * 1. ScreenShare 취소하면 세션 에러나는 현상 수정
 */

 import { options } from "../../igovern-RtcClient.js";
 
 let openYN = "N";
 const screenShareBtn = document.querySelector("#screenShare-img");
 
 export const screenShareFunc = () => {
     const screenShareBtn = document.querySelector("#shareScreen");
     screenShareBtn.addEventListener("click", screenShareJoin);
 };
 
 async function screenShareJoin() {
    if(!checkIsHost()) {
        alert("Host Only");
        return;
    }

     if (openYN !== "N") {
         return alert("Please close screen share which is opened");
     }
 
     const screenClient = AgoraRTC.createClient({
         mode: "rtc",
         codec: "vp8",
     });
 
     await screenClient.join(
         options.appid,
         options.channel,
         options.token || null,
         `${options.uid}Screen` ||
             `${userName}Screen`
     );
     try {
         const screenTrack = await AgoraRTC.createScreenVideoTrack(
             {
                 encoderConfig: "1080p_1",
                 optimizationMode: "detail", // 영상의 품질을 우선
                 // encoderConfig: "1080p_5", // frameRate : 60, bitrateMax : 4780
                 // optimizationMode: "motion", // 영상의 부드러움을 우선
                 // screenSourceType: "screen", // 'screen', 'application', 'window'
             },
             "auto"
         );
         openYN = "Y";
         if (screenTrack[1]) {
             await screenClient.publish([screenTrack[0], screenTrack[1]]);
             screenTrack[0].on("track-ended", () => {
                 LeaveShareScreen(screenClient, screenTrack);
             });
         } else {
             await screenClient.publish(screenTrack);
             screenTrack.on("track-ended", () => {
                 LeaveShareScreen(screenClient, screenTrack);
             });
         }
 
         screenShareBtn.src = "/left/screen_a.svg";
     } catch (err) {
         console.log("Agora error: " + err);
         screenClient.leave();
     }
 }
 
 function LeaveShareScreen(screenClient, screenTrack) {
     screenClient.unpublish(screenTrack);
     if (screenTrack[1]) {
         screenTrack.map((track) => {
             track.stop();
             track.close();
         });
     } else {
         screenTrack.stop();
         screenTrack.close();
     }
 
     screenClient.leave();
     openYN = "N";
 
     screenShareBtn.src = "/left/screen.svg";
 }
 