const downBtn = document.createElement("i");
const upBtn = document.createElement("i");

const remotePlayList = document.querySelector("#remote-playerlist");

downBtn.className = "fas fa-angle-down";
upBtn.className = "fas fa-angle-up";
downBtn.id = "downBtn";
upBtn.id = "upBtn";

$("#remote-playerlist").append(upBtn);

$(document).on("click", "#upBtn", (e) => {
    $("#video-grid").append(downBtn);
    $("#remote-playerlist").slideUp("slow");
});

$(document).on("click", "#downBtn", (e) => {
    $("#remote-playerlist").slideDown("slow");
    downBtn.remove();
});
