const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const path = require("path");

const app = express();

const port = process.env.PORT || 1227;
const server = http.createServer(app);
const io = new Server(server);

app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.static(path.join(__dirname, "../public/css")));
app.use(express.static(path.join(__dirname, "../public/img")));
app.use(express.static(path.join(__dirname, "../public/lib")));
app.use(express.static(path.join(__dirname, "../public/utils")));

app.get("/", (req, res) => {
    res.render("index");
});

io.on("connection", socket => {
    socket.on("local_join_room", (roomName) => {
      socket.join(roomName);
    });

    socket.on("submit_address", (address, roomName) => {
      socket.to(roomName).emit("input_address", address);
    });
});

server.listen(port, () => {
    console.log(`Server Listen... ${port}`);
});
