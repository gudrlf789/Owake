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
    appid: "8d4f054da71f427b93df3e27ca31bb54",
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
        totalUsers[localUid].videoTrack
            ? totalUsers[localUid].videoTrack.stop()
            : "";
        document.getElementById("local__videoBox local-player").remove();
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

    const checkDeskTopCamera = await AgoraRTC.getCameras();

    options.uid = await client.join(
        options.appid,
        options.channel || window.sessionStorage.getItem("channel"),
        options.token || null,
        options.uid || window.sessionStorage.getItem("uid") || null
    );

    localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack(
        MicrophoneAudioTrackInitConfig
    );

    if (checkDeskTopCamera.length != 0) {
        localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack();
    } else {
        localTracks.videoTrack = undefined;
        localVideoBox.style.backgroundRepeat = "no-repeat";
        localVideoBox.style.backgroundImage = "url(../img/person.png)";
        localVideoBox.style.backgroundSize = "contain";
    }

    totalUsers[options.uid] = {
        audioTrack: localTracks.audioTrack,
        videoTrack:
            checkDeskTopCamera.length != 0 ? localTracks.videoTrack : undefined,
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

    if (localTracks.videoTrack) {
        $("#local-player-name").text(`${options.uid}`);
        localTracks.videoTrack.play(localVideoBox);
        await client.publish(Object.values(localTracks));
    } else {
        $("#local-player-name").text(`${options.uid}`);
        await client.publish(localTracks.audioTrack);
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
    socket.emit("leave-room", options.channel);

    //세션 스토리지 clear
    window.sessionStorage.clear();

    $("#local-player-name").text("");
    $("#join").attr("disabled", false);
    $("#leave").attr("disabled", true);
}

async function subscribe(user, mediaType) {
    const uid = user.uid;
    await client.subscribe(user, mediaType);

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
    const localUid = document.getElementById(
        "local__videoBox local-player"
    ).uid;

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
