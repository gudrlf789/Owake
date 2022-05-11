const navBtn = document.querySelector("#nav__btn");

let deviceSettingActivator = false;

export const optionsBtn = () => {
    navBtn.addEventListener("click", (e) => {
        deviceSettingActivator = !deviceSettingActivator;
        // subOptionsActivator ? selectOptionsEnable() : selectOptionsDisable();
    });
};
