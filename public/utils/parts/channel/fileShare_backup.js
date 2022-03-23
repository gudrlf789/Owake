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

// elements Object
let elements = {
    video: "video",
    audio: "audio",
    text: "textarea",
    img: "img",
};

// fileType Object
let fileType = {
    video: 0,
    audio: 1,
    text: 2,
    image: 3,
    pdf: 4,
};

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
    selectFileAction();
    handlerFileListCtrl();
    handlerFileRemove();
    shareReceiveFile();
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
            file.type.includes("css");

        let imageTypeCheck =
            file.type.includes("png") ||
            file.type.includes("jpg") ||
            file.type.includes("jpeg") ||
            file.type.includes("gif") ||
            file.type.includes("svg") ||
            file.type.includes("webp");

        let reader = new FileReader();

        reader.onload = (e) => {
            let content = e.target.result;
            let buffer = new Uint8Array(e.target.result);

            fileData = fileDataInit(
                channel,
                file.name,
                file.size,
                file.type,
                fileType,
                uid,
                elements,
                bufferSize,
                buffer,
                content
            );

            // File 배열에 데이터 삽입
            fileArr[i] = fileData;

            console.log(fileArr[i]);

            if (videoTypeCheck) {
                receiveDataElement(fileArr[i]);
                shareFile({
                    channel: fileArr[i].channel,
                    fileElement: fileArr[i].fileElement.video,
                    fileTypeNumber: fileArr[i].fileTypeNumber.video,
                    fileBufferSize: fileArr[i].fileBufferSize,
                    fileType: fileArr[i].fileType,
                    fileBuffer: fileArr[i].fileBuffer,
                    fileName: fileArr[i].fileName,
                    fileSize: fileArr[i].fileSize,
                    fileUid: fileArr[i].fileUid,
                    peerID: fileArr[i].peerID,
                    fileContent: null,
                });
            }
            if (audioTypeCheck) {
                receiveDataElement(fileArr[i]);
                shareFile({
                    channel: fileArr[i].channel,
                    fileElement: fileArr[i].fileElement.audio,
                    fileTypeNumber: fileArr[i].fileTypeNumber.audio,
                    fileBufferSize: fileArr[i].fileBufferSize,
                    fileType: fileArr[i].fileType,
                    fileBuffer: fileArr[i].fileBuffer,
                    fileName: fileArr[i].fileName,
                    fileSize: fileArr[i].fileSize,
                    fileUid: fileArr[i].fileUid,
                    peerID: fileArr[i].peerID,
                    fileContent: null,
                });
            }
            if (textTypeCheck) {
                receiveDataElement(fileArr[i]);
                shareFile({
                    channel: fileArr[i].channel,
                    fileElement: fileArr[i].fileElement.text,
                    fileTypeNumber: fileArr[i].fileTypeNumber.text,
                    fileBufferSize: fileArr[i].fileBufferSize,
                    fileType: fileArr[i].fileType,
                    fileBuffer: null,
                    fileName: fileArr[i].fileName,
                    fileSize: fileArr[i].fileSize,
                    fileUid: fileArr[i].fileUid,
                    peerID: fileArr[i].peerID,
                    fileContent: fileArr[i].fileContent,
                });
            }

            if (imageTypeCheck) {
                receiveDataElement(fileArr[i]);
                shareFile({
                    channel: fileArr[i].channel,
                    fileElement: fileArr[i].fileElement.img,
                    fileTypeNumber: fileArr[i].fileTypeNumber.image,
                    fileBufferSize: fileArr[i].fileBufferSize,
                    fileType: fileArr[i].fileType,
                    fileBuffer: fileArr[i].fileBuffer,
                    fileName: fileArr[i].fileName,
                    fileSize: fileArr[i].fileSize,
                    fileUid: fileArr[i].fileUid,
                    peerID: fileArr[i].peerID,
                    fileContent: null,
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

// Recevie Progress
fileShareSocket.on("fs-progress", (progress) => {
    progressEl.value = progress;
});

function shareFile(metadata) {
    console.log(metadata);
    fileShareSocket.emit("file-meta", metadata);
}

function shareReceiveFile() {
    fileShareSocket.on("fs-meta", (data) => {
        console.log(data);
        if (data.fileBuffer !== null) {
            receiveDataElement(data);
        } else if (data.fileContent !== null) {
            receiveDataElement(data);
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

function receiveDataElement(data) {
    console.log(":::receiveDataElement:::::", data);
    let uid = data.fileUid;
    let peer = data.peerID;
    let filename = data.fileName;
    let element = data.fileElement;
    let fileType = data.fileType;
    let fileTypeNumber = data.fileTypeNumber;

    let blobData = new Blob([data.fileBuffer]);
    let url = window.URL.createObjectURL(blobData);

    bodyEl.append(fileTabList);
    spanEl = document.createElement("span");
    spanEl.classList.add("fileTab");
    const containerWidth = document.querySelector(
        ".fileShareContainer"
    ).offsetWidth;
    const containerHeight = document.querySelector(
        ".fileShareContainer"
    ).offsetHeight;

    const contentsWidth = containerWidth / 1.4 + "px";
    const contentsHeight = containerHeight / 1.4 + "px";

    if (fileType.includes("text")) {
        spanEl.innerHTML = [
            `<${element} class="thumbnail-${uid}-${peer}" style= "width: ${contentsWidth}; height: ${contentsHeight};">${content}</${element}>`,
        ].join("");
        // spanEl.innerHTML = [`${filename}`].join("");
        fileTabList.insertBefore(spanEl, null);
    } else if (fileTypeNumber === 3) {
        spanEl.innerHTML = [
            `<${element} class="thumbnail-${uid}-${peer}" style= "width: ${contentsWidth};" src="${url}"/>`,
        ].join("");
        // spanEl.innerHTML = [`${filename}`].join("");
        fileTabList.insertBefore(spanEl, null);
    } else if (fileTypeNumber === 0) {
        spanEl.innerHTML = [
            `<${element} class="thumbnail-${uid}-${peer}" style= "width: ${contentsWidth};" src="${url}"/>`,
        ].join("");
        // spanEl.innerHTML = [`${filename}`].join("");
        fileTabList.insertBefore(spanEl, null);
    } else if (fileTypeNumber === 1) {
        spanEl.innerHTML = [
            `<${element} class="thumbnail-${uid}-${peer}" style= "width: ${contentsWidth};" src="${url}"/>`,
        ].join("");
        // spanEl.innerHTML = [`${filename}`].join("");
        fileTabList.insertBefore(spanEl, null);
    } else {
        return;
    }

    window.URL.revokeObjectURL(element.src);
}

/**
 * @anthor 전형동
 * @data 2022 02 28
 * @description
 * FileTab Click Event
 */
function selectFileAction() {
    $(document).on("click", ".fileTab", (e) => {
        e.stopImmediatePropagation();
        let element = e.target;
        let url = element.src;
        thumbnailBodyContainer(element, url);
        const fileTab = document.querySelector(".fileTab");

        for (let i = 0; i < fileTab.length; i++) {
            if (fileTab.childNodes.length === 0) {
                fileTab.remove();
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
    const selectFileShareContainer = document.querySelector(
        ".fileShare-contentBox"
    );

    let width = localContainer.offsetWidth + "px";

    selectFileShareContainer.style.setProperty("width", width);
    thumbnailBodyEl.classList.add("thumbnailBodyContainer");
    thumbnailBodyEl.append(element);
    bodyEl.append(thumbnailBodyEl);
}

function handlerFileRemove() {
    fileEmpty.addEventListener("click", () => {
        const bodyThumbnail = document.querySelector(".thumbnailBodyContainer");

        if (bodyThumbnail.childNodes.length > 0) {
            for (let i = 0; i < bodyThumbnail.children.length; i++) {
                bodyThumbnail.remove();
            }
        } else {
            return;
        }
    });
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

function fileDataInit(
    channel,
    name,
    size,
    type,
    typeNumber,
    uid,
    element,
    bufferSize,
    buffer,
    content
) {
    let data = {
        channel: channel,
        fileName: name,
        fileSize: size,
        fileType: type,
        fileTypeNumber: typeNumber,
        fileUid: uid,
        fileElement: element,
        fileBuffer: buffer,
        fileBufferSize: bufferSize,
        fileContent: content,
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
