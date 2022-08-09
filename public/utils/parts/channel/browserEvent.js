export const browserEvent = () => {
    browserClose();
};

/**
 * @anthor 전형동
 * @date 2022.08.09
 * @version 1.0
 * @descrption
 * 브라우저 이름과 버전 체크 함수
 */

export function browserCheck() {
    let result = bowser.getParser(window.navigator.userAgent);
    console.log(result.parsedResult.browser.name);
    console.log(result.parsedResult.browser.version);

    if (
        result.parsedResult.browser.name.includes("Chrome") ||
        result.parsedResult.browser.name.includes("Edge") ||
        result.parsedResult.browser.name.includes("Safari")
    ) {
        return true;
    } else {
        return false;
    }
}

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
        handlerBrowserCloseEvent(e);
    });

    function handlerBrowserCloseEvent(e) {
        if (window.sessionStorage.length > 0) {
            const reqData = {
                channelType: window.sessionStorage.getItem("channelType"),
                channelName: window.sessionStorage.getItem("channel"),
                userId: window.sessionStorage.getItem("uid"),
            };
            axios.post("/channel/removeUserNameOnChannel", reqData);
        }
        sessionStorage.clear();
        deleteAllCookies();
    }

    /**
     * @author 전형동
     * @version 1.1
     * @data 2022.04.25
     * @description
     * Browser를 나가면 현 도메인의 모든 쿠키를 삭제함.
     */
    function deleteAllCookies() {
        let c = document.cookie.split("; ");
        for (i in c)
            document.cookie =
                /^[^=]+/.exec(c[i])[0] +
                "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}
