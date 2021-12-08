$("#update").click((e) => {
  const reqData = {
      roomName: $('#channelName').val(),
      roomType: $('input:radio[name=drone]:checked').val(),
      roomPassword: $('#channelPassword').val(),
      roomTheme: $('#theme-category').val(),
      roomDescription: $('#channel-description').val()
  };

  axios.patch("/room/update", reqData).then((res) => {
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