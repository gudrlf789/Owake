const callChannelList = () => {
  axios.get("/room/list").then((res) => {
    // 자식요소 모두 삭제 후 불러오기
    $(".box-conatiner").empty();

    for( data of res.data.roomList ){
      $(".box-conatiner").append($(
        "<div class='channel-box'>"
          + "channelName : " + data.roomName + "<br/>" 
          + "channelType : " + data.roomType +
        "</div>" +
        "<span>" + data.roomDescription + "</span>" 
      ));
    }
  });
};

callChannelList();