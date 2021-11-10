let momentShareActive = false;

const momentShareBtn = document.querySelector("#momentShare");
const momentShareIcon = document.querySelector(".fa-brain");
const messagesContainer = document.querySelector(".messages");
const chatContainer = document.querySelector(".main__chat_window");
const momentShareArea = document.createElement("div");

const searchInputCtr = document.createElement("div");
const searchInput = document.createElement("input");
const momentShare = document.createElement("iframe");

searchInputCtr.id = "searchInputCtr";
searchInput.id = "searchInput";
momentShare.id = "momentShare-iframe";
momentShareArea.id = "momentShareArea";

searchInputCtr.appendChild(searchInput);
momentShareArea.append(searchInputCtr, momentShare);

momentShare.src = "https://www.youtube.com/embed/xocBrWHO7NE";

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
