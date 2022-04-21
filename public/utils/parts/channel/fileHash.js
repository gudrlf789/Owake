import { socketInitFunc } from "./socket.js";
/**
 * @Author 박형길
 * @Date 2022 04 13
 * @Description
 * File Indentifier TrustOS API 적용
 */

export const fileHash = () => {
    let hashSocket = socketInitFunc();
    let formData = new FormData();
    let jwt;

    const selectFile1 = document.getElementById("selectFile_1");
    const selectFile2 = document.getElementById("selectFile_2");
    const selectOriginalInput = document.getElementById("selectOriginalInput");
    const selectComparisonInput = document.getElementById("selectComparisonInput");
    const compareResult = document.getElementById("compareResult");
    const clickVerifyFile = document.getElementById("clickVerifyFile");
    const originCopy = document.getElementById("originCopy");
    const comparisonCopy = document.getElementById("comparisonCopy");
    const channelName = window.sessionStorage.getItem("channel");
    const loginData = {
        id: "",
        password: "",
    };

    $(() => {
        $("#selectFile_1").attr("disabled", true);
        $("#selectFile_2").attr("disabled", true);
        compareResult.value = "";
    });

    function makeFileToHash(data, textHtml) {
        if (formData.has("fileInput")) {
            formData.delete("fileInput");
        }
        formData.append("fileInput", data);

        axios
            .post(
                "https://pro.virtualtrust.io/cert/certificate/file/hash",
                formData,
                {
                    headers: {
                        Authorization: "Bearer " + jwt,
                        "Content-Type": "multipart/form-data",
                    },
                }
            )
            .then((res) => {
                hashSocket.emit(
                    "submit_hash",
                    res.data.output.file_hash,
                    textHtml.id,
                    channelName
                );
                textHtml.value = res.data.output.file_hash;
            })
            .catch((err) => {
                console.log(err);
            });
    };

    selectFile1.addEventListener("change", (e) => {
        makeFileToHash(selectFile1.files[0], selectOriginalInput);
    });

    selectFile2.addEventListener("change", (e) => {
        makeFileToHash(selectFile2.files[0], selectComparisonInput);
    });

    clickVerifyFile.addEventListener("click", (e) => {
        compareResult.style.fontWeight = "bold";

        if (selectOriginalInput.value === selectComparisonInput.value) {
            compareResult.style.color = "green";
            compareResult.value = "Same File";
        } else {
            compareResult.style.color = "red";
            compareResult.value = "Different File";
        }
    });

    originCopy.addEventListener("click", (e) => {
        navigator.clipboard.writeText(selectOriginalInput.value);
        alert("Copied the text: " + selectOriginalInput.value);
    });

    comparisonCopy.addEventListener("click", (e) => {
        navigator.clipboard.writeText(selectComparisonInput.value);
        alert("Copied the text: " + selectComparisonInput.value);
    });

    $("#syncBtn").click((e) => {
        hashSocket.emit("join-hash", channelName);
        axios
            .post("/channel/jwt", loginData)
            .then((res) => {
                if(res.data.jwt !== undefined){
                    alert("Sync is completed");
                    jwt = res.data.jwt;
                    $("#syncBtn").attr("disabled", true);
                    $("#selectFile_1").attr("disabled", false);
                    $("#selectFile_2").attr("disabled", false);
                }else{
                    alert("Fail to connect with other users");
                }
                
            })
            .catch((err) => {
                alert(err);
            });
    });

    $("#closeBtn").click((e) => {
        hashSocket.emit("leave-hash", channelName);
        selectFile1.value = "";
        selectFile2.value = "";
        selectOriginalInput.value = "";
        selectComparisonInput.value = "";
        $("#syncBtn").attr("disabled", false);
        $("#selectFile_1").attr("disabled", true);
        $("#selectFile_2").attr("disabled", true);
    });

    hashSocket.on("input_hash", (data) => {
        $(`#${data.textHtmlId}`).val(`${data.hash}`);
    });
};
