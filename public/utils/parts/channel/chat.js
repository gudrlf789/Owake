export const mobileDisplayCtr = () => {
    let messagesActive = false;

    const showChat = document.querySelector("#showChat");
    const mainRight = document.querySelector(".main__right");

    showChat.addEventListener("click", () => {
        messagesActive = !messagesActive;
        messagesActive ? messageEnable() : messageDisable();
    });

    function messageEnable() {
        mainRight.hidden = false;
        mainRight.style.display = "flex";
        showChat.style.color = "rgb(165, 199, 236)";
    }
    function messageDisable() {
        mainRight.hidden = true;
        showChat.style.color = "#fff";
    }

    document.activeElement.blur();
};

export const scrollToBottom = () => {
    let messages = document.querySelector(".messages");
    messages.scrollTop = messages.scrollHeight;
};
