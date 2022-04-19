export const contentsFunc = () => {
    let contentsSocket = io();

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

    contentsSocket.on("currentTime-remote", (currentTime, playingFile) => {
        const mediaFile = document.getElementsByClassName("mediaFile");
        if(mediaFile.length !== 0 && choiceFile === playingFile){
            mediaFile[0].currentTime = currentTime;
        }
    });

    $(document).on("click", ".middleContainerBtn", (e) => {
        let fileName = e.currentTarget.children[1].value;
        originUser = e.currentTarget.children[2].innerHTML.split('-')[0];
        choiceFile = fileName = originUser + "_" + fileName;

        mainContainer.innerHTML = 
        `
            <video class="mediaFile" controls style="width: 100%; height: 100%">
                <source src="${fileName}">
            </video>
        `;
    });

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
        
    }, true);

    document.addEventListener('seeked', function (e) {
        if(originUser === userName) {
            const currentTime = document.getElementsByClassName("mediaFile")[0].currentTime;
            contentsSocket.emit("currentTime-origin", channelName, currentTime, choiceFile);
        }
    }, true);


    closeModal.addEventListener("click", (e) => {
        contentsSocket.emit("leave-contents", channelName);
    });
};
