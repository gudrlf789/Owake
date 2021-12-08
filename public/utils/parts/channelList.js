const callChannelList = () => {
    axios.get("/channel/list").then((res) => {
        // 자식요소 모두 삭제 후 불러오기
        $(".box-conatiner").empty();

        console.log(res.data);

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
    });
};

callChannelList();
