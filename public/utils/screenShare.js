const screenShareBtn = document.getElementById("shareScreen");

screenShareBtn.addEventListener("click", screenShareJoin);

function LeaveShareScreen(screenClient, screenTrack) {
    screenClient.unpublish(screenTrack);
    screenTrack.stop();
    screenTrack.close();
    screenClient.leave();
}

async function screenShareJoin() {
    const screenClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    await screenClient.join(
        options.appid,
        options.channel || window.sessionStorage.getItem("channel"),
        null,
        `${options.uid}Screen` ||
            `${window.sessionStorage.getItem("uid")}Screen`
    );

    const screenTrack = await AgoraRTC.createScreenVideoTrack({
        streamID: options.uid,
        audio: false,
        video: false,
        screen: true,
        mediaSource: "screen", // 'screen', 'application', 'window'
    });

    await screenClient.publish(screenTrack);

    const videoScreenID = document.getElementById(
        `player-${options.uid}Screen`
    );
    console.log("videoScreenID::::::::::::::::" + videoScreenID);

    screenTrack.on("track-ended", () => {
        LeaveShareScreen(screenClient, screenTrack);
    });
}
