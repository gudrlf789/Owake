import { localTracks } from "../../rtcClient.js";
import { deviceScan } from "./deviceScan.js";

/**
 * @author 전형동
 * @date 2022 03 24
 * @version 1.1
 * @description
 * 디바이스 셋팅
 *
 * ---------------- 수정사항 ---------------
 * 1. 함수위치 수정
 * 2. 소리 안들리는 내용 수정
 * 3. lcalTracks 변수를 rtcClient.js에서 가져왔음.
 * 4. videoProfiles 객체에서 480p_1 제거
 */

// Select DOM
const deviceSettingBtn = document.querySelector(".deviceSettingBtn");
const cameraSwitchBtn = document.querySelector("#camera-switching");

let mics = []; // all microphones devices you can use
let cams = []; // all cameras devices you can use
let currentMic; // the microphone you are using
let currentCam; // the camera you are using
let volumeAnimation;
let videoBox;
let cameraSwitchActive = false;

let event = deviceScan();

/**
 * 2022 02 25
 * Video Resolution List
 */
let videoProfiles = [
    {
        label: "480p_2",
        detail: "640×480, 30fps, 1000Kbps",
        value: "480p_2",
    },
    {
        label: "720p_1",
        detail: "1280×720, 15fps, 1130Kbps",
        value: "720p_1",
    },
    {
        label: "720p_2",
        detail: "1280×720, 30fps, 2000Kbps",
        value: "720p_2",
    },
    {
        label: "1080p_1",
        detail: "1920×1080, 15fps, 2080Kbps",
        value: "1080p_1",
    },
    {
        label: "1080p_2",
        detail: "1920×1080, 30fps, 3000Kbps",
        value: "1080p_2",
    },
    {
        label: "200×640",
        detail: "200×640, 30fps",
        value: { width: 200, height: 640, frameRate: 30 },
    }, // custom video profile
];

let curVideoProfile;

export const recodingDeviceCtrl = () => {
    getDeviceFunc();
    cameraSwitchFunc();
    videoResolutionCtrlFunc();

    $("#deviceSettingModal").on("hidden.bs.modal", function (e) {
        cancelAnimationFrame(volumeAnimation);
    });

    deviceSettingBtn.addEventListener("click", handlerDeviceSetting);
};

async function getDeviceFunc() {
    // get mics
    mics = await AgoraRTC.getMicrophones();
    currentMic = mics[0];
    $(".mic-input").val(currentMic.label);
    mics.forEach((mic) => {
        $(".mic-list").append(`<a class="dropdown-item">${mic.label}</a>`);
    });

    // get cameras
    cams = await AgoraRTC.getCameras();
    currentCam = cams[0];
    $(".cam-input").val(currentCam.label);
    cams.forEach((cam) => {
        $(".cam-list").append(`<a class="dropdown-item">${cam.label}</a>`);
    });
}

async function handlerDeviceSetting() {
    videoBox = document.querySelector("#local__videoBox");
    $(".cam-list").delegate("a", "click", (e) => {
        if (e.target.innerText.includes("back")) {
            switchCamera(e.target.innerText);
            setTimeout(() => {
                videoBox.childNodes[0].childNodes[0].style.setProperty(
                    "transform",
                    "rotateY(0deg)"
                );
            }, 3000);
        } else {
            switchCamera(e.target.innerText);
        }
    });
    $(".mic-list").delegate("a", "click", function (e) {
        switchMicrophone(e.target.innerText);
    });
    volumeAnimation = requestAnimationFrame(setVolumeWave);
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

function cameraSwitchFunc() {
    cameraSwitchBtn.addEventListener("click", () => {
        cameraSwitchActive = !cameraSwitchActive;
        cameraSwitchActive ? cameraSwitchEnable() : cameraSwitchDisable();
    });
}

function cameraSwitchEnable() {
    videoBox = document.querySelector("#local__videoBox");
    videoBox.childNodes[0].childNodes[0].style.setProperty(
        "transform",
        "rotateY(0deg)"
    );
}

function cameraSwitchDisable() {
    videoBox = document.querySelector("#local__videoBox");
    videoBox.childNodes[0].childNodes[0].style.setProperty(
        "transform",
        "rotateY(180deg)"
    );
}

function videoResolutionCtrlFunc() {
    initVideoProfiles();
    $("#video-profile-list").delegate("a", "click", function (e) {
        changeVideoProfile(this.getAttribute("label"));
    });
}

function initVideoProfiles() {
    videoProfiles.forEach((profile) => {
        $("#video-profile-list").append(
            `<a class="dropdown-item" label="${profile.label}">${profile.label}: ${profile.detail}</a>`
        );
    });

    curVideoProfile = videoProfiles[0];
    $("#video-profile-input").val(`${curVideoProfile.detail}`);
}

async function changeVideoProfile(label) {
    curVideoProfile = videoProfiles.find((profile) => profile.label === label);
    $("#video-profile-input").val(`${curVideoProfile.detail}`);
    // change the local video track`s encoder configuration
    localTracks.videoTrack &&
        (await localTracks.videoTrack.setEncoderConfiguration(
            curVideoProfile.value
        ));
}
