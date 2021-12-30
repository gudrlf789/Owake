$("#channelDelete-btn").click((e) => {
  const korean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;

  const reqData = {
    adminId: $("#delete_adminId").val(),
    adminPassword: $("#delete_adminPassword").val(),
    channelType: $("#delete_channelType").val(),
    channelName: $("#delete_channelName").val(),
    channelPassword: $("#delete-channelPassword").val()
  };

  if(!korean.test(reqData.adminId) && !korean.test(reqData.channelName)){
    axios.post("/channel/delete", reqData).then((res) => {
      if (res.data.success) {
        alert("The channel has been successfully deleted");
        $("#channelDeleteModal").modal("hide");
        $("#delete_adminId").val("");
        $("#delete_adminPassword").val("");
        $("#delete_channelType").val(),
        $("#delete_channelName").val("");
        $("#delete_channelPassword").val("");
  
        callChannelList();
      }else{
        if(res.data.failData){
          alert(`${res.data.failData} is wrong`);
        }
        alert("The channel hasn't been deleted");
        $("#channelCreate").modal("hide");
      }
    });
  }else{
    alert("You can only type AdminId and channelName in English.");
  }
});