export const optionsBtnFunc = () => {
    const optionsBtn = document.createElement("img");

    $("#video-grid").append(optionsBtn);

    optionsBtn.className = "options-toggle owake-btn";
    optionsBtn.id = "options-toggle";
    optionsBtn.src = "../img/button/owake_logo.svg";

    $(document).on("click", "#options-toggle", (e) => {
        $(".options").slideToggle("slow");
    });
};
