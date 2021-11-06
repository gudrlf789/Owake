const remoteVideoBox = document.createElement("div");
remoteVideoBox.id = "remote__videoBox";

let client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

/*
 * Clear the video and audio tracks used by `client` on initiation.
 */
let localTracks = {
    videoTrack: null,
    audioTrack: null,
};

/*
 * On initiation no users are connected.
 */
let remoteUsers = {};

/*
 * On initiation. `client` is not attached to any project or channel for any specific user.
 */
let options = {
    appid: "50b9cd9de2d54849a139e3db52e7928a",
    channel: null,
    uid: null,
    token: null,
};

/*
 * When this page is called with parameters in the URL, this procedure
 * attempts to join a Video Call channel using those parameters.
 */
$(() => {
    let urlParams = new URL(location.href).searchParams;

    options.channel = urlParams.get("channel");
    options.token = urlParams.get("token");
    options.uid = urlParams.get("uid");
    if (options.appid && options.channel) {
        $("#uid").val(options.uid);

        $("#token").val(options.token);
        $("#channel").val(options.channel);
        $("#join-form").submit();
    }
});

/*
 * When a user clicks Join or Leave in the HTML form, this procedure gathers the information
 * entered in the form and calls join asynchronously. The UI is updated to match the options entered
 * by the user.
 */
$("#join-form").submit(async function (e) {
    e.preventDefault();
    $("#join").attr("disabled", true);
    try {
        options.token = $("#token").val();
        options.channel = $("#channel").val();
        options.uid = Number($("#uid").val());
        await join();
    } catch (error) {
        console.error(error);
    } finally {
        $("#leave").attr("disabled", false);
    }
});

/*
 * Called when a user clicks Leave in order to exit a channel.
 */
$("#leave").click(function (e) {
    leave();
});

/*
 * Join a channel, then create local video and audio tracks and publish them to the channel.
 */
async function join() {
    // Add an event listener to play remote tracks when remote user publishes.
    client.on("user-published", handleUserPublished);
    client.on("user-unpublished", handleUserUnpublished);

    // Join a channel and create local tracks. Best practice is to use Promise.all and run them concurrently.
    [options.uid, localTracks.audioTrack, localTracks.videoTrack] =
        await Promise.all([
            // Join the channel.
            client.join(
                options.appid,
                options.channel,
                options.token || null,
                options.uid || null
            ),
            // Create tracks to the local microphone and camera.
            AgoraRTC.createMicrophoneAudioTrack(),
            AgoraRTC.createCameraVideoTrack(),
        ]);

    // Play the local video track to the local browser and update the UI with the user ID.
    const localPlayerName = $(
        `<p id="local-player-name" class="player-name"></p>`
    );

    localTracks.videoTrack.play("local__video__container");

    $("#local-player-name").text(`localVideo(${options.uid})`);

    // Publish the local video and audio tracks to the channel.
    await client.publish(Object.values(localTracks));
    console.log("publish success");
}

/*
 * Stop all local and remote tracks then leave the channel.
 */
async function leave() {
    for (trackName in localTracks) {
        var track = localTracks[trackName];
        if (track) {
            track.stop();
            track.close();
            localTracks[trackName] = undefined;
        }
    }

    // Remove remote users and player views.
    remoteUsers = {};
    $("#remote__video__container").html("");

    // leave the channel
    await client.leave();

    $("#local-player-name").text("");
    $("#join").attr("disabled", false);
    $("#leave").attr("disabled", true);
    console.log("client leaves channel success");
}

/*
 * Add the local use to a remote channel.
 *
 * @param  {IAgoraRTCRemoteUser} user - The {@link  https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/iagorartcremoteuser.html| remote user} to add.
 * @param {trackMediaType - The {@link https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/itrack.html#trackmediatype | media type} to add.
 */
async function subscribe(user, mediaType) {
    const uid = user.uid;
    // subscribe to a remote user
    await client.subscribe(user, mediaType);
    console.log("subscribe success");

    $("#remote__video__container").append(remoteVideoBox);

    if (mediaType === "video") {
        user.videoTrack.play(remoteVideoBox);
    }

    if (mediaType === "audio") {
        user.audioTrack.play();
    }
}

/*
 * Add a user who has subscribed to the live channel to the local interface.
 *
 * @param  {IAgoraRTCRemoteUser} user - The {@link  https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/iagorartcremoteuser.html| remote user} to add.
 * @param {trackMediaType - The {@link https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/itrack.html#trackmediatype | media type} to add.
 */
function handleUserPublished(user, mediaType) {
    const id = user.uid;
    remoteUsers[id] = user;
    subscribe(user, mediaType);
}

/*
 * Remove the user specified from the channel in the local interface.
 *
 * @param  {string} user - The {@link  https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/iagorartcremoteuser.html| remote user} to remove.
 */
function handleUserUnpublished(user) {
    const id = user.uid;
    delete remoteUsers[id];
    $(`#player-wrapper-${id}`).remove();
}
