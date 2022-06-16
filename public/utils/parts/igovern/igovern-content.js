import { deviceScan } from "./igovern-deviceScan.js";
import { channelName, userName } from "./igovern-sessionStorage.js";
import { checkIsHost } from "./igovern-checkIsHost.js";

let event = deviceScan();

export const contentFunc = (contentShareSocket) => {
    const imageType = /(.*?)\/(jpg|JPG|jpeg|png|gif|bmp)$/i;
    const mediaType = /(.*?)\/(mp4|m4v|avi|wmv|mwa|asf|mpg|mpeg|ts|mkv|mov|3gp|3g2|webm)$/i;
    let contentShareActive = false;
    let originUser = userName;
    let choiceFile = "";
    let deleteContentTab = [];

    const contentShareBtn = document.querySelector("#contentShare");
    const localVideoContainer = document.querySelector(
        "#local__video__container"
    );

    const mediaImg = document.querySelector("#media-img");
    
    const contentShareArea = document.createElement("div");
    const contentSearchContainer = document.createElement("div");
    const contentSearchInput = document.createElement("input");

    const contentShare = document.createElement("div");

    const contentNavContainer = document.createElement("section");
    const contentTabArea = document.createElement("div");

    contentNavContainer.id = "contentNavContainer";
    contentTabArea.id = "contentTabArea";

    contentSearchInput.type = "file";
    contentSearchInput.style.textAlign = "center";

    contentShare.id = "contentShare-main";
    contentShare.name = "contentShare";
    contentShareArea.id = "contentShareArea";
    contentSearchContainer.id = "contentSearchContainer";
    contentSearchInput.id = "contentSearchInput";

    contentNavContainer.append(contentSearchContainer);
    contentSearchContainer.append(contentSearchInput, contentTabArea);

    contentShareArea.append(contentNavContainer, contentShare);
    contentShareArea.append(contentShare);
    contentShare.frameborder = "0";

    contentTabArea.style.setProperty("height", "100%");
    contentTabArea.style.setProperty("background", "#fff");
    contentTabArea.style.setProperty("border", "2px solid #000");
    contentTabArea.style.setProperty("display", "-webkit-box");
    contentTabArea.style.setProperty("align-items", "center");
    contentTabArea.style.setProperty("overflow", "auto");
    contentTabArea.style.setProperty("z-index", "5");

    contentSearchContainer.style.setProperty("flex-direction", "column");
    
    contentShareSocket.on("igoven-contentShare-client", (contentShareActive) => {
        contentShareActive ? contentShareEnable() : contentShareDisable();
    });

    function contentShareSocketEvent(contentShareActive) {
        contentShareActive ? contentShareEnable() : contentShareDisable();
        contentShareSocket.emit("igoven-contentShare", channelName, contentShareActive);
    };

    contentShareBtn.addEventListener(event, (e) => {
        contentShareActive = !contentShareActive;

        if(checkIsHost()){
            contentShareSocketEvent(contentShareActive);
        }else {
            alert("Host Only");
        }
    });

    function createContentTab(userName, fileType, fileName) {
        const html = `
            <span class="middleContainerBtn" name="${userName}_${fileName}"
            style="margin: 0.4rem; padding: 0.2rem; background: #182843; color: #fff; cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; text-align: center;">
                <input type="hidden" value=${fileType}>
                <span style="background: #182843; color: white;">${userName}-${fileName}</span>
            </span>
            <div class="closeContent" name="${userName}_${fileName}">
                <i class="fas fa-times"></i>
            </div>
        `;

        $("#contentTabArea").append(html);
    }

    contentSearchInput.addEventListener("change", (e) => {
        const fileData = contentSearchInput.files[0];

        if (!imageType.test(fileData.type) && !mediaType.test(fileData.type)) {
            alert("Only image, video type file");
            return;
        }

        if (fileData.size > 150000000) {
            alert("You can upload up to 150MB");
            return;
        }

        const formData = new FormData();
        formData.append("userName", userName);
        formData.append("channelName", channelName);
        formData.append("content", fileData);

        axios
            .post("/channel/contentsUpload", formData)
            .then((res) => {
                if (res.data.success) {
                    createContentTab(userName, fileData.type, fileData.name);
                    contentShareSocket.emit(
                        "content-info",
                        channelName,
                        userName,
                        fileData.name,
                        fileData.type
                    );
                    contentSearchInput.value = "";
                }
            })
            .catch((err) => {
                alert("Error occur");
                $("#spinnerModal").modal("hide");
                console.log("에러: " + err);
            });
    });

    function contentShareEnable() {
        localVideoContainer.append(contentShareArea);
        contentShareArea.hidden = false;
        //contentShareSocket.emit("join-contents", channelName);
        mediaImg.src = "/right/media_a.svg";
    }

    function contentShareDisable() {
        contentShareArea.hidden = true;
        //contentShareSocket.emit("leave-contents", channelName);
        mediaImg.src = "/right/media.svg";
    }

    function playMediaContent(fileType, choiceFile, originUser) {
        if (imageType.test(fileType)) {
            contentShare.innerHTML = `
                <div class="imageFile" name="${choiceFile}" style="overflow: auto; height:100%">
                    <img src="${channelName}/${originUser}/${choiceFile}" style="width: 100%" />
                </div>
            `;
        }
        if (mediaType.test(fileType)) {
            contentShare.innerHTML = `
                <video class="mediaFile" name="${choiceFile}" controls controlsList="nodownload" style="width: 100%; height: 100%">
                    <source src="${channelName}/${originUser}/${choiceFile}">
                </video>
            `;
        }
    }

    $(document).on(event, ".middleContainerBtn", (e) => {
        const fileType = e.currentTarget.children[0].value;
        originUser = e.currentTarget.getAttribute("name").split("_")[0];
        choiceFile = e.currentTarget.getAttribute("name");
        
        if(checkIsHost()){
            contentShareSocket.emit("igoven-choice-host-media", channelName, fileType, choiceFile, originUser);
        }
        playMediaContent(fileType, choiceFile, originUser);
    });

    $(document).on(event, ".closeContent", (e) => {
        const deleteTagName = e.currentTarget.getAttribute("name");
        deleteContentTab = document.getElementsByName(deleteTagName);
        originUser = deleteTagName.split("_")[0];

        if (userName === originUser) {
            const data = {
                fileName: deleteTagName,
                channelName: channelName,
                userName: userName,
            };

            axios
                .post("/channel/contentsDelete", data)
                .then((res) => {
                    if (res.data.success && res.status === 200) {
                        contentShareSocket.emit(
                            "delete-origin-tag",
                            channelName,
                            deleteTagName
                        );
                        if (deleteContentTab.length === 2) {
                            for (let i = 0; i < 2; i++) {
                                deleteContentTab[0].remove();
                            }
                        } else {
                            for (let i = 0; i < 3; i++) {
                                deleteContentTab[0].remove();
                            }
                        }
                    } else {
                        alert(res.data.deleteResult);
                    }
                })
                .catch((err) => {
                    alert("Error occur");
                    $("#spinnerModal").modal("hide");
                    console.log("에러: " + err);
                });
        } else {
            alert("You can delete only the files you post");
        }
    });

    /**
     * @Author 박형길
     * @param {*} mediaEvent (video, audio)
     * @Date 2022 04 19
     * @Description
     * @returns
     */
    document.addEventListener(
        "play",
        function (e) {
            if(e.path[1].id === "contentShare-main"){
                if (checkIsHost()) {
                    const currentTime = document.getElementsByClassName("mediaFile")[0].currentTime;
                    contentShareSocket.emit(
                        "play-origin",
                        channelName,
                        choiceFile,
                        currentTime
                    );
                }
            }
        },
        true
    );

    document.addEventListener(
        "pause",
        function (e) {
            if(e.path[1].id === "contentShare-main"){
                if (checkIsHost()) {
                    contentShareSocket.emit("pause-origin", channelName, choiceFile);
                }
            }
        },
        true
    );

    document.addEventListener(
        "volumechange",
        function (e) {
            if(e.path[1].id === "contentShare-main"){
                if (checkIsHost()) {
                    const originVolume =
                        document.getElementsByClassName("mediaFile")[0].volume;
                    contentShareSocket.emit(
                        "volume-origin",
                        channelName,
                        originVolume,
                        choiceFile
                    );
                }
            }
        },
        true
    );

    document.addEventListener(
        "seeked",
        function (e) {
            if(e.path[1].id === "contentShare-main"){
                if (checkIsHost()) {
                    const currentTime =
                        document.getElementsByClassName("mediaFile")[0].currentTime;
                    contentShareSocket.emit(
                        "currentTime-origin",
                        channelName,
                        currentTime,
                        choiceFile
                    );
                }
            }
        },
        true
    );

    /**
     * @Author 박형길
     * @param {*} mediaEvent (image)
     * @Date 2022 04 19
     * @Description
     * @returns
     */

    document.addEventListener(
        "scroll",
        function (e) {
            if(e.path[1].id === "contentShare-main"){
                if (checkIsHost()) {
                    const originTop =
                        document.getElementsByClassName("imageFile")[0]
                            .scrollTop;
                    const originLeft =
                        document.getElementsByClassName("imageFile")[0]
                            .scrollLeft;
                    contentShareSocket.emit(
                        "scroll-origin",
                        channelName,
                        originTop,
                        originLeft,
                        choiceFile
                    );
                }
            }
        },
        true
    );

    /**
     * @Author 박형길
     * @param {*} contentShareSocket event handler
     * @Date 2022 04 19
     * @Description
     * @returns
     */
    contentShareSocket.on("input-content", (data) => {
        createContentTab(data.userName, data.fileType, data.fileName);
    });

    contentShareSocket.on("play-remote", (playingFile, currentTime) => {
        const mediaFile = document.getElementsByClassName("mediaFile");
        if (mediaFile.length !== 0) {
            mediaFile[0].currentTime = currentTime;
            mediaFile[0].play();
        }
    });

    contentShareSocket.on("pause-remote", (playingFile) => {
        const mediaFile = document.getElementsByClassName("mediaFile");
        if (mediaFile.length !== 0) {
            mediaFile[0].pause();
        }
    });

    contentShareSocket.on("volume-remote", (originVolume, playingFile) => {
        const mediaFile = document.getElementsByClassName("mediaFile");
        if (mediaFile.length !== 0) {
            mediaFile[0].volume = originVolume;
        }
    });

    contentShareSocket.on("currentTime-remote", (currentTime, playingFile) => {
        const mediaFile = document.getElementsByClassName("mediaFile");
        if (mediaFile.length !== 0) {
            mediaFile[0].currentTime = currentTime;
        }
    });

    contentShareSocket.on("scroll-remote", (originTop, originLeft, playingFile) => {
        const imageFile = document.getElementsByClassName("imageFile");
        if (imageFile.length !== 0) {
            imageFile[0].scrollTop = originTop;
            imageFile[0].scrollLeft = originLeft;
        }
    });

    contentShareSocket.on("delete-remote-tag", (deleteTagName) => {
        deleteContentTab = document.getElementsByName(deleteTagName);
        if (deleteContentTab.length === 2) {
            for (let i = 0; i < 2; i++) {
                deleteContentTab[0].remove();
            }
        } else {
            for (let i = 0; i < 3; i++) {
                deleteContentTab[0].remove();
            }
        }
    });

    contentShareSocket.on("igoven-play-host-media", (fileType, choiceFile, originUser) => {
        playMediaContent(fileType, choiceFile, originUser);
    });
};
