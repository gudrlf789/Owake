const callChannelList = () => {
  axios.get("/room/list").then((res) => {
    for( data of res.data.roomList ){
      $(".box-conatiner").append($(
        "<div class='channel-box'>"
          + "channelName : " + data.roomName + "<br/>" 
          + "channelType : " + data.roomType +
        "</div>" +
        "<span>" + data.roomDescription + "</span>" 
      ))
    }
  });
};

callChannelList();