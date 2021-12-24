$("#searchIcon").click((e) => {
    const reqData = {
        channelName: $('#searchWord').val(),
    };
    
    axios.post("/channel/search", reqData).then((res) => {
      if (res.data.success) {
          // 자식요소 모두 삭제 후 불러오기
          $(".channel-box-container").empty();
          
          for( data of res.data.channelList ){
            $(".channel-box-container").append(
              $(
                  "<div class='channel-box'>"+
                      "<div class='channel-box-wrapper'>"+
                          "<div class='channel-menu'>"+
                              "<div class='btn-group'>"+
                                  "<button type='button'"+
                                      "class='btn btn-secondary dropdown-toggle dropdown-toggle-split'"+
                                      "id='channelDropDownMenu' data-toggle='dropdown' aria-haspopup='true'"+
                                      "aria-expanded='false' data-reference='parent'>"+
                                      "<span class='sr-only'>Toggle Dropdown</span>"+
                                  "</button>"+
                                  "<div class='dropdown-menu' aria-labelledby='channelDropDownMenu'>"+
                                      "<a class='dropdown-item' href='#'>Channel Update</a>"+
                                      "<a class='dropdown-item' href='#'>Channel Remove</a>"+
                                  "</div>"+
                              "</div>"+
                          "</div>"+
                          "<div class='channel-box-title'>"+
                              data.channelName +
                          "</div>"+
                          "<div class='channel-box-description'>"+
                              data.channelDescription +
                          "</div>"+
                          "<div class='channel-box-footer'>"+
                              "<div class='channel-box-footer-icon'>"+
                                  "<img src='./img/lock.svg' alt='' class='lock-icon'>"+
                                  "</img>"+
                              "</div>"+
                              "<div class='channel-box-footer-users'>"+
                                  "<p><span>Users/20</span></p>"+
                              "</div>"+
                          "</div>"+
                      "</div>"+
                  "</div>"
              )
            );
          }
      } else {
          alert(
              "There's no channel I searched for."
          );
      }
    });
  });