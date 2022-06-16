export const responsiveFunc = () => {
    playerNameHidden();
    mobileResponsive();
    window.addEventListener("resize", playerNameHidden, false);
    window.addEventListener("resize", mobileResponsive, false);
};

function playerNameHidden() {
    const playerName = document.querySelector("#local-player-name");
    const mainOptions = document.querySelector(".main__options");
    const subOptions = document.querySelector(".sub__options");

    const optionsNext = document.querySelector(".nav__right");
    const optionsPrev = document.querySelector(".nav__left");

    const bodyWidth = document.body.offsetWidth;

    let classNameSearch = {};

    if (bodyWidth <= 1280) {
        playerName.hidden = true;
        optionsNext.hidden = false;
        optionsPrev.hidden = false;

        for (let i = 0; i < mainOptions.classList.length; i++) {
            classNameSearch.main = mainOptions.classList[i];
            classNameSearch.sub = subOptions.classList[i];

            if (
                !classNameSearch.main.includes("swiper-slide") ||
                !classNameSearch.main.includes("swiper-slide-active") ||
                !classNameSearch.main.includes("swiper-slide-next")
            ) {
                mainOptions.classList.add("swiper-slide");
                mainOptions.classList.add("swiper-slide-active");
                mainOptions.classList.add("swiper-slide-next");
            }

            if (
                !classNameSearch.sub.includes("swiper-slide") ||
                !classNameSearch.sub.includes("swiper-slide-active") ||
                !classNameSearch.sub.includes("swiper-slide-next")
            ) {
                subOptions.classList.add("swiper-slide");
                subOptions.classList.add("swiper-slide-active");
                subOptions.classList.add("swiper-slide-next");
            }
        }
    } else if (bodyWidth < 768) {
        playerName.hidden = true;
        optionsNext.hidden = false;
        optionsPrev.hidden = false;

        for (let i = 0; i < mainOptions.classList.length; i++) {
            classNameSearch.main = mainOptions.classList[i];
            classNameSearch.sub = subOptions.classList[i];

            if (
                !classNameSearch.main.includes("swiper-slide") ||
                !classNameSearch.main.includes("swiper-slide-active") ||
                !classNameSearch.main.includes("swiper-slide-next")
            ) {
                mainOptions.classList.add("swiper-slide");
                mainOptions.classList.add("swiper-slide-active");
                mainOptions.classList.add("swiper-slide-next");
            }

            if (
                !classNameSearch.sub.includes("swiper-slide") ||
                !classNameSearch.sub.includes("swiper-slide-active") ||
                !classNameSearch.sub.includes("swiper-slide-next")
            ) {
                subOptions.classList.add("swiper-slide");
                subOptions.classList.add("swiper-slide-active");
                subOptions.classList.add("swiper-slide-next");
            }
        }
    } else if (bodyWidth >= 1281) {
        playerName.hidden = false;
        optionsNext.hidden = true;
        optionsPrev.hidden = true;

        for (let i = 0; i < mainOptions.classList.length; i++) {
            classNameSearch.main = mainOptions.classList[i];
            classNameSearch.sub = subOptions.classList[i];

            if (
                classNameSearch.main.includes("swiper-slide") ||
                classNameSearch.main.includes("swiper-slide-active") ||
                classNameSearch.main.includes("swiper-slide-next")
            ) {
                mainOptions.classList.remove("swiper-slide");
                mainOptions.classList.remove("swiper-slide-active");
                mainOptions.classList.remove("swiper-slide-next");
            }

            if (
                classNameSearch.sub.includes("swiper-slide") ||
                classNameSearch.sub.includes("swiper-slide-active") ||
                classNameSearch.sub.includes("swiper-slide-next")
            ) {
                subOptions.classList.remove("swiper-slide");
                subOptions.classList.remove("swiper-slide-active");
                subOptions.classList.remove("swiper-slide-next");
            }
        }
    }
}

function mobileResponsive() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
}
