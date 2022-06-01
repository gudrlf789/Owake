import { socketInitFunc } from "./socket.js";
import { deviceScan } from "./deviceScan.js";

let event = deviceScan();

export const contentFunc = () => {
    const contentSocket = socketInitFunc();
    const imageType = /(.*?)\/(jpg|JPG|jpeg|png|gif|bmp)$/i;
    const mediaType =
        /(.*?)\/(mp4|m4v|avi|wmv|mwa|asf|mpg|mpeg|ts|mkv|mov|3gp|3g2|webm)$/i;
    let contentShareActive = false;

    const userName = window.sessionStorage.getItem("uid");
    const channelName = window.sessionStorage.getItem("channel");
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

    contentShareBtn.addEventListener(event, (e) => {
        contentShareActive = !contentShareActive;
        contentShareActive ? contentShareEnable() : contentShareDisable();
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
                    contentSocket.emit(
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
        contentSocket.emit("join-contents", channelName);
        mediaImg.src = "/right/media_a.svg";
    }

    function contentShareDisable() {
        contentShareArea.hidden = true;
        contentSocket.emit("leave-contents", channelName);
        mediaImg.src = "/right/media.svg";
    }

    $(document).on(event, ".middleContainerBtn", (e) => {
        const fileType = e.currentTarget.children[0].value;
        originUser = e.currentTarget.getAttribute("name").split("_")[0];
        choiceFile = e.currentTarget.getAttribute("name");

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
    });

    $(document).on(event, ".closeContent", (e) => {
        const deleteTagName = e.currentTarget.getAttribute("name");
        deleteContentTab = document.getElementsByName(deleteTagName);
        originUser = deleteTagName.split("_")[0];

        if (userName === originUser) {
            const data = {
                fileName: deleteTagName,
                channelName: channelName,
                userName: originUser,
            };

            axios
                .post("/channel/contentsDelete", data)
                .then((res) => {
                    if (res.data.success && res.status === 200) {
                        contentSocket.emit(
                            "delete-origin-tag",
                            channelName,
                            deleteTagName
                        );
                        for (let i = 0; i < 2; i++) {
                            deleteContentTab[0].remove();
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
            if (originUser === userName) {
                const currentTime =
                    document.getElementsByClassName("mediaFile")[0].currentTime;
                contentSocket.emit(
                    "play-origin",
                    channelName,
                    choiceFile,
                    currentTime
                );
            }
        },
        true
    );

    document.addEventListener(
        "pause",
        function (e) {
            if (originUser === userName) {
                contentSocket.emit("pause-origin", channelName, choiceFile);
            }
        },
        true
    );

    document.addEventListener(
        "volumechange",
        function (e) {
            if (originUser === userName) {
                const originVolume =
                    document.getElementsByClassName("mediaFile")[0].volume;
                contentSocket.emit(
                    "volume-origin",
                    channelName,
                    originVolume,
                    choiceFile
                );
            }
        },
        true
    );

    document.addEventListener(
        "seeked",
        function (e) {
            if (originUser === userName) {
                const currentTime =
                    document.getElementsByClassName("mediaFile")[0].currentTime;
                contentSocket.emit(
                    "currentTime-origin",
                    channelName,
                    currentTime,
                    choiceFile
                );
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
            if (e.target.id === "") {
                if (originUser === userName) {
                    const originTop =
                        document.getElementsByClassName("imageFile")[0]
                            .scrollTop;
                    const originLeft =
                        document.getElementsByClassName("imageFile")[0]
                            .scrollLeft;
                    contentSocket.emit(
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
     * @param {*} socket event handler
     * @Date 2022 04 19
     * @Description
     * @returns
     */
    contentSocket.on("input-content", (data) => {
        createContentTab(data.userName, data.fileType, data.fileName);
    });

    contentSocket.on("play-remote", (playingFile, currentTime) => {
        const mediaFile = document.getElementsByClassName("mediaFile");
        if (mediaFile.length !== 0 && choiceFile === playingFile) {
            mediaFile[0].currentTime = currentTime;
            mediaFile[0].play();
        }
    });

    contentSocket.on("pause-remote", (playingFile) => {
        const mediaFile = document.getElementsByClassName("mediaFile");
        if (mediaFile.length !== 0 && choiceFile === playingFile) {
            mediaFile[0].pause();
        }
    });

    contentSocket.on("volume-remote", (originVolume, playingFile) => {
        const mediaFile = document.getElementsByClassName("mediaFile");
        if (mediaFile.length !== 0 && choiceFile === playingFile) {
            mediaFile[0].volume = originVolume;
        }
    });

    contentSocket.on("currentTime-remote", (currentTime, playingFile) => {
        const mediaFile = document.getElementsByClassName("mediaFile");
        if (mediaFile.length !== 0 && choiceFile === playingFile) {
            mediaFile[0].currentTime = currentTime;
        }
    });

    contentSocket.on("scroll-remote", (originTop, originLeft, playingFile) => {
        const imageFile = document.getElementsByClassName("imageFile");
        if (imageFile.length !== 0 && choiceFile === playingFile) {
            imageFile[0].scrollTop = originTop;
            imageFile[0].scrollLeft = originLeft;
        }
    });

    contentSocket.on("delete-remote-tag", (deleteTagName) => {
        deleteContentTab = document.getElementsByName(deleteTagName);
        for (let i = 0; i < 2; i++) {
            deleteContentTab[0].remove();
        }
    });
};
