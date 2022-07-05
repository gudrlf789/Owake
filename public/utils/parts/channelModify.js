function realUpdateChannel() {
    const imageType = /(.*?)\/(jpg|jpeg|png|gif|bmp)$/;

    let fileType;
    let fileSelect;
    let fileName;
    let fileNameSave;

    fileSelect = $(`#update_file_thumnail`)[0].files[0];

    let formData = new FormData();

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

function channelPasswordSame() {
    const updatePassword = $("#update_channelPassword").val();
    const updatePasswordConfirm = $("#update_channelPassword_confirm").val();

    if(updatePassword !== updatePasswordConfirm){
        alert("Check your password again");
        $("#update_channelPassword_confirm").val("");
        return;
    }
    updateChannelAction();
};

function channelAdminPasswordSame() {
    const adminPassword = $("#update_adminPassword").val();
    const adminPasswordConfirm = $("#update_adminPassword_confirm").val();

    if(adminPassword !== adminPasswordConfirm) {
        alert("Check your admin password again");
        $("#update_adminPassword_confirm").val("");
        return;
    }
    updateChannelAction();
};

$("#updateBtn").click((e) => {
    // From channelCreate
    if (fileSizeCheck("update") === false) {
        return alert("Please check the file size (2MB or less)");
    } else {
        if($("input:radio[name=update_password]:checked").val() === "Y"){
            channelPasswordSame();
        }else{
            channelAdminPasswordSame();
        }
    }
});

$("input:checkbox[name=channelUpdateGovernType]").change((e) => {
    if (e.target.id === "check-update-igovern") {
        $("#check-update-wegovern").prop("checked", false);
    } else {
        $("#check-update-igovern").prop("checked", false);
    }
});

$("input:radio[name=update_password]").change((e) => {
    if (e.currentTarget.value == "Y") {
        $("#update_channelPassword").attr("disabled", false);
        $("#update_channelPassword_confirm").attr("disabled", false);
    } else {
        $("#update_channelPassword").attr("disabled", true);
        $("#update_channelPassword_confirm").attr("disabled", true);
        $("#update_channelPassword").val("");
        $("#update_channelPassword_confirm").val("");
    }
});

$("#update_file_thumnail").change((e) => {
    $("#update_upload").text(e.currentTarget.files[0].name);
});

$("#update_file_thumnail").focus((e) => {
    e.currentTarget.classList.add("has-focus");
});

$("#update_file_thumnail").blur((e) => {
    e.currentTarget.classList.remove("has-focus");
});

function updateChannelAction() {
    const korean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
    const reqData = {
        channelName: $(`#update_channelName`).val(),
        //channelType: $("input:radio[name=update_channelType]:checked").val(),
        channelType: "Public",
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
        //$("input:radio[name=update_channelType]:checked").val()
        "Public"
    );
    data.append("governType", $("input:checkbox[name=channelUpdateGovernType]:checked").val());
    data.append("channelName", $(`#update_channelName`).val());
    data.append("channelPassword", $(`#update_channelPassword`).val());
    data.append("channelCategory", "");
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
            $(`#update_channelPassword_confirm`).val("");
            //$(`#update_theme-category`).val("News");
            $("#update_file_thumnail").val("");
            $("#update_upload").val("Attach a channel image");
            $(`#update_channel-description`).val("");

            selectOptionsChannel();
        } else {
            alert("The channel hasn't been modified");
            $("#channelUpdate").modal("hide");
            return;
        }
    });
}

$("#channelUpdateModal").on("shown.bs.modal", (e) => {
    const checkChannlePassword = $("input:radio[name=update_password]:checked").val();

    if(checkChannlePassword === "N"){
        $("#update_channelPassword").attr("disabled", true);
        $("#update_channelPassword_confirm").attr("disabled", true);
    }else {
        $("#update_channelPassword").attr("disabled", false);
        $("#update_channelPassword_confirm").attr("disabled", false);
    }
});

$("#channelUpdateModal").on("hidden.bs.modal", (e) => {
    let channelInput = document
        .querySelector("#channelUpdateModal")
        .querySelector(".channel-info-container")
        .querySelectorAll("input");
    let channelTextArea = document
        .querySelector("#channelUpdateModal")
        .querySelector(".channel-info-container")
        .querySelector("textarea");
    for (let i = 0; i < channelInput.length; i++) {
        channelInput[i].value = "";
        channelTextArea.value = "";
    }
});
