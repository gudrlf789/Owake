$("#searchIcon").click((e) => {
    const reqData = {
        roomName: $("#searchWord").val(),
    };

    axios.post("/room/search", reqData).then((res) => {
        if (res.data.success) {
            // 자식요소 모두 삭제 후 불러오기
            $(".box-conatiner").empty();

            for (data of res.data.roomList) {
                $(".box-conatiner").append(
                    $(
                        "<div class='channel-box'>" +
                            "<div class='channel-box-inner-box'>" +
                            `channelName : ${data.roomName} ` +
                            "</div>" +
                            "<div class='channel-box-inner-box'>" +
                            `channelType : ${data.roomType}` +
                            "</div>" +
                            "<div class='channel-box-inner-box'>" +
                            "<span>" +
                            data.roomDescription +
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
