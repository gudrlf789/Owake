function checkKronosaPassword(channelName, channelPassword, channelType) {
    if (channelPassword !== "") {
        $("#channelPrivateJoin #private-channelName").val(channelName);
        $("#channelPrivateJoin #private-passwordChecking").val(channelPassword);
        $("#channelPrivateJoin #private-channelType").val(channelType);
        $("#channelPrivateJoin").modal();
    } else {
        $("#channelPublicJoin #public-channelName").val(channelName);
        $("#channelPublicJoin #public-channelType").val(channelType);
        $("#channelPublicJoin").modal();
    }
}

$(document).on("click", ".channel-thumnail", (e) => {
    const channelType =
        e.currentTarget.parentNode.childNodes[0].childNodes[0].value;
    const channelName =
        e.currentTarget.parentNode.childNodes[0].childNodes[1].value;
    const channelPassword =
        e.currentTarget.parentNode.childNodes[0].childNodes[2].value;

    switch (channelType) {
        case "Public":
            checkKronosaPassword(channelName, channelPassword, channelType);
            break;
        case "Private":
            checkKronosaPassword(channelName, channelPassword, channelType);
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
                $(".channel-box-container").append(
                    $(
                        "<article class='channel-box content-container'>" +
                            "<div class='hidden-data'>" +
                            `<input type='hidden' value=${data.channelType} >` +
                            `<input type='hidden' value="${data.channelName}" >` +
                            `<input type='hidden' value=${data.channelPassword} >` +
                            `<input type='hidden' value="${data.imageName}" >` +
                            `<input type='hidden' value=${data.channelCategory} >` +
                            `<input type='hidden' value="${data.channelDescription}" >` +
                            "</div>" +
                            "<a href='#' class='thumbnail channel-thumnail'>" +
                            `<img src='${data.imageName}' alt='' class='thumbnail-image'>` +
                            "</a>" +
                            "<div class='content-bottom-section'>" +
                            "<div class='content-title-container'>" +
                            `<a href='#' class='content-title'>${data.channelName}</a>` +
                            "<div class='channel-box-footer-icon'>" +
                            `${
                                data.channelPassword.length !== 0 ||
                                data.channelPassword !== ""
                                    ? "<img src='./img/lock.svg' alt='' class='lock-icon'></img>"
                                    : "<img src='./img/unlock.svg' alt='' class='unlock-icon'></img>"
                            }` +
                            "</div>" +
                            "</div>" +
                            "</div>" +
                            "<div class='content-details'>" +
                            `<a href='#' class='content-channel-description'>${data.channelDescription}</a>` +
                            "<div class='content-metadata'>" +
                            "<div class='content-channel-options'>" +
                            "<div class='channel-box-footer-btn-update' id='channelUpdateBtn' data-toggle='modal'" +
                            "data-target='#channelUpdateModal'>" +
                            "<span>Edit</span>" +
                            "</div>" +
                            "<div class='channel-box-footer-btn-remove' id='channelDeleteBtn' data-toggle='modal'" +
                            "data-target='#channelDeleteModal'>" +
                            "<span>Delete</span>" +
                            "</div>" +
                            "</div>" +
                            "<div class='content-symbol-button'>" +
                            "<i class='symbol-icon'></i>" +
                            "<span>10 On_line</span>" +
                            "</div>" +
                            "</div>" +
                            "</div>" +
                            "</article>"
                    )
                );
            }
        }
    });
};

callChannelKronosaList();
