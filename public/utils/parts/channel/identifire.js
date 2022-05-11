const identifireBtn = document.querySelector("#fileHashBtn");
const identifireContainer = document.querySelector(".identifier-container");
let identifireActivator = false;

export const identifireFunc = () => {
    identifireBtn.addEventListener("click", (e) => {
        identifireActivator = !identifireActivator;
        identifireActivator ? identifireEnable() : identifireDisable();
    });
};

function identifireEnable() {
    identifireContainer.hidden = false;
}

function identifireDisable() {
    identifireContainer.hidden = true;
}
