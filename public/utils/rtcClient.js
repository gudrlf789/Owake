let socket = io();
const localVideoBox = document.createElement("div");
const selectVideo = document.querySelector("video");
localVideoBox.id = "local__videoBox";
localVideoBox.className = "player";

// if (selectVideo) {
//     selectVideo.setAttribute("playsinline", "playsinline");
// }

let client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

let localTracks = {
    videoTrack: null,
    audioTrack: null,
};

let totalUsers = {};
let remoteUsers = {};

let options = {
    // appid : "8d4f054da71f427b93df3e27ca31bb54"
    appid: "e44f4580aea5429e921e3dbffaa69f33",
    // appid: "50b9cd9de2d54849a139e3db52e7928a",
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

$("#leave").click(function (e) {
    leave();
});

$(document).on("click", ".player", (e) => {
    const localUid = localVideoBox.uid;
    console.log(localUid);
    const remoteUid = e.currentTarget.id.replace("player-", "");
    let remoteTag = document.getElementById(`player-wrapper-${remoteUid}`);

    if (e.currentTarget.id != "local__videoBox") {
        totalUsers[localUid].videoTrack
            ? totalUsers[localUid].videoTrack.stop()
            : "";
        localVideoBox.remove();
        totalUsers[remoteUid].videoTrack
            ? totalUsers[remoteUid].videoTrack.stop()
            : "";

        localVideoBox.uid = remoteUid;
        remoteTag.id = `player-wrapper-${localUid}`;
        remoteTag.children[1].id = `player-${localUid}`;

        if (totalUsers[localUid].videoTrack) {
            remoteTag.children[0].textContent = `${localUid}`;
            totalUsers[localUid].videoTrack.play(`player-${localUid}`);
        } else {
            remoteTag.children[0].textContent = `${localUid}`;
            remoteTag.children[0].style.color = "white";
            remoteTag.children[1].style.backgroundRepeat = "no-repeat";
            remoteTag.children[1].style.backgroundImage =
                "url(../img/person.png)";
            remoteTag.children[1].style.backgroundSize = "contain";
        }

        $("#local-player-name").text(`${remoteUid}`);
        if (totalUsers[remoteUid].videoTrack) {
            $("#local__video__container").append(localVideoBox);
            totalUsers[remoteUid].videoTrack.play(localVideoBox);
        } else {
            localVideoBox.style.backgroundRepeat = "no-repeat";
            localVideoBox.style.backgroundImage = "url(../img/person.png)";
            localVideoBox.style.backgroundSize = "contain";
            $("#local__video__container").append(localVideoBox);
        }
    }

    if (
        localVideoBox.childNodes.length != 0 &&
        localVideoBox.childNodes[0].id
    ) {
        localVideoBox.childNodes[0].childNodes[0].style.objectFit = "contain";
    }
});

async function join() {
    // socket.on("connect", handleConnect);
    options.uid = window.sessionStorage.getItem("uid");
    options.channel = window.sessionStorage.getItem("channel");

    client.on("user-published", handleUserPublished);
    client.on("user-joined", handleUserJoined);
    client.on("user-unpublished", handleUserUnpublished);

    const checkDeskTopCamera = await AgoraRTC.getCameras();
    const checkDeskTopAudio = await AgoraRTC.getMicrophones();

    await client.join(
        options.appid,
        options.channel || window.sessionStorage.getItem("channel"),
        options.token || null,
        options.uid || window.sessionStorage.getItem("uid") || null
    );

    // 오디오 디바이스가 없을시
    if (checkDeskTopAudio.length != 0) {
        localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack(
            MicrophoneAudioTrackInitConfig
        );
    } else {
        localTracks.audioTrack = undefined;
    }

    // 카메라 디바이스가 없을시
    if (checkDeskTopCamera.length != 0) {
        localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack();
    } else {
        localTracks.videoTrack = undefined;
        localVideoBox.style.backgroundRepeat = "no-repeat";
        localVideoBox.style.backgroundImage = "url(../img/person.png)";
        localVideoBox.style.backgroundSize = "contain";
    }

    totalUsers[options.uid] = {
        audioTrack:
            checkDeskTopAudio.length != 0 ? localTracks.audioTrack : undefined,
        videoTrack:
            checkDeskTopCamera.length != 0 ? localTracks.videoTrack : undefined,
    };

    localVideoBox.uid = client.uid;
    $("#local__video__container").append(localVideoBox);

    $("#local-player-name").text(`${options.uid}`);
    if (
        localTracks.videoTrack !== undefined &&
        localTracks.audioTrack !== undefined
    ) {
        localTracks.videoTrack.play(localVideoBox);
        await client.publish(Object.values(localTracks));
    } else if (
        localTracks.videoTrack === undefined &&
        localTracks.audioTrack !== undefined
    ) {
        await client.publish(localTracks.audioTrack);
    } else if (
        localTracks.videoTrack !== undefined &&
        localTracks.audioTrack === undefined
    ) {
        localTracks.videoTrack.play(localVideoBox);
        await client.publish(localTracks.videoTrack);
    } else {
        alert("인식된 디바이스가 아무것도 없음");
    }
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
    // 로컬트랙 배경이미지 초기화
    localVideoBox.style.backgroundImage = "";
    $("#remote-playerlist").html("");

    await client.leave();
    $("#newUserModal").modal("hide");

    //세션 스토리지 clear
    window.sessionStorage.clear();

    $("#local-player-name").text("");
    $("#join").attr("disabled", false);
    $("#leave").attr("disabled", true);

    window.location.replace("/");
}

async function subscribe(user, mediaType) {
    const uid = user.uid;
    await client.subscribe(user, mediaType);
    console.log("subscribe success");

    if (mediaType === "video") {
        const player = $(`
          <div id="player-wrapper-${uid}">
            <p class="player-name">${uid}</p>
            <div id="player-${uid}" class="player" uid="${uid}"></div>
          </div>
        `);
        $("#remote-playerlist").append(player);
        user.videoTrack.play(`player-${uid}`);
    }

    if (mediaType === "audio") {
        user.audioTrack.play();
        // 카메라 장치가 없는 경우 오디오 트랙만 publish 하기 때문에
        // 아이콘 화면이 나타나게 수정
        if (!user.hasVideo && user.hasAudio) {
            const iconPlayer = $(`
                <div id="player-wrapper-${uid}">
                <p class="player-name" style="color: white">${uid}</p>
                <div id="player-${uid}" class="player" uid="${uid}" 
                    style="background-image: url('../img/person.png'); background-repeat: no-repeat; background-size: contain"></div>
                </div>
            `);
            $("#remote-playerlist").append(iconPlayer);
        }
    }
}

function revertLocalTrackToMain(leftUid) {
    const localUid = document.getElementById("local__videoBox").uid;

    if (localUid == leftUid) {
        localVideoBox.uid = options.uid;

        if (totalUsers[options.uid].videoTrack) {
            totalUsers[options.uid].videoTrack.stop();
            $("#local-player-name").text(`${options.uid}`);
            $("#local__video__container").append(localVideoBox);
            totalUsers[options.uid].videoTrack.play(localVideoBox);
        } else {
            $("#local-player-name").text(`${options.uid}`);
            localVideoBox.style.backgroundRepeat = "no-repeat";
            localVideoBox.style.backgroundImage = "url(../img/person.png)";
            localVideoBox.style.backgroundSize = "contain";
            $("#local__video__container").append(localVideoBox);
        }

        $(`#player-wrapper-${options.uid}`).remove();
    } else {
        $(`#player-wrapper-${leftUid}`).remove();
    }
}

function handleUserJoined(user) {
    const id = user.uid;
    totalUsers[id] = user;
    remoteUsers[id] = user;
}

function handleUserPublished(user, mediaType) {
    subscribe(user, mediaType);
}

function handleUserUnpublished(user) {
    const id = user.uid;
    delete totalUsers[id];
    delete remoteUsers[id];
    revertLocalTrackToMain(id);
    // socket.on("disconnect", handleDisconnect);
}

/**
 * Socket Connect
 * @anthor 전형동
 * @date 2020.02.21
 * @Description Socket Handler Func
 */

function handleConnect() {
    console.log("Connected to signaling server");

    let myPeerId = socket.id;
    console.log("My peer id [ " + myPeerId + " ]");
    joinToChannel();
}

function handleDisconnect(reason) {
    console.log("Disconnected from signaling server", { reason: reason });
}

function joinToChannel() {
    console.log("join to channel", options.channel);
    sendToServer("join", {
        channel: options.channel,
        peerId: socket.id,
        peerName: options.uid,
    });
}
async function sendToServer(msg, config = {}) {
    await socket.emit(msg, config);
}
