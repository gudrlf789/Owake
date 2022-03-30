const { Server } = require("socket.io");
const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
const Logger = require("./Logger");
const log = new Logger("server");
const port = process.env.PORT || 1227;

let channels = {}; // collect channels
let sockets = {}; // collect sockets
let peers = {}; // collect peers info grp by channels
let channel;
let peerId;
let peerName;

let io, server;

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

server = require("http").createServer(app, CORS_fn);
io = new Server({
    pingTimeout: 60000,
    upgradeTimeout: 100000,

    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        preflightContinue: false,
    },
}).listen(server);
/** Router */
const mainRouter = require("./routes/router.js");

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
app.use(express.static(path.join(__dirname, "../public/img/channel")));
app.use(express.static(path.join(__dirname, "../public/img/nav-icon")));
app.use(express.static(path.join(__dirname, "./uploads/")));
app.use(express.static(path.join(__dirname, "../views")));

app.use(
    express.urlencoded({
        extended: true,
    })
);

app.use(express.json());

/** Routing Settings */
app.use("/channel", mainRouter);

app.get("/", (req, res, next) => {
    res.render("index");
});

app.get("/:channelName/:channelType", (req, res) => {
    res.render("channel", {
        channelName: req.params.channelName,
        channelType: req.params.channelType,
    });
});

app.get("/all", (req, res, next) => {
    res.render("all");
});

app.get("/dashboard", (req, res, next) => {
    res.render("index");
});

app.get("/business", (req, res, next) => {
    res.render("businessList");
});

app.get("/channelList", (req, res, next) => {
    res.render("channelList");
});

app.get("/newsfeed", (req, res, next) => {
    res.render("newsfeed");
});

/**
 * @anthor 전형동
 * @date 2022.02.21
 * @version 1.1
 * @descrption
 * Socket 내용 다소 변경
 * Logger 추가
 * FileShare Socket 추가
 */

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

    socket.on("join-fileShare", (channelName) => {
        socket.join(channelName);
    });

    socket.on("leave-fileShare", (channelName) => {
        socket.leave(channelName);
    });

    socket.on("fileShare", (channelName, data, type) => {
        socket.broadcast.to(channelName).emit("send-fileShare", data, type);
    });
    
    socket.on("join-hash", (channelName) => {
        socket.join(channelName);
    });

    socket.on("submit_hash", (hash, textHtmlId, channelName) => {
        let data = {
            hash: hash,
            textHtmlId: textHtmlId
        }
        socket.to(channelName).emit("input_hash", data);
    });

    socket.on("leave-hash", (channelName) => {
        socket.leave(channelName);
    });
});

server.listen(port, () => {
    log.debug(`Server Listen... ${port}`);
});
