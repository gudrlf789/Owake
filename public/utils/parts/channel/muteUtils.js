import { localTracks, totalUsers, options } from "../../rtcClient.js";

export const muteUtilsFunc = () => {
    const videoIcon = document.getElementById("videoIcon");
    const audioIcon = document.getElementById("audioIcon");

    let localTrackState = {
        videoTrackMuted: false,
        audioTrackMuted: false,
    };

    $(() => {
        setTimeout(() => {
            muteVideo();
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

    async function muteAudio() {
        if (!localTracks.audioTrack) return;
        totalUsers[
            options.uid
        ].audioTrack._originMediaStreamTrack.enabled = false;
        localTrackState.audioTrackMuted = true;
        audioIcon.className = "fa fa-microphone-slash";
    }

    async function unmuteAudio() {
        if (!localTracks.audioTrack) return;
        totalUsers[
            options.uid
        ].audioTrack._originMediaStreamTrack.enabled = true;
        localTrackState.audioTrackMuted = false;
        audioIcon.className = "fa fa-microphone";
    }

    async function muteVideo() {
        if (!localTracks.videoTrack) return;
        totalUsers[
            options.uid
        ].videoTrack._originMediaStreamTrack.enabled = false;
        localTrackState.videoTrackMuted = true;
        videoIcon.className = "fas fa-video-slash";
    }

    async function unmuteVideo() {
        if (!localTracks.videoTrack) return;
        totalUsers[
            options.uid
        ].videoTrack._originMediaStreamTrack.enabled = true;
        localTrackState.videoTrackMuted = false;
        videoIcon.className = "fas fa-video";
    }
};
