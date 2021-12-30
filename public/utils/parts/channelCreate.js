function afterAction(typeFlag) {
    typeFlag === "private"
        ? $("#channelPrivateCreate").modal("hide")
        : $("#channelPublicCreate").modal("hide");
    $(`#${typeFlag}_adminId`).val("");
    $(`#${typeFlag}_adminPassword`).val("");
    $(`#${typeFlag}_channelName`).val("");
    $(`#${typeFlag}_channelPassword`).val("");
    $(`#${typeFlag}_theme-category`).val("outdoor");
    $(`#${typeFlag}_file_thumnail`).val("");
    $(`#${typeFlag}_channel-description`).val("");
}

function createChannelData(typeFlag) {
    const korean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
    const imageType = /(.*?)\/(jpg|jpeg|png|gif|bmp)$/;

    const formData = new FormData();

    formData.append("adminId", $(`#${typeFlag}_adminId`).val());
    formData.append("adminPassword", $(`#${typeFlag}_adminPassword`).val());
    formData.append(
        "channelType",
        typeFlag === "private" ? "Private" : "Public"
    );
    formData.append("channelName", $(`#${typeFlag}_channelName`).val());
    formData.append("channelPassword", $(`#${typeFlag}_channelPassword`).val());
    formData.append("channelCategory", $(`#${typeFlag}_theme-category`).val());
    formData.append(
        "channelDescription",
        $(`#${typeFlag}_channel-description`).val()
    );

    if ($(`#${typeFlag}_file_thumnail`)[0].files[0]) {
        if (imageType.test($(`#${typeFlag}_file_thumnail`)[0].files[0].type)) {
            formData.append(
                "image",
                $(`#${typeFlag}_file_thumnail`)[0].files[0]
            );
            formData.append(
                "imageName",
                $(`#${typeFlag}_file_thumnail`)[0].files[0].name
            );
        } else {
            alert("You can only select the image file");
            return;
        }
    }

    if (
        !korean.test(formData.get("adminId")) &&
        !korean.test(formData.get("channelName"))
    ) {
        axios.post("/channel/register", formData).then((res) => {
            if (res.data.success) {
                alert("The channel has been successfully created");
                afterAction(typeFlag);
                callChannelList();
            } else {
                alert(
                    `ChannelName: ${$(
                        `#${typeFlag}_channelName`
                    ).val()} is already existed. please choice another type or channelName`
                );
                $(`#${typeFlag}_channelName`).val("");
            }
        });
    } else {
        alert("You can only type AdminId and channelName in English.");
        afterAction(typeFlag);
    }
}

$("#private_create").click((e) => {
    createChannelData("private");
});

$("#public_create").click((e) => {
    createChannelData("public");
});

$("input:radio[name=channelRadioBtn]").change((e) => {
    if (e.currentTarget.value == "Public") {
        $("#channelPassword").attr("disabled", true);
        $("#channelPassword").val("");
    } else {
        $("#channelPassword").attr("disabled", false);
    }
});

$("#public_file_thumnail").change((e) => {
    $("#public_upload").val(e.currentTarget.files[0].name);
});

$("#private_file_thumnail").change((e) => {
    $("#private_upload").val(e.currentTarget.files[0].name);
});
