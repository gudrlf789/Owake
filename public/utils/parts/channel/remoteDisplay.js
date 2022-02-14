export const remoteDisplay = () => {
    const downBtn = document.createElement("i");
    const upBtn = document.createElement("i");
    const btnSpan = document.createElement("span");
    const btnSpan2 = document.createElement("span");
    const navContainer = document.querySelector(".nav__container");

    const upBtnCtr = document.createElement("div");
    const downBtnCtr = document.createElement("div");

    downBtn.className = "fas fa-chevron-circle-down";
    upBtn.className = "fas fa-chevron-circle-up";
    downBtn.id = "downBtn";
    upBtn.id = "upBtn";

    btnSpan.id = "btnSpan";
    btnSpan.className = "span-button";

    btnSpan.innerHTML = "Users";
    btnSpan2.innerHTML = "On";

    upBtnCtr.id = "upBtnContainer";
    downBtnCtr.id = "downBtnContainer";
    upBtnCtr.className = "options__button";
    downBtnCtr.className = "options__button";

    let upBtnActive = true;
    let downBtnActive = true;

    downBtnCtr.append(downBtn, btnSpan2);
    upBtnCtr.append(upBtn, btnSpan);
    navContainer.append(upBtnCtr);

    let width = window.document.body.offsetWidth;

    if (width > 768) {
        $("#remote__video__container").attr("style", "height:100%");
    } else {
        $("#remote__video__container").attr("style", "height:min-content");
    }

    $(document).on("click", "#upBtnContainer", (e) => {
        if (upBtnActive) {
            $("#remote-playerlist").slideUp("fast");
            navContainer.append(downBtnCtr);
            upBtnCtr.remove();
        }
    });

    $(document).on("click", "#downBtnContainer", (e) => {
        if (downBtnActive) {
            $("#remote-playerlist").slideDown("fast");
            btnSpan.innerHTML = "Off";
            navContainer.append(upBtnCtr);
            downBtnCtr.remove();
        }
    });
};
