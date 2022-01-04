import { scrollToBottom } from "./channel/chat.js";

const messageList = document.getElementById("messages");
let channelMessageText = document.getElementById("chat_message");
let channelMessageSend = document.getElementById("send");

// Element Create
const messageContainer = document.createElement("div");
messageContainer.className = "message__container";

let userNameArea;
let messageArea;
let channel;
let userName;

$(async () => {
    if (window.sessionStorage.length != 0) {
        await joinRtm();
    }
});

// Initialize rtmClient
let rtmClient = AgoraRTM.createInstance(options.appid);

async function joinRtm() {
    channel = rtmClient.createChannel(window.sessionStorage.getItem("channel"));
    options.uid = window.sessionStorage.getItem("uid");
    userName = window.sessionStorage.getItem("uid");
    await rtmClient.login(options);
    await channel.join().then(() => {
        messageAreaFunc();
        messageArea.className = "message";
        messageArea.textContent =
            "You have successfully joined channel " +
            window.sessionStorage.getItem("channel");
        messageList.append(messageArea);
    });

    channel.on("ChannelMessage", function (message, memberId, e) {
        messageAreaFunc();
        const msg = JSON.stringify(message.text);

        // Remote User, Remote Messages Naming
        userNameArea.textContent = memberId;
        messageArea.textContent = msg;

        messageList.append(userNameArea, messageArea);
    });
    // Display channel member stats
    channel.on("MemberJoined", function (memberId) {
        messageAreaFunc();
        messageArea.textContent = memberId + " joined the channel";
        messageList.append(messageArea);
    });
    // Display channel member stats
    channel.on("MemberLeft", function (memberId) {
        messageAreaFunc();
        messageArea.textContent = memberId + " left the channel";
        messageList.append(messageArea);
    });
}

// document.getElementById("join").onclick = async function () {
//     await joinRtm();
// };

if (
    document.getElementById("channelJoin-btn") ||
    document.getElementById("private-channelJoin-btn") ||
    document.getElementById("public-channelJoin-btn")
) {
    await joinRtm();
}

// Client Event listeners
// Display messages from peer
rtmClient.on("MessageFromPeer", function (message, peerId) {
    messageAreaFunc();
    userNameArea.textContent = peerId;
    messageArea.textContent = message;
    messageList.append(userNameArea, messageArea);
});
// Display connection state changes
rtmClient.on("ConnectionStateChanged", function (state, reason) {
    messageAreaFunc();
    messageArea.textContent =
        "State changed To: " + state + " Reason: " + reason;
    messageList.append(messageArea);
});

// send channel message
channelMessageSend.addEventListener("click", (e) => {
    if (channelMessageText.value.length !== 0) {
        channelMessageFunc();
        channelMessageText.value = "";
    }
});

channelMessageText.addEventListener("keydown", (e) => {
    if (e.which === 13 && channelMessageText.value.length !== 0) {
        channelMessageFunc();
        channelMessageText.value = "";
    }
});

async function channelMessageFunc() {
    let channelMessage = channelMessageText.value.toString();

    if (channel != null) {
        await channel.sendMessage({ text: channelMessage }).then(() => {
            messageAreaFunc();
            userNameArea.textContent = userName;
            messageArea.textContent = channelMessage;
            messageList.append(userNameArea, messageArea);
            scrollToBottom();
        });
    }
}

function messageAreaFunc() {
    userNameArea = document.createElement("div");
    messageArea = document.createElement("div");
    userNameArea.className = "userName";
    messageArea.className = "message";

    scrollToBottom();
}
