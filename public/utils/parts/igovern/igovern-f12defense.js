export const f12defense = () => {
    // 오른쪽 버튼 비활성화
    document.addEventListener(
        "contextmenu",
        function (e) {
            e.preventDefault();
        },
        false
    );
};
