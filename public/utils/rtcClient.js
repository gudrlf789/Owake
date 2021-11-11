const socket = io();

const localVideoBox = document.createElement("div");
localVideoBox.id = "local__videoBox local-player";
localVideoBox.className = "player";

let client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
let currentMic; // the microphone you are using
let currentCam; // the camera you are using

let localTracks = {
    videoTrack: null,
    audioTrack: null,
};

let totalUsers = {};

let remoteUsers = {};

let options = {
    appid: "50b9cd9de2d54849a139e3db52e7928a",
    channel: null,
    uid: null,
    token: null,
    role: "audience", // host or audience
};

const MicrophoneAudioTrackInitConfig = {
    AEC: true,
    ANS: true,
    AGC: false,
};

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

$("#join-form").submit(async function (e) {
    e.preventDefault();
    $("#join").attr("disabled", true);
    try {
        options.token = $("#token").val();
        options.channel = $("#channel").val();
        options.uid = $("#uid").val();
        await join();
    } catch (error) {
        console.error(error);
    } finally {
        $("#leave").attr("disabled", false);
    }
});

$("#leave").click(function (e) {
    leave();
});

$(document).on("click", ".player", (e) => {
    const localUid = document.getElementById("local__videoBox local-player").uid;
    const remoteUid = e.currentTarget.id.replace("player-","");
    let remoteTag = document.getElementById(`player-wrapper-${e.currentTarget.id.replace("player-","")}`);
    
    if(e.currentTarget.id != "local__videoBox local-player"){
        debugger;
        localTracks.videoTrack.stop();
        document.getElementById("local__videoBox local-player").remove();
        totalUsers[remoteUid].videoTrack.stop();
        
        localVideoBox.uid = remoteUid;
        remoteTag.id = `player-wrapper-${localUid}`;
        remoteTag.children[0].textContent = `remoteUser(${localUid})`
        remoteTag.children[1].id = `player-${localUid}`;
        totalUsers[localUid].videoTrack.play(`player-${localUid}`);

        $("#local-player-name").text(`localVideo(${remoteUid})`);
        $("#local__video__container").append(localVideoBox);
        totalUsers[remoteUid].videoTrack.play(localVideoBox);
    }
});

socket.on("input_address", (address) => {
    const momentShare = document.getElementById("momentShare-iframe");
    momentShare.src = `https://${address}`;
});

async function join() {
    client.on("user-published", handleUserPublished);
    client.on("user-joined", handleUserJoined);
    client.on("user-unpublished", handleUserUnpublished);
    socket.emit("join-room", options.channel);

    [options.uid, localTracks.audioTrack, localTracks.videoTrack] =
        await Promise.all([
            client.join(
                options.appid,
                options.channel,
                options.token || null,
                options.uid || null
            ),
            AgoraRTC.createMicrophoneAudioTrack(MicrophoneAudioTrackInitConfig),
            AgoraRTC.createCameraVideoTrack(),
        ]);

    totalUsers[options.uid] = {
        audioTrack : localTracks.audioTrack,
        videoTrack : localTracks.videoTrack
    };
    
    localVideoBox.uid = client.uid;
    $("#local__video__container").append(localVideoBox);

    localTracks.videoTrack.play(localVideoBox);

    $("#local-player-name").text(`localVideo(${options.uid})`);

    await client.publish(Object.values(localTracks));
    console.log("publish success");
}

async function leave() {
    for (trackName in localTracks) {
        var track = localTracks[trackName];
        if (track) {
            track.stop();
            track.close();
            localTracks[trackName] = undefined;
        }
    }

    localTracks = {};
    remoteUsers = {};
    totalUsers = {};
    $("#remote__video__container").html("");

    await client.leave();

    $("#local-player-name").text("");
    $("#join").attr("disabled", false);
    $("#leave").attr("disabled", true);
    //$("#device-wrapper").css("display", "none");
    console.log("client leaves channel success");
}

async function subscribe(user, mediaType) {
    const uid = user.uid;
    await client.subscribe(user, mediaType);
    console.log("subscribe success");

    if (mediaType === "video") {
        const player = $(`
          <div id="player-wrapper-${uid}">
            <p class="player-name">remoteUser(${uid})</p>
            <div id="player-${uid}" class="player" uid="${uid}"></div>
          </div>
        `);
        $("#remote-playerlist").append(player);
        user.videoTrack.play(`player-${uid}`);
    }

    if (mediaType === "audio") {
        user.audioTrack.play();
    }
}

function handleUserPublished(user, mediaType) {
    const id = user.uid;
    totalUsers[id] = user;
    remoteUsers[id] = user;
    subscribe(user, mediaType);
}

function handleUserUnpublished(user) {
    const id = user.uid;
    delete totalUsers[id];
    delete remoteUsers[id];
    $(`#player-wrapper-${id}`).remove();
}

function handleUserJoined(user, mediaType) {
    const id = user.uid;
    totalUsers[id] = user;
    remoteUsers[id] = user;
    subscribe(user, mediaType);
}
