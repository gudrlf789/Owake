$("#updateBtn").click((e) => {
  const korean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
  const imageType = /(.*?)\/(jpg|jpeg|png|gif|bmp)$/;

  const formData = new FormData();

  formData.append("adminId", $(`#update_adminId`).val());
  formData.append("adminPassword", $(`#update_adminPassword`).val());
  formData.append("channelType", $("input:radio[name=update_channelType]:checked").val());
  formData.append("channelName", $(`#update_channelName`).val());
  formData.append("channelPassword",$(`#update_channelPassword`).val());
  formData.append("channelCategory", $(`#update_theme-category`).val());
  formData.append("channelDescription", $(`#update_channel-description`).val());

  if($(`#update_file_thumnail`)[0].files[0]){
    if(imageType.test($(`#update_file_thumnail`)[0].files[0].type)){
        formData.append("image", $(`#update_file_thumnail`)[0].files[0]);
        formData.append("imageName", $(`#update_file_thumnail`)[0].files[0].name);
    }else{
        alert("You can only select the image file");
        return;
    }
  }

  if (!korean.test(formData.get("adminId")) && !korean.test(formData.get("channelName"))) {
    axios.post("/channel/update", formData).then((res) => {
      if (res.data.success) {
        alert("The channel has been successfully modified");
        $("#channelUpdateModal").modal("hide");
        $(`#update_adminId`).val("");
        $(`#update_adminPassword`).val("");
        $(`#update_channelName`).val("");
        $(`#update_channelPassword`).val("");
        $(`#update_theme-category`).val("News");
        $(`#update_channel-description`).val("");

        callChannelList();
      }else{
        alert("The channel hasn't been modified");
        $("#channelUpdate").modal("hide");
      }
    });
  }else{
    alert("You can only type in English.");
  }
});

$("input:radio[name=update_password]").change((e) => {
  if (e.currentTarget.value == "Y") {
      $("#update_channelPassword").attr("disabled", false);
  } else {
      $("#update_channelPassword").attr("disabled", true);
      $("#update_channelPassword").val("");
  }
});

$("#update_file_thumnail").change((e) => {
  $("#update_upload").val(e.currentTarget.files[0].name);
});