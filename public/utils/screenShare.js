const screenShareBtn = document.querySelector("#shareScreen");

screenShareBtn.addEventListener("click", screenShareJoin);

async function screenShareJoin() {
    const screenClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

    await screenClient.join(options.appid, options.channel, null);
    socket.emit("join_room", options.channel);

    const screenTrack = await AgoraRTC.createScreenVideoTrack({
        streamID: options.uid,
        audio: false,
        video: false,
        screen: true,
        mediaSource: "screen", // 'screen', 'application', 'window'
    });
    await screenClient.publish(screenTrack);
    screenTrack.on("track-ended", () => {
        LeaveShareScreen(screenClient, screenTrack);
    });
}

function LeaveShareScreen(screenClient, screenTrack) {
    screenClient.unpublish(screenTrack);
    screenTrack.stop();
    screenTrack.close();
    screenClient.leave();
}
