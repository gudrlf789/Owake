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

import { deviceScan } from "./deviceScan.js";
let event = deviceScan();

const webImg = document.querySelector("#web-img");

export const momentShareFunc1 = () => {
    const momentSocket = socketInitFunc();
    let momentShareActive = false;

    let momentShare;
    let iframeInit = false;
    let inputURL;

    const momentShareBtn1 = document.querySelector("#momentShare1");
    const localVideoContainer = document.querySelector(
        "#local__video__container"
    );

    const momentShareArea1 = document.createElement("section");
    const iframeContainer1 = document.createElement("section");
    const searchContainer1 = document.createElement("div");
    const searchInput1 = document.createElement("input");
    const searchInput1Btn = document.createElement("div");
    const searchInput1BtnIcon = document.createElement("i");

    const navContainer1 = document.createElement("section");
    const momentTabArea1 = document.createElement("div");

    navContainer1.id = "navContainer1";
    momentTabArea1.id = "momentTabArea1";

    const momentContainer1 = document.createElement("span");

    searchInput1.placeholder = "Enter a URL";
    searchInput1.style.textAlign = "center";

    momentShareArea1.id = "momentShareArea1";
    momentContainer1.id = "momentContainer1";

    searchContainer1.id = "searchContainer1";
    searchInput1.id = "searchInput1";
    searchInput1Btn.id = "searchInput1Btn";
    searchInput1BtnIcon.id = "searchInput1BtnIcon";

    searchInput1BtnIcon.className = "fas fa-search";

    navContainer1.append(searchContainer1, momentTabArea1);
    searchInput1Btn.appendChild(searchInput1BtnIcon);
    searchContainer1.append(searchInput1, searchInput1Btn);

    momentShareArea1.append(navContainer1, momentContainer1);

    momentShareBtn1.addEventListener("click", (e) => {
        momentShareActive = !momentShareActive;
        momentShareActive ? momentShareEnable() : momentShareDisable();
    });

    function momentShareEnable() {
        localVideoContainer.append(momentShareArea1);
        momentShareArea1.hidden = false;
        momentSocket.emit("join-web", options.channel);

        iframeContainer1.innerHTML = `<iframe id='momentShare-iframe1'
            name='momentShare' frameborder='0'
            </iframe>`;
        momentContainer1.appendChild(iframeContainer1);

        webImg.src = "/left/web_a.svg";
    }

    function momentShareDisable() {
        momentShareArea1.hidden = true;
        momentShareBtn1.style.color = "#fff";
        momentSocket.emit("leave-web", options.channel);

        webImg.src = "/left/web.svg";
    }

    searchInput1Btn.addEventListener("click", (e) => {
        inputURL = searchInput1.value;
        if (inputURL.length === 0) {
            alert("Please enter your address.");
        } else {
            webShareLoad(inputURL);
            searchInput1.value = "";
        }
    });

    searchInput1.addEventListener("keypress", (e) => {
        inputURL = searchInput1.value;
        if (e.key === "Enter") {
            if (inputURL.length === 0) {
                alert("Please enter your address.");
            } else {
                webShareLoad(inputURL);
                searchInput1.value = "";
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
            // Iframe 생성 후 URL 삽입
            webShareContainerLoad(url);
            // URL 탭 생성 후 삽입
            createMomentTabFunc(url);
            // URL을 소켓에 전달
            socketSubmitAddressEmit(url);
        } else {
            // Iframe 생성 후 URL 삽입
            webShareContainerLoad(url);
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
    function webShareContainerLoad(url) {
        iFrameInit();

        let convertURL;
        momentShare = document.querySelector("#momentShare-iframe1");
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
            searchInput1.value = "";
            return returnUrl;
        } else if (url.includes("google")) {
            returnUrl = googleUrlReplace(url);
            searchInput1.value = "";
            return returnUrl;
        } else if (url.includes("tv.naver")) {
            returnUrl = naverUrlReplace(url);
            searchInput1.value = "";
            console.log(returnUrl);
            return returnUrl;
        } else {
            returnUrl = url;
            searchInput1.value = "";
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

    /**
     * @author 전형동
     * @version 1.0
     * @data 2022.04.23
     * @description
     * Tab 생성 함수
     */
    function createMomentTabFunc(url) {
        const momentTab = document.createElement("span");
        const momentTabClose = document.createElement("button");
        const momentTabCtr = document.createElement("div");

        momentTab.id = "momentTab";
        momentTabClose.classList.add("btn-close");
        momentTabClose.setAttribute("aria-label", "Close");
        momentTabClose.id = "momentTabClose";
        momentTabCtr.className = "momentTabCtr";

        momentTabCtr.append(momentTab, momentTabClose);

        if (url !== null || url !== "" || url !== undefined) {
            momentTab.textContent = url;
            momentTabArea1.append(momentTabCtr);
        }
    }

    $(document).on(event, "#momentTabClose", (e) => {
        e.target.parentNode.remove();
    });

    // Tab Click Event 함수
    $(document).on(event, "#momentTab", (e) => {
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
     * Socket 전달 받는 함수
     */
    // Receive Socket
    momentSocket.on("receive_click", (mouseEvent) => {
        console.log("receive click :::: ", mouseEvent.link);
        webShareContainerLoad(mouseEvent.link, iframeInit);
    });

    momentSocket.on("input_address", (url) => {
        createMomentTabFunc(url);
        webShareContainerLoad(url, iframeInit);
    });

    /**
     * @author 전형동
     * @version 1.0
     * @data 2022.04.23
     * @description
     * IFrame 초기화 함수
     */
    function iFrameInit() {
        if (momentContainer1.childNodes.length > 0) {
            momentContainer1.removeChild(iframeContainer1);
        }

        iframeContainer1.innerHTML = `<iframe id='momentShare-iframe1'
        name='momentShare' frameborder='0'
        </iframe>`;
        momentContainer1.appendChild(iframeContainer1);
    }
};
