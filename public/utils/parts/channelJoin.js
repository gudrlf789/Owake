$("#channelJoin-btn").click((e) => {
    const channelName = $("#channelJoin-channelName").val();
    const userId = $("#channelJoin-userId").val();

    window.sessionStorage.setItem("channel", channelName);
    window.sessionStorage.setItem("uid", userId);

    //테스트
    window.location.href="https://owake.ga/join";
});

$("#private-channelJoin-btn").click((e) => {
    const channelName = $("#private-channelName").val();
    const checkingPassword = $("#private-passwordChecking").val();

    const userId = $("#private-nickName").val();
    const password = $("#private-roomPassword").val();

    if(checkingPassword !== password){
        alert("Wrong Password");
        $("#private-channelName").val("");
        $("#private-passwordChecking").val("");
        $("#private-nickName").val("");
        $("#private-roomPassword").val("");
        $("#channelPrivateJoin").modal("hide");
    }else{
        window.sessionStorage.setItem("channel", channelName);
        window.sessionStorage.setItem("uid", userId);

        //테스트
        window.location.href="https://owake.ga/join";
    }
});

$("#public-channelJoin-btn").click((e) => {
    const channelName = $("#public-channelName").val();
    const userId = $("#public-nickName").val();

    window.sessionStorage.setItem("channel", channelName);
    window.sessionStorage.setItem("uid", userId);

    //테스트
    window.location.href="http://localhost:1227/join";
});
