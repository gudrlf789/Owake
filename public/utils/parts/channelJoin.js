$("#channelJoin-btn").click((e) => {
    const channelName = $("#channelJoin-channelName").val();
    const userId = $("#channelJoin-userId").val();

    window.sessionStorage.setItem("channel", channelName);
    window.sessionStorage.setItem("uid", userId);
});
