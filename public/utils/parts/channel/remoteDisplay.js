export const remoteDisplay = () => {
    $(document).ready(function () {
        const downBtn = document.createElement("i");
        const upBtn = document.createElement("i");
        const playerList = document.querySelector("#remote-playerlist");

        downBtn.className = "fas fa-angle-down";
        upBtn.className = "fas fa-angle-up";
        downBtn.id = "downBtn";
        upBtn.id = "upBtn";

        $("#video-grid").append(upBtn);

        if (window.document.body.offsetHeight < 700) {
            upBtn.style.top = "200px";
            downBtn.style.top = "200px";
        } else if (window.document.body.offsetHeight > 700) {
            upBtn.style.top = "220px";
            downBtn.style.top = "220px";
        }

        $(document).on("click", "#upBtn", (e) => {
            $("#video-grid").append(downBtn);
            $("#remote-playerlist").slideUp("fast");
            upBtn.remove();
        });

        $(document).on("click", "#downBtn", (e) => {
            $("#video-grid").append(upBtn);
            $("#remote-playerlist").slideDown("fast");
            downBtn.remove();
        });
    });
};
