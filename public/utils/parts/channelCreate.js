$("#create").click((e) => {
    let channelNumber = 1;
    const reqData = {
        channelNo: channelNumber,
        adminId: $("#adminId").val(),
        adminPassword: $("#adminPassword").val(),
        channelType: $("input:radio[name=channelRadioBtn]:checked").val(),
        channelName: $("#channelName").val(),
        channelPassword: $("#channelPassword").val(),
        channelTheme: $("#theme-category").val(),
        channelDescription: $("#channel-description").val(),
    };

    axios.post("/channel/register", reqData).then((res) => {
        if (res.data.success) {
            alert("The channel has been successfully created");
            $("#channelCreate").modal("hide");
            // 자식요소 모두 삭제 후 불러오기
            $(".box-conatiner").empty();
            callChannelList();
        } else {
            alert(
                `ChannelName: ${$(
                    "#channelName"
                ).val()} is already existed. please choice another number`
            );
        }
    });
});

$("input:radio[name=channelRadioBtn]").change((e) => {
    if (e.currentTarget.value == "Public") {
        $("#channelPassword").attr("disabled", true);
    } else {
        $("#channelPassword").attr("disabled", false);
    }
});
