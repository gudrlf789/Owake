export const momentShare = () => {
    const momentSocket = io();
    let momentShareActive = false;
    let mouseDrag = false;
    let searchResult;

    const momentShareBtn = document.querySelector("#momentShare");
    const momentShareIcon = document.querySelector(".fa-brain");
    const localVideoContainer = document.querySelector(
        "#local__video__container"
    );

    const momentShareArea = document.createElement("i");
    const iFrameContainer = document.createElement("div");
    const searchInput = document.createElement("input");
    const searchInputBtn = document.createElement("div");
    const searchInputBtnIcon = document.createElement("i");
    const momentShare = document.createElement("iframe");

    searchInput.placeholder = "Please search.";
    searchInput.style.textAlign = "center";
    momentShare.id = "momentShare-iframe";
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

    momentShareBtn.addEventListener("click", (e) => {
        momentShareActive = !momentShareActive;
        momentShareActive ? momentShareEnable() : momentShareDisable();
    });

    function momentShareEnable() {
        localVideoContainer.append(momentShareArea);
        momentShareArea.hidden = false;
        momentShareIcon.style.color = "#000";
    }

    function momentShareDisable() {
        momentShareArea.hidden = true;
        momentShareIcon.style.color = "#fff";
    }

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
        result = momentShare.src = `https://${searchInput.value.replace(
            /^(https?:\/\/)?(www\.)?/,
            ""
        )}`;

        searchInput.value = "";
        return result;
    }

    const youtubeUrlReplarce = (search) => {
        let str = search;
        console.log(str);
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
