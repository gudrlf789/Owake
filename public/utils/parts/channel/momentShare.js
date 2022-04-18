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
    momentTabArea.style.setProperty("background", "#fff");
    momentTabArea.style.setProperty("border", "2px solid #000");
    momentTabArea.style.setProperty("display", "flex");
    momentTabArea.style.setProperty("align-items", "center");
    momentTabArea.style.setProperty("overflow-x", "auto");

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
        if (searchInput.value.length === 0) {
            alert("Please enter your address.");
        } else {
            searchUrlTransfer(InputURL);
        }
    });

    searchInput.addEventListener("keypress", (e) => {
        InputURL = searchInput.value;
        if (e.key === "Enter") {
            if (searchInput.value.length === 0) {
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

        createMomentTabFunc(address);

        try {
            if (address.includes("youtube")) {
                momentShare.src = address;
                momentShare.contentWindow.location = address;
                // momentShare.contentWindow.document.open(address);
            } else {
                momentShare.src = staticURL;
                momentShare.contentWindow.location = staticURL;
                // momentShare.contentWindow.document.open(staticURL);
            }
        } catch (e) {
            console.log("resultURLContentCheck Error : ", e);
        }
    }

    function createMomentTabFunc(url) {
        const momentTab = document.createElement("span");

        momentTab.id = "momentTab";
        momentTab.style.setProperty("margin", "0.4rem");
        momentTab.style.setProperty("background", "#182843");
        momentTab.style.setProperty("color", "#fff");
        momentTab.style.setProperty("cursor", "pointer");

        momentTab.textContent = url;
        momentTabArea.append(momentTab);
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

    function mouseEventFunc() {
        let mouseEventObj = {
            iframeMouseOver: false,
        };

        momentShare.contentWindow.addEventListener(
            "mouseover",
            async (e) => {
                mouseEventObj.iframeMouseOver = true;

                momentSocket.emit("active_mouseover", {
                    peer: options.uid,
                    channel: options.channel,
                });
            },
            false
        );

        momentShare.contentWindow.addEventListener(
            "mousedown",
            async (e) => {
                mouseEventObj.iframeMouseOver = true;

                let sendURL = e.target.href;

                if (sendURL.includes("https") || sendURL.includes("http")) {
                    momentShare.contentWindow.location = sendURL;
                    // searchUrlTransfer(sendURL);
                }

                momentSocket.emit("active_mousedown", {
                    peer: options.uid,
                    channel: options.channel,
                    link: sendURL,
                });
            },
            false
        );

        momentShare.contentWindow.addEventListener(
            "mouseup",
            async (e) => {
                mouseEventObj.iframeMouseOver = false;

                momentSocket.emit("active_mouseup", {
                    peer: options.uid,
                    channel: options.channel,
                });
            },
            false
        );

        momentShare.contentWindow.addEventListener(
            "mousemove",
            async (e) => {
                mouseEventObj.iframeMouseOver = true;

                momentSocket.emit("active_mousemove", {
                    peer: options.uid,
                    channel: options.channel,
                });
            },
            false
        );

        momentShare.contentWindow.addEventListener(
            "mouseout",
            async (e) => {
                mouseEventObj.iframeMouseOver = false;

                momentSocket.emit("active_mouseout", {
                    peer: options.uid,
                    channel: options.channel,
                });
            },
            false
        );

        momentShare.contentWindow.addEventListener(
            "scroll",
            async (e) => {
                mouseEventObj.iframeMouseOver = false;

                momentSocket.emit("active_scroll", {
                    peer: options.uid,
                    channel: options.channel,
                    scrollY: e.currentTarget.scrollY,
                });
            },
            false
        );

        momentShare.contentWindow.addEventListener(
            "wheel",
            async (e) => {
                const delta = Math.sign(e.deltaY);

                momentSocket.emit("active_wheel", {
                    peer: options.uid,
                    channel: options.channel,
                    wheel: delta,
                });

                console.info(delta);
            },
            false
        );
    }

    function receiveMouseEventFunc() {
        let rect = currentFrameAbsolutePosition();
        // let rect = momentShare.getBoundingClientRect();

        momentSocket.on("receive_mouseover", (mouseEvent) => {
            // console.log(mouseEvent);
        });
        momentSocket.on("receive_mouseup", (mouseEvent) => {
            // console.log(mouseEvent);
        });
        momentSocket.on("receive_mousedown", (mouseEvent) => {
            console.log(mouseEvent);
            let receiveURL = resultURLprotocolCheck(mouseEvent.link);
            momentShare.contentWindow.location = receiveURL;
        });
        momentSocket.on("receive_mouseout", (mouseEvent) => {
            // console.log(mouseEvent);
        });
        momentSocket.on("receive_mousemove", (mouseEvent) => {
            // console.log(mouseEvent);
        });

        momentSocket.on("receive_scroll", (mouseEvent) => {
            momentShare.contentWindow.scrollTo(0, mouseEvent.scrollY + rect.y);
        });

        momentSocket.on("receive_wheel", (mouseEvent) => {
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

    $(document).on("click", "#momentTab", (e) => {
        console.log(e);
        let tabURL = e.target.innerText;
        momentShare.src = tabURL;
        momentShare.contentWindow.location.href = tabURL;
    });
};
