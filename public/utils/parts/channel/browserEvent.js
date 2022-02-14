export const browserEvent = () => {
    browserClose();
};

function browserClose() {
    window.addEventListener("beforeunload", (e) => {
        sessionStorage.clear();
    });
}
