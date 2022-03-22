function checkUserId(userId) {
    if (userId === "") {
        return false;
    } else {
        return true;
    }
}

/**
 * @anthor 박형길
 * @date 2022.03.22
 * @version 1.0
 * @descrption
 * 유저 이름 등록
 */
function enrollUserNameOnChannel(userId, channelName, channelType) {
    const reqData = {
        channelType: channelType,
        channelName: channelName,
        userId: userId
    };

    axios.post("/channel/enrollUserNameOnChannel", reqData).then((res) => {
        if(res.data.success){
            window.sessionStorage.setItem("channel", channelName);
            window.sessionStorage.setItem("channelType", channelType);
            window.sessionStorage.setItem("uid", userId);
            window.location.href = `/${channelName}/${channelType}`;
        }else {
            alert(res.data.error);
        }
    });
}

/**
 * @anthor 박형길
 * @date 2022.03.22
 * @version 1.0
 * @descrption
 * 유저 이름 중복 체크
 */
function checkDuplicateUserNameOnChannel(userId, channelName, channelType) {
    const reqData = {
        channelType: channelType,
        channelName: channelName,
        userId: userId
    };

    axios.post("/channel/info", reqData).then((res) => {
        if(res.data.success){
            const result = res.data.channelInfo.userNames.filter(userName => userName === userId);

            if(result.length > 0) {
                alert("Duplicate username exists");
            }else {
                enrollUserNameOnChannel(userId, channelName, channelType);
            }
        }else {
            alert(res.data.error);
        }
    });
}

function checkKorean(userId, channelName, channelType) {
    const korean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;

    if (!korean.test(userId)) {
        checkDuplicateUserNameOnChannel(userId, channelName, channelType);
    } else {
        alert("You can only type User Name in English.");
        return;
    }
}

$("input:radio[name=join_userType]").change((e) => {
    if (e.currentTarget.value === "ADMIN") {
        $("#join-adminPassword").attr("disabled", false);
    } else {
        $("#join-adminPassword").attr("disabled", true);
        $("#join-adminPassword").val("");
    }
});

$("#channelJoin-btn").click((e) => {
    const reqData = {
        channelType: $("input:radio[name=join_channelType]:checked").val(),
        channelName: $("#join-channelName").val(),
        channelpassword: $("#join-channelPassword").val(),
        userId: $("#join-username").val(),
        adminPassword: $("#join-adminPassword").val(),
    };

    axios.post("/channel/info", reqData).then((res) => {
        if (res.data.success) {
            switch ($("input:radio[name=join_userType]:checked").val()) {
                case "ADMIN":
                    if (
                        res.data.channelInfo.adminId !== reqData.userId ||
                        res.data.channelInfo.adminPassword !==
                            reqData.adminPassword
                    ) {
                        alert("Check user name or admin password");
                    } else {
                        checkKorean(
                            reqData.userId,
                            reqData.channelName,
                            res.data.channelInfo.channelType
                        );
                    }
                    break;
                default:
                    if (
                        res.data.channelInfo.channelPassword !==
                        reqData.channelpassword
                    ) {
                        alert("Check channel password");
                        $("#join-channelPassword").val("");
                    } else {
                        checkKorean(
                            reqData.userId,
                            reqData.channelName,
                            res.data.channelInfo.channelType
                        );
                    }
                    break;
            }
        } else {
            alert(res.data.error);
        }
    });
});

$("#private-channelJoin-btn").click((e) => {
    const channelName = $("#private-channelName").val();
    const checkingPassword = $("#private-passwordChecking").val();
    const channelType = $("#private-channelType").val();

    const userId = $("#private-nickName").val();
    const password = $("#private-roomPassword").val();

    if (checkingPassword !== password) {
        alert("Wrong Password");
        $("#private-roomPassword").val("");
    } else {
        if (!checkUserId(userId)) {
            alert("Enter your User Name");
        } else {
            checkKorean(userId, channelName, channelType);
        }
    }
});

$("#public-channelJoin-btn").click((e) => {
    const channelName = $("#public-channelName").val();
    const channelType = $("#public-channelType").val();
    const userId = $("#public-nickName").val();

    if (!checkUserId(userId)) {
        alert("Enter your User Name");
    } else {
        checkKorean(userId, channelName, channelType);
    }
});
