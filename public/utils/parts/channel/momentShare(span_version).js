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
    const momentShare = document.createElement("span");
    const searchForm = document.createElement("form");

    searchInput.placeholder = "Enter a URL";
    searchInput.style.textAlign = "center";
    momentShare.id = "momentShare-span";
    momentShare.name = "momentShare";
    momentShareArea.id = "momentShareArea";
    searchContainer.id = "searchContainer";
    searchInput.id = "searchInput";
    searchInputBtn.id = "searchInputBtn";
    searchInputBtnIcon.id = "searchInputBtnIcon";

    searchInputBtnIcon.className = "fas fa-search";

    searchInputBtn.appendChild(searchInputBtnIcon);
    searchContainer.append(searchInput, searchInputBtn);
    momentShareArea.append(searchContainer, momentShare);
    momentShareArea.append(momentShare);
    momentShare.frameborder = "0";

    momentShareArea.style.setProperty("overflow", "auto");

    momentShareBtn.addEventListener("click", (e) => {
        momentShareActive = !momentShareActive;
        momentShareActive ? momentShareEnable() : momentShareDisable();
    });

    function momentShareEnable() {
        localVideoContainer.append(momentShareArea);
        momentShareArea.hidden = false;
        momentShareBtn.style.color = "rgb(165, 199, 236)";
        momentSocket.emit("join-web", options.channel);

        // momentShare.addEventListener("load", mouseEventFunc, false);
        // momentShare.addEventListener("load", receiveMouseEventFunc, false);
    }

    function momentShareDisable() {
        momentShareArea.hidden = true;
        momentShareBtn.style.color = "#fff";
        momentSocket.emit("leave-web", options.channel);
    }

    momentSocket.on("input_address", (address) => {
        resultURLContentCheck(address);
    });

    searchInputBtn.addEventListener("click", (e) => {
        InputURL = searchInput.value;
        if (InputURL.length === 0) {
            alert("Please enter your address.");
        } else {
            searchUrlTransfer(InputURL);
        }
    });

    searchInput.addEventListener("keypress", (e) => {
        InputURL = searchInput.value;
        if (e.key === "Enter") {
            if (InputURL.length === 0) {
                alert("Please enter your address.");
            } else {
                searchUrlTransfer(InputURL);
            }
        }
    });

    function searchUrlTransfer(address) {
        console.log("searchUrlTransfer:::", address);

        let resultURL;
        if (address === null || address === undefined || address === "") {
            resultURL = resultURLprotocolCheck();
            axios.post("/urlSearch", null, { params: resultURL });
            momentSocket.emit("submit_address", resultURL, {
                peerID: options.uid,
                channel: options.channel,
            });
        } else {
            resultURL = resultURLprotocolCheck(address);
            axios.post("/urlSearch", null, { params: resultURL });
            momentSocket.emit("submit_address", resultURL, {
                peerID: options.uid,
                channel: options.channel,
            });
        }

        resultURLContentCheck(resultURL);
    }

    /**
     * @author 전형동
     * @version 1.0
     * @data 2022.04.10
     * @description
     * resultURLContentCheck
     * 리턴되는 URL의 컨텐츠 체크하는 함수
     */

    function resultURLContentCheck(address) {
        $("#momentShare-span").load(`${address}`);
    }

    /**
     * @author 전형동
     * @version 1.0
     * @data 2022.04.10
     * @description
     * resultURLprotocolCheck
     * 입력된 URL의 프로토콜 체크 함수
     */
    function resultURLprotocolCheck(address) {
        let returnUrl;
        let url;

        if (address) {
            url = `https://${address.replace(/^(https?:\/\/)?(www\.)?/, "")}`;
        } else {
            url = `https://${searchInput.value.replace(
                /^(https?:\/\/)?(www\.)?/,
                ""
            )}`;
        }

        if (url.includes("youtube") || url.includes("youtu.be")) {
            returnUrl = "https://" + youtubeUrlReplarce(url);
            searchInput.value = "";
            return returnUrl;
        } else {
            returnUrl = url;
            searchInput.value = "";
            return returnUrl;
        }
    }

    const youtubeUrlReplarce = (search) => {
        let str = search;
        const regExp =
            /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        let match = str.match(regExp);
        if (match && match[2].length == 11) {
            console.log(match[2]);
            let sepratedID = match[2];
            let embedUrl = "www.youtube.com/embed/" + sepratedID;
            let result = search.replace(str, embedUrl);
            console.log(result);
            return result;
        }
    };
};
