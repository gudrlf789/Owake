const socket = io();

const localVideoBox = document.createElement("div");
localVideoBox.id = "local__videoBox local-player";
localVideoBox.className = "player";

let client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

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
};

const MicrophoneAudioTrackInitConfig = {
    AEC: true,
    ANS: true,
    AGC: false,
};

$(async () => {
    // 새로고침시에 세션스토리지에 값이 저장되었는지 확인 후
    // 값이 존재하면 해당 채널, uid  값으로 재접속
    if (window.sessionStorage.length != 0) {
        await join();
    }
});

$(() => {
    if (options.appid && options.channel) {
        $("#join-form").submit();
    }
});

$("#join-form").submit(async function (e) {
    e.preventDefault();
    const nickname = $("#uid").val();
    const korean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
    if (korean.test(nickname)) {
        return alert("You can only type in English.");
    } else {
        $("#join").attr("disabled", true);
        try {
            options.token = $("#token").val();
            options.channel = $("#channel").val();
            options.uid = nickname;
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
        remoteTag.children[0].textContent = `user: ${localUid}`;
        remoteTag.children[1].id = `player-${localUid}`;
        totalUsers[localUid].videoTrack.play(`player-${localUid}`);

        $("#local-player-name").text(`user: ${remoteUid}`);
        $("#local__video__container").append(localVideoBox);
        totalUsers[remoteUid].videoTrack.play(localVideoBox);
    }

    if (localVideoBox.childNodes[0].id.includes(options.uid)) {
        localVideoBox.childNodes[0].childNodes[0].style.objectFit = "contain";
    }
});

socket.on("input_address", (address) => {
    const momentShare = document.getElementById("momentShare-iframe");
    momentShare.src = `https://${address.replace(
        /^(https?:\/\/)?(www\.)?/,
        ""
    )}`;
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
                options.uid || window.sessionStorage.getItem("uid") || null
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
    } else {
        $("#join").attr("disabled", true);
        $("#leave").attr("disabled", false);
    }

    localVideoBox.uid = client.uid;
    $("#local__video__container").append(localVideoBox);

    localTracks.videoTrack.play(localVideoBox);

    $("#local-player-name").text(`user: ${options.uid}`);

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

    $("#remote-playerlist").html("");

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
            <p class="player-name">user: ${uid}</p>
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

function revertLocalTrackToMain(leftUid) {
    const localUid = document.getElementById(
        "local__videoBox local-player"
    ).uid;

    if (localUid == leftUid) {
        localVideoBox.uid = options.uid;
        totalUsers[options.uid].videoTrack.stop();
        $("#local-player-name").text(`user: ${options.uid}`);
        $("#local__video__container").append(localVideoBox);
        totalUsers[options.uid].videoTrack.play(localVideoBox);

        $(`#player-wrapper-${options.uid}`).remove();
    } else {
        $(`#player-wrapper-${leftUid}`).remove();
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

    revertLocalTrackToMain(id);
}
