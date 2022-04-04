/**
 * @author 전형동
 * @version 1.1
 * @data 2022 03.24
 * @description
 * --------------- 수정사항 ---------------
 * 1. 트랙 중복되는 현상은 오디오 트랙이 원인으로 추정됨.
 * 해당 함수는 주석처리함 // 197번째 줄
 * 2. 레이아웃 그리드 기능 추가
 * 3. 카메라 스위칭 기능 추가 // cameraSwitchEnableFunc
 * 4. 카메라 위치반전 기능 추가 // videoTransformAction
 */

import { socketInitFunc } from "./parts/channel/socket.js";

const socket = socketInitFunc();
export const localVideoBox = document.createElement("div");
const localVideoContainer = document.querySelector("#local__video__container");
const selectVideo = document.querySelector("video");
localVideoBox.id = "local__videoBox";
localVideoBox.className = "player";

if (selectVideo) {
    selectVideo.setAttribute("playsinline", "playsinline");
    selectVideo.muted = true;
    selectVideo.volume = 0;
}

localVideoContainer.className = "grid-off";

let client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

export let localTracks = {
    videoTrack: null,
    audioTrack: null,
};

export let totalUsers = {};
export let options = {
    appid: appID,
    channel: null,
    uid: null,
    token: null,
    accountName: null,
};

let MicrophoneAudioTrackInitConfig = {
    AEC: true,
    ANS: true,
    AGC: false,
};

$(async () => {
    // 새로고침시에 세션스토리지에 값이 저장되었는지 확인 후
    // 값이 존재하면 해당 채널, uid  값으로 재접속
    if (window.sessionStorage.length != 0) {
        socket.on("connect", handleConnect);
        await join();
    }
});

$("#leave").click(function (e) {
    const reqData = {
        channelType: window.sessionStorage.getItem("channelType"),
        channelName: window.sessionStorage.getItem("channel"),
        userId: window.sessionStorage.getItem("uid"),
    };

    axios.post("/channel/removeUserNameOnChannel", reqData).then((res) => {
        if (res.data.success) {
            leave();
        } else {
            alert(res.data.error);
        }
    });
});

async function join() {
    options.uid = window.sessionStorage.getItem("uid");
    options.channel = window.sessionStorage.getItem("channel");

    client.on("user-published", handleUserPublished);
    client.on("user-joined", handleUserJoined);
    client.on("user-unpublished", handleUserUnpublished);

    const checkDeskTopCamera = await AgoraRTC.getCameras();
    const checkDeskTopAudio = await AgoraRTC.getMicrophones();

    await client.join(
        options.appid,
        options.channel,
        options.token || null,
        options.uid
    );

    // // 오디오 디바이스가 없을시
    if (checkDeskTopAudio.length != 0) {
        localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack(
            MicrophoneAudioTrackInitConfig
        );
    } else {
        localTracks.audioTrack = undefined;
    }

    // 카메라 디바이스가 없을시
    /**
     * @another 전형동
     * @date 20220225
     * @description
     * 카메라 인코딩 적용
     * 1080p을 적용시켜보았으나 데이터 전송속도가 너무 느렸음.
     * 720p_1로 지켜볼 예정
     */

    if (checkDeskTopCamera.length != 0) {
        localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack({
            optimizationMode: "motion",
            encoderConfig: "720p_1",
        });
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

    videoTransformAction();
}

async function leave() {
    let trackName;
    for (trackName in localTracks) {
        let track = localTracks[trackName];
        if (track) {
            track.stop();
            track.close();
            localTracks[trackName] = undefined;
        }
    }

    localTracks = {};
    totalUsers = {};
    // 로컬트랙 배경이미지 초기화
    localVideoBox.style.backgroundImage = "";
    $("#remote-playerlist").html("");

    await client.leave();

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

        // if (!user.hasVideo && user.hasAudio) {
        if (!user.hasVideo) {
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

    cameraResidue();
}

function revertLocalTrackToMain(leftUid) {
    if (localVideoBox) {
        const localUid = localVideoBox.uid;
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
}

function handleUserJoined(user) {
    const id = user.uid;
    totalUsers[id] = user;
}

function handleUserPublished(user, mediaType) {
    subscribe(user, mediaType);
}

function handleUserUnpublished(user) {
    const id = user.uid;
    delete totalUsers[id];
    revertLocalTrackToMain(id);

    socket.on("disconnect", handleDisconnect);
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

    // let userList = Object.keys(totalUsers);
    // console.log("Connected user list ", userList);

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

/**
 * Video Transform Action
 * @anthor 전형동
 * @date 2020.02.25
 * @Description
 * LocalVideo 서치 후 Transform 스타일 180도 변경
 */

function videoTransformAction() {
    if (
        localVideoBox.childNodes.length != 0 &&
        localVideoBox.childNodes[0].id
    ) {
        if (localVideoBox.childNodes[0].id.includes("Screen")) {
            localVideoBox.childNodes[0].childNodes[0].style.objectFit =
                "contain";
        } else if (
            localVideoBox.childNodes[0].className.includes("back") ||
            document
                .querySelector("#local-player-name")
                .className.includes("back")
        ) {
            localVideoBox.childNodes[0].childNodes[0].style.setProperty(
                "transform",
                "rotateY(180deg)"
            );
        } else if (
            localVideoBox.childNodes[0].childNodes[0] !==
            document.querySelector("li")
        ) {
            localVideoBox.childNodes[0].childNodes[0].style.objectFit = "cover";
            localVideoBox.childNodes[0].childNodes[0].style.setProperty(
                "transform",
                "rotateY(180deg)"
            );
        } else {
            return;
        }
    }
}

/**
 * @author 전형동
 * @date 2022 03 20
 * @description
 * 카메라 스위칭 이벤트
 * Grid mode 시에 카메라 스위칭이 진행되지 않도록 설정
 */

$(document).on("click", ".player", (e) => {
    if (localVideoContainer.className === "grid-off") {
        cameraSwitchEnableFunc(e);
    } else {
        cameraSwitchDisableFunc(e);
    }
});

function cameraSwitchEnableFunc(e) {
    const localUid = localVideoBox.uid;
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

    // Video 화면회전
    videoTransformAction();
}

function cameraSwitchDisableFunc(e) {
    e.preventDefault();
    e.stopPropagation();
}

/**
 * @author 전형동
 * @date 2022 03 31
 * @description
 * 카메라 트랙 컨테이너 찌꺼기 삭제 함수
 */

function cameraResidue() {
    const playerTag = $(`#player-wrapper-${options.uid}`);
    $(document).on(`#player-wrapper-${options.uid}`),
        () => {
            if (
                playerTag.find("video") === null ||
                playerTag.find("video") === undefined ||
                playerTag.find("video") === "" ||
                !playerTag.find("video") ||
                playerTag.find("img") === null ||
                playerTag.find("img") === undefined ||
                playerTag.find("img") === "" ||
                !playerTag.find("img")
            ) {
                playerTag.remove();
            }
        };
}
