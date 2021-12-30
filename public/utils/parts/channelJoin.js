$("#private-channelJoin-btn").click((e) => {
    const channelName = $("#private-channelName").val();
    const checkingPassword = $("#private-passwordChecking").val();

    const userId = $("#private-nickName").val();
    const password = $("#private-roomPassword").val();

    if (checkingPassword !== password) {
        alert("Wrong Password");
        $("#private-roomPassword").val("");
    } else {
        checkKorean(userId, channelName);
    }
});

$("#public-channelJoin-btn").click((e) => {
    const channelName = $("#public-channelName").val();
    const userId = $("#public-nickName").val();

    checkKorean(userId, channelName);
});

function checkKorean(userId, channelName) {
    const korean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;

    if(!korean.test(userId)){
        window.sessionStorage.setItem("channel", channelName);
        window.sessionStorage.setItem("uid", userId);
        window.location.href = "/join";
    }else{
        alert("You can only type User Name in English.");
    }
};