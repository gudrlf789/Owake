export const contentsFunc = () => {
    let contentsSocket = io();
    const imageType = /(.*?)\/(jpg|JPG|jpeg|png|gif|bmp)$/i;
    const medioType = /(.*?)\/(mp4|m4v|avi|wmv|mwa|asf|mpg|mpeg|ts|mkv|mov|3gp|3g2|webm)$/i;

    contentsSocket.emit("join-contents", window.sessionStorage.getItem("channel"));

    const contentsFile = document.getElementById("contentsFile");
    const mainContainer = document.getElementById("content_main_container");
    const closeModal = document.getElementById("closeModal");

    const userName = window.sessionStorage.getItem("uid");
    const channelName = window.sessionStorage.getItem("channel");
    let originUser = userName;
    let choiceFile = "";

    const makeBtnTemplate = (userName, fileType, fileName) => {
        const html = 
        `
            <div class="middleContainerBtn">
                <input type="hidden" value=${fileType}>
                <input type="hidden" value="${fileName}">
                <button>${userName}-${fileName}</button>
            </div>
        `;

        $("#content_middle_container").append(html);
    };

    contentsFile.addEventListener("change", (e) => {
        const formData = new FormData();
        const fileData = contentsFile.files[0];

        formData.append("userName", userName);
        formData.append("content", fileData);
        
        axios.post("/channel/contentsUpload", formData).then((res) => {
            if(res.data.success){
                makeBtnTemplate(userName, fileData.type, fileData.name);
                contentsSocket.emit("content-info", channelName, userName, fileData.name, fileData.type);
            }
        });
    });

    $(document).on("click", ".middleContainerBtn", (e) => {
        const fileType = e.currentTarget.children[0].value;
        let fileName = e.currentTarget.children[1].value;
        originUser = e.currentTarget.children[2].innerHTML.split('-')[0];
        choiceFile = fileName = originUser + "_" + fileName;

        if(imageType.test(fileType)){
            mainContainer.innerHTML =
            `
                <div class="imageFile style="overflow: scroll, width: 100%, height:100%">
                    <img src="${fileName}" style="width: 100%" />
                </div>
            `;
        }
        if(medioType.test(fileType)){
            mainContainer.innerHTML =
            `
                <video class="mediaFile" controls style="width: 100%; height: 100%">
                    <source src="${fileName}">
                </video>
            `;
        }
    });

    contentsSocket.on("input-content", (data) => {
        makeBtnTemplate(data.userName, data.fileType, data.fileName);
    });

    contentsSocket.on("play-remote", (playingFile) => {
        const mediaFile = document.getElementsByClassName("mediaFile");
        if(mediaFile.length !== 0 && choiceFile === playingFile){
            mediaFile[0].play();
        }
    });

    contentsSocket.on("pause-remote", (playingFile) => {
        const mediaFile = document.getElementsByClassName("mediaFile");
        if(mediaFile.length !== 0 && choiceFile === playingFile){
            mediaFile[0].pause();
        }
    });

    contentsSocket.on("volume-remote", (originVolume, playingFile) => {
        const mediaFile = document.getElementsByClassName("mediaFile");
        if(mediaFile.length !== 0 && choiceFile === playingFile){
            mediaFile[0].volume = originVolume;
        }
    });

    contentsSocket.on("currentTime-remote", (currentTime, playingFile) => {
        const mediaFile = document.getElementsByClassName("mediaFile");
        if(mediaFile.length !== 0 && choiceFile === playingFile){
            mediaFile[0].currentTime = currentTime;
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
            contentsSocket.emit("play-origin", channelName, choiceFile);
        }
    }, true);

    document.addEventListener('pause', function (e) {
        if(originUser === userName) {
            contentsSocket.emit("pause-origin", channelName, choiceFile);
        }
    }, true);

    document.addEventListener('volumechange', function (e) {
        if(originUser === userName) {
            const originVolume = document.getElementsByClassName("mediaFile")[0].volume;
            contentsSocket.emit("volume-origin", channelName, originVolume, choiceFile);
        }
    }, true);

    document.addEventListener('seeked', function (e) {
        if(originUser === userName) {
            const currentTime = document.getElementsByClassName("mediaFile")[0].currentTime;
            contentsSocket.emit("currentTime-origin", channelName, currentTime, choiceFile);
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
            //const currentTime = document.getElementsByClassName("imageFile");
            //contentsSocket.emit("currentTime-origin", channelName, currentTime, choiceFile);
        }
    }, true);

    closeModal.addEventListener("click", (e) => {
        contentsSocket.emit("leave-contents", channelName);
    });
};
