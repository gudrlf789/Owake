export const f12defense = () => {
    // 오른쪽 버튼 비활성화
    document.addEventListener(
        "contextmenu",
        function (e) {
            e.preventDefault();
        },
        false
    );

    // 소스 보기 바로가기 키 비활성화
    // USE THIS TO DISABLE CONTROL AND ALL FUNCTION KEYS
    // if (e.ctrlKey || (e.keyCode>=112 && e.keyCode<=123)) {
    // THIS WILL ONLY DISABLE CONTROL AND F12
    // document.addEventListener("keydown", (e) => {
    //     if (e.ctrlKey || e.keyCode == 123) {
    //         e.stopPropagation();
    //         e.preventDefault();
    //     }
    // });
};
