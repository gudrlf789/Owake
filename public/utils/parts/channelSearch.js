$("#searchIcon").click((e) => {
    const reqData = {
        channelName: $("#searchWord").val(),
    };

    axios.post("/channel/search", reqData).then((res) => {
        if (res.data.success) {
            // 자식요소 모두 삭제 후 불러오기
            $(".box-conatiner").empty();

            for (data of res.data.channelList) {
                $(".box-conatiner").append(
                    $(
                        "<div class='channel-box'>" +
                            "<div class='channel-box-inner-box'>" +
                            `channelName : ${data.channelName} ` +
                            "</div>" +
                            "<div class='channel-box-inner-box'>" +
                            `channelType : ${data.channelType}` +
                            "</div>" +
                            "<div class='channel-box-inner-box'>" +
                            "<span>" +
                            data.channelDescription +
                            "</span>" +
                            "</div>" +
                            "</div>"
                    )
                );
            }
        } else {
            alert("There's no channel I searched for.");
        }
    });
});
