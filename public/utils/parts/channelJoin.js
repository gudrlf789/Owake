$("#channelJoin-btn").click((e) => {
    const channelName = $("#channelJoin-channelName").val();
    const userId = $("#channelJoin-userId").val();

    window.sessionStorage.setItem("channel", channelName);
    window.sessionStorage.setItem("uid", userId);
    window.location.href = "/join";
});

$("#private-channelJoin-btn").click((e) => {
    const channelName = $("#private-channelName").val();
    const checkingPassword = $("#private-passwordChecking").val();

    const userId = $("#private-nickName").val();
    const password = $("#private-roomPassword").val();

    if (checkingPassword !== password) {
        alert("Wrong Password");
        $("#private-channelName").val("");
        $("#private-passwordChecking").val("");
        $("#private-nickName").val("");
        $("#private-roomPassword").val("");
        $("#channelPrivateJoin").modal("hide");
    } else {
        window.sessionStorage.setItem("channel", channelName);
        window.sessionStorage.setItem("uid", userId);
        window.location.href = "/join";
    }
});

$("#public-channelJoin-btn").click((e) => {
    const channelName = $("#public-channelName").val();
    const userId = $("#public-nickName").val();

    window.sessionStorage.setItem("channel", channelName);
    window.sessionStorage.setItem("uid", userId);
    window.location.href = "/join";
});

$("input:radio[name=userTypeRadioBtn]").change((e) => {
    if (e.currentTarget.value == "ADMIN") {
        $("#channelJoin-adminPassword").attr("disabled", false);
    } else {
        $("#channelJoin-adminPassword").attr("disabled", true);
        $("#channelJoin-adminPassword").val("");
    }
});