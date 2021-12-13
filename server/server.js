/** Default Module */
const express = require("express");
const app = express();
const path = require("path");
const server = require("http").createServer(app);
const io = require("socket.io")(server);

/** Router */
const mainRouter = require("../router/main.js");
const channelRouter = require("../router/channel.js");
/** Router Set End */

/** Dotenv */
const dotenv = require("dotenv");
dotenv.config();

/** https Redirecting Setting */
function redirectSec(req, res, next) {
    if (req.headers["x-forwarded-proto"] == "http") {
        var redirect = "https://" + req.headers.host + req.path;
        console.log("Redirect to:" + redirect);
        res.redirect(redirect);
    } else {
        return next();
    }
}

app.set("view engine", "ejs");

app.use(redirectSec);

app.use("/", express.static(path.join(__dirname, "../public")));
app.use("/", express.static(path.join(__dirname, "../public/css")));
app.use("/", express.static(path.join(__dirname, "../public/img")));
app.use("/", express.static(path.join(__dirname, "../public/lib")));
app.use("/", express.static(path.join(__dirname, "../public/utils")));
app.use("/", express.static(path.join(__dirname, "../public/utils/parts")));
app.use(
    "/",
    express.static(path.join(__dirname, "../public/utils/parts/mainpage"))
);
app.use("/", express.static(path.join(__dirname, "../public/img/favicon")));
app.use("/", express.static(path.join(__dirname, "../public/img/button")));
app.use("/", express.static(path.join(__dirname, "../views")));

app.use("/channel", express.static(path.join(__dirname, "../public")));
app.use("/channel", express.static(path.join(__dirname, "../public/css")));
app.use("/channel", express.static(path.join(__dirname, "../public/img")));
app.use("/channel", express.static(path.join(__dirname, "../public/lib")));
app.use("/channel", express.static(path.join(__dirname, "../public/utils")));
app.use(
    "/channel",
    express.static(path.join(__dirname, "../public/utils/parts"))
);
app.use(
    "/channel",
    express.static(path.join(__dirname, "../public/utils/parts/channel"))
);
app.use(
    "/channel",
    express.static(path.join(__dirname, "../public/img/favicon"))
);
app.use(
    "/channel",
    express.static(path.join(__dirname, "../public/img/button"))
);
app.use("/channel", express.static(path.join(__dirname, "../views")));

app.use(
    express.urlencoded({
        extended: true,
    })
);
app.use(express.json());

/** Routing Settings */
app.use("/", mainRouter);
app.use("/list", mainRouter);
app.use("/register", mainRouter);
app.use("/update", mainRouter);
app.use("/remove", mainRouter);
app.use("/search", mainRouter);
app.use("/channel", channelRouter);
/** Routing Setting End */

io.on("connection", (socket) => {
    socket.on("join-room", (roomName) => {
        console.log("roomName " + roomName);
        socket.join(roomName);
    });
    socket.on("submit_address", (address, roomName) => {
        socket.to(roomName).emit("input_address", address);
    });

    socket.on("leave-room", (roomName) => {
        socket.leave(roomName);
    });

    socket.on("speech message", (msg, roomName) => {
        console.log(msg);
        io.to(roomName).emit("send message", {
            message: msg,
            user: socket.username,
        });
    });

    socket.on("drawing", (data) => {
        socket.broadcast.emit("drawing", data);
        console.log(data);
    });

    socket.on("new user", (user) => {
        socket.username = user;
        console.log("User connected - User name: " + socket.username);
    });
});

const port = process.env.PORT || 1227;
server.listen(port, () => {
    console.log(`Server Listen... ${port}`);
});
