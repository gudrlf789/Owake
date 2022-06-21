// 공백체크
let pattern_empty = /\s/g;
//  영문체크
let check_eng = /[a-zA-Z]/;
/// 숫자체크
let check_number = /\d/;
// 특수문자 체크
let check_SpecialCharacter = /[~!@#$%^&*()_+|<>?:{}]/;

// 비밀번호 조합(영문, 숫자, 특수문자) 및 길이 체크 정규식
let regExpPassword = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^*+=-]).{6,16}$/;

window.addEventListener("input", (e) => {
    validationCheck(e.target);
});

const validationCheck = (target) => {
    if (target.type === "password") {
        if (target.value.match(regExpPassword)) {
            console.log("password true");
            target.style.setProperty("color", "#000");
            return true;
        } else {
            console.log("password false");
            target.style.setProperty("color", "red");
            return false;
        }
    }
};
