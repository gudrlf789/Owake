const momentSocket = io();
let momentShareActive = false;

const momentShareBtn = document.querySelector("#momentShare");
const momentShareIcon = document.querySelector(".fa-brain");
const messagesContainer = document.querySelector(".messages");

const chatContainer = document.querySelector(".main__chat_window");
const momentShareArea = document.createElement("i");

const searchInputCtr = document.createElement("div");
const searchInput = document.createElement("input");
<<<<<<< HEAD
const searchInputBtn = document.createElement("button");
=======
const searchInputBtnIcon = document.createElement("i");
const searchInputBtn = document.createElement("div");
>>>>>>> upstream/agora_DC
const momentShare = document.createElement("iframe");

momentShare.id = "momentShare-iframe";
momentShareArea.id = "momentShareArea";
searchInputBtn.id ="searchInputBtn";
searchInputBtn.textContent = "Click";

<<<<<<< HEAD
searchInputCtr.append(searchInput, searchInputBtn);
momentShareArea.append(searchInputCtr, momentShare);

=======
searchInputCtr.id = "searchInputCtr";
searchInput.id = "searchInput";
searchInputBtn.id = "searchInputBtn";
searchInputBtnIcon.id = "searchInputBtnIcon";
searchInputBtnIcon.className = "fas fa-search";

searchInputBtn.appendChild(searchInputBtnIcon);
searchInputCtr.append(searchInput, searchInputBtn);
momentShareArea.append(searchInputCtr, momentShare);

>>>>>>> upstream/agora_DC
momentShareBtn.addEventListener("click", (e) => {
    momentShareActive = !momentShareActive;

    if (momentShareActive == true) {
        chatContainer.appendChild(momentShareArea);
        momentShareArea.style.display = "block";
        messagesContainer.style.flex = "0.2";
        momentShareIcon.style.color = "#000";
    } else {
        momentShareArea.style.display = "none";
        momentShareIcon.style.color = "#fff";
        messagesContainer.style.flex = "1";
    }
});

$(document).on("click", "#searchInputBtn", (e) => {
<<<<<<< HEAD
    momentSocket.emit("submit_address", searchInput.value, options.channel);
    momentShare.src = `http://${searchInput.value}`;
    searchInput.value = "";
=======
    if (searchInput.value.length !== 0) {
        momentSocket.emit("submit_address", searchInput.value, options.channel);
        momentShare.src = `http://${searchInput.value}`;
        searchInput.value = "";
    }
});

$(document).on("keydown", "#searchInput", (e) => {
    if (e.which === 13 && searchInput.value.length !== 0) {
        momentSocket.emit("submit_address", searchInput.value, options.channel);
        momentShare.src = `http://${searchInput.value}`;
        searchInput.value = "";
    }
>>>>>>> upstream/agora_DC
});
