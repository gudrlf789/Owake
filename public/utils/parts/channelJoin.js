$("#join").click((e) => {
    const channelName = $("#channelJoin-channelName").val();
    const userId = $("#channelJoin-userId").val();

    window.sessionStorage.setItem("channel", channelName);
    window.sessionStorage.setItem("uid", userId);
    window.location.href="http://localhost:1227/join";
});