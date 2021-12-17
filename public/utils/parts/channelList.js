const callChannelList = () => {
    axios.get("/channel/list").then((res) => {
        // 자식요소 모두 삭제 후 불러오기
        $(".box-conatiner").empty();

        for (data of res.data.channelList) {
            $(".box-conatiner").append(
                $(
                    "<div class='channel-box'>" +
                        "<div class='channel-inner-text-box'>" +
                        "channelName : " +
                        data.channelName +
                        "<br/>" +
                        "channelType : " +
                        data.channelType +
                        "</div>" +
                        "<span>" +
                        data.channelDescription +
                        "</span>" +
                        "</div>"
                )
            );
        }

        $(".feed-container").append(
            $(
                "<div class='feed-category'>" +
                    "<div class='feed-category-box'>" +
                    "</div>" +
                    "<div class='feed-category-box'>" +
                    "</div>" +
                    "<div class='feed-category-box'>" +
                    "</div>" +
                    "<div class='feed-category-box'>" +
                    "</div>" +
                    "</div>" +
                    "<div class='feed-description'>" +
                    "<div class='feed-box'>" +
                    "<p>" +
                    "<span>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</span>" +
                    "</p>" +
                    "</div>" +
                    "</div>"
            )
        );
    });
};

callChannelList();
