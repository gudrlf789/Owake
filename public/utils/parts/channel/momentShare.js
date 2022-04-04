import { socketInitFunc } from "./socket.js";
import { options } from "../../rtcClient.js";

export const momentShareFunc = () => {
    const momentSocket = socketInitFunc();
    let momentShareActive = false;
    let searchResult;

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
    searchForm.target = "momentShare";
    searchForm.method = "get";
    momentShareArea.id = "momentShareArea";
    searchContainer.id = "searchContainer";
    searchInput.id = "searchInput";
    searchInputBtn.id = "searchInputBtn";
    searchInputBtnIcon.id = "searchInputBtnIcon";

    searchInputBtnIcon.className = "fas fa-search";

    searchForm.append(searchInput);
    searchInputBtn.appendChild(searchInputBtnIcon);
    searchContainer.append(searchForm, searchInputBtn);
    momentShareArea.append(searchContainer, momentShare);
    momentShareArea.append(momentShare);
    momentShare.frameborder = "0";

    momentShareBtn.addEventListener("click", (e) => {
        momentShareActive = !momentShareActive;
        momentShareActive ? momentShareEnable() : momentShareDisable();
    });

    function momentShareEnable() {
        localVideoContainer.append(momentShareArea);
        momentShareArea.hidden = false;
        momentShareBtn.style.color = "rgb(165, 199, 236)";

        // momentSocket.emit("join-web", window.sessionStorage.getItem("channel"));
        momentSocket.emit("join-web", options.channel);
    }

    function momentShareDisable() {
        momentShareArea.hidden = true;
        momentShareBtn.style.color = "#fff";
        // momentSocket.emit(
        //     "leave-web",
        //     window.sessionStorage.getItem("channel")
        // );
        momentSocket.emit("leave-web", options.channel);
    }

    momentSocket.on("input_address", (address) => {
        const momentShare = document.getElementById("momentShare-iframe");
        momentShare.src = `https://${address.replace(
            /^(https?:\/\/)?(www\.)?/,
            ""
        )}`;
    });

    $(document).on("click", "#searchInputBtn", (e) => {
        if (searchInput.value.length !== 0) {
            searchResult = searchUrlStringCheck();
            momentSocket.emit("submit_address", searchResult, options.channel);
        }
    });

    $(document).on("keydown", "#searchInput", (e) => {
        if (e.which === 13 && searchInput.value.length !== 0) {
            searchResult = searchUrlStringCheck();
            momentSocket.emit("submit_address", searchResult, options.channel);
        }
    });

    function searchUrlStringCheck() {
        let returnUrl;
        let url = `https://${searchInput.value.replace(
            /^(https?:\/\/)?(www\.)?/,
            ""
        )}`;

        if (url.includes("youtube") || url.includes("youtu.be")) {
            returnUrl = searchForm.action =
                "https://" + youtubeUrlReplarce(url);
            searchInput.value = "";
            return returnUrl;
        } else {
            returnUrl = searchForm.action = url;
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
