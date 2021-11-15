const socket = io();

const localVideoBox = document.createElement("div");
localVideoBox.id = "local__videoBox local-player";
localVideoBox.className = "player";

let client = AgoraRTC.createClient({ mode: "rtc", codec: "h264" });

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
    nickName: null,
};

const MicrophoneAudioTrackInitConfig = {
    AEC: true,
    ANS: true,
    AGC: false,
};

$(document).ready(async () => {
    // 새로고침시에 세션스토리지에 값이 저장되었는지 확인 후
    // 값이 존재하면 해당 채널, uid  값으로 재접속
    if (window.sessionStorage.length != 0) {
        await join();
    }
});

$(() => {
    if (location.protocol === "http:") {
        if (location.href == "http://localhost:1227/") {
            joinConfig();
        } else {
            location.replace(
                `https:${location.href.substring(location.protocol.length)}`
            );
            joinConfig();
        }
    } else {
        joinConfig();
    }
});

function joinConfig() {
    if (options.appid && options.channel) {
        $("#join-form").submit();
    }
}

$("#join-form").submit(async function (e) {
    e.preventDefault();
    options.nickName = $("#uid").val();
    options.uid = Number($("#uid").val());
    const korean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
    if (!Number($("#uid").val())) {
        return alert("You can only type in Number");
    } else {
        $("#join").attr("disabled", true);
        try {
            options.channel = $("#channel").val();
            await join();
        } catch (error) {
            console.error(error);
        } finally {
            $("#leave").attr("disabled", false);
        }
    }
});

$("#leave").click(function (e) {
    leave();
});

$(document).on("click", ".player", (e) => {
    const localUid = document.getElementById(
        "local__videoBox local-player"
    ).uid;
    const remoteUid = e.currentTarget.id.replace("player-", "");
    let remoteTag = document.getElementById(`player-wrapper-${remoteUid}`);

    if (e.currentTarget.id != "local__videoBox local-player") {
        totalUsers[localUid].videoTrack.stop();
        document.getElementById("local__videoBox local-player").remove();
        totalUsers[remoteUid].videoTrack.stop();

        localVideoBox.uid = remoteUid;

        remoteTag.id = `player-wrapper-${localUid}`;
        remoteTag.children[0].textContent = `remoteUser(${localUid})`;
        remoteTag.children[1].id = `player-${localUid}`;
        totalUsers[localUid].videoTrack.play(`player-${localUid}`);

        //$("#local-player-name").text(`Nickname : (${remoteUid})`);
        $("#local-player-name").text(`Nickname : ${options.nickName}`);
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
    client.on("user-unpublished", handleUserUnpublished);
    socket.emit("join-room", options.channel);

    [options.uid, localTracks.audioTrack, localTracks.videoTrack] =
        await Promise.all([
            client.join(
                options.appid,
                options.channel || window.sessionStorage.getItem("channel"),
                options.token || null,
                options.uid || window.sessionStorage.getItem("uid") || null,
                options.nickName ||
                    window.sessionStorage.getItem("nickname") ||
                    null
            ),
            AgoraRTC.createMicrophoneAudioTrack(MicrophoneAudioTrackInitConfig),
            AgoraRTC.createCameraVideoTrack(),
        ]);

    totalUsers[options.uid] = {
        audioTrack: localTracks.audioTrack,
        videoTrack: localTracks.videoTrack,
    };

    //처음 트랙 생성시 채널,uid 값 세션 스토리지에 저장
    if (window.sessionStorage.length == 0) {
        window.sessionStorage.setItem("channel", options.channel);
        window.sessionStorage.setItem("uid", options.uid);
        window.sessionStorage.setItem("nickname", options.nickName);
    } else {
        $("#join").attr("disabled", true);
        $("#leave").attr("disabled", false);
    }

    localVideoBox.uid = client.uid;
    $("#local__video__container").append(localVideoBox);
    localTracks.videoTrack.play(localVideoBox);
    $("#local-player-name").text(`Nickname : ${options.uid}`);

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
    //세션 스토리지 clear
    window.sessionStorage.clear();

    $("#local-player-name").text("");
    $("#join").attr("disabled", false);
    $("#leave").attr("disabled", true);

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
