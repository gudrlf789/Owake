function realUpdateChannel() {
    const imageType = /(.*?)\/(jpg|jpeg|png|gif|bmp)$/;
    const formData = new FormData();

    let fileType;
    let fileSelect;
    let fileName;
    let fileSize;
    let maxFileSize;

    fileSelect = $(`#update_file_thumnail`)[0].files[0];

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

    if (fileSelect) {
        fileName = $(`#update_file_thumnail`)[0].files[0].name;
        fileSize = $(`#update_file_thumnail`)[0].files[0].size;
        fileType = $(`#update_file_thumnail`)[0].files[0].type;
        maxFileSize = 2 * 1024 * 1024;
        const korean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
        if (korean.test(fileName)) {
            alert(
                "The file name contains Korean. Please change the file name to English."
            );
            return;
        }
        if (imageType.test(fileType)) {
            formData.append("image", fileSelect);
            formData.append("imageName", fileName);
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
        } else if (res.data.includes("file size")) {
            alert(`${res.data}`);
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
