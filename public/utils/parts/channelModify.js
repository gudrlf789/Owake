function realUpdateChannel() {
    const imageType = /(.*?)\/(jpg|jpeg|png|gif|bmp)$/;

    let fileType;
    let fileSelect;
    let fileName;
    let fileNameSave;

    fileSelect = $(`#update_file_thumnail`)[0].files[0];

    const formData = new FormData();

    if (fileSelect) {
        fileName = fileSelect.name;
        fileType = fileSelect.type;
        fileNameSave = fileName;
        new Compressor(fileSelect, {
            quality: 0.2,

            success(result) {
                formDataFunc(formData);

                const korean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
                if (korean.test(fileName)) {
                    alert(
                        "The file name contains Korean. Please change the file name to English."
                    );
                    return;
                }
                if (imageType.test(fileType)) {
                    formData.append("image", result, fileName);
                    formData.append("imageName", result.name);
                } else {
                    alert("You can only select the image file");
                    return;
                }
                channelUpdateFunc(formData);
            },
            error(err) {
                console.log(err.message);
            },
        });
    } else {
        formDataFunc(formData);
        formData.append("imageName", $("#update_upload").val());
        channelUpdateFunc(formData);
    }
}

$("#updateBtn").click((e) => {
    // From channelCreate
    if (fileSizeCheck("update") === false) {
        return alert("Please check the file size (2MB or less)");
    } else {
        updateChannelAction();
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

function updateChannelAction() {
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
}

function formDataFunc(data) {
    data.append("adminId", $(`#update_adminId`).val());
    data.append("adminPassword", $(`#update_adminPassword`).val());
    data.append(
        "channelType",
        $("input:radio[name=update_channelType]:checked").val()
    );
    data.append("channelName", $(`#update_channelName`).val());
    data.append("channelPassword", $(`#update_channelPassword`).val());
    data.append("channelCategory", $(`#update_theme-category`).val());
    data.append("channelDescription", $(`#update_channel-description`).val());

    return data;
}

function channelUpdateFunc(data) {
    axios.post("/channel/update", data).then((res) => {
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
        } else {
            alert("The channel hasn't been modified");
            $("#channelUpdate").modal("hide");
            return;
        }
    });
}
