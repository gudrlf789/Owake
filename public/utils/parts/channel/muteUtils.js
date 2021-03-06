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

const videoIcon = document.getElementById("videoIcon");
const audioIcon = document.getElementById("audioIcon");

let localTrackState = {
    videoTrackMuted: false,
    audioTrackMuted: false,
};

export const muteUtilsFunc = () => {
    $(async () => {
        setTimeout(() => {
            muteVideo();
            muteAudio();
        }, 3000);
    });

    $("#muteAudio").click(function (e) {
        if (!localTrackState.audioTrackMuted) {
            muteAudio();
            alert("audio mute activation");
        } else {
            unmuteAudio();
            alert("audio unmute activation");
        }
    });

    $("#muteVideo").click(function (e) {
        if (!localTrackState.videoTrackMuted) {
            muteVideo();
            alert("video mute activation");
        } else {
            unmuteVideo();
            alert("video unmute activation");
        }
    });
};

async function muteAudio() {
    if (!localTracks.audioTrack) return;
    localTrackState.audioTrackMuted = true;
    totalUsers[options.uid].audioTrack._originMediaStreamTrack.enabled = false;
    // totalUsers[options.uid].audioTrack.setMuted(true);
    // totalUsers[options.uid].audioTrack.setEnabled(false);
    audioIcon.className = "fa fa-microphone-slash";
}

async function unmuteAudio() {
    if (!localTracks.audioTrack) return;
    localTrackState.audioTrackMuted = false;
    totalUsers[options.uid].audioTrack._originMediaStreamTrack.enabled = true;
    // totalUsers[options.uid].audioTrack.setMuted(false);
    // totalUsers[options.uid].audioTrack.setEnabled(true);
    audioIcon.className = "fa fa-microphone";
}

async function muteVideo() {
    if (!localTracks.videoTrack) return;
    localTrackState.videoTrackMuted = true;
    totalUsers[options.uid].videoTrack._originMediaStreamTrack.enabled = false;
    // totalUsers[options.uid].videoTrack.setMuted(true);
    // totalUsers[options.uid].videoTrack.setEnabled(false);
    videoIcon.className = "fas fa-video-slash";
}

async function unmuteVideo() {
    if (!localTracks.videoTrack) return;
    localTrackState.videoTrackMuted = false;
    totalUsers[options.uid].videoTrack._originMediaStreamTrack.enabled = true;
    // totalUsers[options.uid].videoTrack.setMuted(false);
    // totalUsers[options.uid].videoTrack.setEnabled(true);
    videoIcon.className = "fas fa-video";
}
