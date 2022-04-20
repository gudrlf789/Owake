import { socketInitFunc } from "./socket.js";
import { options } from "../../rtcClient.js";

export const momentShareFunc = () => {
    const momentSocket = socketInitFunc();
    let momentShareActive = false;
    let searchResult;
    let inputURL;

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
        // const momentShare = document.getElementById("momentShare-iframe");
        console.log("address::::::::::::::", address);
        momentShare.src = address;
    });

    searchInputBtn.addEventListener("click", (e) => {
        inputURL = searchInput.value;
        if (inputURL.length === 0) {
            alert("Please enter your address.");
        } else {
            searchResult = searchUrlStringCheck();
            searchForm.action = searchResult;
            momentSocket.emit("submit_address", {
                url: searchResult,
                channel: options.channel,
            });
        }
    });

    searchInput.addEventListener("keypress", (e) => {
        inputURL = searchInput.value;
        if (e.key === "Enter") {
            if (inputURL.length === 0) {
                alert("Please enter your address.");
            } else {
                searchResult = searchUrlStringCheck();
                searchForm.action = searchResult;
                momentSocket.emit("submit_address", {
                    url: searchResult,
                    channel: options.channel,
                });
            }
        }
    });

    function searchUrlStringCheck() {
        let returnUrl;
        let url = `https://${searchInput.value.replace(
            /^(https?:\/\/)?(www\.)?/,
            ""
        )}`;

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
