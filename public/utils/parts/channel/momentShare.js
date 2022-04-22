/**
 * @author 전형동
 * @version 1.0
 * @data 2022.04.20
 * @description
 * 전부 지우고 새로 개발 중
 * 이동될 URL은 고정 staticURL = webShare.ejs로 이동됨.
 * urlSearchAxios에서 입력된 URL을 서버로 보내고 서버에서 스캔 및 URL을 저장 후
 * webShare.ejs로 보냄.
 * 따라서 socket에 전달될 URL은 고정 URL만 전달하면 됨.
 *
 * 남아있는 과제
 * 1. jquery.load로 불러온 웹사이트에서는 마우스 이벤트 및 자바스크립트 이벤트가 유효함.
 * 단, iframe 내부에서 페이지가 이동이 되었을 경우 이벤트는 유효하지 못함.
 * 이벤트가 유효한 첫 페이지에서 클릭 후 링크를 탭에 저장하고 화면에 호출
 * 이때 화면에 호출된 사이트는 이벤트가 막혀있는 상태이기 때문에 리모트에 화면이 동기화가 되지 않는다.
 * 동기화를 하려면 탭을 눌러 새로운 페이지를 띄운다.
 */

import { socketInitFunc } from "./socket.js";
import { options } from "../../rtcClient.js";

export const momentShareFunc = () => {
    const momentSocket = socketInitFunc();
    let momentShareActive = false;

    let InputURL;
    let convertURL;
    let receiveURL;
    let momentShare;
    let scroll = false;
    let mouse = false;
    let scrollY = 0;
    let searchResult;
    let inputURL;

    const momentShareBtn = document.querySelector("#momentShare");
    const momentShareIcon = document.querySelector(".fa-brain");
    const localVideoContainer = document.querySelector(
        "#local__video__container"
    );

    const momentShareArea = document.createElement("section");
    const iframeContainer = document.createElement("section");
    const searchContainer = document.createElement("div");
    const searchInput = document.createElement("input");
    const searchInputBtn = document.createElement("div");
    const searchInputBtnIcon = document.createElement("i");

    const momentContainer = document.createElement("span");

    searchInput.placeholder = "Enter a URL";
    searchInput.style.textAlign = "center";
    // momentShare.id = "momentShare-iframe";
    // momentShare.name = "momentShare";

    momentShareArea.id = "momentShareArea";
    momentContainer.id = "momentContainer";

    searchContainer.id = "searchContainer";
    searchInput.id = "searchInput";
    searchInputBtn.id = "searchInputBtn";
    searchInputBtnIcon.id = "searchInputBtnIcon";

    searchInputBtnIcon.className = "fas fa-search";

    searchInputBtn.appendChild(searchInputBtnIcon);
    searchContainer.append(searchInput, searchInputBtn);

    momentShareArea.append(navContainer, momentContainer);

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

        iframeContainer.innerHTML =
            "<iframe id='momentShare-iframe'" +
            "name='momentShare' is='x-frame-bypass' frameborder='0'" +
            "</iframe>";
        momentContainer.appendChild(iframeContainer);

        // Iframe 내부 이벤트 로드
        momentShare = document.querySelector("#momentShare-iframe");
        momentShare.addEventListener("load", handlerMouseEventFunc, false);
    }

    function momentShareDisable() {
        momentShareArea.hidden = true;
        momentShareBtn.style.color = "#fff";
        momentSocket.emit("leave-web", options.channel);
    }

    searchInputBtn.addEventListener("click", (e) => {
        inputURL = searchInput.value;
        if (inputURL.length === 0) {
            alert("Please enter your address.");
        } else {
            // urlSearchAxios(InputURL);
            convertURL = `https://${InputURL.replace(
                /^(https?:\/\/)?(www\.)?/,
                ""
            )}`;
            webShareLoad(convertURL);
            searchInput.value = "";
        }
    });

    searchInput.addEventListener("keypress", (e) => {
        inputURL = searchInput.value;
        if (e.key === "Enter") {
            if (inputURL.length === 0) {
                alert("Please enter your address.");
            } else {
                // urlSearchAxios(InputURL);
                convertURL = `https://${InputURL.replace(
                    /^(https?:\/\/)?(www\.)?/,
                    ""
                )}`;
                webShareLoad(convertURL);
                searchInput.value = "";
            }
        }
    });
    function webShareLoad(url) {
        // Iframe 생성 후 URL 삽입
        webShareContainerLoad(url);
        // URL 탭 생성 후 삽입
        createMomentTabFunc(url);
        // URL을 소켓에 전달
        socketSubmitAddressEmit(url);
    }

    function socketSubmitAddressEmit(url) {
        momentSocket.emit("submit_address", {
            peerID: options.uid,
            channel: options.channel,
            link: url,
        });
    }

    function webShareContainerLoad(url) {
        momentShare = document.querySelector("#momentShare-iframe");
        momentShare.setAttribute("src", url);
    }

    function handlerMouseEventFunc() {
        momentShare.contentWindow.addEventListener(
            "mousedown",
            (e) => {
                mouse = true;
                console.log(e.target);
                let tagName = e.target.nodeName;
                let sendURL;
                let mediaType =
                    "IMG" ||
                    "VIDEO" ||
                    "AUDIO" ||
                    "IFRAME" ||
                    "OBJECT" ||
                    "SOURCE" ||
                    "EMBED";

                if (tagName === mediaType) {
                    sendURL = window.URL.createObjectURL(e.target.src);
                } else {
                    sendURL = e.target.href;
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
            "scroll",
            (e) => {
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

    // async function handlerSendMouseDown(e) {
    //     console.log("handlerSendMouseDown ::::", e);
    //     mouse = true;
    //     let tagName = e.target.nodeName;
    //     let sendURL;
    //     let mediaType =
    //         "IMG" ||
    //         "VIDEO" ||
    //         "AUDIO" ||
    //         "IFRAME" ||
    //         "OBJECT" ||
    //         "SOURCE" ||
    //         "EMBED";

    //     if (tagName === mediaType) {
    //         sendURL = window.URL.createObjectURL(e.target.src);
    //     } else {
    //         sendURL = e.target.href;
    //     }
    //     await momentSocket.emit("active_mousedown", {
    //         peer: options.uid,
    //         channel: options.channel,
    //         link: sendURL,
    //     });
    // }

    // async function handlerSendScroll(e) {
    //     scroll = true;
    //     if (scroll) {
    //         await momentSocket.emit("active_scroll", {
    //             peer: options.uid,
    //             channel: options.channel,
    //             scrollY: e.currentTarget.scrollY,
    //         });
    //     }
    // }

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

    $(document).on("click", "#momentTab", (e) => {
        let tabURL = e.target.innerText;
        let replaceURL;
        try {
            if (tabURL.includes("youtube")) {
                youtubeTVPlayer(tabURL);
            } else if (tabURL.includes("google")) {
                defaultMomentShare(tabURL);
            } else if (tabURL.includes("twitch")) {
                alert("Twitch is Developing..");
            } else if (tabURL.includes("tv.naver")) {
                naverTVPlayer(tabURL);
            } else {
                replaceURL = `https://${tabURL.replace(
                    /^(https?:\/\/)?(www\.)?/,
                    ""
                )}`;

                webShareContainerLoad(replaceURL);
            }
        } catch (e) {
            console.log("resultURLContentCheck Error : ", e);
        }
    });

    // let rect = momentShare.getBoundingClientRect();

    // 스크롤 좌표값 구하는 함수
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

    let rect = currentFrameAbsolutePosition();

    // Receive Socket
    momentSocket.on("receive_mousedown", (mouseEvent) => {
        console.log("receive mousedown :::: ", mouseEvent.link);
        webShareContainerLoad(mouseEvent.link);
    });

    momentSocket.on("receive_scroll", (mouseEvent) => {
        scroll = true;
        scrollY = mouseEvent.scrollY + rect.y;

        if (scroll) {
            momentShare.contentWindow.scrollTo(0, scrollY);
        }
    });

    momentSocket.on("input_address", (url) => {
        createMomentTabFunc(url);
        webShareContainerLoad(url);
    });
};
