const callChannelList = () => {
    axios.get("/room/list").then((res) => {
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
    });
};

callChannelList();
