import { socketInitFunc } from "./socket.js";
import { deviceScan } from "./deviceScan.js";

/**
 * @Author 박형길
 * @Date 2022 04 13
 * @Description
 * File Indentifier TrustOS API 적용
 */

export const fileHash = () => {
    let hashSocket = socketInitFunc();
    let formData = new FormData();
    let event = deviceScan();

    const selectFile1 = document.getElementById("selectFile_1");
    const selectFile2 = document.getElementById("selectFile_2");
    const originHash = document.getElementById("originHash");
    const remoteHash = document.getElementById("remoteHash");
    const selectOriginalInput = document.getElementById("selectOriginalInput");
    const selectComparisonInput = document.getElementById(
        "selectComparisonInput"
    );
    const syncBtn = document.querySelector("#syncBtn");
    const closeBtn = document.querySelector("#closeBtn");

    const compareResult = document.getElementById("compareResult");
    const clickVerifyFile = document.getElementById("clickVerifyFile");
    const originCopy = document.getElementById("originCopy");
    const comparisonCopy = document.getElementById("comparisonCopy");
    const userName = window.sessionStorage.getItem("uid");
    const channelName = window.sessionStorage.getItem("channel");
    const loginData = {
        id: "",
        password: "",
    };
    const identifireContainer = document.querySelector(".identifier-container");
    const fileHashImg = document.querySelector("#fileHash-img");
    const identifireBtn = document.querySelector("#fileHashBtn");

    let identifireActivator = false;

    $(() => {
        identifireFunc();
        $("#selectFile_1").attr("disabled", true);
        $("#selectFile_2").attr("disabled", true);
        $("#originHash").attr("disabled", true);
        $("#remoteHash").attr("disabled", true);
        compareResult.value = "";
    });

    function identifireFunc() {
        identifireBtn.addEventListener(event, (e) => {
            identifireActivator = !identifireActivator;
            identifireActivator ? identifireEnable() : identifireDisable();
        });
    }

    function identifireEnable() {
        identifireContainer.hidden = false;
        fileHashImg.src = "/left/hash_a.svg";
    }

    function identifireDisable() {
        identifireContainer.hidden = true;
        fileHashImg.src = "/left/hash.svg";

        hashSocket.emit("leave-hash", channelName);
        selectFile1.value = "";
        selectFile2.value = "";
        selectOriginalInput.value = "";
        selectComparisonInput.value = "";
        $("#syncBtn").attr("disabled", false);
        $("#selectFile_1").attr("disabled", true);
        $("#selectFile_2").attr("disabled", true);
        $("#originHash").attr("disabled", true);
        $("#remoteHash").attr("disabled", true);
    }

    function makeFileToHash(data, textHtml) {
        if (formData.has("fileInput")) {
            formData.delete("fileInput");
        }
        formData.append("userName", userName);
        formData.append("channelName", channelName);
        formData.append("fileInput", data);

        axios
            .post("/channel/hashFile", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
            })
            .then((res) => {
                hashSocket.emit(
                    "submit_hash",
                    res.data.hashCode,
                    textHtml.id,
                    channelName
                );
                textHtml.value = res.data.hashCode;
            })
            .catch((err) => {
                alert("Error occur");
                $("#spinnerModal").modal("hide");
                console.log("에러: " + err);
            });
    }

    function checkFileSelected(file) {
        if (file.length === 0) {
            alert("You have to select file");
            return false;
        }

        return true;
    }

    originHash.addEventListener(event, (e) => {
        if (checkFileSelected(selectFile1.files)) {
            makeFileToHash(selectFile1.files[0], selectOriginalInput);
        }
    });

    remoteHash.addEventListener(event, (e) => {
        if (checkFileSelected(selectFile2.files)) {
            makeFileToHash(selectFile2.files[0], selectComparisonInput);
        }
    });

    clickVerifyFile.addEventListener(event, (e) => {
        compareResult.style.fontWeight = "bold";

        if (selectOriginalInput.value === selectComparisonInput.value) {
            compareResult.style.color = "green";
            compareResult.value = "Same File";
        } else {
            compareResult.style.color = "red";
            compareResult.value = "Different File";
        }
    });

    originCopy.addEventListener(event, (e) => {
        navigator.clipboard.writeText(selectOriginalInput.value);
        alert("Copied the text: " + selectOriginalInput.value);
    });

    comparisonCopy.addEventListener(event, (e) => {
        navigator.clipboard.writeText(selectComparisonInput.value);
        alert("Copied the text: " + selectComparisonInput.value);
    });

    // $(document).on("#syncBtn", event, (e) => {
    //     hashSocket.emit("join-hash", channelName);
    //     axios
    //         .post("/channel/jwt", loginData)
    //         .then((res) => {
    //             if (res.data.success) {
    //                 alert("Sync is completed");
    //                 $("#syncBtn").attr("disabled", true);
    //                 $("#selectFile_1").attr("disabled", false);
    //                 $("#selectFile_2").attr("disabled", false);
    //                 $("#originHash").attr("disabled", false);
    //                 $("#remoteHash").attr("disabled", false);
    //             } else {
    //                 alert("Fail to connect with other users");
    //             }
    //         })
    //         .catch((err) => {
    //             alert(err);
    //         });
    // });

    syncBtn.addEventListener(event, (e) => {
        hashSocket.emit("join-hash", channelName);
        axios
            .post("/channel/jwt", loginData)
            .then((res) => {
                if (res.data.success) {
                    alert("Sync is completed");
                    $("#syncBtn").attr("disabled", true);
                    $("#selectFile_1").attr("disabled", false);
                    $("#selectFile_2").attr("disabled", false);
                    $("#originHash").attr("disabled", false);
                    $("#remoteHash").attr("disabled", false);
                } else {
                    alert("Fail to connect with other users");
                }
            })
            .catch((err) => {
                alert(err);
            });
    });

    closeBtn.addEventListener(event, (e) => {
        identifireContainer.hidden = true;
        fileHashImg.src = "/left/hash.svg";
        identifireActivator = false;

        hashSocket.emit("leave-hash", channelName);
        selectFile1.value = "";
        selectFile2.value = "";
        selectOriginalInput.value = "";
        selectComparisonInput.value = "";
        $("#syncBtn").attr("disabled", false);
        $("#selectFile_1").attr("disabled", true);
        $("#selectFile_2").attr("disabled", true);
        $("#originHash").attr("disabled", true);
        $("#remoteHash").attr("disabled", true);
    });

    // $(document).on("#closeBtn", `${event}`, (e) => {
    //     identifireContainer.hidden = true;
    //     fileHashImg.style.setProperty("filter", "none");
    //     hashSocket.emit("leave-hash", channelName);
    //     selectFile1.value = "";
    //     selectFile2.value = "";
    //     selectOriginalInput.value = "";
    //     selectComparisonInput.value = "";
    //     $("#syncBtn").attr("disabled", false);
    //     $("#selectFile_1").attr("disabled", true);
    //     $("#selectFile_2").attr("disabled", true);
    //     $("#originHash").attr("disabled", true);
    //     $("#remoteHash").attr("disabled", true);
    // });

    hashSocket.on("input_hash", (data) => {
        $(`#${data.textHtmlId}`).val(`${data.hash}`);
    });
};
