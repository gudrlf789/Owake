import { deviceScan } from "./deviceScan.js";
let event = deviceScan();

export const mobileDisplayCtr = () => {
    let messagesActive = false;

    const showChat = document.querySelector("#showChat");
    const mainRight = document.querySelector(".main__right");

    showChat.addEventListener(event, () => {
        messagesActive = !messagesActive;
        messagesActive ? messageEnable() : messageDisable();
    });

    function messageEnable() {
        mainRight.hidden = false;
        mainRight.style.display = "flex";
        showChat.children[0].style.color = "#ec6f73";
    }
    function messageDisable() {
        mainRight.hidden = true;
        showChat.children[0].style.color = "#fff";
    }

    document.activeElement.blur();
};

export const scrollToBottom = () => {
    let messages = document.querySelector(".messages");
    messages.scrollTop = messages.scrollHeight;
};
