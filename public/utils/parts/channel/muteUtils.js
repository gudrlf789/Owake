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

let event = deviceScan();

let localTrackState = {
    videoTrackMuted: false,
    audioTrackMuted: false,
};

export const muteUtilsFunc = () => {
    $(async () => {
        if (document.readyState == "loading") {
            // 아직 로딩 중이므로 이벤트를 기다립니다.
            document.addEventListener("DOMContentLoaded", muteStart, false);
        } else {
            // DOM이 완성되었습니다!
            muteStart();
        }
    });

    function muteStart() {
        setTimeout(() => {
            muteVideo();
            muteAudio();
        }, 3000);
    }

    audioBtn.addEventListener(event, (e) => {
        if (!localTrackState.audioTrackMuted) {
            muteAudio();
            alert("audio mute activation");
        } else {
            unmuteAudio();
            alert("audio unmute activation");
        }
    });

    videoBtn.addEventListener(event, (e) => {
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

    console.log(totalUsers[options.uid]);
}

async function unmuteVideo() {
    if (!localTracks.videoTrack) return;
    localTrackState.videoTrackMuted = false;
    totalUsers[options.uid].videoTrack._originMediaStreamTrack.enabled = true;
    // totalUsers[options.uid].videoTrack.setMuted(false);
    // totalUsers[options.uid].videoTrack.setEnabled(true);
    videoIcon.className = "fas fa-video";
}
