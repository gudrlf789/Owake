import { totalUsers, localVideoBox } from "../../rtcClient.js";

/**
 * @author 전형동
 * @date 2022 03 10
 * @description
 * 레이아웃 그리드 활성화 및 비활성화 기능
 *
 * 버그 : 모바일 화면 수정할 필요있음. 스크롤이 생기면서
 * 레이아웃이 깨짐. 메뉴 네브바가 고정이 안되어있음.
 * 로컬화면쪽 이름 붙여야됨.
 * 그리드 레이아웃 활성화시 비디오 클릭버튼 비활성화 시켜야 됨.
 * 또 비활성화시에는 클릭버튼 활성화 시켜야됨.
 *
 *
 * ------------------- 수정해야 될 사항 ----------------
 * 1. 아직도 li 찌꺼기가 남아있음.
 * 2. 스크린쉐어 후 나가게 되면 배열에 스크린쉐어 트랙 Element가 담겨져서 사라지지 않는 현상 발견
 */

let gridViewActivator = false;
let localVideoSave = [];
let remoteVideoSave = [];
let newRemoteVideoSave;
let gridViewPeer;
let number = 0;

const gridContainer = document.createElement("ul");
const localPlayerName = document.querySelector("#local-player-name");
const localVideoContainer = document.querySelector("#local__video__container");

let remotePlayList = document.querySelector("#remote-playerlist");
let viewChangeBtn = document.querySelector("#video-grid-button");
let gridList;

gridContainer.className = "grid-container";
gridContainer.id = "auto-grid";

export const gridView = () => {
    gridViewBtnActivator();
};

function gridViewBtnActivator() {
    $(document).on("click", "#video-grid-button", (e) => {
        e.preventDefault();
        e.stopPropagation();
        gridViewActivator = !gridViewActivator;
        gridViewActivator ? gridViewEnable() : gridViewDisable();

        // 찌꺼기 li 제거
        scrapsBoxRemove();
    });
}

function gridViewEnable() {
    localVideoContainer.classList.remove("grid-off");
    localVideoContainer.classList.add("grid-on");
    viewChangeBtn.children[0].classList.remove("fa-th");
    viewChangeBtn.children[0].classList.add("fa-grip-vertical");

    localPlayerName.hidden = true;

    // totalUsers를 rtcClient에서 가져옴.
    gridViewPeer = Object.keys(totalUsers);

    // LocalVideo 노드가 자식이 있는지 여부를 알아낸다
    while (localVideoBox.hasChildNodes()) {
        // 배열 비우기
        localVideoSave.length = 0;
        localVideoSave.push(localVideoBox.childNodes[0]);
        localVideoBox.removeChild(localVideoBox.firstChild);
    }

    // remotePlayList 노드가 자식이 있는지 여부를 알아낸다
    if (remotePlayList.hasChildNodes()) {
        for (number; number < gridViewPeer.length; number++) {
            let remotePeer = document.querySelector(
                `#player-wrapper-${gridViewPeer[number]}`
            );

            remoteVideoSave.push(remotePeer);
        }
        remotePlayList.removeChild(remotePlayList.firstChild);
    }

    // 배열에서 null값 제거
    newRemoteVideoSave = remoteVideoSave.filter((element) => element !== null);

    for (number = 0; number < newRemoteVideoSave.length; number++) {
        if (newRemoteVideoSave.length > 0) {
            gridList = document.createElement("li");
            gridContainer.append(gridList);
            gridList.append(newRemoteVideoSave[number]);
        }
    }

    localVideoBox.append(gridContainer);
    gridList = document.createElement("li");
    gridList.append(localVideoSave[0]);
    gridContainer.append(gridList);
}

function gridViewDisable() {
    localVideoContainer.classList.remove("grid-on");
    localVideoContainer.classList.add("grid-off");
    localPlayerName.hidden = false;

    viewChangeBtn.children[0].classList.remove("fa-grip-vertical");
    viewChangeBtn.children[0].classList.add("fa-th");

    while (localVideoBox.hasChildNodes()) {
        localVideoBox.removeChild(localVideoBox.firstChild);
    }

    localVideoBox.append(localVideoSave[0]);
    for (number = 0; number < newRemoteVideoSave.length; number++) {
        remotePlayList.append(newRemoteVideoSave[number]);
    }
}

/**
 * @author 전형동
 * @date 2022 03 20
 * @description
 * Grid Enable 시에 생기는 공백 li 태그를 제거한다.
 */

function scrapsBoxRemove() {
    let liLength;
    if (gridContainer.childNodes) {
        for (let i = 0; i < gridContainer.childNodes.length; i++) {
            liLength = gridContainer.childNodes[i];
            if (liLength.childElementCount < 1) {
                liLength.remove();
            }
        }
    }
}
