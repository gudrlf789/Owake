$("#create").click((e) => {
    const reqData = {
        adminId: $('#adminId').val(),
        adminPassword: $('#adminPassword').val(),
        roomType: $('input:radio[name=drone]:checked').val(),
        roomName: $('#channelName').val(),
        roomPassword: $('#channelPassword').val(),
        roomTheme: $('#theme-category').val(),
        roomDescription: $('#channel-description').val()
    };

    axios.post("/room/register", reqData).then((res) => {
        if (res.data.success) {
            alert("The channel has been successfully created");
            $("#channelCreate").modal("hide");
        } else {
            alert(
                `ChannelName: ${$('#channelName').val()} is already existed. please choice another number`
            );
        }
    });
});

$("input:radio[name=drone]").change((e) => {
    if(e.currentTarget.value == "Public"){
        $("#channelPassword").attr("disabled", true);
    }else{
        $("#channelPassword").attr("disabled", false);
    }
});
