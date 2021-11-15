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
    await screenClient.join(options.appid, options.channel || window.sessionStorage.getItem("channel"), null, `${options.uid}Screen` || `${window.sessionStorage.getItem("uid")}Screen`);
    
    const screenTrack = await AgoraRTC.createScreenVideoTrack();
    await screenClient.publish(screenTrack);
    screenTrack.on("track-ended", () => {
        LeaveShareScreen(screenClient, screenTrack);
    });
}