const express = require("express");
const app = express();
const path = require("path");
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
    cors: {
        origin: "*",
    },
});
const cors = require("cors");

const dotenv = require("dotenv");
dotenv.config();
const port = process.env.PORT || 1227;
const host = process.env.HOST;
const agoraId = process.env.AGORA_ID;

app.set("view engine", "ejs");

app.use(cors());

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.static(path.join(__dirname, "../public/css")));
app.use(express.static(path.join(__dirname, "../public/img")));
app.use(express.static(path.join(__dirname, "../public/lib")));
app.use(express.static(path.join(__dirname, "../public/utils")));
app.use(express.static(path.join(__dirname, "../views")));

app.get("/", (req, res) => {
    res.render("index");
});

io.on("connection", (socket) => {
    socket.on("join-room", (roomName) => {
        socket.join(roomName);
    });

    socket.on("submit_address", (address, roomName) => {
        socket.to(roomName).emit("input_address", address);
    });
});

server.listen(port, () => {
    console.log(`Server Listen... ${port}`);
});
