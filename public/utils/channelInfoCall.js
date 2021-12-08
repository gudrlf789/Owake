$("#channel-create").click((e) => {
  const reqData = {
      adminId : "phg"
  }

  axios.post("/room/info", reqData).then((res) => {
      if (res.data.success) {
          if(res.data.adminRoomList.length > 0) {
              $("#adminId").attr("disabled", true);
              $("#adminPassword").attr("disabled", true);
              $("#channelName").attr("disabled", true);
              $("#channelPassword").attr("disabled", false);

              for( data of res.data.adminRoomList ){
                  $("#adminId").val(data.adminId);
                  $("#adminPassword").val(data.adminPassword);
                  $("#channelName").val(data.roomName);
                  $("#channelPassword").val(data.roomPassword);
                  $("#theme-category").val(data.roomTheme);
                  $("#channel-description").val(data.roomDescription);

                  if(data.roomType == "Private"){
                      $("#private_active").attr("checked", true);
                  }else{
                      $("#public_active").attr("checked", true);
                  }
              }

              $("#update").attr("disabled", false);
              $("#remove").attr("disabled", false);
          }else{
              $("#adminId").attr("disabled", false);
              $("#adminPassword").attr("disabled", false);
              $("#channelName").attr("disabled", false);
              $("#channelPassword").attr("disabled", true);
              $("#private_active").attr("checked", false);
              $("#public_active").attr("checked", true);

              $("#update").attr("disabled", true);
              $("#remove").attr("disabled", true);
          }
          
      }
  });
});