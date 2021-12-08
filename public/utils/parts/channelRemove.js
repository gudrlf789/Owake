$("#remove").click((e) => {
    const reqData = {
        channelName: $("#channelName").val(),
    };

    axios.post("/room/delete", reqData).then((res) => {
        if (res.data.success) {
            alert("The channel has been successfully deleted");
            $("#channelCreate").modal("hide");

            $("#adminId").val("");
            $("#adminPassword").val("");
            $("#channelName").val("");
            $("#channelPassword").val("");
            $("#theme-category").val("outdoor");
            $("#channel-description").val("");

            callChannelList();
        } else {
            alert("The channel hasn't been successfully deleted");
            $("#channelCreate").modal("hide");
        }
    });
});
