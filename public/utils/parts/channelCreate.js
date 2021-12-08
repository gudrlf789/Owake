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
            // 자식요소 모두 삭제 후 불러오기
            $(".box-conatiner").empty();
            callChannelList();
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