/**
 * @author 전형동
 * @date 2022 05 08
 * @version 1.0
 * @description
 * remoteDisplay 설정
 *
 * ---------------- 수정사항 ---------------
 * 1. 리모트 유저가 접속했을 때 버튼 색상 변경
 * 2. 유저가 접속한 상태라면 분홍색 아니면 흰색
 */

const usersBtn = document.querySelector("#users");
const remotePlayerList = document.querySelector("#remote-playerlist");

let usersBtnActive = false;
let width;

export const remoteDisplay = () => {
    // window.addEventListener("resize", resizeRemoteContainerAction, false);
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
    if (width < 768) {
        $("#remote__video__container").attr("style", "height:min-content");
    }
}
