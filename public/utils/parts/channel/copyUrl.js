function copyInfo() {
    const copyIcon = document.getElementById("copyUrl");
    copyIcon.addEventListener("click", () => {
        navigator.clipboard.writeText(window.location.href);
        alert("The URL has been copied.");
    });
}

copyInfo();
