const identifireBtn = document.querySelector("#fileHashBtn");
const identifireContainer = document.querySelector(".identifier-container");
const fileHashImg = document.querySelector("#fileHashImg");

let identifireActivator = false;

export const identifireFunc = () => {
    identifireBtn.addEventListener("click", (e) => {
        identifireActivator = !identifireActivator;
        identifireActivator ? identifireEnable() : identifireDisable();
    });
};

function identifireEnable() {
    identifireContainer.hidden = false;
    fileHashImg.style.setProperty(
        "filter",
        "invert(69%) sepia(56%) saturate(3565%) hue-rotate(310deg) brightness(90%) contrast(106%)"
    );
}

function identifireDisable() {
    identifireContainer.hidden = true;
    fileHashImg.style.setProperty("filter", "none");
}
