$("#channelJoin-btn").click((e) => {

    const reqData = {
        userId: $("#channelJoin-username").val(),
        adminPassword: $("#channelJoin-adminPassword").val(),
        channelType: $("input:radio[name=join_userType]:checked").val(),
        channelName: $("#channelJoin-channelName").val(),
        channelPassword: $("#channelJoin-channelPassword").val()
    };

    axios.post("/channel/info",reqData).then((res) => {
        if(res.data.success){
            switch($("input:radio[name=join_userType]:checked").val()) {
                case "ADMIN" :
                    if(res.data.channelInfo.adminPassword !== reqData.adminPassword){
                        alert("Wrong Admin Password");
                    }else if(res.data.channelInfo.channelPassword !== reqData.channelPassword){
                        alert("Wrong Channel Password");
                    }else{
                        checkKorean(reqData.userId, reqData.channelName);
                    }
                    break;
                default :
                    if(res.data.channelInfo.channelPassword !== reqData.channelPassword){
                        alert("Wrong Channel Password");
                    }else{
                        checkKorean(reqData.userId, reqData.channelName);
                    }
                    break;
            }
        }
    });

    if($("input:radio[name=join_userType]:checked").val() === "ADMIN"){
        axios.post("/channel/callChannelData").then((res) => {
            if(res.data.success){
                if(res.data.channelInfo.adminPassword !== reqData.adminPassword){
                    alert("Wrong Admin Password");
                }else if(res.data.channelInfo.channelPassword !== reqData.channelPassword){
                    alert("Wrong Channel Password");
                }else{
                    checkKorean(reqData.userId, reqData.channelName);
                }
            }
        });
    }else{

    }
});

$("input:radio[name=join_userType]").change((e) => {
    if (e.currentTarget.value == "ADMIN") {
        $("#channelJoin-adminPassword").attr("disabled", false);
    } else {
        $("#channelJoin-adminPassword").attr("disabled", true);
        $("#channelJoin-adminPassword").val("");
    }
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