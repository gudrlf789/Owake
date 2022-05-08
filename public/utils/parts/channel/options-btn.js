const navBtn = document.querySelector("#nav__btn");
const subOptions = document.querySelector(".sub__options");
const mainOptions = document.querySelector(".main__options");
const navRight = document.querySelector("#nav__right");
const navLeft = document.querySelector("#nav__left");
const optionsRightContainer = document.querySelector(".options__right");
const mainLeaveBtn = document.querySelector(".main__leave");

let width;
let subOptionsActivator = false;

export const optionsBtn = () => {
    resizeOptionsActive();
    window.addEventListener("resize", resizeOptionsActive, false);

    navBtn.addEventListener("click", (e) => {
        subOptionsActivator = !subOptionsActivator;
        subOptionsActivator ? selectOptionsEnable() : selectOptionsDisable();
    });
    navRight.addEventListener("click", (e) => {
        console.log(e.target);
        mainOptions.hidden = true;
        subOptions.hidden = false;
    });
    navLeft.addEventListener("click", (e) => {
        mainOptions.hidden = false;
        subOptions.hidden = true;
    });

    if (optionsRightContainer.hidden === false) {
        leaveOptions();
    }
};

function selectOptionsEnable() {
    subOptions.hidden = false;
    mainOptions.hidden = true;
}

function selectOptionsDisable() {
    subOptions.hidden = true;
    mainOptions.hidden = false;
}

function resizeOptionsActive() {
    console.log("resizeOptionsActive:::::::::::::::");

    width = window.document.body.offsetWidth;
    if (width < 768) {
        navRight.hidden = true;
        navLeft.hidden = true;
        optionsRightContainer.hidden = true;
    } else {
        navRight.hidden = false;
        navLeft.hidden = false;
        optionsRightContainer.hidden = false;
    }
}

function leaveOptions() {
    mainLeaveBtn.addEventListener("click", () => {
        window.location.replace("/");
    });
}
