import { channelName } from "./igovern-sessionStorage.js";

const socket = io.connect("/");
socket.emit("igovern-join-channel", channelName);

export default socket;