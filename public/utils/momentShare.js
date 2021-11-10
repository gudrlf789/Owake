const momentShareIcon = document.querySelector("#momentShareIcon");
const momentShareArea = document.createElement("iframe");
const chatContainer = document.querySelector(".main__chat_window");

momentShareArea.id = "momentShareArea";

momentShareIcon.addEventListener("click", (e) => {
    chatContainer.appendChild(momentShareArea);
});

