import { deviceScan } from "./deviceScan.js";
let event = deviceScan();

export const mobileDisplayCtr = () => {
    let messagesActive = false;

    const chatImg = document.querySelector("#chat-img");
    const mainRight = document.querySelector(".main__right");

    chatImg.addEventListener("click", () => {
        messagesActive = !messagesActive;
        messagesActive ? messageEnable() : messageDisable();
    });

    function messageEnable() {
        mainRight.hidden = false;
        mainRight.style.display = "flex";
        chatImg.src = "/right/chat_a.svg";
    }
    function messageDisable() {
        mainRight.hidden = true;
        chatImg.src = "/right/chat.svg";
    }

    document.activeElement.blur();
};

export const scrollToBottom = () => {
    let messages = document.querySelector(".messages");
    messages.scrollTop = messages.scrollHeight;
};
