function mobileDisplayCtr() {
    const showChat = document.querySelector("#showChat");
    const backBtn = document.querySelector(".header__back");

    backBtn.addEventListener("click", () => {
        document.querySelector(".main__left").style.display = "flex";
        document.querySelector(".main__left").style.flex = "1";
        document.querySelector(".main__right").style.display = "none";
        document.querySelector(".header__back").style.display = "none";
    });

    showChat.addEventListener("click", () => {
        document.querySelector(".main__right").style.display = "flex";
        document.querySelector(".main__right").style.flex = "1";
        document.querySelector(".main__left").style.display = "none";
        document.querySelector(".header__back").style.display = "block";
    });
}

function scrollToBottom() {
    let d = document.querySelector(".messages");
    d.scrollTop = d.scrollHeight;
}
mobileDisplayCtr();
