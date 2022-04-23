/**
 * @author 전형동
 * @version 1.0
 * @data 2022.04.23
 * @description

 * XFrameByPass 적용
 * Youtube, KaKao, Naver Tv  적용
 * 일반 웹사이트는 XFrameByPass를 사용하고,
 * Youtube 영상을 Embed 할 때는 XFrameByPass를 사용하지 않게 구현
 */

import { socketInitFunc } from "./socket.js";
import { options } from "../../rtcClient.js";

export const momentShareFunc = () => {
    const momentSocket = socketInitFunc();
    let momentShareActive = false;

    let convertURL;
    let receiveURL;
    let momentShare;
    let scroll = false;
    let mouse = false;
    let iframeInit = false;
    let searchResult;
    let inputURL;
    let bypass = "x-frame-bypass";

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

    const navContainer = document.createElement("section");
    const momentTabArea = document.createElement("div");

    navContainer.id = "navContainer";
    momentTabArea.id = "momentTabArea";

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

    navContainer.append(searchContainer, momentTabArea);
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

        // Iframe Init
        iFrameInit(iframeInit);

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
            webShareLoad(inputURL);
            searchInput.value = "";
        }
    });

    searchInput.addEventListener("keypress", (e) => {
        inputURL = searchInput.value;
        if (e.key === "Enter") {
            if (inputURL.length === 0) {
                alert("Please enter your address.");
            } else {
                webShareLoad(inputURL);
                searchInput.value = "";
            }
        }
    });

    /**
     * @author 전형동
     * @version 1.0
     * @data 2022.04.23
     * @description
     * 처음 클라이언트에서 Iframe 로드하는 함수
     */
    function webShareLoad(url) {
        // Youtube 와 같은 Iframe Embed 서비스인 경우 그냥 호출
        if (
            url.includes("/v/") ||
            url.includes("embed") ||
            url.includes("youtu.be") ||
            url.includes("youtube") ||
            url.includes("channel")
        ) {
            // IFrame 초기화
            iframeInit = true;
            // Iframe 생성 후 URL 삽입
            webShareContainerLoad(url, iframeInit);
            // URL 탭 생성 후 삽입
            createMomentTabFunc(url);
            // URL을 소켓에 전달
            socketSubmitAddressEmit(url);
        } else {
            iframeInit = false;
            // Iframe 생성 후 URL 삽입
            webShareContainerLoad(url, iframeInit);
            // URL 탭 생성 후 삽입
            createMomentTabFunc(url);
            // URL을 소켓에 전달
            socketSubmitAddressEmit(url);
        }
    }

    /**
     * @author 전형동
     * @version 1.0
     * @data 2022.04.23
     * @description
     * Socket에 전달하는 함수
     */
    function socketSubmitAddressEmit(url) {
        momentSocket.emit("submit_address", {
            peerID: options.uid,
            channel: options.channel,
            link: url,
        });
    }

    /**
     * @author 전형동
     * @version 1.0
     * @data 2022.04.23
     * @description
     * URL 컨버트 후 Iframe에 삽입하는 함수
     * Iframe Load 함수
     */
    function webShareContainerLoad(url, initState) {
        iFrameInit(initState);

        let convertURL;
        momentShare = document.querySelector("#momentShare-iframe");
        convertURL = resultURLprotocolCheck(url);
        let resultURL = `https://${convertURL.replace(
            /^(https?:\/\/)?(www\.)?/,
            ""
        )}`;
        console.log(resultURL);
        momentShare.setAttribute("src", resultURL);
    }

    /**
     * @author 전형동
     * @version 1.0
     * @data 2022.04.10
     * @description
     * resultURLprotocolCheck
     * 입력된 URL의 프로토콜 체크 함수
     */
    function resultURLprotocolCheck(url) {
        let returnUrl;

        if (url.includes("youtube") || url.includes("youtu.be")) {
            returnUrl = youtubeUrlReplarce(url);
            searchInput.value = "";
            return returnUrl;
        } else if (url.includes("google")) {
            returnUrl = googleUrlReplace(url);
            searchInput.value = "";
            return returnUrl;
        } else if (url.includes("tv.naver")) {
            returnUrl = naverUrlReplace(url);
            searchInput.value = "";
            console.log(returnUrl);
            return returnUrl;
        } else {
            returnUrl = url;
            searchInput.value = "";
            return returnUrl;
        }
    }

    const naverUrlReplace = (url) => {
        let channel;
        let originalURL;
        let createURL;
        let vSearch = url.indexOf("/v/");
        let listSearch = url.indexOf("/list/");
        let urlLength = url.length;

        try {
            if (vSearch) {
                channel = url.substring(vSearch + 3, urlLength);
                originalURL = url.substring(0, vSearch);
                createURL = `${originalURL}/embed/${channel}?autoPlay=true`;

                return createURL;
            } else if (vSearch && listSearch) {
                channel = url.substring(vSearch + 3, listSearch);
                originalURL = url.substring(0, vSearch);
                createURL = `${originalURL}/embed/${channel}?autoPlay=true`;

                return createURL;
            } else {
                return;
            }
        } catch (err) {
            console.log("Naver TV Error::", err);
        }
    };

    const googleUrlReplace = (url) => {
        return url + "/search?igu=1";
    };

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

                // 주소값이 있거나, undefined가 아닐 경우 서버로 넘김
                if (
                    sendURL.includes("https") &&
                    !sendURL.includes("undefined")
                ) {
                    momentSocket.emit("active_mousedown", {
                        peer: options.uid,
                        channel: options.channel,
                        link: sendURL,
                    });
                }
            },
            false
        );
        momentShare.contentWindow.addEventListener(
            "scroll",
            (e) => {
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

    /**
     * @author 전형동
     * @version 1.0
     * @data 2022.04.23
     * @description
     * Tab 생성 함수
     */
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

    // Tab Click Event 함수
    $(document).on("click", "#momentTab", (e) => {
        let tabURL = e.target.innerText;
        try {
            if (
                tabURL.includes("/v/") ||
                tabURL.includes("embed") ||
                tabURL.includes("youtu.be") ||
                tabURL.includes("youtube") ||
                tabURL.includes("channel")
            ) {
                iframeInit = true;
                webShareContainerLoad(tabURL, iframeInit);
            } else {
                iframeInit = false;
                webShareContainerLoad(tabURL, iframeInit);
            }
        } catch (e) {
            console.log("resultURLContentCheck Error : ", e);
        }
    });

    /**
     * @author 전형동
     * @version 1.0
     * @data 2022.04.23
     * @description
     * 스크롤 좌표값 구하는 함수
     */

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

    /**
     * @author 전형동
     * @version 1.0
     * @data 2022.04.23
     * @description
     * Socket 전달 받는 함수
     */
    // Receive Socket
    momentSocket.on("receive_mousedown", (mouseEvent) => {
        console.log("receive mousedown :::: ", mouseEvent.link);
        webShareContainerLoad(mouseEvent.link);
    });

    let rect = currentFrameAbsolutePosition();
    momentSocket.on("receive_scroll", (mouseEvent) => {
        momentShare = document.querySelector("#momentShare-iframe");
        scroll = true;
        let scrollY = 0;
        scrollY = mouseEvent.scrollY + rect.y;
        if (scroll) {
            momentShare.contentWindow.scrollTop = scrollY;
        }
    });

    momentSocket.on("input_address", (url) => {
        createMomentTabFunc(url);
        webShareContainerLoad(url);
    });

    /**
     * @author 전형동
     * @version 1.0
     * @data 2022.04.23
     * @description
     * ByPass 스크립트 로드 함수
     */
    // Dynamic Scripts Load
    function xFrameScriptFirstLoad() {
        const script = document.createElement("script");
        script.setAttribute("type", "text/javascript");
        script.setAttribute(
            "src",
            "https://unpkg.com/@ungap/custom-elements-builtin"
        );
        const body = document.body;

        body.appendChild(script);
    }

    function xFrameScriptSecondLoad() {
        const script = document.createElement("script");
        script.setAttribute("type", "text/javascript");
        script.setAttribute("src", "../../../lib/x-frame-bypass.js");
        const body = document.body;

        body.appendChild(script);
    }

    /**
     * @author 전형동
     * @version 1.0
     * @data 2022.04.23
     * @description
     *  XFrame 스크립트 제거 함수
     */

    function xFrameScriptRemove() {
        let selectScript = document.querySelectorAll("script");
        momentShare = document.querySelector("#momentShare-iframe");
        let searchXframe;
        let searchElementsBuiltin;
        for (let i = 0; i < selectScript.length; i++) {
            searchXframe = selectScript[i].src.includes("bypass");
            searchElementsBuiltin = selectScript[i].src.includes("builtin");

            if (searchXframe === true || searchElementsBuiltin === true) {
                console.log(selectScript[i]);
                selectScript[i].remove();

                console.log("bypass remove");
            }
        }
    }

    /**
     * @author 전형동
     * @version 1.0
     * @data 2022.04.23
     * @description
     * IFrame 초기화 함수
     */
    function iFrameInit(init) {
        if (momentContainer.childNodes.length > 0) {
            momentContainer.removeChild(iframeContainer);
        }

        if (init === false) {
            xFrameScriptFirstLoad();
            xFrameScriptSecondLoad();
            iframeContainer.innerHTML = `<iframe id='momentShare-iframe'
            name='momentShare' is='${bypass}' frameborder='0'
            </iframe>`;
            momentContainer.appendChild(iframeContainer);
        }

        if (init === true) {
            xFrameScriptRemove();
            iframeContainer.innerHTML = `<iframe id='momentShare-iframe'
            name='momentShare' frameborder='0'
            </iframe>`;
            momentContainer.appendChild(iframeContainer);
        }
    }
};
