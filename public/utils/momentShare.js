const momentShareIcon = document.querySelector("#momentShareIcon");
const momentShareArea = document.createElement("div");
const chatContainer = document.querySelector(".main__chat_window");

momentShareArea.id = "momentShareArea";

momentShareIcon.addEventListener("click", (e) => {
    chatContainer.appendChild(momentShareArea);
});
