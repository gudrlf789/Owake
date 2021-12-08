export const responsiveFunc = () => {
    $(document).ready(() => {
        playerNameHidden();
    });
};

const playerName = document.querySelector("#local-player-name");
const bodyWidth = document.body.offsetWidth;

function playerNameHidden() {
    if (bodyWidth < 768) {
        playerName.hidden = true;
    } else {
        playerName.hidden = false;
    }
}
