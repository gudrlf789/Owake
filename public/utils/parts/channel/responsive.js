export const responsiveFunc = () => {
    playerNameHidden();
    mobileResponsive();
    window.addEventListener("resize", playerNameHidden, false);
    window.addEventListener("resize", mobileResponsive, false);
};

function playerNameHidden() {
    const playerName = document.querySelector("#local-player-name");
    const optionsRightContainer = document.querySelector(".options__right");
    const optionsNext = document.querySelector(".nav__right");
    const optionsPrev = document.querySelector(".nav__left");

    const desktopOptions = document.querySelector(".desktop-options");
    const mobileOptions = document.querySelector(".mobile-options");

    const bodyWidth = document.body.offsetWidth;
    if (bodyWidth < 768) {
        playerName.hidden = true;
        optionsRightContainer.hidden = true;
        optionsNext.hidden = true;
        optionsPrev.hidden = true;

        desktopOptions.hidden = true;
        mobileOptions.hidden = false;
    } else {
        playerName.hidden = false;
        optionsRightContainer.hidden = false;
        optionsNext.hidden = true;
        optionsPrev.hidden = true;

        desktopOptions.hidden = false;
        mobileOptions.hidden = true;
    }
}

function mobileResponsive() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
}
