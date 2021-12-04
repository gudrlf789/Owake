const downBtn = document.createElement("i");
const upBtn = document.createElement("i");

const remotePlayList = document.querySelector("#remote-playerlist");

downBtn.className = "fas fa-angle-down";
upBtn.className = "fas fa-angle-up";
downBtn.id = "downBtn";
upBtn.id = "upBtn";

$("#video-grid").append(upBtn);

$(document).on("click", "#upBtn", (e) => {
    upBtn.remove();
    $("#video-grid").append(downBtn);
    $("#remote-playerlist").slideUp("slow");
});

$(document).on("click", "#downBtn", (e) => {
    downBtn.remove();
    $("#video-grid").append(upBtn);
    $("#remote-playerlist").slideDown("slow");
});
