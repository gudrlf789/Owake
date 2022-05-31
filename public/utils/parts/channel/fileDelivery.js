import { deviceScan } from "./deviceScan.js";

let event = deviceScan();

const sendBtn = document.querySelector("#sendBtn");
const receiveBtn = document.querySelector("#receiveBtn");

export const fileDelivery = () => {
    updateDevice();
    sendBtn.addEventListener(event, sendAction, false);
    receiveBtn.addEventListener(event, receiveAction, false);
};

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
            console.log(xhr);
            console.log(textStatus);
            console.log(error);
        });
}

function receiveFile(url) {
    $("<iframe />").attr("src", url).hide().appendTo("body");
}

function checkIphoneMobile() {
    const checkIphone = navigator.userAgent.toLowerCase();

    if (checkIphone.indexOf("iphone") > -1) {
        alert(
            "We are sorry for that iPhone users can't use send and receive button yet."
        );
        return false;
    }
    return true;
}

function sendAction() {
    // if (checkIphoneMobile()) {
    //     let files = $("#fileInput").prop("files");
    //     if (files.length > 0) {
    //         createKey(files);
    //     } else {
    //         alert("Please select file");
    //     }
    // }

    let files = $("#fileInput").prop("files");
    if (files.length > 0) {
        createKey(files);
    } else {
        alert("Please select file");
    }
}

function receiveAction() {
    if (checkIphoneMobile()) {
        receiveKey($("#keyInput").val());
    }
}

$("#keyInput").keyup((e) => {
    if (e.keyCode == 13) {
        receiveAction();
    }
});

$("#keyInput").keydown(() => {
    $("#receiveForm .form-group").removeClass("has-error");
    $("#status").text("").removeClass("text-danger").addClass("text-success");
});
