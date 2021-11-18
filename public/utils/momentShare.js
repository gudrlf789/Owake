const momentSocket = io();
let momentShareActive = false;
let mouseDrag = false;

const momentShareBtn = document.querySelector("#momentShare");
const momentShareIcon = document.querySelector(".fa-brain");
const messagesContainer = document.querySelector(".messages");
const chatContainer = document.querySelector(".main__chat_window");
const localVideoContainer = document.querySelector("#local__video__container");

const momentShareArea = document.createElement("i");
const iFrameContainer = document.createElement("div");
const searchInput = document.createElement("input");
const searchInputBtn = document.createElement("div");
const searchInputBtnIcon = document.createElement("i");
const momentShare = document.createElement("iframe");

searchInput.placeholder = "Please search.";
searchInput.style.textAlign = "center";
momentShare.id = "momentShare-iframe";
momentShare.name = "iFrame";
momentShareArea.id = "momentShareArea";
iFrameContainer.id = "iFrameContainer";
searchInput.id = "searchInput";
searchInputBtn.id = "searchInputBtn";
searchInputBtnIcon.id = "searchInputBtnIcon";

searchInputBtnIcon.className = "fas fa-search";

searchInputBtn.appendChild(searchInputBtnIcon);
iFrameContainer.append(searchInput, searchInputBtn);
momentShareArea.append(iFrameContainer, momentShare);
momentShareArea.append(momentShare);
momentShare.frameborder = "0";
momentShare.target = "_parent";

momentShareBtn.addEventListener("click", (e) => {
    momentShareActive = !momentShareActive;
    momentShareActive ? momentShareEnable() : momentShareDisable();
});

function momentShareEnable() {
    localVideoContainer.append(momentShareArea);
    momentShareArea.style.display = "block";
    momentShareIcon.style.color = "#000";
}

function momentShareDisable() {
    momentShareArea.style.display = "none";
    momentShareIcon.style.color = "#fff";
}

$(document).on("click", "#searchInputBtn", (e) => {
    if (searchInput.value.length !== 0) {
        momentSocket.emit("submit_address", searchInput.value, options.channel);
        searchUrlStringCheck();
    }
});

$(document).on("keydown", "#searchInput", (e) => {
    if (e.which === 13 && searchInput.value.length !== 0) {
        momentSocket.emit("submit_address", searchInput.value, options.channel);
        searchUrlStringCheck();
    }
});

function searchUrlStringCheck() {
    momentShare.src = `https://${searchInput.value.replace(
        /^(https?:\/\/)?(www\.)?/,
        ""
    )}/webhp?igu=1`;
    searchInput.value = "";
}

function urlResult(search) {
    momentShare.src = "https://" + youtubeUrlReplarce(search);
    searchInput.value = "";
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
        return result;
    }
};
