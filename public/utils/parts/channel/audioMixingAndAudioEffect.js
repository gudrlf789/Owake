/**
 * @Author 전형동
 * @Date 2022 06 06
 * @Description
 * Audio Mixing 개발중...
 */

import { localTracks, client } from "../../rtcClient.js";

const playButton = document.querySelector(".audioPlay");
const audioMixingBtn = document.querySelector("#audio-mixing");
const audioEffectBtn = document.querySelector("#audio-effect");
const stopAudioMixingBtn = document.querySelector("#stop-audio-mixing");
const audioBarAndProgressBtn = document.querySelector(".audio-bar .progress");
const volume = document.querySelector("#volume");
const localMixingBtn = document.querySelector("#local-audio-mixing");

let audioMixingProgressAnimation;

let audioMixing = {
    state: "IDLE", // "IDLE" | "LOADING | "PLAYING" | "PAUSE"
    duration: 0,
};

export const audioMixingAndAudioEffect = () => {
    audioMixingBtn.addEventListener("click", startAudioMixing, false);
    stopAudioMixingBtn.addEventListener("click", stopAudioMixing, false);
    audioBarAndProgressBtn.addEventListener("click", (e) => {
        setAudioMixingPosition(e.offsetX);
        return false;
    });
    volume.addEventListener("click", (e) => {
        setVolume(volume.value);
    });

    localMixingBtn.addEventListener("click", (e) => {
        const file = $("#local-file").prop("files")[0];
        if (!file) {
            console.warn("please choose a audio file");
            return;
        }
        startAudioMixing(file);
        return false;
    });

    playButton.addEventListener("click", () => {
        if (audioMixing.state === "IDLE" || audioMixing.state === "LOADING")
            return;
        toggleAudioMixing();
        return false;
    });
};

// $("#audio-effect").click(async function (e) {
//     // play the audio effect
//     await playEffect(1, { source: "audio.mp3" });
//     console.log("play audio effect success");
// });

function setAudioMixingPosition(clickPosX) {
    if (audioMixing.state === "IDLE" || audioMixing.state === "LOADING") return;
    const newPosition = clickPosX / $(".progress").width();

    // set the audio mixing playing position
    localTracks.audioMixingTrack.seekAudioBuffer(
        newPosition * audioMixing.duration
    );
}

function setVolume(value) {
    // set the audio mixing playing position
    localTracks.audioMixingTrack.setVolume(parseInt(value));
}

async function startAudioMixing(file) {
    if (audioMixing.state === "PLAYING" || audioMixing.state === "LOADING")
        return;
    const options = {};
    if (file) {
        options.source = file;
    } else {
        options.source = "HeroicAdventure.mp3";
    }
    try {
        audioMixing.state = "LOADING";
        // if the published track will not be used, you had better unpublish it
        if (localTracks.audioMixingTrack) {
            await client.unpublish(localTracks.audioMixingTrack);
        }
        // start audio mixing with local file or the preset file
        localTracks.audioMixingTrack =
            await AgoraRTC.createBufferSourceAudioTrack(options);
        await client.publish(localTracks.audioMixingTrack);
        localTracks.audioMixingTrack.play();
        localTracks.audioMixingTrack.startProcessAudioBuffer({ loop: true });

        audioMixing.duration = localTracks.audioMixingTrack.duration;
        $(".audio-duration").text(toMMSS(audioMixing.duration));
        $(".audioPlay").toggleClass("active", true);
        setAudioMixingProgress();
        audioMixing.state = "PLAYING";
        console.log("start audio mixing");
    } catch (e) {
        audioMixing.state = "IDLE";
        console.error(e);
    }
}

function stopAudioMixing() {
    if (audioMixing.state === "IDLE" || audioMixing.state === "LOADING") return;
    audioMixing.state = "IDLE";

    // stop audio mixing track
    localTracks.audioMixingTrack.stopProcessAudioBuffer();
    localTracks.audioMixingTrack.stop();

    $(".progress-bar").css("width", "0%");
    $(".audio-current-time").text(toMMSS(0));
    $(".audio-duration").text(toMMSS(0));
    $(".audioPlay").toggleClass("active", false);
    cancelAnimationFrame(audioMixingProgressAnimation);
    console.log("stop audio mixing");
}

function toggleAudioMixing() {
    if (audioMixing.state === "PAUSE") {
        playButton.toggleClass("active", true);

        // resume audio mixing
        localTracks.audioMixingTrack.resumeProcessAudioBuffer();

        audioMixing.state = "PLAYING";
    } else {
        $(".audioPlay").toggleClass("active", false);

        // pause audio mixing
        localTracks.audioMixingTrack.pauseProcessAudioBuffer();

        audioMixing.state = "PAUSE";
    }
}

function setAudioMixingProgress() {
    audioMixingProgressAnimation = requestAnimationFrame(
        setAudioMixingProgress
    );
    const currentTime = localTracks.audioMixingTrack.getCurrentTime();
    $(".progress-bar").css(
        "width",
        `${(currentTime / audioMixing.duration) * 100}%`
    );
    $(".audio-current-time").text(toMMSS(currentTime));
}

// use buffer source audio track to play effect.
async function playEffect(cycle, options) {
    // if the published track will not be used, you had better unpublish it
    if (localTracks.audioEffectTrack) {
        await client.unpublish(localTracks.audioEffectTrack);
    }
    localTracks.audioEffectTrack = await AgoraRTC.createBufferSourceAudioTrack(
        options
    );
    await client.publish(localTracks.audioEffectTrack);
    localTracks.audioEffectTrack.play();
    localTracks.audioEffectTrack.startProcessAudioBuffer({ cycle });
}

// calculate the MM:SS format from millisecond
function toMMSS(second) {
    // const second = millisecond / 1000;
    let MM = parseInt(second / 60);
    let SS = parseInt(second % 60);
    MM = MM < 10 ? "0" + MM : MM;
    SS = SS < 10 ? "0" + SS : SS;
    return `${MM}:${SS}`;
}
