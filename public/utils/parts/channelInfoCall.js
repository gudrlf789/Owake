/*$("#channel-create").click((e) => {
  const reqData = {
      //adminId : "phg"
      adminId : $('#adminId').val(),
      channelType: $('input:radio[name=channelRadioBtn]:checked').val(),
      channelName: $('#channelName').val()
  }

  axios.post("/channel/info", reqData).then((res) => {
      if (res.data.success) {
          if(res.data.adminChannelList.length > 0) {
              $("#adminId").attr("disabled", true);
              $("#adminPassword").attr("disabled", true);
              $("#channelName").attr("disabled", true);
              $("#channelPassword").attr("disabled", false);

              for( data of res.data.adminChannelList ){
                  $("#adminId").val(data.adminId);
                  $("#adminPassword").val(data.adminPassword);
                  $("#channelName").val(data.channelName);
                  $("#channelPassword").val(data.channelPassword);
                  $("#theme-category").val(data.channelCategory);
                  $("#channel-description").val(data.channelDescription);

                  if(data.channelType == "Private"){
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

});*/