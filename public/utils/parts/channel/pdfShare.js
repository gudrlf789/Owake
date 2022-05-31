import { socketInitFunc } from "./socket.js";
import { deviceScan } from "./deviceScan.js";

export const pdfFunc = () => {
    const pdfSocket = socketInitFunc();
    const pdfType = /(.*?)\/(pdf|PDF)$/i;
    let pdfShareActive = false;
    let event = deviceScan();

    const userName = window.sessionStorage.getItem("uid");
    const channelName = window.sessionStorage.getItem("channel");
    let originUser = userName;
    let choiceFile = "";
    let deleteContentTab = [];
    let myState = {
        pdf: null,
        currentPage: 1,
    };
    let scale = 5;

    const pdfShareBtn = document.querySelector("#pdfShare");
    const localVideoContainer = document.querySelector(
        "#local__video__container"
    );
    const pdfImg = document.querySelector("#pdf-img");

    const pdfShareArea = document.createElement("div");
    const pdfSearchContainer = document.createElement("div");
    const pdfSearchInput = document.createElement("input");

    const pdfShare = document.createElement("div");
    const pdfRender = document.createElement("canvas");

    const pdfNavContainer = document.createElement("section");
    const pdfTabArea = document.createElement("div");

    const pdfPageControls = document.createElement("div");
    const pdfPageNext = document.createElement("button");
    const pdfPagePrevious = document.createElement("button");
    pdfPageControls.id = "pdf-page-controls";
    pdfPageNext.id = "pdf-page-next";
    pdfPageNext.innerText = "Next";
    pdfPageNext.className = "btn btn-primary btn-sm";
    pdfPagePrevious.id = "pdf-page-previous";
    pdfPagePrevious.innerText = "Previos";
    pdfPagePrevious.className = "btn btn-secondary btn-sm";

    pdfNavContainer.id = "pdfNavContainer";
    pdfTabArea.id = "pdfTabArea";

    pdfSearchInput.type = "file";
    pdfSearchInput.style.textAlign = "center";

    pdfShare.id = "pdfShare-main";
    pdfShare.name = "pdfShare";
    pdfRender.id = "pdfRender";
    pdfShareArea.id = "pdfShareArea";
    pdfSearchContainer.id = "pdfSearchContainer";
    pdfSearchInput.id = "pdfSearchInput";

    pdfNavContainer.append(pdfSearchContainer);
    pdfSearchContainer.append(pdfSearchInput, pdfTabArea);

    pdfPageControls.append(pdfPagePrevious);
    pdfPageControls.append(pdfPageNext);

    pdfShareArea.append(pdfNavContainer);
    pdfShareArea.append(pdfShare);
    pdfShareArea.append(pdfPageControls);
    pdfShare.append(pdfRender);
    pdfShare.frameborder = "0";

    pdfTabArea.style.setProperty("height", "100%");
    pdfTabArea.style.setProperty("background", "#fff");
    pdfTabArea.style.setProperty("border", "2px solid #000");
    pdfTabArea.style.setProperty("display", "-webkit-box");
    pdfTabArea.style.setProperty("align-items", "center");
    pdfTabArea.style.setProperty("overflow", "auto");
    pdfTabArea.style.setProperty("z-index", "5");

    pdfSearchContainer.style.setProperty("flex-direction", "column");

    pdfShareBtn.addEventListener(event, (e) => {
        pdfShareActive = !pdfShareActive;
        pdfShareActive ? pdfShareEnable() : pdfShareDisable();
    });

    function createPdfTab(userName, fileType, fileName) {
        const html = `
            <span class="pdfMiddleContainerBtn" name="${userName}_${fileName}"
            style="margin: 0.4rem; padding: 0.2rem; background: #182843; color: #fff; cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; text-align: center;">
                <input type="hidden" value=${fileType}>
                <span style="background: #182843; color: white;">${userName}-${fileName}</span>
            </span>
            <div class="pdfCloseContent" name="${userName}_${fileName}">
                <i class="fas fa-times"></i>
            </div>
        `;

        $("#pdfTabArea").append(html);
    }

    function clearCanvas() {
        const canvas = document.getElementById("pdfRender");
        let ctx = canvas.getContext("2d");
        //convas 초기화
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
    }

    function pdfInit(fileName) {
        $("#spinnerModal").modal({
            backdrop: false,
        });

        pdfjsLib
            .getDocument("/channel/downloadPdf?fileName=" + fileName)
            .promise.then(
                (pdf) => {
                    myState.pdf = pdf;
                    render();
                    $("#spinnerModal").modal("hide");
                },
                (err) => {
                    alert("Error: " + err);
                }
            );
    }

    function render() {
        myState.pdf.getPage(myState.currentPage).then((page) => {
            let canvas = document.getElementById("pdfRender");
            const ctx = canvas.getContext("2d");

            const viewport = page.getViewport({ scale: scale });

            canvas.width = viewport.width;
            canvas.height = viewport.height;

            page.render({
                canvasContext: ctx,
                viewport: viewport,
            });
        });
    }

    pdfSearchInput.addEventListener("change", (e) => {
        const formData = new FormData();
        const fileData = pdfSearchInput.files[0];

        if (!pdfType.test(fileData.type)) {
            return alert("Only PDF file");
        }

        if (fileData.size > 150000000) {
            alert("You can upload up to 150MB");
            return;
        }

        formData.append("userName", userName);
        formData.append("content", fileData);

        axios
            .post("/channel/contentsUpload", formData)
            .then((res) => {
                if (res.data.success) {
                    createPdfTab(userName, fileData.type, fileData.name);
                    pdfSocket.emit(
                        "pdf-info",
                        channelName,
                        userName,
                        fileData.name,
                        fileData.type
                    );
                    pdfSearchInput.value = "";
                }
            })
            .catch((err) => {
                alert("Error occur");
                console.log("에러: " + err);
            });
    });

    function pdfShareEnable() {
        localVideoContainer.append(pdfShareArea);
        pdfShareArea.hidden = false;
        pdfShareBtn.style.color = "rgb(165, 199, 236)";
        pdfSocket.emit("join-pdf", channelName);

        pdfImg.src = "/right/pdf_a.svg";
    }

    function pdfShareDisable() {
        pdfShareArea.hidden = true;
        pdfShareBtn.style.color = "#fff";
        pdfSocket.emit("leave-pdf", channelName);

        pdfImg.src = "/right/pdf.svg";
    }

    $(document).on("click", ".pdfMiddleContainerBtn", async (e) => {
        originUser = e.currentTarget.getAttribute("name").split("_")[0];
        choiceFile = e.currentTarget.getAttribute("name");

        pdfPageNext.name = originUser;
        pdfPagePrevious.name = originUser;
        await pdfInit(choiceFile);
    });

    $(document).on("click", ".pdfCloseContent", (e) => {
        const deleteTagName = e.currentTarget.getAttribute("name");
        deleteContentTab = document.getElementsByName(deleteTagName);
        originUser = deleteTagName.split("_")[0];

        if (userName === originUser) {
            const data = {
                fileName: deleteTagName,
            };

            axios.post("/channel/contentsDelete", data).then((res) => {
                if (res.data.success && res.status === 200) {
                    pdfSocket.emit(
                        "delete-origin-tag",
                        channelName,
                        deleteTagName
                    );
                    for (let i = 0; i < 2; i++) {
                        deleteContentTab[0].remove();
                    }
                    myState.pdf = null;
                    clearCanvas();
                } else {
                    alert(res.data.deleteResult);
                }
            });
        } else {
            alert("You can delete only the files you post");
        }
    });

    $(document).on("click", "#pdf-page-next", (e) => {
        if (myState.pdf == null || myState.currentPage > myState.pdf.numPages) {
            alert("This is last page");
            return;
        }
        myState.currentPage += 1;
        render();
        if (originUser === userName) {
            pdfSocket.emit(
                "pdf-origin-next",
                channelName,
                myState.currentPage,
                choiceFile
            );
        }
    });

    $(document).on("click", "#pdf-page-previous", (e) => {
        if (myState.pdf == null || myState.currentPage <= 1) {
            alert("This is first page");
            return;
        }
        myState.currentPage -= 1;
        render();
        if (originUser === userName) {
            pdfSocket.emit(
                "pdf-origin-previous",
                channelName,
                myState.currentPage,
                choiceFile
            );
        }
    });

    /**
     * @Author 박형길
     * @param {*} mediaEvent (pdf)
     * @Date 2022 05 03
     * @Description
     * @returns
     */

    document.addEventListener(
        "scroll",
        function (e) {
            if (e.target.id === "pdfShare-main") {
                if (originUser === userName) {
                    const originTop =
                        document.getElementById("pdfShare-main").scrollTop;
                    const originLeft =
                        document.getElementById("pdfShare-main").scrollLeft;
                    pdfSocket.emit(
                        "scroll-origin-pdf",
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
     * @Date 2022 05 03
     * @Description
     * @returns
     */
    pdfSocket.on("input-pdf", (data) => {
        createPdfTab(data.userName, data.fileType, data.fileName);
    });

    pdfSocket.on("pdf-remote-next", (nextPage, playingFile) => {
        if (choiceFile === playingFile) {
            myState.currentPage = nextPage;
            render();
        }
    });

    pdfSocket.on("pdf-remote-previous", (previousPage, playingFile) => {
        if (choiceFile === playingFile) {
            myState.currentPage = previousPage;
            render();
        }
    });

    pdfSocket.on("scroll-remote-pdf", (originTop, originLeft, playingFile) => {
        const pdfShareMain = document.getElementById("pdfShare-main");
        if (choiceFile === playingFile) {
            pdfShareMain.scrollTop = originTop;
            pdfShareMain.scrollLeft = originLeft;
        }
    });

    pdfSocket.on("delete-remote-tag", (deleteTagName) => {
        deleteContentTab = document.getElementsByName(deleteTagName);
        for (let i = 0; i < 2; i++) {
            deleteContentTab[0].remove();
        }
        clearCanvas();
    });
};
