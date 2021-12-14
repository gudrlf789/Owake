$("#create").click((e) => {
    const reqData = {
        adminId: $('#adminId').val(),
        adminPassword: $('#adminPassword').val(),
        channelType: $('input:radio[name=channelRadioBtn]:checked').val(),
        channelName: $('#channelName').val(),
        channelPassword: $('#channelPassword').val(),
        channelCategory: $('#theme-category').val(),
        channelDescription: $('#channel-description').val()
    };

    axios.post("/register", reqData).then((res) => {
        if (res.data.success) {
            alert("The channel has been successfully created");
            $("#channelCreate").modal("hide");
            $("#adminId").val("");
            $("#adminPassword").val("");
            $("#channelName").val("");
            $("#channelPassword").val("");
            $("#theme-category").val("outdoor");
            $("#channel-description").val("");
            
            callChannelList();
        } else {
            alert(
                `ChannelName: ${$('#channelName').val()} is already existed. please choice another number`
            );
        }
    });
});

$("input:radio[name=channelRadioBtn]").change((e) => {
    if(e.currentTarget.value == "Public"){
        $("#channelPassword").attr("disabled", true);
        $("#channelPassword").val("");
    }else{
        $("#channelPassword").attr("disabled", false);
    }
});
