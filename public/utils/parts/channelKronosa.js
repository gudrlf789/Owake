$(document).on("click", ".business-box-wrapper", (e) => {

  const channelName = e.currentTarget.children[0].value;
  const channelPassword = e.currentTarget.children[1].value;

  $("#channelPrivateJoin #private-channelName").val(channelName);
  $("#channelPrivateJoin #private-passwordChecking").val(channelPassword);
  $("#channelPrivateJoin").modal();

});

const callChannelKronosaList = () => {
  axios.get("/channel/kronosaChannelList").then((res) => {
      // 자식요소 모두 삭제 후 불러오기
      $(".business-box-container").empty();

      for (data of res.data.channelList) {
          $(".business-box-container").append(
              $(
                "<div class='business-box'>"+
                  "<div class='business-box-wrapper'>"+
                      `<input type='hidden' value=${data.channelName} />`+
                      `<input type='hidden' value=${data.channelPassword} />`+
                      `<img src='KronWorld.png' alt='Kronworld'>`+
                      "<div class='business-box-text'>"+
                          "<div class='business-box-title'>"+
                              "<p><span>"+
                                data.channelName +
                              "</span></p>"+
                          "</div>"+
                          "<div class='business-box-description'>"+
                              
                          "</div>"+
                          "<div class='business-box-footer'>"+
                              "<div class='business-name'>"+
                                  "<p><span></span></p>"+
                              "</div>"+
                              "<div class='business-users'>"+
                                  "<p><span>Users / 20</span></p>"+
                              "</div>"+
                          "</div>"+
                      "</div>"+
                  "</div>"+
               "</div>"
              )
          );
      }
  });
};

callChannelKronosaList();
