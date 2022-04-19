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

        momentShare.addEventListener("load", mouseEventFunc, false);
        momentShare.addEventListener("load", receiveMouseEventFunc, false);
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
            console.log(resultURL);
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
        console.log("resultURLContentCheck : 진입");
        let staticURL = "/site";
        let receiveURL = `https://${address.replace(
            /^(https?:\/\/)?(www\.)?/,
            ""
        )}`;

        createMomentTabFunc(receiveURL);

        try {
            if (receiveURL.includes("youtube")) {
                youtubeTVPlayer(receiveURL);
            } else if (receiveURL.includes("google")) {
                defaultMomentShare(receiveURL);
            } else if (receiveURL.includes("twitch")) {
                // let twitchEndPoint = receiveURL.indexOf("tv/");
                // let channel = receiveURL.substring(
                //     twitchEndPoint + 3,
                //     receiveURL.length
                // );

                // let twitchOriginalURL = receiveURL.substring(
                //     0,
                //     twitchEndPoint + 3
                // );

                // console.log(twitchOriginalURL);
                // console.log(channel);

                // let twitchPlayer =
                //     twitchOriginalURL +
                //     `?channel=${channel}&parent=streamernews.example.com`;

                // console.log(twitchPlayer);

                // momentShare.src = twitchPlayer;
                // momentShare.contentWindow.location = twitchPlayer;
                alert("Twitch is Developing..");
            } else if (receiveURL.includes("tv.naver")) {
                naverTVPlayer(receiveURL);
            } else {
                defaultMomentShare(staticURL);
            }
        } catch (e) {
            console.log("resultURLContentCheck Error : ", e);
        }
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
            returnUrl = youtubeUrlReplarce(url);
            searchInput.value = "";
            return returnUrl;
        } else if (url.includes("google")) {
            returnUrl = url + "/search?igu=1";
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
            let embedUrl =
                "www.youtube.com/embed/" + sepratedID + "?autoplay=1&mute=1";
            let result = search.replace(str, embedUrl);
            console.log(result);
            return result;
        }
    };

    function mouseEventFunc() {
        let scroll = false;

        momentShare.contentWindow.addEventListener(
            "mousedown",
            handleClickSendData,
            false
        );

        momentShare.contentWindow.addEventListener(
            "touchend",
            handleClickSendData,
            false
        );

        momentShare.contentWindow.addEventListener(
            "scroll",
            async (e) => {
                e.preventDefault();
                scroll = true;
                if (scroll) {
                    momentSocket.emit("active_scroll", {
                        peer: options.uid,
                        channel: options.channel,
                        scrollY: e.currentTarget.scrollY,
                    });
                }
            },
            false
        );
    }

    function handleClickSendData(e) {
        let sendURL = e.target.href;
        console.log(sendURL);

        if (sendURL === "" || sendURL === undefined || sendURL === null) {
            return;
        }

        createMomentTabFunc(sendURL);

        if (sendURL.includes("https") || sendURL.includes("http")) {
            momentShare.contentWindow.location = sendURL;
            // searchUrlTransfer(sendURL);
        }

        momentSocket.emit("active_mousedown", {
            peer: options.uid,
            channel: options.channel,
            link: sendURL,
        });

        // Touch Screen Sensing
        if (window.matchMedia("(pointer: coarse)").matches) {
            // touchscreen
            momentSocket.emit("active_touchend", {
                peer: options.uid,
                channel: options.channel,
                link: sendURL,
            });
        }
    }

    function receiveMouseEventFunc() {
        let scroll = false;
        let scrollY = 0;
        let scrollX = 0;
        let rect = currentFrameAbsolutePosition();
        // let rect = momentShare.getBoundingClientRect();

        momentSocket.on("receive_mousedown", (mouseEvent) => {
            let receiveURL = resultURLprotocolCheck(mouseEvent.link);
            momentShare.contentWindow.location = receiveURL;
            createMomentTabFunc(receiveURL);
        });

        momentSocket.on("receive_touchend", (mouseEvent) => {
            let receiveURL = resultURLprotocolCheck(mouseEvent.link);
            momentShare.contentWindow.location = receiveURL;
            createMomentTabFunc(receiveURL);
        });

        momentSocket.on("receive_scroll", (mouseEvent) => {
            scroll = true;
            scrollY = mouseEvent.scrollY + rect.y;

            if (scroll) {
                momentShare.contentWindow.scrollTo(0, scrollY);
            }
        });
    }

    function currentFrameAbsolutePosition() {
        let currentWindow = window;
        let currentParentWindow;
        let positions = [];
        let rect;

        while (currentWindow !== window.top) {
            currentParentWindow = currentWindow.parent;
            for (let idx = 0; idx < currentParentWindow.frames.length; idx++)
                if (currentParentWindow.frames[idx] === currentWindow) {
                    for (let frameElement of currentParentWindow.document.getElementsByTagName(
                        "iframe"
                    )) {
                        if (frameElement.contentWindow === currentWindow) {
                            rect = frameElement.getBoundingClientRect();
                            positions.push({ x: rect.x, y: rect.y });
                        }
                    }
                    currentWindow = currentParentWindow;
                    break;
                }
        }
        return positions.reduce(
            (accumulator, currentValue) => {
                return {
                    x: accumulator.x + currentValue.x,
                    y: accumulator.y + currentValue.y,
                };
            },
            { x: 0, y: 0 }
        );
    }

    function createMomentTabFunc(url) {
        const momentTab = document.createElement("span");

        momentTab.id = "momentTab";
        momentTab.style.setProperty("margin", "0.4rem");
        momentTab.style.setProperty("padding", "0.2rem");
        momentTab.style.setProperty("background", "#182843");
        momentTab.style.setProperty("color", "#fff");
        momentTab.style.setProperty("cursor", "pointer");
        momentTab.style.setProperty("white-space", "nowrap");
        momentTab.style.setProperty("overflow", "hidden");
        momentTab.style.setProperty("text-overflow", "ellipsis");
        momentTab.style.setProperty("width", "10rem");
        momentTab.style.setProperty("text-align", "center");

        if (url !== null || url !== "" || url !== undefined) {
            momentTab.textContent = url;
            momentTabArea.append(momentTab);
        }
    }

    // Click To Tab Function
    $(document).on("click", "#momentTab", (e) => {
        let tabURL = e.target.innerText;
        try {
            if (tabURL.includes("youtube")) {
                youtubeTVPlayer(tabURL);
            } else if (tabURL.includes("google")) {
                defaultMomentShare(tabURL);
            } else if (tabURL.includes("twitch")) {
                // let twitchEndPoint = receiveURL.indexOf("tv/");
                // let channel = receiveURL.substring(
                //     twitchEndPoint + 3,
                //     receiveURL.length
                // );

                // let twitchOriginalURL = receiveURL.substring(
                //     0,
                //     twitchEndPoint + 3
                // );

                // console.log(twitchOriginalURL);
                // console.log(channel);

                // let twitchPlayer =
                //     twitchOriginalURL +
                //     `?channel=${channel}&parent=streamernews.example.com`;

                // console.log(twitchPlayer);

                // momentShare.src = twitchPlayer;
                // momentShare.contentWindow.location = twitchPlayer;
                alert("Twitch is Developing..");
            } else if (tabURL.includes("tv.naver")) {
                naverTVPlayer(tabURL);
            } else {
                defaultMomentShare(tabURL);
            }
        } catch (e) {
            console.log("resultURLContentCheck Error : ", e);
        }
    });

    // WebShare / TVShare Function
    function naverTVPlayer(url) {
        let urlEndPoint = url.indexOf("/v/");
        console.log(urlEndPoint);
        let channel = url.substring(urlEndPoint + 3, url.indexOf("/list/"));
        let originalURL = url.substring(0, urlEndPoint);
        console.log(originalURL);
        console.log(channel);
        let createURL = `${originalURL}/embed/${channel}?autoPlay=true`;
        momentShare.src = createURL;
        momentShare.contentWindow.location = createURL;
    }

    function youtubeTVPlayer(url) {
        momentShare.src = url;
        momentShare.contentWindow.location = url;
    }

    function defaultMomentShare(url) {
        momentShare.src = url;
        momentShare.contentWindow.location = url;
    }
};
