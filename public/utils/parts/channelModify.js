$("#update").click((e) => {
    const reqData = {
        channelName: $('#channelName').val(),
        channelType: $('input:radio[name=channelRadioBtn]:checked').val(),
        channelPassword: $('#channelPassword').val(),
        channelCategory: $('#theme-category').val(),
        channelDescription: $('#channel-description').val()
    };
  
    axios.patch("/channel/update", reqData).then((res) => {
      if (res.data.success) {
        alert("The channel has been successfully modified");
        $("#channelCreate").modal("hide");
  
        callChannelList();
      }else{
        alert("The channel hasn't been successfully modified");
        $("#channelCreate").modal("hide");
      }
    });
  });