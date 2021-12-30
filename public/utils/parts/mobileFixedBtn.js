$(document).ready((e) => {
    const mobileMenu = document.createElement("div");
    mobileMenu.className = "mobileClickMenu";

    mobileMenu.style.padding = "10px";

    const publicChannelBtn = document.createElement("div");
    const PrivateChannelBtn = document.createElement("div");

    publicChannelBtn.className = "publicChannelBtn";
    PrivateChannelBtn.className = "PrivateChannelBtn";

    publicChannelBtn.textContent = "Create Public Channel";
    PrivateChannelBtn.textContent = "Create Private Channel";

    publicChannelBtn.style.marginBottom = "5px";

    publicChannelBtn.style.fontSize = "13px";
    PrivateChannelBtn.style.fontSize = "13px";

    mobileMenu.append(publicChannelBtn, PrivateChannelBtn);

    const bodyContainer = document.querySelector(".body-container");

    let menuActive = false;

    $(".mobile-main-fixed-menu").click((e) => {
        menuActive = !menuActive;
        if (menuActive == true) {
            bodyContainer.append(mobileMenu);
        } else {
            bodyContainer.removeChild(mobileMenu);
        }
    });

    $(document).on("click", ".publicChannelBtn", (e) => {
        $("#channelPublicCreate").modal("show");
    });

    $(document).on("click", ".PrivateChannelBtn", (e) => {
        $("#channelPrivateCreate").modal("show");
    });
});
