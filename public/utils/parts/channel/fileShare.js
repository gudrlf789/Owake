/**
 * @author 전형동
 * @version 1.0
 * @data 2022.02.24
 * @description
 * FileShare 새로 추가
 * ---------------- 문제점 ----------------
 * 1. Blob ArrayBuffer로 소켓 연결시 데이터는 넘어가지만 이미지, 동영상, 텍스트, 오디오 등 제대로 브라우징이 안됨.
 * 1-1. 원인은 URL.createObjectURL 때문으로 추정됨. 다른 브라우저에서 재사용이 불가능함.
 * 1-2 결국은 파일 사이즈를 쪼개서 보내는 방식으로 진행해야 될 듯...
 * 2. 클릭버튼 넘겨야됨.
 * 3. 호스트 권한과 게스트 권한 넘겨서 클릭버튼 컨트롤 해야됨.
 */

let fileShareSocket = io();
let fileShareBtnActive = false;
let channel = window.sessionStorage.getItem("channel");

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
    let file = files[0];
    let chunkCounter;
    let filename = file.name;
    let filesize = file.size;
    let start = 0; //파일의 시작위치
    let chunkEnd;
    let chunkSize = 10 * 1024 * 1024;
    let numberOfChunks = Math.ceil(file.size / chunkSize);

    let fileReader = new FileReader();
    let fileData = new ArrayBuffer();

    let videoTypeCheck =
        file.type.includes("mp4") ||
        file.type.includes("mov") ||
        file.type.includes("wmv") ||
        file.type.includes("flv") ||
        file.type.includes("avi") ||
        file.type.includes("webm") ||
        file.type.includes("mkv") ||
        file.type.includes("x-matroska");

    let audioTypeCheck =
        file.type.includes("mp3") ||
        file.type.includes("mpeg") ||
        file.type.includes("wav") ||
        file.type.includes("aac") ||
        file.type.includes("aacp") ||
        file.type.includes("ogg") ||
        file.type.includes("flac") ||
        file.type.includes("x-caf");

    let textTypeCheck =
        file.type.match(/text.*/) ||
        file.type.includes("html") ||
        file.type.includes("js") ||
        file.type.includes("ejs") ||
        file.type.includes("css");

    let imageTypeCheck =
        file.type.includes("png") ||
        file.type.includes("jpg") ||
        file.type.includes("jpeg") ||
        file.type.includes("gif") ||
        file.type.includes("svg") ||
        file.type.includes("webp");

    let fileType = {
        video: 0,
        audio: 1,
        text: 2,
        image: 3,
        pdf: 4,
    };

    if (textTypeCheck) {
        fileReader.readAsText(file);
    } else {
        // fileReader.readAsArrayBuffer(file);
        fileReader.readAsDataURL(file);
    }

    fileReader.onload = (e) => {
        console.log("fileReader loading........");
        // let buffer = new Uint8Array(fileReader.result);
        // let dataBlob = new Blob([buffer]);
        // let data = window.URL.createObjectURL(dataBlob);
        let data = fileReader.result;

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
}

// Video
function fileVideoElement(content) {
    bodyEl.append(videoEl);
    videoEl.src = content;
}
// Audio
function fileAudioElement(content) {
    bodyEl.append(audioEl);
    audioEl.src = content;
}
// Text
function fileTextElement(content) {
    bodyEl.append(textEl);
    textEl.textContent = content;
}
// Image
function fileImageElement(content) {
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
