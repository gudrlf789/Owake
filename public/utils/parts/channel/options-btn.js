export const optionsBtn = () => {
    const owakeBtn = document.createElement("img");

    $("#video-grid").append(owakeBtn);

    owakeBtn.className = "options-toggle owake-btn";
    owakeBtn.id = "options-toggle";
    owakeBtn.src = "../../img/button/owake_logo.svg";

    $(document).on("click", "#options-toggle", (e) => {
        $(".options").slideToggle("slow");
    });
};
