export const copyInfo = () => {
    const copyIcon = document.getElementById("copyUrl");
    copyIcon.addEventListener("click", () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert("The URL has been copied.");
        });
    });
};
