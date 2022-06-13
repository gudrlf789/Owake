/**
 * @author 전형동
 * @date 2022 03 10
 * @description
 * 이미지 최적화 적용
 * New Compressor
 * Quality	Input size	Output size	Compression ratio	Description
    0	    2.12 MB	    114.61  KB	       94.72%	        -
    0.2	    2.12 MB	    349.57  KB	       83.90%	        -
    0.4	    2.12 MB	    517.10  KB	       76.18%	        -
    0.6	    2.12 MB	    694.99  KB	       67.99%	    Recommend
    0.8	    2.12 MB	    1.14    MB	       46.41%	    Recommend
    1	    2.12 MB	    2.12    MB	         0%	        Not recommend
    NaN	    2.12 MB	    2.01    MB	        5.02%	        -
 */

let fileType;
let fileSelect;
let fileName;
let maxFileSize;
let popup;
let popupActivate = false;

let iGovernHelp = document.querySelector("#i_govern_help");
let weGovernHelp = document.querySelector("#we_govern_help");

function afterAction(typeFlag) {
    typeFlag === "private"
        ? $("#channelPrivateCreate").modal("hide")
        : $("#channelPublicCreate").modal("hide");
    $(`#${typeFlag}_adminId`).val("");
    $(`#${typeFlag}_adminPassword`).val("");
    $(`#${typeFlag}_channelName`).val("");
    $(`#${typeFlag}_channelPassword`).val("");
    //$(`#${typeFlag}_theme-category`).val("News");
    $(`#${typeFlag}_file_thumnail`).val("");
    $(`#${typeFlag}_upload`).val("");
    $(`#${typeFlag}_channel-description`).val("");
}

function checkCreateData(typeFlag) {
    if ($(`#${typeFlag}_adminId`).val() === "") {
        return {
            success: false,
            failData: "Admin ID",
        };
    } else if ($(`#${typeFlag}_adminPassword`).val() === "") {
        return {
            success: false,
            failData: "Admin Password",
        };
    } else if ($(`#${typeFlag}_channelName`).val() === "") {
        return {
            success: false,
            failData: "Channel Name",
        };
    } else {
        return {
            success: true,
        };
    }
}

function checkIdentityPassword(typeFlag) {
    const password = $(`#${typeFlag}_channelPassword`).val();
    const confirmPassword = $(`#${typeFlag}_channelPassword_confirm`).val();

    if (password !== confirmPassword) {
        alert("The passwords are not the same");
        $(`${typeFlag}_channelPassword_confirm`).focus();
        return false;
    }

    return true;
}

function createChannelData(typeFlag) {
    console.log(":::::: createChannelData ::::::");
    const imageType = /(.*?)\/(jpg|jpeg|png|gif|bmp)$/;
    // const formData = new FormData();
    const result = checkCreateData(typeFlag);
    const korean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;

    fileSelect = $(`#${typeFlag}_file_thumnail`)[0].files[0];

    if (!fileSelect) {
        alert("Please insert the image.");
        return;
    }

    if (!result.success) {
        alert(`Please enter ${result.failData}`);
        return;
    }

    if (!checkIdentityPassword(typeFlag)) return;

    new Compressor(fileSelect, {
        quality: 0.2,
        // The compression process is asynchronous,
        // which means you have to access the `result` in the `success` hook function.
        success(result) {
            const formData = new FormData();

            if (fileSelect) {
                fileName = fileSelect.name;
                fileType = fileSelect.type;
            }

            formData.append("adminId", $(`#${typeFlag}_adminId`).val());
            formData.append(
                "adminPassword",
                $(`#${typeFlag}_adminPassword`).val()
            );
            formData.append(
                "channelType",
                //typeFlag === "private" ? "Private" : "Public"
                "Public"
            );
            formData.append(
                "governType",
                $("input:checkbox[name=channelGovernType]:checked").val() ===
                    "I"
                    ? $("#check-igovern").val()
                    : $("#check-wegovern").val()
            );
            formData.append("channelName", $(`#${typeFlag}_channelName`).val());
            formData.append(
                "channelPassword",
                $(`#${typeFlag}_channelPassword`).val()
            );
            /*formData.append(
                "channelCategory",
                $(`#${typeFlag}-theme-category`).val()
            );*/
            formData.append(
                "channelDescription",
                $(`#${typeFlag}_channel-description`).val()
            );

            if (fileSelect) {
                if (korean.test(fileName)) {
                    alert(
                        "The file name contains Korean. Please change the file name to English."
                    );
                    return;
                }

                if (imageType.test(fileType)) {
                    formData.append("image", result, fileName);
                    formData.append("imageName", fileName);
                } else {
                    alert("You can only select the image file");
                    return;
                }
            }

            if (
                !korean.test(formData.get("adminId")) &&
                !korean.test(formData.get("channelName"))
            ) {
                axios.post("/channel/register", formData).then((res) => {
                    if (res.data.success) {
                        alert("The channel has been successfully created");
                        afterAction(typeFlag);
                        selectOptionsChannel();
                    } else {
                        alert(
                            `ChannelName: ${$(
                                `#${typeFlag}_channelName`
                            ).val()} is already existed. please choice another type or channelName`
                        );
                        $(`#${typeFlag}_channelName`).val("");
                    }
                });
            } else {
                alert("You can only type AdminId and channelName in English.");
                afterAction(typeFlag);
            }
        },
        error(err) {
            console.log(err.message);
        },
    });
}

$("#create-channel-btn").click((e) => {
    if (fileSizeCheck("public") === false) {
        return alert("Please check the file size (2MB or less)");
    } else {
        createChannelData("public");
    }
});

$("input:checkbox[name=channelGovernType]").change((e) => {
    if (e.target.id === "check-igovern") {
        $("#check-wegovern").prop("checked", false);
    } else {
        $("#check-igovern").prop("checked", false);
    }
});

$("input:radio[name=channelRadioBtn]").change((e) => {
    if (e.target.id === "password_use_yes") {
        $("#password_use_no").prop("checked", false);
        $("#public_channelPassword").attr("disabled", false);
        $("#public_channelPassword_confirm").attr("disabled", false);
    } else {
        $("#public_channelPassword").val("");
        $("#public_channelPassword_confirm").val("");

        $("#password_use_yes").prop("checked", false);
        $("#public_channelPassword").attr("disabled", true);
        $("#public_channelPassword_confirm").attr("disabled", true);
    }
});

$("#public_file_thumnail").change((e) => {
    $("#public_upload").text(e.currentTarget.files[0].name);
});

$("#public_file_thumnail").focus((e) => {
    e.currentTarget.classList.add("has-focus");
});

$("#public_file_thumnail").blur((e) => {
    e.currentTarget.classList.remove("has-focus");
});

function fileSizeCheck(typeFlag) {
    fileSelect = $(`#${typeFlag}_file_thumnail`)[0].files[0];
    if (fileSelect) {
        let fileSize = fileSelect.size;
        maxFileSize = 2 * 1024 * 1024;
        if (fileSize > maxFileSize) {
            return false;
        }
    } else {
        return true;
    }
}

function iGovernHelpPopup() {
    popup = `
    <div class="card i_help" style="width: 18rem;">
        <div class="card-body">
            <h5 class="card-title">I Govern (IG)</h5>
            <p class="card-text">The Governor of this world can choose, show, and present the content and services he/she wants to show to all attendees. (Attendees can upload content)</p>
        </div>
    </div>
    `;

    return popup;
}

function weGovernHelpPopup() {
    popup = `
    <div class="card we_help" style="width: 18rem;">
        <div class="card-body">
            <h5 class="card-title">We Govern (WG)</h5>
            <p class="card-text">Any participant can show and present content and services to other participants at the same moment as one of the Governors of this world. (All participants can show and present.)</p>
        </div>
    </div>
    `;

    return popup;
}

function iGovernHelpEnable() {
    let iPopup = iGovernHelpPopup();
    $("#createChannel-container").append(iPopup);
}

function iGovernHelpDisable() {
    $("#createChannel-container .i_help").remove();
}

function weGovernHelpEnable() {
    let wePopup = weGovernHelpPopup();
    $("#createChannel-container").append(wePopup);
}

function weGovernHelpDisable() {
    $("#createChannel-container .we_help").remove();
}

iGovernHelp.addEventListener("click", () => {
    popupActivate = !popupActivate;
    popupActivate ? iGovernHelpEnable() : iGovernHelpDisable();
});
weGovernHelp.addEventListener("click", () => {
    popupActivate = !popupActivate;
    popupActivate ? weGovernHelpEnable() : weGovernHelpDisable();
});
