export const recodingDeviceCtrl = () => {
    var mics = []; // all microphones devices you can use
    var cams = []; // all cameras devices you can use
    let currentMic; // the microphone you are using
    let currentCam; // the camera you are using
    let volumeAnimation;
    let videoBox;
    let cameraSwitchActive = false;
    let area;

    const deviceSettingBtn = document.getElementById("deviceSettingBtn");
    const dropdownItem = document.querySelector(".dropdown-item");
    const cameraSwitchBtn = document.querySelector("#camera-switching");

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
        videoBox = document.querySelector("#local__videoBox");
        $(".cam-list").delegate("a", "click", function (e) {
            e.preventDefault();
            if (this.text.includes("back") || this.text.includes("camera2 0")) {
                switchCamera(this.text);
                setTimeout(() => {
                    videoBox.childNodes[0].childNodes[0].style.setProperty(
                        "transform",
                        "rotateY(0deg)"
                    );
                }, 3000);
            } else {
                switchCamera(this.text);
            }
        });
        $(".mic-list").delegate("a", "click", function (e) {
            e.preventDefault();
            switchMicrophone(this.text);
        });
        volumeAnimation = requestAnimationFrame(setVolumeWave);
    });

    cameraSwitchBtn.addEventListener("click", () => {
        cameraSwitchActive = !cameraSwitchActive;
        cameraSwitchActive ? cameraSwitchEnable() : cameraSwitchDisable();
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

    // geoFencing
    async function geoFencing() {
        initAreas();

        console.log("geoFencing::::Start");

        $(".profile-list").delegate("a", "click", function (e) {
            changeArea(this.getAttribute("label"));
        });

        async function changeArea(label) {
            area = areas.find((profile) => profile.label === label);
            $(".profile-input").val(`${area.detail}`);
            // Specify the region for connection as North America
            AgoraRTC.setArea({
                areaCode: area.value,
            });
        }

        async function initAreas() {
            areas.forEach((profile) => {
                $(".profile-list").append(
                    `<a class="dropdown-item" label="${profile.label}">${profile.label}: ${profile.detail}</a>`
                );
            });
            area = areas[0];
            $(".profile-input").val(`${area.detail}`);
        }
    }

    geoFencing();
};
