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
    let clickCount = 0;

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
        if (searchInput.value.length === 0) {
            alert("Please enter your address.");
        } else {
            searchUrlTransfer();
        }
    });

    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            searchUrlTransfer();
        } else {
            return;
        }
    });

    function searchUrlTransfer(address) {
        console.log("searchUrlTransfer:::", address);

        let resultURL;
        let config;
        if (address === null || address === undefined || address === "") {
            resultURL = resultURLprotocolCheck();
            axios.post("/urlSearch", null, { params: resultURL });
            momentSocket.emit(
                "submit_address",
                resultURL,
                (config = { peerID: options.uid, channel: options.channel })
            );
        } else {
            resultURL = resultURLprotocolCheck(address);
            axios.post("/urlSearch", null, { params: resultURL });
            momentSocket.emit(
                "submit_address",
                resultURL,
                (config = { peerID: options.uid, channel: options.channel })
            );
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
        if (address.includes("youtube")) {
            return (momentShare.src = address);
        } else {
            return (momentShare.src = "/site");
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

    let clickIframe = window.setInterval(checkFocus, 100);

    function mouseEventFunc() {
        let mouseEventObj = {
            iframeMouseOver: false,
        };
        let mouseEventConfig = {
            peer: null,
            channel: null,
            clientX: null,
            clientY: null,
            offsetX: null,
            offsetY: null,
            screenX: null,
            screenY: null,
            pageX: null,
            pageY: null,
            scrollX: null,
            scrollY: null,
            link: null,
            wheel: null,
        };

        // mouseEventConfig.peer = options.uid;
        // mouseEventConfig.channel = options.channel;
        // mouseEventConfig.clientX = e.clientX;
        // mouseEventConfig.clientY = e.clientY;
        // mouseEventConfig.offsetX = e.offsetX;
        // mouseEventConfig.offsetY = e.offsetY;
        // mouseEventConfig.screenX = e.screenX;
        // mouseEventConfig.screenY = e.screenY;
        // mouseEventConfig.pageX = e.pageX;
        // mouseEventConfig.pageY = e.pageY;
        // mouseEventConfig.scrollX = e.scrollX;
        // mouseEventConfig.scrollY = e.scrollY;

        window.addEventListener("blur", async (e) => {
            if (mouseEventObj.iframeMouseOver) {
                console.log("Wow! Iframe Click!", clickIframe);
                console.log(e);
            }
        });

        momentShare.contentWindow.addEventListener("mouseover", async (e) => {
            console.log(e);
        });

        momentShare.contentWindow.addEventListener(
            "mousedown",
            async (e) => {
                mouseEventObj.iframeMouseOver = true;

                console.log(e);
                console.log(e.target);
                console.log(e.target.href);

                mouseEventConfig.peer = options.uid;
                mouseEventConfig.channel = options.channel;
                mouseEventConfig.link = e.target.href;

                momentSocket.emit("active_mousedown", mouseEventConfig);
            },
            false
        );

        momentShare.contentWindow.addEventListener(
            "scroll",
            async (e) => {
                mouseEventObj.iframeMouseOver = false;
                momentSocket.emit("active_scroll", mouseEventConfig);
            },
            false
        );

        momentShare.contentWindow.addEventListener(
            "wheel",
            async (e) => {
                const delta = Math.sign(e.deltaY);

                mouseEventConfig.peer = options.uid;
                mouseEventConfig.channel = options.channel;
                mouseEventConfig.wheel = delta;

                momentSocket.emit("active_wheel", mouseEventConfig);
                console.info(delta);
            },
            false
        );
    }

    function receiveMouseEventFunc() {
        let mouseEventObj;
        let rect = currentFrameAbsolutePosition();
        // let rect = momentShare.getBoundingClientRect();

        const pointer = document.createElement("div");
        pointer.className = "pointer";
        pointer.style.setProperty("width", "15px");
        pointer.style.setProperty("height", "15px");
        pointer.style.setProperty("background", "#2585");
        pointer.style.setProperty("border-radius", "20px");
        pointer.style.setProperty("z-index", "9999");
        pointer.style.setProperty("position", "absolute");

        momentSocket.on("receive_mouseover", (mouseEventObj) => {
            // console.log(mouseEventObj);
        });
        momentSocket.on("receive_mouseup", (mouseEventObj) => {
            // console.log(mouseEventObj);
        });

        momentSocket.on("receive_mousedown", (mouseEventObj) => {
            console.log(mouseEventObj);
            let receiveURL = resultURLprotocolCheck(mouseEventObj.link);
            momentShare.src = receiveURL;
        });

        momentSocket.on("receive_mouseout", (mouseEventObj) => {
            // console.log(mouseEventObj);
        });
        momentSocket.on("receive_mousemove", (mouseEventObj) => {
            // console.log(mouseEventObj);
        });

        momentSocket.on("receive_scroll", (mouseEventObj) => {
            momentShare.contentWindow.scrollTo(
                0,
                mouseEventObj.scrollY + rect.y
            );
        });

        momentSocket.on("receive_wheel", (mouseEventObj) => {
            // console.log(mouseEventObj);
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

    function checkFocus() {
        if (document.activeElement == momentShare) {
            console.log("clicked " + clickCount++);
            window.focus();
        }
    }
};
