export const optionsBtn = () => {
    const navBtn = document.querySelector("#nav__btn");
    const subOptions = document.querySelector(".sub__options");
    const mainOptions = document.querySelector(".main__options");

    let subOptionsActivator = false;

    navBtn.addEventListener("click", (e) => {
        subOptionsActivator = !subOptionsActivator;
        subOptionsActivator ? selectOptionsEnable() : selectOptionsDisable();
    });

    function selectOptionsEnable() {
        subOptions.hidden = false;
        mainOptions.hidden = true;
    }

    function selectOptionsDisable() {
        subOptions.hidden = true;
        mainOptions.hidden = false;
    }
};
