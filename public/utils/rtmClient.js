const rtmClientFunc = () => {
    const messageList = document.getElementById("messages");
    const userNameArea = document.createElement("div");
    const messageArea = document.createElement("div");

    let channelMessageText = document.getElementById("chat_message");
    let channelMessageSend = document.getElementById("send");

    userNameArea.className = "userName";
    messageArea.className = "message";

    let options = {
        uid: "",
        token: "",
    };

    let channel;
    let userName;

    const appID = "50b9cd9de2d54849a139e3db52e7928a";

    $(() => {
        let urlParams = new URL(location.href).searchParams;

        options.channel = urlParams.get("channel");
        options.token = urlParams.get("token");
        options.uid = urlParams.get("uid");
        if (options.appid && options.channel) {
            $("#uid").val(options.uid);
            $("#token").val(options.token);
            $("#channel").val(options.channel);
        }
    });

    // Initialize rtmClient
    let rtmClient = AgoraRTM.createInstance(appID);

    document.getElementById("join").onclick = async function () {
        channel = rtmClient.createChannel($("#channel").val());
        options.uid = $("#uid").val();
        userName = $("#uid").val();
        await rtmClient.login(options);
        await channel.join().then(() => {
            messageList.append(
                "You have successfully joined channel " + channel.channelId
            );
        });

        channel.on("ChannelMessage", function (message, memberId) {
            messageList.append(
                "Message received from: " +
                    memberId +
                    " Message: " +
                    JSON.stringify(message)
            );
        });
        // Display channel member stats
        channel.on("MemberJoined", function (memberId) {
            messageList.append(memberId + " joined the channel");
        });
        // Display channel member stats
        channel.on("MemberLeft", function (memberId) {
            messageList.append(memberId + " left the channel");
        });
    };

    // Client Event listeners
    // Display messages from peer
    rtmClient.on("MessageFromPeer", function (message, peerId) {
        userNameArea.textContent = peerId;
        messageArea.textContent = message;
        messageList.append(userNameArea, messageArea);
    });
    // Display connection state changes
    rtmClient.on("ConnectionStateChanged", function (state, reason) {
        messageList.append("State changed To: " + state + " Reason: " + reason);
    });

    // send channel message
    channelMessageSend.addEventListener("click", (e) => {
        if (channelMessageText.value.length !== 0) {
            console.log(channelMessageText.value);
            channelMessageFunc();
            channelMessageText.value = "";
        }
    });

    channelMessageText.addEventListener("keydown", (e) => {
        if (e.which === 13 && channelMessageText.value.length !== 0) {
            console.log(channelMessageText.value);
            channelMessageFunc();
            channelMessageText.value = "";
        }
    });

    async function channelMessageFunc() {
        let channelMessage = channelMessageText.value.toString();

        if (channel != null) {
            await channel.sendMessage({ text: channelMessage }).then(() => {
                userNameArea.textContent = userName;
                messageArea.textContent = channelMessage;
                messageList.append(userNameArea, messageArea);
            });
        }
    }
};

rtmClientFunc();
