export const recodingDeviceCtrl = () => {
    var mics = []; // all microphones devices you can use
    var cams = []; // all cameras devices you can use
    let currentMic; // the microphone you are using
    let currentCam; // the camera you are using
    let volumeAnimation;
    let videoBox;

    const deviceSettingBtn = document.getElementById("deviceSettingBtn");
    const dropdownItem = document.querySelector(".dropdown-item");

    $(async () => {
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
    });

    deviceSettingBtn.addEventListener("click", async (e) => {
        $(".cam-list").delegate("a", "click", function (e) {
            videoBox = document.querySelector("#local__videoBox");
            console.log(this.text);
            if (
                this.text.includes("facing back") ||
                this.text.includes("camera2 0")
            ) {
                console.log("back Camera");
                videoBox.style.setProperty(
                    "transform",
                    "rotateY(0deg)",
                    "!important"
                );
                switchCamera(this.text);
            } else {
                console.log("front Camera");
                switchCamera(this.text);
            }
        });
        $(".mic-list").delegate("a", "click", function (e) {
            switchMicrophone(this.text);
        });
        volumeAnimation = requestAnimationFrame(setVolumeWave);
    });

    $("#deviceSettingModal").on("hidden.bs.modal", function (e) {
        cancelAnimationFrame(volumeAnimation);
    });

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
};
