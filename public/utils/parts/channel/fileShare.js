let fileShareSocket = io();

// DOM Element
const el = document.createElement("div");
const videoEl = document.createElement("video");
const audioEl = document.createElement("audio");
const textEl = document.createElement("textArea");
const fileInputEl = document.createElement("input");
const localContainer = document.querySelector("#local__video__container");

el.className = "fileShareContainer";
fileInputEl.id = "fileInputControl";
videoEl.id = "video-preview";
audioEl.id = "audio-preview";
textEl.id = "text-preview";

let fileShareBtnActive = false;
let channel = window.sessionStorage.getItem("channel");

videoEl.autoplay = true;
videoEl.controls = true;
audioEl.autoplay = true;
audioEl.controls = true;
audioEl.preload = "metadata";

fileInputEl.type = "file";

export const fileShare = () => {
    fileDelivery();
    fileShareActivate();
    fileReadAction();
    fileShareSocket.on("send-fileShare", (data) => {
        console.log(data);
        // textArea.textContent = data;
        // imageArea.src = data;
        audioEl.src = data;
        // videoEl.src = data;
    });
};

/**
 * @author 전형동
 * @version 1.0 FileShare와 FileTransfer로 함수를 나누었음.
 * @data 2022.02.21
 */

function fileShareActivate() {
    const fileShareBtn = document.querySelector("#fileShareBtn");
    fileShareBtn.addEventListener("click", (e) => {
        fileShareBtnActive = !fileShareBtnActive;
        if (fileShareBtnActive == true) {
            fileShareActionEnable();
        } else {
            fileShareActionDisable();
        }
    });
}

function fileShareActionEnable() {
    el.append(fileInputEl, audioEl);
    localContainer.appendChild(el);
}

function fileShareActionDisable() {
    localContainer.removeChild(el);
}

function fileReadAction() {
    fileInputEl.addEventListener("change", fileInputControlChangeEventHandler);
}

function fileInputControlChangeEventHandler(e) {
    let fileInputControl = e.target;
    let files = fileInputControl.files;
    let firstFile = files[0];
    let fileReader = new FileReader();

    fileReader.readAsArrayBuffer(firstFile);
    // fileReader.readAsText(firstFile);

    fileReader.onload = (e) => {
        let fileContents = e.target.result;
        let dataBlob = new Blob([new Uint8Array(fileContents)]);
        let url = window.URL.createObjectURL(dataBlob);
        // textArea.textContent = fileContents;
        // imageArea.src = fileContents;
        // videoEl.src = url;
        audioEl.src = url;

        fileShareSocket.emit("fileShare", channel, url);
    };
}

/**
 * @author 전형동
 * @version 1.0 FileDelivery
 * @data 2022.02.22
 * @description
 * 코드 재조정... Sapari 업데이트 예정
 */

function fileDelivery() {
    $(document).ready(() => {
        const params = {
            api_key: "503d6430f3c124e0f239092e9c916b932a869dfe",
            profile_name: "owake",
        };
        function updateDevice() {
            $.ajax({
                url: "https://send-anywhere.com/web/v1/device",
                type: "GET",
                dataType: "jsonp",
                data: params,
                cache: false,
            }).done((data) => {});
        }

        function createKey(files) {
            let params = { file: [] };
            let formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                let file = files[i];
                params.file.push({ name: file.name, size: file.size });
                formData.append("file" + i, file, file.name);
            }

            $.ajax({
                url: "https://send-anywhere.com/web/v1/key",
                type: "GET",
                data: params,
                dataType: "jsonp",
                cache: false,
            }).done(function (data, textStatus, xhr) {
                $("#key").text(data.key);
                sendFile(data.weblink, formData);
            });
        }

        function sendFile(url, data) {
            $.ajax({
                url: url,
                type: "POST",
                processData: false,
                contentType: false,
                data: data,
                cache: false,
            }).done(function (data) {});
        }

        function receiveKey(key) {
            $("#status").text("waiting");
            $.ajax({
                url: "https://send-anywhere.com/web/v1/key/" + key,
                type: "GET",
                dataType: "jsonp",
                timeout: 3000,
                cache: false,
            })
                .done(function (data) {
                    receiveFile(data.weblink);
                    $("#status").text("done");
                })
                .fail(function (xhr, textStatus, error) {
                    $("#receiveForm .form-group").addClass("has-error");
                    $("#status")
                        .text("failed")
                        .removeClass("text-success")
                        .addClass("text-danger");
                });
        }

        function receiveFile(url) {
            $("<iframe />").attr("src", url).hide().appendTo("body");
        }

        $(document).on("click touchstart", "#sendBtn", function (e) {
            let files = $("#fileInput").prop("files");
            if (files.length > 0) {
                createKey(files);
            }
        });

        $(document).on("click touchstart", "#receiveBtn", function (e) {
            receiveKey($("#keyInput").val());
        });

        $(document).on("keyup", "#keyInput", function (e) {
            if (e.keyCode == 13) {
                $("#receiveBtn").click();
            }
        });

        $(document).on("keydown", "#keyInput", function (e) {
            $("#receiveForm .form-group").removeClass("has-error");
            $("#status")
                .text("")
                .removeClass("text-danger")
                .addClass("text-success");
        });
        updateDevice();
    });
}
