function realDeleteChannel(reqData) {
  axios.post("/channel/delete", reqData).then((res) => {
    if (res.data.success) {
      alert("The channel has been successfully deleted");
      $("#delete_adminId").val("");
      $("#delete_adminPassword").val("");
      $("#delete_channelType").val(),
      $("#delete_channelName").val("");
      $("#delete-channelPassword").val("");
      $("#channelDeleteModal").modal("hide");

      selectOptionsChannel();
    }else{
      if(res.data.failData){
        alert(`${res.data.failData} is wrong`);
      }
      alert("The channel hasn't been deleted");
      $("#channelCreate").modal("hide");
    }
  });
};

$("#channelDelete-btn").click((e) => {
  const korean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;

  const reqData = {
    channelType: $("#delete_channelType").val(),
    channelName: $("#delete_channelName").val(),
    imageName: $("#delete_imageName").val()
  };
  
  if(!korean.test(reqData.adminId) && !korean.test(reqData.channelName)){
    axios.post("/channel/info", reqData).then((res) => {
      if(res.data.success){
        if(res.data.channelInfo.adminId !== $("#delete_adminId").val()){
          alert("Governor Id is wrong");
          $("#delete_adminId").val("");
        }else if(res.data.channelInfo.adminPassword !== $("#delete_adminPassword").val()){
          alert("Governor Password is wrong");
          $("#delete_adminPassword").val("");
        }else if(res.data.channelInfo.channelPassword !== $("#delete-channelPassword").val()){
          alert("Channel Password is wrong");
          $("#delete-channelPassword").val("");
        }else{
          realDeleteChannel(reqData);
        }
      }
    });
  }else{
    alert("You can only type Governor Id and channelName in English.");
  }
});