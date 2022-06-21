const publicParticipant = document.querySelector(".public-participant-toggle");
const privateParticipant = document.querySelector(
    ".private-participant-toggle"
);

const publicGovernorChecked = document.querySelector(".public-governor-toggle");
const privateGovernorChecked = document.querySelector(
    ".private-governor-toggle"
);
const publicJoinPasswordContainer = document.querySelector(
    "#publicJoin-password-container"
);
const privateJoinPasswordContainer = document.querySelector(
    "#privateJoin-password-container"
);

$("#channelPrivateJoin").on("shown.bs.modal", (e) => {
    if ($("#private-governType").val() === "WE") {
        privateGovernorChecked.setAttribute("disabled", true);
    } else {
        privateGovernorChecked.removeAttribute("disabled");
    }
});

$("#channelPrivateJoin").on("hidden.bs.modal", (e) => {
    $("#private-nickName").val("");
    $("#private-password").val("");
    privateGovernorChecked.value = "off";
    privateJoinPasswordContainer.hidden = true;
});

$("#channelPublicJoin").on("shown.bs.modal", (e) => {
    if ($("#public-governType").val() === "WE") {
        publicGovernorChecked.setAttribute("disabled", true);
    } else {
        publicGovernorChecked.removeAttribute("disabled");
    }
});

$("#channelPublicJoin").on("hidden.bs.modal", (e) => {
    $("#public-nickName").val("");
    $("#public-password").val("");
    publicGovernorChecked.value = "off";
    publicJoinPasswordContainer.hidden = true;
});

publicGovernorChecked.addEventListener("input", (e) => {
    if (publicGovernorChecked.checked) {
        publicJoinPasswordContainer.hidden = false;
        e.currentTarget.value = "on";
        publicParticipant.checked = false;
    } else {
        publicJoinPasswordContainer.hidden = true;
        e.currentTarget.value = "off";
        publicParticipant.checked = true;
    }
});

privateGovernorChecked.addEventListener("input", (e) => {
    if (privateGovernorChecked.checked) {
        privateJoinPasswordContainer.hidden = false;
        e.currentTarget.value = "on";
        privateParticipant.checked = false;
    } else {
        privateJoinPasswordContainer.hidden = true;
        e.currentTarget.value = "off";
        privateParticipant.checked = true;
    }
});

function checkUserId(userId) {
    // 공백체크
    let pattern_empty = /\s/g;
    // 영문체크
    let check_eng = /[a-zA-Z]/;
    /// 숫자체크
    let check_number = /\d/;
    // 특수문자 체크
    let pattern_spc = /[~!@#$%^&*()_+|<>?:{}]/;

    if (
        userId === "" ||
        userId === undefined ||
        userId === null ||
        userId.match(pattern_empty) ||
        pattern_spc.test(userId) ||
        !(check_eng.test(userId) || check_number.test(userId))
    ) {
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
function enrollUserNameOnChannel(userId, channelName, channelType, governType) {
    //문자 공백 제거
    userId = userId.replace(/\s/gi, "");

    if (!governType) governType = "WE";

    const reqData = {
        channelType: channelType,
        channelName: channelName,
        userId: userId,
    };

    axios.post("/channel/enrollUserNameOnChannel", reqData).then((res) => {
        if (res.data.success) {
            window.sessionStorage.setItem("channel", channelName);
            window.sessionStorage.setItem("channelType", channelType);
            window.sessionStorage.setItem("uid", userId);
            window.location.href = `/${channelName}/${channelType}/${governType}`;
        } else {
            alert(res.data.error);
        }
    });
}

function checkHostUser(userId, userPassword, adminId, adminPassword) {
    if (userId === adminId && userPassword === adminPassword) {
        return true;
    } else {
        return false;
    }
}

/**
 * @anthor 박형길
 * @date 2022.03.22
 * @version 1.0
 * @descrption
 * 유저 이름 중복 체크
 */
function checkDuplicateUserNameOnChannel(userId, channelName, channelType) {
    const userPassword = $("#public-password").val();

    const reqData = {
        channelType: channelType,
        channelName: channelName,
        userId: userId,
    };

    axios.post("/channel/info", reqData).then((res) => {
        if (res.data.success) {
            const result = res.data.channelInfo.userNames.filter(
                (userName) => userName === userId
            );

            if (result.length > 0) {
                alert("Duplicate username exists");
            } else {
                if (
                    privatePasswordChecked.value === "on" ||
                    publicPasswordChecked.value === "on"
                ) {
                    if (
                        checkHostUser(
                            userId,
                            userPassword,
                            res.data.channelInfo.adminId,
                            res.data.channelInfo.adminPassword
                        )
                    ) {
                        window.sessionStorage.setItem("isHost", "Y");
                        enrollUserNameOnChannel(
                            userId,
                            channelName,
                            channelType,
                            res.data.channelInfo.governType
                        );
                    } else {
                        alert(
                            "Wrong adminId or password. please check your adminId or password again"
                        );
                    }
                } else {
                    window.sessionStorage.setItem("isHost", "N");
                    enrollUserNameOnChannel(
                        userId,
                        channelName,
                        channelType,
                        res.data.channelInfo.governType
                    );
                }
            }
        } else {
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
    channelJoinAction();
});

function channelJoinAction() {
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
}

$("#private-nickName").keydown((e) => {
    if (e.which === 13) {
        privateChannelJoinAction();
    }
});

$("#private-channelJoin-btn").click((e) => {
    privateChannelJoinAction();
});

function privateChannelJoinAction() {
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
            alert(
                "Please enter a valid user name (no spaces and special characters)"
            );
        } else {
            checkKorean(userId, channelName, channelType);
        }
    }
}

$("#public-nickName").keydown((e) => {
    if (e.which === 13) {
        publicChannelJoinAction();
    }
});

$("#public-channelJoin-btn").click((e) => {
    publicChannelJoinAction();
});

function publicChannelJoinAction() {
    const channelName = $("#public-channelName").val();
    const channelType = $("#public-channelType").val();
    const userId = $("#public-nickName").val();

    if (!checkUserId(userId)) {
        alert(
            "Please enter a valid user name (no spaces and special characters)"
        );
    } else {
        checkKorean(userId, channelName, channelType);
    }
}
