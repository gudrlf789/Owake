function createChannelData(typeFlag) {
    const korean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;

    const reqData = {
        adminId: $(`#${typeFlag}_adminId`).val(),
        adminPassword: $(`#${typeFlag}_adminPassword`).val(),
        channelType: typeFlag === "private" ? "Private" : "Public",
        channelName: $(`#${typeFlag}_channelName`).val(),
        channelPassword: typeFlag === "private" ? $(`#private_channelPassword`).val() : "",
        channelCategory: $(`#${typeFlag}_theme-category`).val(),
        channelDescription: $(`#${typeFlag}_channel-description`).val()
    };

    if(!korean.test(reqData.adminId)){
        axios.post("/channel/register", reqData).then((res) => {
            if (res.data.success) {
                alert("The channel has been successfully created");
                typeFlag === "private" ? $("#channelPrivateCreate").modal("hide") : $("#channelPublicCreate").modal("hide");
                $(`#${typeFlag}_adminId`).val("");
                $(`#${typeFlag}_adminPassword`).val("");
                $(`#${typeFlag}_channelName`).val("");
                $(`#${typeFlag}_channelPassword`).val("");
                $(`#${typeFlag}_theme-category`).val("outdoor");
                $(`#${typeFlag}_channel-description`).val("");
                
                callChannelList();
            } else {
                alert(
                    `ChannelName: ${$(`#${typeFlag}_channelName`).val()} is already existed. please choice another type or channelName`
                );
            }
        });
    }else{
        alert("You can only type in English.");
    }
    
}

$("#private_create").click((e) => {
    createChannelData("private");
});

$("#public_create").click((e) => {
    createChannelData("public");
});

$("input:radio[name=channelRadioBtn]").change((e) => {
    if(e.currentTarget.value == "Public"){
        $("#channelPassword").attr("disabled", true);
        $("#channelPassword").val("");
    }else{
        $("#channelPassword").attr("disabled", false);
    }
});
