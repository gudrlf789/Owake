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

export const screenShareFunc = () => {
    const screenShareBtn = document.querySelector("#shareScreen");
    screenShareBtn.addEventListener("click", screenShareJoin);
};

async function screenShareJoin() {
    const screenClient = AgoraRTC.createClient({
        mode: "rtc",
        codec: "vp8",
    });

    await screenClient.join(
        options.appid,
        options.channel || window.sessionStorage.getItem("channel"),
        null,
        `${options.uid}Screen` ||
            `${window.sessionStorage.getItem("uid")}Screen`
    );

    const screenTrack = await AgoraRTC.createScreenVideoTrack(
        {
            encoderConfig: {
                frameRate: 60,
                bitrateMax: 4780,
                bitrateMin: 3150,
            },
        },
        "auto"
    );

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
}
