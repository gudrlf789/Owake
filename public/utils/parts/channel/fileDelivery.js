export const fileDelivery = () => {
    // Select DOM Element
    const sendBtn = document.querySelector("#sendBtn");
    const receiveBtn = document.querySelector("#receiveBtn");
    const keyInput = document.querySelector("#keyInput");
    const fileDeliveryInput = document.querySelector("#fileInput");

    $(document).ready(() => {
        const params = {
            api_key: "503d6430f3c124e0f239092e9c916b932a869dfe",
            profile_name: "owake",
        };
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
                document.querySelector("#key").textContent = data.key;
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
            document.querySelector("#status").textContent = "waiting";
            $.ajax({
                url: "https://send-anywhere.com/web/v1/key/" + key,
                type: "GET",
                dataType: "jsonp",
                timeout: 3000,
                cache: false,
            })
                .done(function (data) {
                    receiveFile(data.weblink);
                    document.querySelector("#status").textContent = "done";
                })
                .fail(function (xhr, textStatus, error) {
                    document
                        .querySelector("#receiveForm .form-group")
                        .classList.add("has-error");
                    document.querySelector("#status").textContent =
                        "failed".classList
                            .remove("has-success")
                            .classList.add("text-danger");
                    // $("#receiveForm .form-group").addClass("has-error");
                    // $("#status")
                    //     .text("failed")
                    //     .removeClass("text-success")
                    //     .addClass("text-danger");
                });
        }

        function receiveFile(url) {
            $("<iframe />").attr("src", url).hide().appendTo("body");
        }

        function sendAction() {
            let files = fileDeliveryInput.files;
            if (files.length > 0) {
                createKey(files);
            }
        }

        function receiveAction() {
            receiveKey(keyInput.value);
        }

        function keyupAction(e) {
            if (e.keyCode == 13) {
                receiveBtn.click();
            }
        }

        function keydownAction() {
            document
                .querySelector("#receiveForm .form-group")
                .classList.add("has-error");
            document.querySelector("#status").textContent = "".classList
                .remove("text-danger")
                .classList.add("text-success");

            // $("#receiveForm .form-group").removeClass("has-error");
            // $("#status")
            //     .text("")
            //     .removeClass("text-danger")
            //     .addClass("text-success");
        }

        sendBtn.addEventListener("click", sendAction);
        receiveBtn.addEventListener("click", receiveAction);
        keyInput.addEventListener("keyup", (e) => {
            keyupAction(e);
        });
        keyInput.addEventListener("keydown", keydownAction);

        updateDevice();
    });
};
