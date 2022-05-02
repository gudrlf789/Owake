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
        mainOptions.style.setProperty("opacity", "0.2");
        subOptions.style.setProperty("opacity", "1");
    }

    function selectOptionsDisable() {
        subOptions.hidden = true;
        mainOptions.style.setProperty("opacity", "1");
        subOptions.style.setProperty("opacity", "0");
    }
};
