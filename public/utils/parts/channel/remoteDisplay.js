const usersBtn = document.querySelector("#users");
const remotePlayerList = document.querySelector("#remote-playerlist");

let usersBtnActive = false;
let width;

export const remoteDisplay = () => {
    window.addEventListener("resize", resizeRemoteContainerAction, false);
    usersBtn.addEventListener("click", clickRemoteDisplayAction, false);
};

function clickRemoteDisplayAction(e) {
    let element = e.target;
    if (remotePlayerList.childElementCount > 0) {
        usersBtnActive = !usersBtnActive;

        if (element.style.color !== "rgb(255, 255, 255)") {
            usersBtnActive = false;
        } else {
            usersBtnActive = true;
        }

        usersBtnActive
            ? usersDisplayEnable(element)
            : usersDisplayDisable(element);
    } else {
        return alert("No users are connected to the room.");
    }
}

function usersDisplayEnable(element) {
    remotePlayerList.hidden = false;
    element.style.color = "#e07478";
}

function usersDisplayDisable(element) {
    remotePlayerList.hidden = true;
    element.style.color = "#fff";
}

function resizeRemoteContainerAction() {
    width = window.document.body.offsetWidth;
    if (width > 768) {
        $("#remote__video__container").attr("style", "height:100%");
    } else {
        $("#remote__video__container").attr("style", "height:min-content");
    }
}
