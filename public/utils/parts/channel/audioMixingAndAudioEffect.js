/**
 * @Author 전형동
 * @Date 2022 06 06
 * @Description
 * Audio Mixing 개발중...
 */

const playButton = $(".audioPlay");
let audioMixingProgressAnimation;

let audioMixing = {
    state: "IDLE", // "IDLE" | "LOADING | "PLAYING" | "PAUSE"
    duration: 0,
};

export const audioMixingAndAudioEffect = () => {};

$("#audio-mixing").click(function (e) {
    startAudioMixing();
});

$("#audio-effect").click(async function (e) {
    // play the audio effect
    await playEffect(1, { source: "audio.mp3" });
    console.log("play audio effect success");
});

$("#stop-audio-mixing").click(function (e) {
    stopAudioMixing();
    return false;
});

$(".audio-bar .progress").click(function (e) {
    setAudioMixingPosition(e.offsetX);
    return false;
});

$("#volume").click(function (e) {
    setVolume($("#volume").val());
});

$("#local-audio-mixing").click(function (e) {
    // get selected file
    const file = $("#local-file").prop("files")[0];
    if (!file) {
        console.warn("please choose a audio file");
        return;
    }
    startAudioMixing(file);
    return false;
});

playButton.click(function () {
    if (audioMixing.state === "IDLE" || audioMixing.state === "LOADING") return;
    toggleAudioMixing();
    return false;
});

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
        playButton.toggleClass("active", true);
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
    playButton.toggleClass("active", false);
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
        playButton.toggleClass("active", false);

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
