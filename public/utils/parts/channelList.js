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

$(document).on("click", ".channel-box-wrapper", (e) => {
    const channelType = e.currentTarget.children[0].value;
    const channelName = e.currentTarget.children[1].value;
    const channelPassword = e.currentTarget.children[2].value;

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
                            `<input type='hidden' value=${data.channelType} >` +
                            `<input type='hidden' value=${data.channelName} >` +
                            `<input type='hidden' value=${data.channelPassword} >` +
                            "<div class='channel-menu'>" +
                            "<div class='btn-group'>" +
                            "<button type='button'" +
                            "class='btn btn-secondary dropdown-toggle dropdown-toggle-split'" +
                            "id='channelDropDownMenu' data-toggle='dropdown' aria-haspopup='true'" +
                            "aria-expanded='false' data-reference='parent'>" +
                            "<span class='sr-only'>Toggle Dropdown</span>" +
                            "</button>" +
                            "<div class='dropdown-menu' aria-labelledby='channelDropDownMenu'>" +
                            "<a class='dropdown-item' href='#'>Channel Update</a>" +
                            "<a class='dropdown-item' href='#'>Channel Remove</a>" +
                            "</div>" +
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
                            "<div class='channel-box-footer-users'>" +
                            "<p><span>20 / Users</span></p>" +
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
