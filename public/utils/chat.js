function mobileDisplayCtr() {
    let messagesActive = false;

    const showChat = document.querySelector("#showChat");
    const mainRight = document.querySelector(".main__right");

    showChat.addEventListener("click", () => {
        messagesActive = !messagesActive;
        messagesActive ? messageEnable() : messageDisable();
    });

    function messageEnable() {
        mainRight.style.display = "flex";
        mainRight.style.flex = "1";
    }
    function messageDisable() {
        mainRight.style.display = "none";
    }
}

function scrollToBottom() {
    let messages = document.querySelector(".messages");
    messages.scrollTop = messages.scrollHeight;
}
mobileDisplayCtr();
