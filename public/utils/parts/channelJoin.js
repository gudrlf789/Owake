function checkKorean(userId, channelName) {
    const korean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;

    if(!korean.test(userId)){
        window.sessionStorage.setItem("channel", channelName);
        window.sessionStorage.setItem("uid", userId);
        window.location.href = "/join";
    }else{
        alert("You can only type User Name in English.");
    }
};

$("input:radio[name=join_userType]").change((e) => {
    if(e.currentTarget.value === "ADMIN"){
        $("#join-adminPassword").attr("disabled", false);
    }else{
        $("#join-adminPassword").attr("disabled", true);
        $("#join-adminPassword").val("");
    }
});

$("#channelJoin-btn").click((e) => {
    const reqData = {
        channelType : $("input:radio[name=join_channelType]:checked").val(),
        channelName : $("#join-channelName").val(),
        channelpassword : $("#join-channelPassword").val(),
        userId : $("#join-username").val(),
        adminPassword : $("#join-adminPassword").val()
    }

    axios.post("/channel/info", reqData).then((res) => {
        if(res.data.success){
            debugger;
            switch($("input:radio[name=join_userType]:checked").val()) {
                case "ADMIN" :
                    debugger;
                    if(res.data.channelInfo.adminId !== reqData.userId || res.data.channelInfo.adminPassword !== reqData.adminPassword){
                        alert("Check user name or admin password");
                    }else{
                        checkKorean(reqData.userId, reqData.channelName);
                    }
                    break;
                default :
                    if(res.data.channelInfo.channelPassword !== reqData.channelpassword){
                        alert("Check channel password");
                        $("#join-channelPassword").val("");
                    }else{
                        checkKorean(reqData.userId, reqData.channelName);
                    }
                    break;
            }
        }else{
            alert(res.data.error);
        }
    });
});

$("#private-channelJoin-btn").click((e) => {
    const channelName = $("#private-channelName").val();
    const checkingPassword = $("#private-passwordChecking").val();

    const userId = $("#private-nickName").val();
    const password = $("#private-roomPassword").val();

    if (checkingPassword !== password) {
        alert("Wrong Password");
        $("#private-roomPassword").val("");
    } else {
        checkKorean(userId, channelName);
    }
});

$("#public-channelJoin-btn").click((e) => {
    const channelName = $("#public-channelName").val();
    const userId = $("#public-nickName").val();

    checkKorean(userId, channelName);
});