function checkKronosaPassword(channelName, channelPassword) {
    if (channelPassword !== "") {
        $("#channelPrivateJoin #private-channelName").val(channelName);
        $("#channelPrivateJoin #private-passwordChecking").val(channelPassword);
        $("#channelPrivateJoin").modal();
    } else {
        $("#channelPublicJoin #public-channelName").val(channelName);
        $("#channelPublicJoin").modal();
    }
}

$(document).on("click", ".business-box-wrapper > .business-thumnail, .business-box-wrapper > .business-box-title, .business-box-wrapper > .business-box-description", (e) => {
    const channelType = e.currentTarget.parentNode.childNodes[0].childNodes[0].value;
    const channelName = e.currentTarget.parentNode.childNodes[0].childNodes[1].value;
    const channelPassword = e.currentTarget.parentNode.childNodes[0].childNodes[2].value;

    switch (channelType) {
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
                            "<div class='hidden-data'>" +
                            `<input type='hidden' value=${data.channelType} >` +
                            `<input type='hidden' value=${data.channelName} >` +
                            `<input type='hidden' value=${data.channelPassword} >` +
                            "</div>" +
                            "<div class='business-thumnail'>" +
                            `<img src='${data.imageName}' />` +
                            "</div>" +
                            "<div class='business-box-title'>" +
                            data.channelName +
                            "</div>" +
                            "<div class='business-box-description'>" +
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
