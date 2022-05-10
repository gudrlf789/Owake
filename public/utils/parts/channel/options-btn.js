const navBtn = document.querySelector("#nav__btn");
const optionsRightContainer = document.querySelector(".options__right");
const mainLeaveBtn = document.querySelector(".main__leave");
const optionsImgBtn = document.querySelector(".optionsBtnImg");

let subOptionsActivator = false;
let btnClickActivator = false;

export const optionsBtn = () => {
    navBtn.addEventListener("click", (e) => {
        subOptionsActivator = !subOptionsActivator;
        // subOptionsActivator ? selectOptionsEnable() : selectOptionsDisable();
    });

    if (optionsRightContainer.hidden === false) {
        leaveOptions();
    }

    $(document).on("click", ".optionsBtnImg", (e) => {
        btnClickActivator = !btnClickActivator;
    });
};

function leaveOptions() {
    mainLeaveBtn.addEventListener("click", () => {
        window.location.replace("/");
    });
}
