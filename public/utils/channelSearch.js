$("#searchIcon").click((e) => {
  const reqData = {
      roomName: $('#searchWord').val(),
  };
  
  axios.post("/room/search", reqData).then((res) => {
    if (res.data.success) {
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
    } else {
        alert(
            "There's no channel I searched for."
        );
    }
  });
});