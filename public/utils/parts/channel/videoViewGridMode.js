import { totalUsers } from "../../rtcClient.js";

let gridViewActivator = false;

let videoGrid = document.querySelector("#video-grid");
let gridModeBtn = document.querySelector("#video-grid-button");
let lVideoContainer = document.querySelector("#local__video__container");
let rVideoContainer = document.querySelector("#remote__video__container")
let gridContainer;
let selectVideos;
let videoArr = [];

export const gridView = () => {
    gridViewBtnActivator();
};

function gridViewBtnActivator() {
    
    gridModeBtn.addEventListener("click", (e) => {
        gridViewActivator = !gridViewActivator;
        gridViewActivator ? gridViewEnable(e) : gridViewDisable(e);
    })
}

function gridViewEnable(e) {

    selectVideos = document.querySelectorAll("video");

    for (let i = 0; i < selectVideos.length; i++){
        videoArr.push(selectVideos[i].parentNode);
        console.log(videoArr)
    }

    lVideoContainer.style.display = "none"
    rVideoContainer.style.display = "none"

    gridContainer = document.createElement("div");

    videoGrid.append(gridContainer)

    while (0 < videoArr.length) {
        gridContainer.append(videoArr.pop());   
    }
}

function gridViewDisable(e) {
    
}

function scrapsBoxRemove() {
    
}
