/**
 * @author 전형동
 * @version 1.0 FileShare
 * @data 2022.02.21
 * @description
 * FShare 추가 예정
 */

export const fileShare = () => {
    // DOM Select

    const params = {
        api_key: "503d6430f3c124e0f239092e9c916b932a869dfe",
        profile_name: "owake",
    };

    $(document).ready(() => {
        function updateDevice() {
            $.ajax({
                url: "https://send-anywhere.com/web/v1/device",
                type: "GET",
                dataType: "jsonp",
                data: params,
                cache: false,
            }).done((data) => {});
        }

        function createKey(files) {
            let params = { file: [] };
            let formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                let file = files[i];
                params.file.push({ name: file.name, size: file.size });
                formData.append("file" + i, file, file.name);
            }

            $.ajax({
                url: "https://send-anywhere.com/web/v1/key",
                type: "GET",
                data: params,
                dataType: "jsonp",
                cache: false,
            }).done(function (data, textStatus, xhr) {
                $("#key").text(data.key);
                sendFile(data.weblink, formData);
            });
        }

        function sendFile(url, data) {
            $.ajax({
                url: url,
                type: "POST",
                processData: false,
                contentType: false,
                data: data,
                cache: false,
            }).done(function (data) {});
        }

        function receiveKey(key) {
            $("#status").text("waiting");
            $.ajax({
                url: "https://send-anywhere.com/web/v1/key/" + key,
                type: "GET",
                dataType: "jsonp",
                timeout: 3000,
                cache: false,
            })
                .done(function (data) {
                    receiveFile(data.weblink);
                    $("#status").text("done");
                })
                .fail(function (xhr, textStatus, error) {
                    $("#receiveForm .form-group").addClass("has-error");
                    $("#status")
                        .text("failed")
                        .removeClass("text-success")
                        .addClass("text-danger");
                });
        }

        function receiveFile(url) {
            $("<iframe />").attr("src", url).hide().appendTo("body");
        }

        $(document).on("click", "#sendBtn", function () {
            let files = $("#fileInput").prop("files");
            if (files.length > 0) {
                createKey(files);
            }
        });

        $(document).on("click", "#receiveBtn", function () {
            receiveKey($("#keyInput").val());
        });

        $(document).on("keyup", "#keyInput", function (e) {
            if (e.keyCode == 13) {
                $("#receiveBtn").click();
            }
        });

        $(document).on("keydown", "#keyInput", function (e) {
            $("#receiveForm .form-group").removeClass("has-error");
            $("#status")
                .text("")
                .removeClass("text-danger")
                .addClass("text-success");
        });
        updateDevice();
    });
};
