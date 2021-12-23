const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");

const CORS_fn = (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    if (req.method === "OPTIONS") {
        res.writeHead(200);
        res.end();
        return;
    }
};

const server = require("http").createServer(app, CORS_fn);
const io = require("socket.io")(server);

/** Router */
const mainRouter = require("./router/main.js");

const dotenv = require("dotenv");
dotenv.config();

/** https Redirecting Setting */
function redirectSec(req, res, next) {
    if (req.headers["x-forwarded-proto"] == "http") {
        var redirect = "https://" + req.headers.host + req.path;
        res.redirect(redirect);
    } else {
        return next();
    }
}

app.set("view engine", "ejs");

app.use(cors());
app.use(redirectSec);

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.static(path.join(__dirname, "../public/css")));
app.use(express.static(path.join(__dirname, "../public/img")));
app.use(express.static(path.join(__dirname, "../public/lib")));
app.use(express.static(path.join(__dirname, "../public/utils")));
app.use(express.static(path.join(__dirname, "../public/utils/parts")));
app.use(express.static(path.join(__dirname, "../public/img/favicon")));
app.use(express.static(path.join(__dirname, "../public/img/button")));
app.use(express.static(path.join(__dirname, "../public/img/nav-icon")));
app.use(express.static(path.join(__dirname, "../views")));

app.use(express.urlencoded({
    extended: true
}));

app.use(express.json());

/** Routing Settings */
app.use("/channel", mainRouter);

app.get("/", (req, res, next) => {
    res.render("index");
});

app.get("/join", (req, res, next) => {
    res.render("channel");
});

io.on("connection", (socket) => {
    socket.on("join-web", (channelName) => {
        socket.join(channelName);
    });

    socket.on("submit_address", (address, channelName) => {
        socket.to(channelName).emit("input_address", address);
    });

    socket.on("leave-web", (channelName) => {
        socket.leave(channelName);
    });

    socket.on("join-whiteboard", (channelName) => {
        socket.join(channelName);
    });

    socket.on("drawing", (data, channelName) => {
        socket.to(channelName).emit("drawing", data);
    });

    socket.on("leave-whiteboard", (channelName) => {
        socket.leave(channelName);
    });
});

const port = process.env.PORT || 1227;
server.listen(port, () => {
    console.log(`Server Listen... ${port}`);
});
