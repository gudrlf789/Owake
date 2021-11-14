const videoIcon = document.getElementById("videoIcon");
const audioIcon = document.getElementById("audioIcon");

var localTrackState = {
    videoTrackMuted: false,
    audioTrackMuted: false,
};

$("#muteAudio").click(function (e) {
    if (!localTrackState.audioTrackMuted) {
        muteAudio();
    } else {
        unmuteAudio();
    }
});

$("#muteVideo").click(function (e) {
    if (!localTrackState.videoTrackMuted) {
        muteVideo();
    } else {
        unmuteVideo();
    }
});

async function muteAudio() {
    if (!localTracks.audioTrack) return;
    await localTracks.audioTrack.setMuted(true);
    localTrackState.audioTrackMuted = true;
    audioIcon.className = "fa fa-microphone-slash";
}

async function unmuteAudio() {
    if (!localTracks.audioTrack) return;
    await localTracks.audioTrack.setMuted(false);
    localTrackState.audioTrackMuted = false;
    audioIcon.className = "fa fa-microphone";
}

async function muteVideo() {
    if (!localTracks.videoTrack) return;
    await localTracks.videoTrack.setMuted(true);
    localTrackState.videoTrackMuted = true;
    videoIcon.className = "fas fa-video-slash";
}

async function unmuteVideo() {
    if (!localTracks.videoTrack) return;
    await localTracks.videoTrack.setMuted(false);
    localTrackState.videoTrackMuted = false;
    videoIcon.className = "fas fa-video";
}
