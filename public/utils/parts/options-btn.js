export const optionsBtnFunc = () => {
    const optionsBtn = document.createElement("img");
    optionBtnActivation(optionsBtn);
};

function optionBtnActivation(btn) {
    $("#video-grid").append(btn);

    btn.className = "options-toggle owake-videoRoom-btn";
    btn.id = "options-toggle owake-videoRoom-btn";
    btn.src = "../img/button/owake_logo.svg";
    $(document).on("click", "#options-toggle", (e) => {
        $(".options").slideToggle("slow");
    });
}
