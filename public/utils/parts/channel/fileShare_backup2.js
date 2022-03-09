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

export const fileShare = () => {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        fileShareActivate();
    } else {
        alert("The File APIs are not fully supported in this browser.");
    }
};

let fileShareSocket = io();
let fileShareBtnActive = false;
let fileListBtnActive = false;
let channel = window.sessionStorage.getItem("channel");
let spanEl;
// Data Element
let videoEl = "video";
let audioEl = "audio";
let textEl = "textarea";
let imageEl = "img";
let slice;

// DOM Element
const el = document.createElement("section");
const navEl = document.createElement("nav");
const progressEl = document.createElement("input");
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
progressEl.id = "fileShare-progressBar";
fileTabList.id = "fileList";
chunkInfoEl.id = "chunkInfoContainer";
fileListActivator.id = "fileListActivator";
fileEmpty.id = "fileEmpty";

navEl.className = "fileShare-navbar";
bodyEl.className = "fileShare-contentBox";
progressEl.className = "progress-bar";

fileInputEl.type = "file";
fileInputEl.name = "files[]";
fileInputEl.multiple = true;

progressEl.type = "number";
progressEl.readOnly = true;
progressEl.style.setProperty("width", "120px");
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
    fileRemoteSocketAction();
    selectFileAction();
    handlerFileListCtrl();
    handlerFileRemove();
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

    for (let i = 0, file; (file = files[i]); i++) {
        let fileReader = new FileReader();
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

        slice = file.slice(0, 100000);

        if (textTypeCheck) {
            fileReader.readAsText(file);
        } else {
            fileReader.readAsDataURL(file);
            // fileReader.readAsArrayBuffer(file);
        }

        fileReader.onload = ((e) => {
            return (e) => {
                let data = fileReader.result;

                if (videoTypeCheck) {
                    receiveDataElement(videoEl, data);
                    fileShareSocket.emit(
                        "fileShare",
                        channel,
                        videoEl,
                        data,
                        fileType.video,
                        fileReader
                    );
                }
                if (audioTypeCheck) {
                    receiveDataElement(audioEl, data);
                    fileShareSocket.emit(
                        "fileShare",
                        channel,
                        audioEl,
                        data,
                        fileType.audio,
                        fileReader
                    );
                }
                if (textTypeCheck) {
                    receiveDataElement(textEl, data);
                    fileShareSocket.emit(
                        "fileShare",
                        channel,
                        textEl,
                        fileContents,
                        fileType.text,
                        fileReader
                    );
                }
                if (imageTypeCheck) {
                    receiveDataElement(imageEl, data);
                    fileShareSocket.emit(
                        "fileShare",
                        channel,
                        imageEl,
                        data,
                        fileType.image,
                        fileReader
                    );
                }
            };
        })(file);
        readFileProgress(fileReader);
    }
}

// File Progress
function readFileProgress(reader) {
    reader.addEventListener("progress", (e) => {
        if (e.loaded && e.total) {
            const percent = (e.loaded / e.total) * 100;
            progressEl.value = Math.round(percent);
        }
    });
}

// Video
function fileVideoElement(element, content, reader) {
    receiveDataElement(element, content, reader);
}
// Audio
function fileAudioElement(element, content, reader) {
    receiveDataElement(element, content, reader);
}
// Text
function fileTextElement(element, content, reader) {
    receiveDataElement(element, content, reader);
}
// Image
function fileImageElement(element, content, reader) {
    receiveDataElement(element, content, reader);
}

// PDF
function filePDFElement(element, content) {}
// CSV
function fileCSVElement(element, content) {}

function fileRemoteSocketAction() {
    fileShareSocket.on("send-fileShare", (element, data, type, reader) => {
        if (type === 0) {
            fileVideoElement(element, data, reader);
        } else if (type === 1) {
            fileAudioElement(element, data, reader);
        } else if (type === 2) {
            fileTextElement(element, data, reader);
        } else if (type === 3) {
            fileImageElement(element, data, reader);
        } else if (type === 4) {
            filePDFElement(element, data, reader);
        } else {
            alert("Type Error!!");
        }
    });
}

/**
 * @anthor 전형동
 * @data 2022 02 28
 * @description
 * 데이터 전송받아 Element에 담아 호출하는 함수
 */

function receiveDataElement(element, content) {
    bodyEl.append(fileTabList);
    spanEl = document.createElement("span");
    spanEl.classList.add("fileTab");
    if (element === "textarea") {
        spanEl.innerHTML = [
            `<${element} class="thumbnail" textContent="${content}"/>`,
        ].join("");
        fileTabList.insertBefore(spanEl, null);
    } else {
        spanEl.innerHTML = [
            `<${element} class="thumbnail" src="${content}"/>`,
        ].join("");
        fileTabList.insertBefore(spanEl, null);
    }
}

/**
 * @anthor 전형동
 * @data 2022 02 28
 * @description
 * FileTab Click Event
 */
function selectFileAction() {
    $(document).on("click", ".fileTab", (e) => {
        console.log(e);
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

function handlerFileRemove() {
    fileEmpty.addEventListener("click", () => {
        const bodyThumbnail = document.querySelector(".thumbnailBodyContainer");
        for (let i = 0; i < bodyThumbnail.children.length; i++) {
            bodyThumbnail.remove();
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
