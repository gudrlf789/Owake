function checkKronosaPassword(channelName, channelPassword) {
    if(channelPassword !== ""){
        $("#channelPrivateJoin #private-channelName").val(channelName);
        $("#channelPrivateJoin #private-passwordChecking").val(channelPassword);
        $("#channelPrivateJoin").modal();
    }else{
        $("#channelPublicJoin #public-channelName").val(channelName);
        $("#channelPublicJoin").modal();
    }
}

$(document).on("click", ".business-box-wrapper", (e) => {
    const channelType = e.currentTarget.children[0].value;
    const channelName = e.currentTarget.children[1].value;
    const channelPassword = e.currentTarget.children[2].value;

    switch(channelType) {
        case "Public":
            checkKronosaPassword(channelName, channelPassword);
            break;
        case "Private":
            checkKronosaPassword(channelName, channelPassword);
            break;
        default:
            break; 
    }
});

const callChannelKronosaList = () => {
    axios.get("/channel/kronosaChannelList").then((res) => {
        // 자식요소 모두 삭제 후 불러오기
        $(".business-box-container").empty();

        for (data of res.data.channelList) {
            if (data.channelType === "Public") {
                $(".business-box-container").append(
                    $(
                        "<div class='channel-box'>" +
                            "<div class='channel-box-wrapper'>" +
                            "<div class='hidden-data'>" +
                            `<input type='hidden' value=${data.adminId} >` +
                            `<input type='hidden' value=${data.adminPassword} >` +
                            `<input type='hidden' value=${data.channelType} >` +
                            `<input type='hidden' value=${data.channelName} >` +
                            `<input type='hidden' value=${data.channelPassword} >` +
                            `<input type='hidden' value=${data.imageName} >` +
                            "</div>" +
                            "<div class='channel-thumnail'>" +
                            `<img src='${data.imageName}' />` +
                            "</div>" +
                            "<div class='channel-box-title'>" +
                            data.channelName +
                            "</div>" +
                            "<div class='channel-box-description'>" +
                            `<p>${data.channelDescription}</p>` +
                            "</div>" +
                            "</div>" +
                            "</div>"
                    )
                );
            }
        }
    });
};

callChannelKronosaList();
