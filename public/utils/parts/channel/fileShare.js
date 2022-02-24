
/**
 * @author 전형동
 * @version 1.0
 * @data 2022.02.24
 * @description
 * FileShare 새로 추가
 * ---------------- 문제점 ----------------
 * 1. 소켓 연결시 데이터는 넘어가지만 이미지, 동영상, 텍스트, 오디오 등 제대로 브라우징이 안됨.
 * 2. 클릭버튼 넘겨야됨.
 * 3. 호스트 권한과 게스트 권한 넘겨서 클릭버튼 컨트롤 해야됨.
 */

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

export const fileShare = () => {
    fileShareActivate();
    fileReadAction();
    fileRemoteSocketAction();
};