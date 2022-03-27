import { socketInitFunc } from "./socket.js";
import { options } from "../../rtcClient.js";

/**
 * @author 전형동
 * @version 1.1
 * @data 2022.02.24 / 03.10 / 03.14 / 03.23
 * @description
 * FileShare 새로 추가
 * ---------------- 문제점 ----------------
 * 1. 파일 버퍼를 쪼개서 나눠서 보내야 될 필요있음.
 * 2. 파일을 보내면 전부 업로드가 되는 것이 아닌 파일의 메타데이터만 넘기고
 * 유저가 해당 파일을 클릭을 했을 때만 업로드 하게끔 변경할 필요있음.
 * 3. 같은 소켓에 있는 유저가 해당 파일을 클릭을 했을 때나 리더를 사용하거나
 *    혹은 다운로드를 했을 때 파일이 누구의 것인지 식별할 수 있도록
 *    보내는 이와 받는 이로 구별할 수 있도록 기록해야 됨.
 * 4. 파일 UID와는 별도로 제일 처음 파일을 업로드한 피어의 아이디가 파일객체에 담겨야 함. - 해결 -
 * ---------------- 수정사항 ---------------
 * 1. Blob 슬라이스 적용 못해서 5MB로 차라리 쉐어파일 용량에 제한 두었음.
 * 2. 디스플레이 크기에 따라 컨텐츠 컨테이너 크기 조정 적용
 * 3. Empty 버튼 추가
 *
 * ---------------- 3.14 수정사항 ---------------
 * 1. Blob 슬라이스 적용
 * ---------------- 3.23 수정사항 ---------------
 * 1. 함수 리팩토링
 * 2. file UID 적용 uuidv4 함수 추가
 * 3. fileDataInit 함수 추가
 * 4. socket progress 적용
 * 5. file 객체에 PeerID 적용 / 파일이 누구의 것인지 체크
 */

export const fileShare = () => {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        fileShareActivate();
    } else {
        alert("The File APIs are not fully supported in this browser.");
    }
};

const fileShareSocket = socketInitFunc();

// Options
let bufferSize = 1024;
let fileShareBtnActive = false;
let fileListBtnActive = false;
let channel = window.sessionStorage.getItem("channel");
let spanEl;
let file;
let uid;
let fileData;
let fileArr = [];

// Progress Element
const progressLabel = document.createElement("label");
const progressEl = document.createElement("progress");

progressEl.className = "progress-bar";
progressEl.id = "fileShare-progressBar";
progressEl.style.setProperty("width", "120px");
progressEl.max = 100;
progressLabel.for = "fileShare-progressBar";
progressLabel.textContent = "File Progress";

// Data Element
let videoEl = "video";
let audioEl = "audio";
let textEl = "textarea";
let imageEl = "img";

// DOM Element
const el = document.createElement("section");
const navEl = document.createElement("nav");
const bodyEl = document.createElement("section");
const chunkInfoEl = document.createElement("span");

const fileInputEl = document.createElement("input");
const fileTabList = document.createElement("output");
const fileListActivator = document.createElement("button");
const fileEmpty = document.createElement("button");

const localContainer = document.querySelector("#local__video__container");
const fileShareBtn = document.querySelector("#fileShareBtn");

el.className = "fileShareContainer";
fileInputEl.id = "fileInputControl";
navEl.id = "fileShareNavigation";
bodyEl.id = "fileShareBody";

fileTabList.id = "fileList";
chunkInfoEl.id = "chunkInfoContainer";
fileListActivator.id = "fileListActivator";
fileEmpty.id = "fileEmpty";

navEl.className = "fileShare-navbar";
bodyEl.className = "fileShare-contentBox";

fileInputEl.type = "file";
fileInputEl.name = "files[]";
fileInputEl.multiple = true;

fileListActivator.style.setProperty("width", "100px");
fileEmpty.style.setProperty("width", "100px");

fileListActivator.textContent = "File Tab";
fileEmpty.textContent = "Empty";

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
    navEl.append(
        fileInputEl,
        progressLabel,
        progressEl,
        chunkInfoEl,
        fileListActivator,
        fileEmpty
    );
    el.append(navEl, bodyEl);
    localContainer.appendChild(el);
    fileShareBtn.style.color = "rgb(165, 199, 236)";
    fileShareSocket.emit("join-fileShare", channel);

    fileReadAction();
    handlerFileListCtrl();
    handlerFileRemove();
    shareReceiveFile();

    // Recevie Progress
    fileShareSocket.on("fs-progress", (progress) => {
        progressEl.value = progress;
    });
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
    if (!fileInputControl) {
        return;
    }

    for (let i = 0; i < files.length; i++) {
        file = files[i];

        uid = uuidv4();
        fileData = fileDataInit(file.name, file.size, file.type, uid);

        // File 배열에 데이터 삽입
        fileArr[i] = fileData;

        if (file.size > 25 * 1024 * 1024) {
            alert("Please upload the file that can be shared less than 25MB.");
            return;
        }

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
            file.type.includes("json") ||
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

        let reader = new FileReader();

        reader.onload = (e) => {
            let content = e.target.result;
            let buffer = new Uint8Array(e.target.result);

            if (videoTypeCheck) {
                receiveDataElement(
                    videoEl,
                    buffer,
                    fileArr[i].fileUid,
                    fileArr[i].peerID
                );
                shareFile({
                    channel: channel,
                    element: videoEl,
                    filetype: fileType.video,
                    buffer_size: bufferSize,
                    buffer,
                    filename: fileArr[i].fileName,
                    total_buffer_size: fileArr[i].fileSize,
                    uid: fileArr[i].fileUid,
                    peer: fileArr[i].peerID,
                });
            }
            if (audioTypeCheck) {
                receiveDataElement(
                    audioEl,
                    buffer,
                    fileArr[i].fileUid,
                    fileArr[i].peerID
                );
                shareFile({
                    channel: channel,
                    element: audioEl,
                    filetype: fileType.audio,
                    buffer_size: bufferSize,
                    buffer,
                    filename: fileArr[i].fileName,
                    total_buffer_size: fileArr[i].fileSize,
                    uid: fileArr[i].fileUid,
                    peer: fileArr[i].peerID,
                });
            }
            if (textTypeCheck) {
                receiveDataElement(
                    textEl,
                    content,
                    fileArr[i].fileUid,
                    fileArr[i].peerID
                );
                shareFile({
                    channel: channel,
                    element: textEl,
                    filetype: fileType.text,
                    buffer_size: bufferSize,
                    content,
                    filename: fileArr[i].fileName,
                    total_buffer_size: fileArr[i].fileSize,
                    uid: fileArr[i].fileUid,
                    peer: fileArr[i].peerID,
                });
            }

            if (imageTypeCheck) {
                receiveDataElement(
                    imageEl,
                    buffer,
                    fileArr[i].fileUid,
                    fileArr[i].peerID
                );
                shareFile({
                    channel: channel,
                    element: imageEl,
                    filetype: fileType.image,
                    buffer_size: bufferSize,
                    buffer,
                    filename: fileArr[i].fileName,
                    total_buffer_size: fileArr[i].fileSize,
                    uid: fileArr[i].fileUid,
                    peer: fileArr[i].peerID,
                });
            }
        };
        if (textTypeCheck) {
            reader.readAsText(file);
        } else {
            reader.readAsArrayBuffer(file);
        }
        readFileProgress(reader);
    }
}

// File Progress
function readFileProgress(reader) {
    reader.onprogress = (e) => {
        let num = 0;
        if (e.loaded && e.total) {
            const percent = (e.loaded / e.total) * 100;
            num = num + Math.round(percent);
            progressEl.value = num;
            fileShareSocket.emit("file-progress", num, channel);
        }
    };
}

function shareFile(metadata) {
    fileShareSocket.emit("file-meta", metadata);
}

function shareReceiveFile() {
    fileShareSocket.on("fs-meta", (data) => {
        if (data.buffer) {
            receiveDataElement(data.element, data.buffer, data.uid, data.peer);
        } else if (data.content) {
            receiveDataElement(data.element, data.content, data.uid, data.peer);
        } else {
            return;
        }
    });
}

/**
 * @anthor 전형동
 * @data 2022 02 28
 * @description
 * 데이터 전송받아 Element에 담아 호출하는 함수
 */

function receiveDataElement(element, content, uid, peer) {
    let blobData = new Blob([content]);
    let url = window.URL.createObjectURL(blobData);

    bodyEl.append(fileTabList);
    spanEl = document.createElement("span");
    spanEl.classList.add("fileTab");

    if (element === "textarea") {
        spanEl.innerHTML = [
            `<${element} class="thumbnail ${uid} send-${peer}">${content}</${element}>`,
        ].join("");
        fileTabList.insertBefore(spanEl, null);
    } else if (element === "img") {
        spanEl.innerHTML = [
            `<${element} class="thumbnail ${uid} send-${peer}" src="${url}"/>`,
        ].join("");
        fileTabList.insertBefore(spanEl, null);
    } else if (element === "video") {
        spanEl.innerHTML = [
            `<${element} class="thumbnail ${uid} send-${peer}" src="${url}"/>`,
        ].join("");
        fileTabList.insertBefore(spanEl, null);
    } else if (element === "audio") {
        spanEl.classList.add("fas", "fa-file-audio");
        spanEl.style.setProperty("font-size", "6vw");
        spanEl.style.setProperty("text-align", "center");
        spanEl.innerHTML = [
            `<${element} class="thumbnail ${uid} send-${peer}" src="${url}"/>`,
        ].join("");
        fileTabList.insertBefore(spanEl, null);
    } else {
        return;
    }
    window.URL.revokeObjectURL(element.src);

    selectFileAction(uid);
}

/**
 * @anthor 전형동
 * @data 2022 02 28
 * @description
 * FileTab Click Event
 */
function selectFileAction(uid) {
    let receiverState = false;

    const thumbnail = document.querySelector(".thumbnail");
    if (thumbnail) {
        $(document).on("click", `.${uid}`, (e) => {
            // thumbnail.addEventListener("click", (e) => {
            const fileTab = document.querySelector(".fileTab");
            const fileList = document.querySelector("#fileList");

            let element;
            let url;

            if (e.target.children.length > 0) {
                element = e.target.children[0];
                url = element.src;
            } else {
                element = e.target;
                url = element.src;
            }

            const copyElement = element.cloneNode();

            receiverState = true;

            // const receiverPeerID = document.createElement("p");
            // receiverPeerID.textContent = options.uid;

            // receiverPeerID.style.setProperty("position", "absolute");
            // receiverPeerID.style.setProperty("display", "flex");
            // receiverPeerID.style.setProperty("align-items", "center");
            // receiverPeerID.style.setProperty("justify-content", "center");
            // receiverPeerID.style.setProperty("background", "#1d2635");
            // receiverPeerID.style.setProperty("border-radius", "2em");
            // receiverPeerID.style.setProperty("width", "100px");
            // receiverPeerID.style.setProperty("height", "2em");
            // receiverPeerID.style.setProperty("text-align", "center");
            // receiverPeerID.style.setProperty("color", "#fff");

            fileShareSocket.emit("file-receiver", {
                state: receiverState,
                channel: channel,
                uid: uid,
                peer: options.uid,
            });

            thumbnailBodyContainer(element, url);

            for (let i = 0; i < fileList.childNodes.length; i++) {
                if (fileList.childNodes[i].childElementCount < 1) {
                    fileTab.remove();
                }
            }
        });
    }
}

fileShareSocket.on("file-send", (state, uid, peer) => {
    let stateActivate = false;
    if (state === true) {
        const fileTabState = document.createElement("span");
        //  자바스크립트 selectr로는 클래스 uid를 잡을 수 없음 다른 방안을 생각해봐야 될듯...
        const selectFile = $(`.${uid}`);

        fileTabState.className = "fileTabState";
        fileTabState.classList.add("fas", "fa-user-check");

        selectFile.parent().append(fileTabState);

        fileTabStateFunc(fileTabState, stateActivate, peer);
    }
});

function fileTabStateFunc(fileTab, state, peer) {
    fileTab.addEventListener("click", (e) => {
        state = !state;
        const fileStateWindow = document.createElement("div");
        const fileShareBody = document.querySelector("#fileShareBody");
        fileStateWindow.id = "fileStateWindow";

        fileStateWindow.style.setProperty("width", "200px");
        fileStateWindow.style.setProperty("height", "200px");
        fileStateWindow.style.setProperty("border", "1px solid #000");

        fileStateWindow.textContent = peer;

        state
            ? fileTabStateEnable(fileShareBody, fileStateWindow)
            : fileTabStateDisable();
    });
}

function fileTabStateEnable(body, state) {
    body.append(state);
}

function fileTabStateDisable() {
    const fileStateWindow = document.querySelector("#fileStateWindow");
    fileStateWindow.remove();
}

function handlerFileRemove() {
    fileEmpty.addEventListener("click", () => {
        const bodyThumbnail = document.querySelector(".thumbnailBodyContainer");
        const fileShareBody = document.querySelector("#fileShareBody");

        if (fileShareBody.childNodes.length > 1) {
            if (bodyThumbnail.childNodes.length > 0) {
                for (let i = 0; i < bodyThumbnail.children.length; i++) {
                    bodyThumbnail.remove();
                }
            } else {
                return;
            }
        }
    });
}

/**
 * @anthor 전형동
 * @data 2022 02 28
 * @description
 * FileTab Click Event가 실행되면 화면에 클릭된 콘텐츠를 뿌려줌.
 */
function thumbnailBodyContainer(element, content) {
    element.src = content;
    element.autoplay = true;
    element.controls = true;

    const thumbnailBodyEl = document.createElement("section");
    thumbnailBodyEl.classList.add("thumbnailBodyContainer");
    const selectFileShareContainer = document.querySelector(
        ".fileShare-contentBox"
    );

    const containerWidth = document.querySelector(
        ".fileShareContainer"
    ).offsetWidth;
    const containerHeight = document.querySelector(
        ".fileShareContainer"
    ).offsetHeight;

    const contentsWidth = containerWidth / 1.4 + "px";
    const contentsHeight = containerHeight / 1.4 + "px";

    // let width = localContainer.offsetWidth + "px";

    thumbnailBodyEl.style.setProperty("width", `${contentsWidth}`);

    thumbnailBodyEl.append(element);
    bodyEl.append(thumbnailBodyEl);
}

/**
 * @author 전형동
 * @date 2022 03 05
 * @description
 * FileList Ctrl 함수
 */

function handlerFileListCtrl() {
    fileListActivator.addEventListener("click", (e) => {
        fileListBtnActive = !fileListBtnActive;
        fileListBtnActive
            ? handlerFileListCtrlEnable()
            : handlerFileListCtrlDisable();
    });
}

function handlerFileListCtrlEnable() {
    fileTabList.hidden = true;
}

function handlerFileListCtrlDisable() {
    fileTabList.hidden = false;
}

/**
 * @author 전형동
 * @date 2022 03 23
 * @description
 * File Data 객체 초기화 함수
 */

function fileDataInit(name, size, type, uid) {
    let data = {
        fileName: name,
        fileSize: size,
        fileType: type,
        fileUid: uid,
        peerID: options.uid,
    };

    return data;
}

/**
 * @author 전형동
 * @date 2022 03 23
 * @description
 * file UID 생성 함수
 */

function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
        (
            c ^
            (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
        ).toString(16)
    );
}
