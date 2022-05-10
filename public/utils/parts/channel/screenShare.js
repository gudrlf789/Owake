/**
 * @author 전형동
 * @version 1.1
 * @data 2022 03.24
 * @description
 * --------------- 수정사항 ---------------
 * 1. rtcClient.js options 객체 추가
 * 2. 함수 위치 재배치
 */

import { options } from "../../rtcClient.js";

let openYN = "N";

export const screenShareFunc = () => {
    const screenShareBtn = document.querySelector("#shareScreen");
    screenShareBtn.addEventListener("click", screenShareJoin);
};

async function screenShareJoin() {
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
            `${window.sessionStorage.getItem("uid")}Screen`
    );
    try {
        const screenTrack = await AgoraRTC.createScreenVideoTrack(
            {
                encoderConfig: {
                    frameRate: 60,
                    bitrateMax: 4780,
                    bitrateMin: 3150,
                },
                // encoderConfig: "1080p_5", // frameRate : 60, bitrateMax : 4780
                // optimizationMode: "detail",   // 영상의 품질을 우선
                optimizationMode: "motion", // 영상의 부드러움을 우선
                screenSourceType: "screen", // 'screen', 'application', 'window'
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
    }catch(err){
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
}
