function realUpdateChannel() {
    const imageType = /(.*?)\/(jpg|jpeg|png|gif|bmp)$/;
    const formData = new FormData();

    formData.append("adminId", $(`#update_adminId`).val());
    formData.append("adminPassword", $(`#update_adminPassword`).val());
    formData.append(
        "channelType",
        $("input:radio[name=update_channelType]:checked").val()
    );
    formData.append("channelName", $(`#update_channelName`).val());
    formData.append("channelPassword", $(`#update_channelPassword`).val());
    formData.append("channelCategory", $(`#update_theme-category`).val());
    formData.append(
        "channelDescription",
        $(`#update_channel-description`).val()
    );

    if ($(`#update_file_thumnail`)[0].files[0]) {
        if (imageType.test($(`#update_file_thumnail`)[0].files[0].type)) {
            formData.append("image", $(`#update_file_thumnail`)[0].files[0]);
            formData.append(
                "imageName",
                $(`#update_file_thumnail`)[0].files[0].name
            );
        } else {
            alert("You can only select the image file");
            return;
        }
    } else {
        formData.append("imageName", $("#update_upload").val());
    }

    axios.post("/channel/update", formData).then((res) => {
        if (res.data.success) {
            alert("The channel has been successfully modified");
            $("#channelUpdateModal").modal("hide");
            $(`#update_adminId`).val("");
            $(`#update_adminPassword`).val("");
            $(`#update_channelName`).val("");
            $(`#update_channelPassword`).val("");
            $(`#update_theme-category`).val("News");
            $("#update_file_thumnail").val("");
            $("#update_upload").val("");
            $(`#update_channel-description`).val("");

            callChannelList();
        } else if (res.data.includes("file")) {
            alert(`${res.data}`);
            return;
        } else {
            alert("The channel hasn't been modified");
            $("#channelUpdate").modal("hide");
            return;
        }
    });
}

$("#updateBtn").click((e) => {
    const korean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;

    const reqData = {
        channelName: $(`#update_channelName`).val(),
        channelType: $("input:radio[name=update_channelType]:checked").val(),
    };

    if (!korean.test($(`#update_adminId`).val())) {
        axios.post("/channel/info", reqData).then((res) => {
            if (res.data.success) {
                if (
                    res.data.channelInfo.adminId ===
                        $(`#update_adminId`).val() &&
                    res.data.channelInfo.adminPassword ===
                        $(`#update_adminPassword`).val()
                ) {
                    realUpdateChannel();
                } else {
                    alert("Admin Id or Admin Password is wrong");
                }
            } else {
                alert(res.data.error);
            }
        });
    } else {
        alert("You can only type in English.");
        $(`#update_adminId`).val("");
    }
});

$("input:radio[name=update_password]").change((e) => {
    if (e.currentTarget.value == "Y") {
        $("#update_channelPassword").attr("disabled", false);
    } else {
        $("#update_channelPassword").attr("disabled", true);
        $("#update_channelPassword").val("");
    }
});

$("#update_file_thumnail").change((e) => {
    $("#update_upload").val(e.currentTarget.files[0].name);
});
