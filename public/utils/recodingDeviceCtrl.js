var mics = []; // all microphones devices you can use
var cams = []; // all cameras devices you can use
let currentMic; // the microphone you are using
let currentCam; // the camera you are using
let volumeAnimation;

const deviceSettingBtn = document.querySelector("#deviceSettingBtn");
const dropdownItem = document.querySelector(".dropdown-item");

deviceSettingBtn.addEventListener("click", async (e) => {
    $(".cam-list").delegate("a", "click", function (e) {
        switchCamera(this.text);
    });
    $(".mic-list").delegate("a", "click", function (e) {
        switchMicrophone(this.text);
    });

    await mediaDeviceTest();
    volumeAnimation = requestAnimationFrame(setVolumeWave);
});

$("#deviceSettingModal").on("hidden.bs.modal", function (e) {
    cancelAnimationFrame(volumeAnimation);
});

async function mediaDeviceTest() {
    const micList = document.querySelector(".mic-list");
    const camList = document.querySelector(".cam-list");
    // get mics
    mics = await AgoraRTC.getMicrophones();
    currentMic = mics[0];
    $(".mic-input").val(currentMic.label);
    mics.forEach((mic) => {
        console.log(mic.label);
        for (let i = 0; i < micList.childElementCount; i++) {
            if (micList[i] == mic.label) {
                return;
            }
        }

        $(".mic-list").append(
            `<a class="dropdown-item" href="#">${mic.label}</a>`
        );
    });
    console.log(micList);

    // get cameras
    cams = await AgoraRTC.getCameras();
    currentCam = cams[0];
    $(".cam-input").val(currentCam.label);

    cams.forEach((cam) => {
        console.log(cam.label);
        for (let i = 0; i < camList.childElementCount; i++) {
            if (camList[i] == cam.label) {
                return;
            }
        }
        $(".cam-list").append(
            `<a class="dropdown-item" href="#">${cam.label}</a>`
        );
    });
    console.log(camList);
}

async function switchCamera(label) {
    currentCam = cams.find((cam) => cam.label === label);
    $(".cam-input").val(currentCam.label);
    // switch device of local video track.
    await localTracks.videoTrack.setDevice(currentCam.deviceId);
}

async function switchMicrophone(label) {
    currentMic = mics.find((mic) => mic.label === label);
    $(".mic-input").val(currentMic.label);
    // switch device of local audio track.
    await localTracks.audioTrack.setDevice(currentMic.deviceId);
}

// show real-time volume while adjusting device.
function setVolumeWave() {
    volumeAnimation = requestAnimationFrame(setVolumeWave);
    $(".progress-bar").css(
        "width",
        localTracks.audioTrack.getVolumeLevel() * 100 + "%"
    );
    $(".progress-bar").attr(
        "aria-valuenow",
        localTracks.audioTrack.getVolumeLevel() * 100
    );
}
