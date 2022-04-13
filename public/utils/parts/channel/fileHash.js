/**
 * @Author 박형길
 * @Date 2022 04 13
 * @Description
 * File Indentifier TrustOS API 적용
 */

export const fileHash = () => {
    let hashSocket = io();
    let formData = new FormData();
    let jwt;

    const file1 = document.getElementById("file1");
    const file2 = document.getElementById("file2");
    const hashText1 = document.getElementById("hashText1");
    const hashText2 = document.getElementById("hashText2");
    const compareResult = document.getElementById("compareResult");

    $(() => {
        $("#btn1").attr("disabled", true);
        $("#btn2").attr("disabled", true);
        compareResult.value = "";
    });

    const loginData = {
        id: "",
        password: "",
    };

    function makeFileToHash(data, textHtml) {
        if (formData.has("fileInput")) {
            formData.delete("fileInput");
        }
        formData.append("fileInput", data);

        axios
            .post(
                "https://pro.virtualtrust.io/cert/certificate/file/hash",
                formData,
                {
                    headers: {
                        Authorization: "Bearer " + jwt,
                        "Content-Type": "multipart/form-data",
                    },
                }
            )
            .then((res) => {
                hashSocket.emit(
                    "submit_hash",
                    res.data.output.file_hash,
                    textHtml.id,
                    window.sessionStorage.getItem("channel")
                );
                textHtml.value = res.data.output.file_hash;
            })
            .catch((err) => {
                console.log(err);
            });
    }

    hashSocket.on("input_hash", (data) => {
        $(`#${data.textHtmlId}`).val(`${data.hash}`);
    });

    $("#login").click((e) => {
        hashSocket.emit("join-hash", window.sessionStorage.getItem("channel"));

        axios
            .post("/channel/jwt", loginData)
            .then((res) => {
                jwt = res.data.jwt;
                $("#btn1").attr("disabled", false);
                $("#btn2").attr("disabled", false);
            })
            .catch((err) => {
                alert(err);
            });
    });

    $("#btn1").click((e) => {
        makeFileToHash(file1.files[0], hashText1);
    });

    $("#btn2").click((e) => {
        makeFileToHash(file2.files[0], hashText2);
    });

    $("#compare").click((e) => {
        if (hashText1.value === hashText2.value) {
            compareResult.value = "Same File";
        } else {
            compareResult.value = "Different File";
        }
    });

    $("#finish").click((e) => {
        hashSocket.emit("leave-hash", window.sessionStorage.getItem("channel"));
        file1.value = "";
        file2.value = "";
        hashText1.value = "";
        hashText2.value = "";
        $("#btn1").attr("disabled", true);
        $("#btn2").attr("disabled", true);
    });
};
