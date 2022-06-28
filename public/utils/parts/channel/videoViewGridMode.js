import { totalUsers } from "../../rtcClient.js";

let gridViewActivator = false;

let videoGrid = document.querySelector("#video-grid");
let selectVideos = document.querySelectorAll("video");
let videoArr = [];

export const gridView = () => {
    gridViewBtnActivator();
};

function gridViewBtnActivator() {
    $(document).on("click", "#video-grid-button", (e) => {
        gridViewActivator = !gridViewActivator;
        gridViewActivator ? gridViewEnable() : gridViewDisable();

    });
}

function gridViewEnable() {
    for (let i = 0; i < selectVideos.length; i++){
        console.log("enable")
        console.log(selectVideos);
    }
}

function gridViewDisable() {
    
}

function scrapsBoxRemove() {
    
}
