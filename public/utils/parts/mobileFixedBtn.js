// Element Create Div
const mobileMenu = document.createElement("div");
const channelPublicBtn = document.createElement("div");
const channelPrivateBtn = document.createElement("div");
const channelPublicBtnImg = document.createElement("img");
const channelPrivateBtnImg = document.createElement("img");
const channelBtnPublicText = document.createElement("p");
const channelBtnPrivateText = document.createElement("p");
// Element Create End

// ClassName, ID Setting
mobileMenu.className = "mobileClickMenu";
channelPublicBtn.className = "mobile-channel-btn";
channelPrivateBtn.className = "mobile-channel-btn";
channelPublicBtnImg.className = "mobile-channel-btn-img";
channelPrivateBtnImg.className = "mobile-channel-btn-img";

channelPublicBtn.id = "mobileChannelPublicBtn";
channelPrivateBtn.id = "mobileChannelPrivateBtn";
// ClassName, ID Setting End

mobileMenu.style.padding = "10px";

channelPublicBtnImg.src = "../../img/channel/mobile_public_btn.svg";
channelPrivateBtnImg.src = "../../img/channel/mobile_private_btn.svg";

channelBtnPublicText.textContent = "Public";
channelBtnPrivateText.textContent = "Private";

channelPublicBtn.append(channelPublicBtnImg, channelBtnPublicText);
channelPrivateBtn.append(channelPrivateBtnImg, channelBtnPrivateText);

// 2022 04 26
// author 전형동
// 헷갈리니 일단 주석처리
// mobileMenu.append(channelPublicBtn, channelPrivateBtn);
mobileMenu.append(channelPublicBtn);

const mobileBodyContainer = document.querySelector(".body-container");

let menuActive = false;

$(".mobile-main-fixed-menu").click((e) => {
    menuActive = !menuActive;
    if (menuActive == true) {
        mobileBodyContainer.append(mobileMenu);
    } else {
        mobileBodyContainer.removeChild(mobileMenu);
    }
});

$(document).on("click", "#mobileChannelPublicBtn", (e) => {
    $("#channelPublicCreate").modal("show");
});

// $(document).on("click", "#mobileChannelPrivateBtn", (e) => {
//     $("#channelPrivateCreate").modal("show");
// });

window.addEventListener("resize", () => {
    try {
        if (window.innerWidth > 768) {
            mobileBodyContainer.removeChild(mobileMenu);
        }
    } catch (err) {
        console.log("Error: " + err);
    }
});
