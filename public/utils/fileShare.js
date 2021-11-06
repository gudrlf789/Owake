$(document).ready(function () {
    function updateDevice() {
        $.ajax({
            url: "https://send-anywhere.com/web/v1/device",
            type: "GET",
            dataType: "jsonp",
            data: {
                api_key: "503d6430f3c124e0f239092e9c916b932a869dfe",
                profile_name: "username",
            },
            cache: false,
        }).done(function (data) {});
    }
    function createKey(files) {
        var params = { file: [] };
        var formData = new FormData();
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
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
        socket.emit("create message", "file waiting");
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
                socket.emit("create message", "file Done");
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

    $("#sendBtn").click(function () {
        var files = $("#fileInput").prop("files");
        if (files.length > 0) {
            createKey(files);
        }
    });

    $("#receiveBtn").click(function () {
        receiveKey($("#keyInput").val());
    });

    $("#keyInput").keyup(function (e) {
        if (e.keyCode == 13) {
            $("#receiveBtn").click();
        }
    });

    $("#keyInput").keydown(function () {
        $("#receiveForm .form-group").removeClass("has-error");
        $("#status")
            .text("")
            .removeClass("text-danger")
            .addClass("text-success");
    });

    updateDevice();
});
