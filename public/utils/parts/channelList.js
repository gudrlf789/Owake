function checkPassword(channelName, channelPassword) {
    if (channelPassword !== "") {
        $("#private-channelName").val(channelName);
        $("#private-passwordChecking").val(channelPassword);
        $("#channelPrivateJoin").modal();
    } else {
        $("#public-channelName").val(channelName);
        $("#channelPublicJoin").modal();
    }
}

$(document).on("click", ".hidden-data", (e) => {
    const channelType = e.currentTarget.children[2].value;
    const channelName = e.currentTarget.children[3].value;
    const channelPassword = e.currentTarget.children[4].value;

    switch (channelType) {
        case "Public":
            checkPassword(channelName, channelPassword);
            break;
        case "Private":
            checkPassword(channelName, channelPassword);
            break;
        default:
            break;
    }
});

$(document).on("click", "#channel_updateBtn", (e) => {
    const adminId = e.currentTarget.parentNode.parentNode.parentNode.childNodes[0].children[0].value;
    const adminPassword = e.currentTarget.parentNode.parentNode.parentNode.childNodes[0].children[1].value;
    const channelType = e.currentTarget.children[2].value;
    const channelName = e.currentTarget.parentNode.parentNode.parentNode.childNodes[0].children[3].value;

    $("#update_adminId").val(adminId);
    $("#update_adminPassword").val(adminPassword);
    $("#update_channelName").val(channelName);
    
    $("#channelUpdate").modal();
  });

const callChannelList = () => {
    axios.get("/channel/list").then((res) => {
        // 자식요소 모두 삭제 후 불러오기
        $(".channel-box-container").empty();

        for (data of res.data.channelList) {
            if (data.channelType === "Public") {
                $(".channel-box-container").append(
                    $(
                        "<div class='channel-box'>" +
                            "<div class='channel-box-wrapper'>" +
                            
                            "<div class='hidden-data'>" +
                            `<input type='hidden' value=${data.adminId} >` +
                            `<input type='hidden' value=${data.adminPassword} >` +
                            `<input type='hidden' value=${data.channelType} >` +
                            `<input type='hidden' value=${data.channelName} >` +
                            `<input type='hidden' value=${data.channelPassword} >` +
                            "</div>" +

                            "<div class='channel-menu'>" +
                            "<div class='dropdown-toggle dropdown-toggle-split'" +
                            "id='mainTopDropMenu' data-toggle='dropdown'" +
                            "></div>" +
                            "<span class='sr-only'>Toggle Dropdown</span>" +
                            "<div class='dropdown-menu' aria-labelledby='mainTopDropMenu'>" +
                            "<a class='dropdown-item' href='#' data-toggle='modal'" +
                            "data-target='#channelUpdate'>Update Channel</a>" +
                            "<a class='dropdown-item' href='#'>Remove Channel</a>" +
                            "</div>" +
                            "</div>" +
                            "<div class='channel-thumnail'>" +
                            `<img src='${data.imageName}' />` +
                            "</div>" +
                            "<div class='channel-box-title'>" +
                            data.channelName +
                            "</div>" +
                            "<div class='channel-box-description'>" +
                            data.channelDescription +
                            "</div>" +
                            "<div class='channel-box-footer'>" +
                            "<div class='channel-box-footer-icon'>" +
                            `${
                                data.channelPassword.length !== 0 ||
                                data.channelPassword !== ""
                                    ? "<img src='./img/lock.svg' alt='' class='lock-icon'></img>"
                                    : "<img src='./img/unlock.svg' alt='' class='unlock-icon'></img>"
                            }` +
                            "</div>" +

                            "<div>" + "<button id='channel_updateBtn'>업데이트</button>" + "<button>삭제</button>" +

                            "<div class='channel-box-footer-users'>" +
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

callChannelList();
