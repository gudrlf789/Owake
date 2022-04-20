/**
 * @author 전형동
 * @version 1.0
 * @data 2022.04.10
 * @description
 * resultURLprotocolCheck,
 * searchUrlTransfer
 * resultURLContentCheck
 * 함수 추가
 *
 * searchContainer에 있는 Form 태그 삭제 (필요없음)
 *
 */

import { socketInitFunc } from "./socket.js";
import { options } from "../../rtcClient.js";

export const momentShareFunc = () => {
    const momentSocket = socketInitFunc();
    let momentShareActive = false;
    let InputURL;
    let staticURL = "/webShare";

    const momentShareBtn = document.querySelector("#momentShare");
    const momentShareIcon = document.querySelector(".fa-brain");
    const localVideoContainer = document.querySelector(
        "#local__video__container"
    );

    const momentShareArea = document.createElement("div");
    const searchContainer = document.createElement("div");
    const searchInput = document.createElement("input");
    const searchInputBtn = document.createElement("div");
    const searchInputBtnIcon = document.createElement("i");
    const momentShare = document.createElement("iframe");
    const searchForm = document.createElement("form");

    const navContainer = document.createElement("section");
    const momentTabArea = document.createElement("div");

    navContainer.id = "navContainer";
    momentTabArea.id = "momentTabArea";

    searchInput.placeholder = "Enter a URL";
    searchInput.style.textAlign = "center";
    momentShare.id = "momentShare-iframe";
    momentShare.name = "momentShare";
    momentShareArea.id = "momentShareArea";
    searchContainer.id = "searchContainer";
    searchInput.id = "searchInput";
    searchInputBtn.id = "searchInputBtn";
    searchInputBtnIcon.id = "searchInputBtnIcon";

    searchInputBtnIcon.className = "fas fa-search";

    navContainer.append(searchContainer, momentTabArea);
    searchInputBtn.appendChild(searchInputBtnIcon);
    searchContainer.append(searchInput, searchInputBtn);

    momentShareArea.append(navContainer, momentShare);
    momentShareArea.append(momentShare);
    momentShare.frameborder = "0";
    // momentShare.sandbox =
    //     "allow-same-origin allow-scripts allow-popups allow-forms";

    momentTabArea.style.setProperty("height", "3rem");
    momentTabArea.style.setProperty("width", "100%");
    momentTabArea.style.setProperty("background", "#fff");
    momentTabArea.style.setProperty("border", "2px solid #000");
    momentTabArea.style.setProperty("display", "flex");
    momentTabArea.style.setProperty("align-items", "center");
    momentTabArea.style.setProperty("overflow-x", "auto");
    momentTabArea.style.setProperty("position", "absolute");
    momentTabArea.style.setProperty("z-index", "5");

    momentShareBtn.addEventListener("click", (e) => {
        momentShareActive = !momentShareActive;
        momentShareActive ? momentShareEnable() : momentShareDisable();
    });

    function momentShareEnable() {
        localVideoContainer.append(momentShareArea);
        momentShareArea.hidden = false;
        momentShareBtn.style.color = "rgb(165, 199, 236)";
        momentSocket.emit("join-web", options.channel);

        momentShare.src = staticURL;

        // momentShare.addEventListener("load", mouseEventFunc, false);
        // momentShare.addEventListener("load", receiveMouseEventFunc, false);
    }

    function momentShareDisable() {
        momentShareArea.hidden = true;
        momentShareBtn.style.color = "#fff";
        momentSocket.emit("leave-web", options.channel);
    }

    searchInputBtn.addEventListener("click", (e) => {
        InputURL = searchInput.value;
        if (InputURL.length === 0) {
            alert("Please enter your address.");
        } else {
            urlSearchAxios(InputURL);
        }
    });

    searchInput.addEventListener("keypress", (e) => {
        InputURL = searchInput.value;
        if (e.key === "Enter") {
            if (InputURL.length === 0) {
                alert("Please enter your address.");
            } else {
                urlSearchAxios(InputURL);
            }
        }
    });

    function urlSearchAxios(url) {
        axios.post("/urlSearch", null, { params: url });
    }

    window.addEventListener("message", receiveMessage, false);

    function receiveMessage(event) {
        console.log("event data", event.data);
    }
};
