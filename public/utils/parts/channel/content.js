import { socketInitFunc } from "./socket.js";

export const contentFunc = () => {
    const contentSocket = socketInitFunc();
    const imageType = /(.*?)\/(jpg|JPG|jpeg|png|gif|bmp)$/i;
    const mediaType = /(.*?)\/(mp4|m4v|avi|wmv|mwa|asf|mpg|mpeg|ts|mkv|mov|3gp|3g2|webm)$/i;
    let contentShareActive = false;

    const userName = window.sessionStorage.getItem("uid");
    const channelName = window.sessionStorage.getItem("channel");
    let originUser = userName;
    let choiceFile = "";

    const contentShareBtn = document.querySelector("#contentShare");
    const localVideoContainer = document.querySelector(
        "#local__video__container"
    );

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

    contentNavContainer.append(contentSearchContainer, contentTabArea);
    contentSearchContainer.append(contentSearchInput);

    contentShareArea.append(contentNavContainer, contentShare);
    contentShareArea.append(contentShare);
    contentShare.frameborder = "0";

    contentTabArea.style.setProperty("height", "3rem");
    contentTabArea.style.setProperty("background", "#fff");
    contentTabArea.style.setProperty("border", "2px solid #000");
    contentTabArea.style.setProperty("display", "flex");
    contentTabArea.style.setProperty("align-items", "center");
    //contentTabArea.style.setProperty("overflow-x", "auto");
    contentTabArea.style.setProperty("position", "fixed");
    contentTabArea.style.setProperty("z-index", "5");
    
    contentShareBtn.addEventListener("click", (e) => {
        contentShareActive = !contentShareActive;
        contentShareActive ? contentShareEnable() : contentShareDisable();
    });

    function createContentTab(userName, fileType, fileName) {
        const html = 
        `
            <div class="middleContainerBtn" style="margin: 0.4rem; padding: 0.2rem; background: #182843; color: #fff; cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; text-align: center;">
                <input type="hidden" value=${fileType}>
                <input type="hidden" value="${fileName}">
                <span style="background: #182843; color: white;">${userName}-${fileName}</span>
            </div>
        `;

        $("#contentTabArea").append(html);
    };

    contentSearchInput.addEventListener("change", (e) => {
        const formData = new FormData();
        const fileData = contentSearchInput.files[0];

        formData.append("userName", userName);
        formData.append("content", fileData);
        
        axios.post("/channel/contentsUpload", formData).then((res) => {
            if(res.data.success){
                createContentTab(userName, fileData.type, fileData.name);
                contentSocket.emit("content-info", channelName, userName, fileData.name, fileData.type);
                contentSearchInput.value = "";
            }
        });
    });
    

    function contentShareEnable() {
        localVideoContainer.append(contentShareArea);
        contentShareArea.hidden = false;
        contentShareBtn.style.color = "rgb(165, 199, 236)";
        contentSocket.emit("join-contents", channelName);
    }

    function contentShareDisable() {
        contentShareArea.hidden = true;
        contentShareBtn.style.color = "#fff";
        contentSocket.emit("leave-contents", channelName);
    }

    $(document).on("click", ".middleContainerBtn", (e) => {
        const fileType = e.currentTarget.children[0].value;
        let fileName = e.currentTarget.children[1].value;
        originUser = e.currentTarget.children[2].innerHTML.split('-')[0];
        choiceFile = fileName = originUser + "_" + fileName;

        if(imageType.test(fileType)){
            contentShare.innerHTML =
            `
                <div class="imageFile" style="overflow: auto; height:100%">
                    <img src="${fileName}" style="width: 100%" />
                </div>
            `;
        }
        if(mediaType.test(fileType)){
            contentShare.innerHTML =
            `
                <video class="mediaFile" controls style="width: 100%; height: 100%">
                    <source src="${fileName}">
                </video>
            `;
        }
    });

    /**
     * @Author 박형길
     * @param {*} mediaEvent (video, audio)
     * @Date 2022 04 19
     * @Description
     * @returns
     */
     document.addEventListener('play', function (e) {
        if(originUser === userName) {
            contentSocket.emit("play-origin", channelName, choiceFile);
        }
    }, true);

    document.addEventListener('pause', function (e) {
        if(originUser === userName) {
            contentSocket.emit("pause-origin", channelName, choiceFile);
        }
    }, true);

    document.addEventListener('volumechange', function (e) {
        if(originUser === userName) {
            const originVolume = document.getElementsByClassName("mediaFile")[0].volume;
            contentSocket.emit("volume-origin", channelName, originVolume, choiceFile);
        }
    }, true);

    document.addEventListener('seeked', function (e) {
        if(originUser === userName) {
            const currentTime = document.getElementsByClassName("mediaFile")[0].currentTime;
            contentSocket.emit("currentTime-origin", channelName, currentTime, choiceFile);
        }
    }, true);

    /**
     * @Author 박형길
     * @param {*} mediaEvent (image)
     * @Date 2022 04 19
     * @Description
     * @returns
     */

     document.addEventListener('scroll', function (e) {
        if(originUser === userName) {
            const originTop = document.getElementsByClassName("imageFile")[0].scrollTop;
            const originLeft = document.getElementsByClassName("imageFile")[0].scrollLeft;
            contentSocket.emit("scroll-origin", channelName, originTop, originLeft, choiceFile);
        }
    }, true);

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

    contentSocket.on("play-remote", (playingFile) => {
        const mediaFile = document.getElementsByClassName("mediaFile");
        if(mediaFile.length !== 0 && choiceFile === playingFile){
            mediaFile[0].play();
        }
    });

    contentSocket.on("pause-remote", (playingFile) => {
        const mediaFile = document.getElementsByClassName("mediaFile");
        if(mediaFile.length !== 0 && choiceFile === playingFile){
            mediaFile[0].pause();
        }
    });

    contentSocket.on("volume-remote", (originVolume, playingFile) => {
        const mediaFile = document.getElementsByClassName("mediaFile");
        if(mediaFile.length !== 0 && choiceFile === playingFile){
            mediaFile[0].volume = originVolume;
        }
    });

    contentSocket.on("currentTime-remote", (currentTime, playingFile) => {
        const mediaFile = document.getElementsByClassName("mediaFile");
        if(mediaFile.length !== 0 && choiceFile === playingFile){
            mediaFile[0].currentTime = currentTime;
        }
    });

    contentSocket.on("scroll-remote", (originTop, originLeft, playingFile) => {
        const imageFile = document.getElementsByClassName("imageFile");
        if(imageFile.length !== 0 && choiceFile === playingFile){
            imageFile[0].scrollTop = originTop;
            imageFile[0].scrollLeft = originLeft;
        }
    });

};
