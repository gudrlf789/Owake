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
                        "<div class='business-box'>" +
                            "<div class='business-box-wrapper'>" +
                            `<input type='hidden' value=${data.channelType} >` +
                            `<input type='hidden' value=${data.channelName} >` +
                            `<input type='hidden' value=${data.channelPassword} >` +
                            `<img src=${data.imageName} >` +
                            "<div class='business-box-text'>" +
                            "<div class='business-box-title'>" +
                            "<p><span>" +
                            data.channelName +
                            "</span></p>" +
                            "</div>" +
                            "<div class='business-box-description'>" +
                            "</div>" +
                            "<div class='business-box-footer'>" +
                            "<div class='business-name'>" +
                            "<p><span></span></p>" +
                            "</div>" +
                            "<div class='business-users'>" +
                            "<p><span>Users / 20</span></p>" +
                            "</div>" +
                            "</div>" +
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
