export const recodingDeviceCtrl = () => {
    // Select DOM
    const deviceSettingBtn = document.getElementById("deviceSettingBtn");
    const cameraSwitchBtn = document.querySelector("#camera-switching");
    const dropdownItem = document.querySelector(".dropdown-item");

    let mics = []; // all microphones devices you can use
    let cams = []; // all cameras devices you can use
    let currentMic; // the microphone you are using
    let currentCam; // the camera you are using
    let volumeAnimation;
    let videoBox;
    let cameraSwitchActive = false;
    let area;

    (function () {
        deviceSettingFunc();
        cameraSwitchFunc();
        geoFencing();
        videoResolutionCtrlFunc();
    })();

    function deviceSettingFunc() {
        $(async () => {
            // get mics
            mics = await AgoraRTC.getMicrophones();
            currentMic = mics[0];
            $(".mic-input").val(currentMic.label);
            mics.forEach((mic) => {
                $(".mic-list").append(
                    `<a class="dropdown-item">${mic.label}</a>`
                );
            });

            // get cameras
            cams = await AgoraRTC.getCameras();
            currentCam = cams[0];
            $(".cam-input").val(currentCam.label);
            cams.forEach((cam) => {
                $(".cam-list").append(
                    `<a class="dropdown-item">${cam.label}</a>`
                );
            });
        });

        deviceSettingBtn.addEventListener("click", async (e) => {
            videoBox = document.querySelector("#local__videoBox");
            $(".cam-list").delegate("a", "click", function (e) {
                e.preventDefault();
                if (
                    this.text.includes("back") ||
                    this.text.includes("camera2 0")
                ) {
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

    // geoFencing
    async function geoFencing() {
        initAreas();

        console.log("geoFencing::::Start");

        $("#geoFencing-profile-list").delegate("a", "click", function (e) {
            changeArea(this.getAttribute("label"));
        });

        async function changeArea(label) {
            area = areas.find((profile) => profile.label === label);
            $("#geoFencing-profile-input").val(`${area.detail}`);
            // Specify the region for connection as North America
            AgoraRTC.setArea({
                areaCode: area.value,
            });
        }

        async function initAreas() {
            areas.forEach((profile) => {
                $("#geoFencing-profile-list").append(
                    `<a class="dropdown-item" label="${profile.label}">${profile.label}: ${profile.detail}</a>`
                );
            });
            area = areas[0];
            $("#geoFencing-profile-input").val(`${area.detail}`);
        }
    }

    function videoResolutionCtrlFunc() {
        initVideoProfiles();
        $("#video-profile-list").delegate("a", "click", function (e) {
            changeVideoProfile(this.getAttribute("label"));
        });

        initVideoProfiles();
        changeVideoProfile();
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
        curVideoProfile = videoProfiles.find(
            (profile) => profile.label === label
        );
        $("#video-profile-input").val(`${curVideoProfile.detail}`);
        // change the local video track`s encoder configuration
        localTracks.videoTrack &&
            (await localTracks.videoTrack.setEncoderConfiguration(
                curVideoProfile.value
            ));
    }
};
