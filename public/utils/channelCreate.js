$("#create").click((e) => {
  //location.href = "/test";
  const reqData = {
       adminId: $('#adminId').val(),
       adminPassword: $('#adminPassword').val(),
       roomName: "비비빅",
       roomType: "private",
       roomPassword: "123456",
       roomTheme: $('#theme-category').val(),
       roomIntroduce: $('#channel-description').val()
   }
   
   axios.post('/room/register', reqData)
   .then(res => {
       if (res.data.success) {
           alert("To room setting is success")
       }else{
           alert(`RoomNumber is already existed. please choice another number`)
       }
   });

 });