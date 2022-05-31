/**
 * @author 전형동
 * @version 1.1
 * @data 2022 03.24
 * @description
 * --------------- 수정사항 ---------------
 * 1. Mute 함수 위치 재배치
 * 2. rtcClient에서 각 객체들 불러옴
 */

import { localTracks, totalUsers, options } from "../../rtcClient.js";
import { deviceScan } from "./deviceScan.js";

const videoIcon = document.getElementById("videoIcon");
const audioIcon = document.getElementById("audioIcon");
const audioBtn = document.querySelector("#muteAudio");
const videoBtn = document.querySelector("#muteVideo");

// 초기값
audioIcon.style.setProperty("color", "##e07478");
videoIcon.style.setProperty("color", "#e07478");

let event = deviceScan();

let muteActive = false;
let muteState;

let localTrackState = {
    videoTrackMuted: false,
    audioTrackMuted: false,
};

export const muteUtilsFunc = () => {
    $(async () => {
        setTimeout(() => {
            muteStart();
        }, 3000);
    });

    function muteStart() {
        muteActive = true;
        muteVideo(muteActive);
        muteAudio(muteActive);
    }

    audioBtn.addEventListener("click", (e) => {
        if (!localTrackState.audioTrackMuted) {
            muteActive = true;
            muteAudio(muteActive);
            alert("audio mute activation");
        } else {
            muteActive = false;
            unmuteAudio(muteActive);
            alert("audio unmute activation");
        }
    });

    videoBtn.addEventListener("click", (e) => {
        if (!localTrackState.videoTrackMuted) {
            muteActive = true;
            muteVideo(muteActive);
            alert("video mute activation");
        } else {
            muteActive = false;
            unmuteVideo(muteActive);
            alert("video unmute activation");
        }
    });
};

async function muteAudio(mute) {
    if (!localTracks.audioTrack) return;

    if (mute === true) {
        localTrackState.audioTrackMuted = true;
        totalUsers[
            options.uid
        ].audioTrack._originMediaStreamTrack.enabled = false;
        // totalUsers[options.uid].audioTrack.setMuted(true);
        // totalUsers[options.uid].audioTrack.setEnabled(false);
        audioIcon.className = "fa fa-microphone";
        audioIcon.style.setProperty("color", "#fff");
    }
}

async function unmuteAudio(mute) {
    if (!localTracks.audioTrack) return;

    if (mute === false) {
        localTrackState.audioTrackMuted = false;
        totalUsers[
            options.uid
        ].audioTrack._originMediaStreamTrack.enabled = true;
        // totalUsers[options.uid].audioTrack.setMuted(false);
        // totalUsers[options.uid].audioTrack.setEnabled(true);
        audioIcon.className = "fa fa-microphone";
        audioIcon.style.setProperty("color", "#e07478");
    }
}

async function muteVideo(mute) {
    if (!localTracks.videoTrack) return;

    if (mute === true) {
        localTrackState.videoTrackMuted = true;
        totalUsers[
            options.uid
        ].videoTrack._originMediaStreamTrack.enabled = false;
        // totalUsers[options.uid].videoTrack.setMuted(true);
        // totalUsers[options.uid].videoTrack.setEnabled(false);
        videoIcon.className = "fas fa-video";
        videoIcon.style.setProperty("color", "#fff");
    }
}

async function unmuteVideo(mute) {
    if (!localTracks.videoTrack) return;

    if (mute === false) {
        localTrackState.videoTrackMuted = false;
        totalUsers[
            options.uid
        ].videoTrack._originMediaStreamTrack.enabled = true;
        // totalUsers[options.uid].videoTrack.setMuted(false);
        // totalUsers[options.uid].videoTrack.setEnabled(true);
        videoIcon.className = "fas fa-video";
        videoIcon.style.setProperty("color", "#e07478");
    }
}
