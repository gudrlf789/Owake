let fileShareSocket = io();
let fileShareBtnActive = false;
let channel = window.sessionStorage.getItem("channel");
let receiverID;

// DOM Element
const el = document.createElement("div");
const navEl = document.createElement("div");
const progressEl = document.createElement("div");
const bodyEl = document.createElement("div");
const videoEl = document.createElement("video");
const audioEl = document.createElement("audio");
const textEl = document.createElement("textArea");
const imageEl = document.createElement("img");
const fileInputEl = document.createElement("input");

const localContainer = document.querySelector("#local__video__container");
const fileShareBtn = document.querySelector("#fileShareBtn");

el.className = "fileShareContainer";
fileInputEl.id = "fileInputControl";
videoEl.id = "video-preview";
audioEl.id = "audio-preview";
textEl.id = "text-preview";
navEl.id = "fileShareNavigation";
bodyEl.id = "fileShareBody";

navEl.className = "fileShare-navbar";
bodyEl.className = "fileShare-contentBox";
progressEl.className = "fileShare-progressBar";

videoEl.autoplay = true;
videoEl.controls = true;
videoEl.playsInline = true;
audioEl.autoplay = true;
audioEl.controls = true;
audioEl.preload = "metadata";

fileInputEl.type = "file";

export const fileShare = () => {
    fileDelivery();
    // fileShareActivate();
    // fileReadAction();
    // fileRemoteSocketAction();
};

/**
 * @author 전형동
 * @version 1.0 FileShare와 FileTransfer로 함수를 나누었음.
 * @data 2022.02.21
 */

function fileShareActivate() {
    if (fileShareBtn) {
        fileShareBtn.addEventListener("click", (e) => {
            fileShareBtnActive = !fileShareBtnActive;
            if (fileShareBtnActive == true) {
                fileShareActionEnable(e);
            } else {
                fileShareActionDisable(e);
            }
        });
    }
}

function fileShareActionEnable(e) {
    navEl.append(fileInputEl, progressEl);
    el.append(navEl, bodyEl);
    localContainer.appendChild(el);
    fileShareBtn.style.color = "rgb(165, 199, 236)";
    fileShareSocket.emit("join-fileShare", channel);
}

function fileShareActionDisable(e) {
    localContainer.removeChild(el);
    fileShareBtn.style.color = "#fff";
    fileShareSocket.emit("leave-fileShare", channel);
}

function fileReadAction() {
    fileInputEl.addEventListener("change", fileInputControlChangeEventHandler);
}

function fileInputControlChangeEventHandler(e) {
    let fileInputControl = e.target;
    let files = fileInputControl.files;
    let firstFile = files[0];
    console.log(firstFile.type);
    let fileReader = new FileReader();
    let videoTypeCheck =
        firstFile.type.includes("mp4") ||
        firstFile.type.includes("mov") ||
        firstFile.type.includes("wmv") ||
        firstFile.type.includes("flv") ||
        firstFile.type.includes("avi") ||
        firstFile.type.includes("webm") ||
        firstFile.type.includes("mkv") ||
        firstFile.type.includes("x-matroska");

    let audioTypeCheck =
        firstFile.type.includes("mp3") ||
        firstFile.type.includes("mpeg") ||
        firstFile.type.includes("wav") ||
        firstFile.type.includes("aac") ||
        firstFile.type.includes("aacp") ||
        firstFile.type.includes("ogg") ||
        firstFile.type.includes("flac") ||
        firstFile.type.includes("webm") ||
        firstFile.type.includes("x-caf");

    let textTypeCheck =
        firstFile.type.includes("txt") ||
        firstFile.type.includes("text") ||
        firstFile.type.includes("html") ||
        firstFile.type.includes("js") ||
        firstFile.type.includes("ejs") ||
        firstFile.type.includes("css");

    let imageTypeCheck =
        firstFile.type.includes("png") ||
        firstFile.type.includes("jpg") ||
        firstFile.type.includes("jpeg") ||
        firstFile.type.includes("gif") ||
        firstFile.type.includes("svg") ||
        firstFile.type.includes("webp");

    let fileType = {
        video: 0,
        audio: 1,
        text: 2,
        image: 3,
        pdf: 4,
    };

    fileReader.onload = (e) => {
        // Progress 준비중...
        let buffer = new Uint8Array(fileReader.result);
        let fileContents = e.target.result;
        let dataBlob = new Blob([new Uint8Array(fileContents)]);
        let data = window.URL.createObjectURL(dataBlob);

        if (videoTypeCheck) {
            bodyEl.append(videoEl);
            videoEl.src = data;
            fileShareSocket.emit("fileShare", channel, data, fileType.video);
        }
        if (audioTypeCheck) {
            bodyEl.append(audioEl);
            audioEl.src = data;
            fileShareSocket.emit("fileShare", channel, data, fileType.audio);
        }
        if (textTypeCheck) {
            bodyEl.append(textEl);
            textEl.textContent = fileContents;
            fileShareSocket.emit(
                "fileShare",
                channel,
                fileContents,
                fileType.text
            );
        }
        if (imageTypeCheck) {
            bodyEl.append(imageEl);
            imageEl.src = data;
            fileShareSocket.emit("fileShare", channel, data, fileType.image);
        }
    };

    if (textTypeCheck) {
        fileReader.readAsText(firstFile);
    } else {
        fileReader.readAsArrayBuffer(firstFile);
    }
}

// Video
function fileVideoElement(content) {
    console.log(content);
    bodyEl.append(videoEl);
    videoEl.src = content;
}
// Audio
function fileAudioElement(content) {
    console.log(content);
    bodyEl.append(audioEl);
    audioEl.src = content;
}
// Text
function fileTextElement(content) {
    console.log(content);
    bodyEl.append(textEl);
    textEl.textContent = content;
}
// Image
function fileImageElement(content) {
    console.log(content);
    bodyEl.append(imageEl);
    imageEl.src = content;
}

// PDF
function filePDFElement(content) {}
// CSV
function fileCSVElement(content) {}

function fileRemoteSocketAction() {
    fileShareSocket.on("send-fileShare", (data, type) => {
        console.log(data, type);
        if (type === 0) {
            fileVideoElement(data);
        } else if (type === 1) {
            fileAudioElement(data);
        } else if (type === 2) {
            fileTextElement(data);
        } else if (type === 3) {
            fileImageElement(data);
        } else if (type === 4) {
            filePDFElement(data);
        } else {
            alert("Type Error!!");
        }
    });
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
