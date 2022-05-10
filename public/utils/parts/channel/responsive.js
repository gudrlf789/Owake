export const responsiveFunc = () => {
    playerNameHidden();
    mobileResponsive();
    window.addEventListener("resize", playerNameHidden, false);
    window.addEventListener("resize", mobileResponsive, false);
};

function playerNameHidden() {
    const playerName = document.querySelector("#local-player-name");
    const optionsRightContainer = document.querySelector(".options__right");
    const bodyWidth = document.body.offsetWidth;
    if (bodyWidth < 768) {
        playerName.hidden = true;
        optionsRightContainer.hidden = true;
    } else {
        playerName.hidden = false;
        optionsRightContainer.hidden = false;
    }
}

function mobileResponsive() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
}
