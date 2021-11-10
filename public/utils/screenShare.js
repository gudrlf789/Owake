const screenShareBtn = document.querySelector("#shareScreen");

screenShareBtn.addEventListener("click", screenShareJoin);

async function screenShareJoin() {
    client.on("user-published", handleUserPublished);
    client.on("user-unpublished", handleUserUnpublished);

    // join a channel and create local tracks, we can use Promise.all to run them concurrently
    [options.uid, localTracks.audioTrack, localTracks.videoTrack] =
        await Promise.all([
            // join the channel
            client.join(
                options.appid,
                options.channel,
                options.token || null,
                options.uid || null
            ),
            // ** create local tracks, using microphone and screen
            //AgoraRTC.createMicrophoneAudioTrack(),
            AgoraRTC.createScreenVideoTrack(),
        ]);

    // play local video track
    localTracks.videoTrack.play(localVideoBox);
    $("#local-player-name").text(`localVideo(${options.uid})`);

    // publish local tracks to channel
    await client.publish(Object.values(localTracks));
    console.log("publish success");
}
