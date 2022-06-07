function checkPassword(channelName, channelPassword, channelType) {
    if (channelPassword !== "") {
        $("#private-channelName").val(channelName);
        $("#private-passwordChecking").val(channelPassword);
        $("#private-channelType").val(channelType);
        $("#channelPrivateJoin").modal();
    } else {
        $("#public-channelName").val(channelName);
        $("#public-channelType").val(channelType);
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
            checkPassword(channelName, channelPassword, channelType);
            break;
        case "Private":
            checkPassword(channelName, channelPassword, channelType);
            break;
        default:
            break;
    }
});

$(document).on("click", "#channelUpdateBtn", (e) => {
    const channelType =
        e.currentTarget.parentNode.parentNode.parentNode.parentNode
            .childNodes[0].children[0].value;
    const channelName =
        e.currentTarget.parentNode.parentNode.parentNode.parentNode
            .childNodes[0].children[1].value;
    const imageName =
        e.currentTarget.parentNode.parentNode.parentNode.parentNode
            .childNodes[0].children[3].value;
    const channelCategory =
        e.currentTarget.parentNode.parentNode.parentNode.parentNode
            .childNodes[0].children[4].value;
    const channelDescription =
        e.currentTarget.parentNode.parentNode.parentNode.parentNode
            .childNodes[0].children[5].value;

    $("#update_channelName").val(channelName);
    $("#update_upload").val(imageName);
    $("#update_theme-category").val(channelCategory);
    $("#update_channel-description").val(channelDescription);

    if (channelType === "Private") {
        $("#update_private").attr("checked", true);
        $("#update_public").attr("checked", false);
    } else {
        $("#update_private").attr("checked", false);
        $("#update_public").attr("checked", true);
    }

    $("#channelUpdateModal").modal();
});

$(document).on("click", "#channelDeleteBtn", (e) => {
    const channelType =
        e.currentTarget.parentNode.parentNode.parentNode.parentNode
            .childNodes[0].children[0].value;
    const channelName =
        e.currentTarget.parentNode.parentNode.parentNode.parentNode
            .childNodes[0].children[1].value;
    const imageName =
        e.currentTarget.parentNode.parentNode.parentNode.parentNode
            .childNodes[0].children[3].value;

    $("#delete_channelType").val(channelType);
    $("#delete_channelName").val(channelName);
    $("#delete_imageName").val(imageName);
});

const callChannelList = () => {
    axios.get("/channel/list").then((res) => {
        // 자식요소 모두 삭제 후 불러오기
        $(".channel-box-container").empty();
        if (res.data.success) {
            for (data of res.data.channelList) {
                if (data.channelType === "Public" && data.Kronosa === "N") {
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
        }
    });
};

callChannelList();