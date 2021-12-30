function searchKeyWord(searchTypeId) {
    const reqData = {
        channelName: searchTypeId === "searchWord" ? $("#searchWord").val() : $("#mobile_searchWord").val(),
        channelType: searchTypeId === "searchWord" ? $("#select_options_search").val() : $("#mobile_selectOptions").val()
    };

    if (reqData.channelType === "Private" && reqData.channelName === "") {
        alert("Please Enter Private ChannelName");
    } else {
        searchResult(reqData);
    }
}

$("#searchIcon, #mobile_searchIcon").click((e) => {
    searchKeyWord(e.currentTarget.id);
});

$("#searchWord, #mobile_searchWord").keydown((e) => {
    if (e.which === 13) {
        searchKeyWord(e.currentTarget.id);
    }
});

function searchResult(reqData) {
    axios.post("/channel/search", reqData).then((res) => {
        if (res.data.success) {
            // 자식요소 모두 삭제 후 불러오기
            $(".channel-box-container").empty();
            for (data of res.data.channelList) {
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
                            "<div class='channel-box-footer-btn'>" +
                            "<div class='channel-box-footer-btn-update' id='channelUpdateBtn' data-toggle='modal' data-target='#channelUpdateModal'>" +
                            "<span>Edit</span>" +
                            "</div>" +
                            "<div class='channel-box-footer-btn-remove' id='channelDeleteBtn' data-toggle='modal' data-target='#channelDeleteModal'>" +
                            "<span>Delete</span>" +
                            "</div>" +
                            "</div>" +
                            "</div>"
                    )
                );
            }
        } else {
            alert("There's no channel I searched for.");
        }
    });
}
