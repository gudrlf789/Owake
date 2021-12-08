$("#searchIcon").click((e) => {
    const reqData = {
        channelName: $('#searchWord').val(),
    };
  
    axios.post("/channel/search", reqData).then((res) => {
      if (res.data.success) {
          // 자식요소 모두 삭제 후 불러오기
          $(".box-conatiner").empty();
          
          for( data of res.data.channelList ){
            $(".box-conatiner").append($(
              "<div class='channel-box'>"
                + "channelName : " + data.channelName + "<br/>" 
                + "channelType : " + data.channelType +
              "</div>" +
              "<span>" + data.channelDescription + "</span>" 
            ));
          }
      } else {
          alert(
              "There's no channel I searched for."
          );
      }
    });
  });