export const fileDeliverySafari = () => {
    updateDevice();
    clickEvent();
};

let device_key = "";
let device_id = "";

function updateDevice() {
    let params = {
        api_key: "503d6430f3c124e0f239092e9c916b932a869dfe",
        profile_name: "owake",
    };
    if (localStorage.device_key) {
        params.device_key = localStorage.device_key;
    }

    $.ajax({
        url: "https://send-anywhere.com/web/v1/device",
        type: "GET",
        dataType: "jsonp",
        data: params,
        cache: false,
    }).done(function (data) {
        if (data.device_key) {
            localStorage.device_key = data.device_key;
        }
    });
}
function createKey(files) {
    let params = {
        file: [],
        device_key: localStorage.device_key,
    };
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
    var params = {
        device_key: localStorage.device_key,
    };

    $("#status").text("waiting");
    $.ajax({
        url: "https://send-anywhere.com/web/v1/key/" + key,
        type: "GET",
        dataType: "jsonp",
        data: params,
        timeout: 3000,
        cache: false,
    })
        .done(function (data) {
            let weblink = data.weblink.split("?")[0];
            weblink = weblink + "?device_key=" + localStorage.device_key;
            receiveFile(weblink);
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

function clickEvent() {
    $("#sendBtn").click(() => {
        let files = $("#fileInput").prop("files");
        if (files.length > 0) {
            createKey(files);
        }
    });

    $("#receiveBtn").click(() => {
        receiveKey($("#keyInput").val());
    });

    $("#keyInput").keyup((e) => {
        if (e.keyCode == 13) {
            $("#receiveBtn").click();
        }
    });

    $("#keyInput").keydown(() => {
        $("#receiveForm .form-group").removeClass("has-error");
        $("#status")
            .text("")
            .removeClass("text-danger")
            .addClass("text-success");
    });
}
