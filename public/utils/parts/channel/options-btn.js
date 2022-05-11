const navBtn = document.querySelector("#nav__btn");

let subOptionsActivator = false;

export const optionsBtn = () => {
    navBtn.addEventListener("click", (e) => {
        subOptionsActivator = !subOptionsActivator;
        // subOptionsActivator ? selectOptionsEnable() : selectOptionsDisable();
    });

    // if (optionsRightContainer.hidden === false) {
    //     leaveOptions();
    // }

    // $(document).on("click", ".optionsBtnImg", (e) => {
    //     btnClickActivator = !btnClickActivator;
    // });
};
