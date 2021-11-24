const screenShareBtn = document.getElementById("shareScreen");

screenShareBtn.addEventListener("click", screenShareJoin);

let screenTrack;

let screenTracks = {
    screenVideoTrack: null,
    screenAudioTrack: null,
    audioTrack: null,
};

function LeaveShareScreen(screenClient, screenTrack) {
    screenClient.unpublish(screenTrack);
    screenTrack.stop();
    screenTrack.close();
    screenClient.leave();
}

async function screenShareJoin() {
    const screenClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

    [options.uid, screenTracks.audioTrack, screenTrack] = await Promise.all([
        // join the channel
        screenClient.join(
            options.appid,
            options.channel || window.sessionStorage.getItem("channel"),
            null,
            `${options.uid}Screen` ||
                `${window.sessionStorage.getItem("uid")}Screen`
        ),
        // ** create local tracks, using microphone and screen
        AgoraRTC.createMicrophoneAudioTrack(),
        AgoraRTC.createScreenVideoTrack(
            {
                encoderConfig: {
                    framerate: 15,
                    height: 720,
                    width: 1280,
                },
            },
            "auto"
        ),
    ]);

    if (screenTrack instanceof Array) {
        screenTracks.screenVideoTrack = screenTrack[0];
        screenTracks.screenAudioTrack = screenTrack[1];
    } else {
        screenTracks.screenVideoTrack = screenTrack;
    }

    if (screenTracks.screenAudioTrack == null) {
        await screenClient.publish([
            screenTracks.screenVideoTrack,
            screenTracks.audioTrack,
        ]);
    } else {
        await screenClient.publish([
            screenTracks.screenVideoTrack,
            screenTracks.audioTrack,
            screenTracks.screenAudioTrack,
        ]);
    }
    console.log("publish Success");

    screenTracks.screenVideoTrack.on("track-ended", () => {
        LeaveShareScreen(screenClient, screenTracks.screenVideoTrack);
    });
}
