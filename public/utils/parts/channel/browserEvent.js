export const browserEvent = () => {
    browserClose();
};

function browserClose() {
    /**
     * @anthor 박형길
     * @date 2022.03.22
     * @version 1.0
     * @descrption
     * leave 버튼을 클릭시에는 sessionStorage가 전부 clear 되고 유저 이름도 DB에서
     * 삭제 되므로 추가적인 기능이 불필요
     * 브라우저를 닫을시에는 sessionStorage값이 전부 남아있기 때문에
     * 유저 이름을 DB에서 삭제하는 기능이 추가로 필요하다
     */
    window.addEventListener("beforeunload", (e) => {
        if (window.sessionStorage.length > 0) {
            const reqData = {
                channelType: window.sessionStorage.getItem("channelType"),
                channelName: window.sessionStorage.getItem("channel"),
                userId: window.sessionStorage.getItem("uid"),
            };
            axios
                .post("/channel/removeUserNameOnChannel", reqData)
                .then((res) => {});
        }
        sessionStorage.clear();
        deleteAllCookies();
    });

    window.addEventListener("unload", (e) => {
        if (window.sessionStorage.length > 0) {
            const reqData = {
                channelType: window.sessionStorage.getItem("channelType"),
                channelName: window.sessionStorage.getItem("channel"),
                userId: window.sessionStorage.getItem("uid"),
            };
            axios
                .post("/channel/removeUserNameOnChannel", reqData)
                .then((res) => {});
        }
        sessionStorage.clear();
        deleteAllCookies();
    });

    // Browser를 나가면 현 도메인의 모든 쿠키를 삭제함.
    function deleteAllCookies() {
        let c = document.cookie.split("; ");
        for (i in c)
            document.cookie =
                /^[^=]+/.exec(c[i])[0] +
                "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}
