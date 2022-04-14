const { Server } = require("socket.io");
const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const Logger = require("./Logger");
const { execSync } = require("child_process");
const fs = require("fs");
const log = new Logger("server");
const requestIp = require('request-ip');
const port = process.env.PORT || 1227;

let channels = {}; // collect channels
let sockets = {}; // collect sockets
let peers = {}; // collect peers info grp by channels
let channel;
let peerId;
let peerName;
let urlParams;

let site = [];
let siteSet;
let siteArr = [];

let peerWebURLArr = [];

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
    pingInterval: 100000,
    pingTimeout: 100000,
    maxHttpBufferSize: 1e8,

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
        let redirect = "https://" + req.headers.host + req.path;
        res.redirect(redirect);
    } else {
        return next();
    }
}

app.set("view engine", "ejs");

app.use(cors());
app.use(redirectSec);

app.use(
    express.urlencoded({
        extended: true,
    })
);

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.static(path.join(__dirname, "../public/css")));
app.use(express.static(path.join(__dirname, "../public/img")));
app.use(express.static(path.join(__dirname, "../public/lib")));
app.use(express.static(path.join(__dirname, "../public/lib/p5")));
app.use(express.static(path.join(__dirname, "../public/lib/p5/addons")));
app.use(express.static(path.join(__dirname, "../public/utils")));
app.use(express.static(path.join(__dirname, "../public/utils/parts")));
app.use(express.static(path.join(__dirname, "../public/img/favicon")));
app.use(express.static(path.join(__dirname, "../public/img/button")));
app.use(express.static(path.join(__dirname, "../public/img/channel")));
app.use(express.static(path.join(__dirname, "../public/img/nav-icon")));
app.use(express.static(path.join(__dirname, "./uploads/")));
app.use(express.static(path.join(__dirname, "../views")));

app.use(express.json());
app.use(requestIp.mw());

/** Routing Settings */
app.use("/channel", mainRouter);

app.get("/", (req, res, next) => {
    res.render("index");
});

app.get("/:channelName/:channelType", (req, res) => {
    let appID = "4343e4c08654493cb8997de783a9aaeb";
    res.render("channel", {
        channelName: req.params.channelName,
        channelType: req.params.channelType,
        appID,
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
 * @date 2022.04.05
 * @version 1.1
 * @descrption
 * 모멘트 쉐어링 개발중
 * 클라이언트 페이지 호출
 */

app.post("/urlSearch", async (req, res) => {
    fs.writeFileSync("views/site.ejs", "", () =>
        console.log("Created site.ejs")
    );
    fs.createReadStream("views/site.ejs").pipe(res);

    urlParams = req.query[0];
    site.push(urlParams);
    siteSet = new Set(site);
    siteArr = Array.from(siteSet);
});

app.get("/site", async (req, res) => {
    for (let i = 0; i < siteArr.length; i++) {
        if (urlParams === siteArr[i]) {
            fetchWebsite(urlParams);
        }
    }
    res.render("site");
});

/**
 * @anthor 전형동
 * @date 2022.04.05
 * @version 1.1
 * @descrption
 * 웹사이트 내용 긁어오는 소스
 * 클라이언트에도 Error를 뿌려줘야 됨. 아직 수정 못함.
 */

const fetchWebsite = (url) => {
    try {
        if (url.includes("undefined")) {
            // 클라이언트에도 Error를 뿌려줘야 됨. 아직 수정 못함.
            return log.debug("The entered URL is invalid.");
        } else {
            execSync(
                `wget -q -O - ${url} > views/site.ejs`,
                (error, stdout, stderr) => {
                    if (error !== null) {
                        return false;
                    }
                }
            );
        }
    } catch (error) {
        return log.debug("Moment Share -- URL Input Error ", error);
    }
};

/**
 * @anthor 전형동
 * @date 2022.02.21
 * @version 1.1
 * @descrption
 * Socket 내용 다소 변경
 * Logger 추가
 * FileShare Socket 추가
 */

io.sockets.on("connection", (socket) => {
    // io.on("connection", (socket) => {
    socket.channels = {};
    sockets[socket.id] = socket;

    log.debug("[" + socket.id + "] connection accepted");

    socket.on("disconnect", (reason) => {
        for (let channel in socket.channels) {
            removePeerFrom(channel);
        }
        log.debug("[" + socket.id + "] disconnected", { reason: reason });
        delete sockets[socket.id];
    });

    socket.on("join", (config) => {
        log.debug("[" + socket.id + "] join ", config);

        channel = config.channel;
        peerId = config.peerId;
        peerName = config.peerName;

        if (channel in socket.channels) {
            log.debug("[" + socket.id + "] [Warning] already joined", channel);
            return;
        }

        // no channel aka room in channels init
        if (!(channel in channels)) channels[channel] = {};

        // no channel aka room in peers init
        if (!(channel in peers)) peers[channel] = {};

        // collect peers info grp by channels
        // peers[channel][socket.id] = {
        //     peer_Id: peerId,
        //     peer_name: peerName,
        // };

        peers[channel][peerName] = {
            peer_Id: peerId,
        };

        log.debug("connected peers grp by roomId", peers);

        channels[channel][socket.id] = socket;
        socket.channels[channel] = channel;

        socket.join(channel);
    });

    socket.on("join-web", (channelName) => {
        socket.join(channelName);
    });

    socket.on("leave-web", (channelName) => {
        socket.leave(channelName);
    });

    socket.on("submit_address", (address, config) => {
        // 이 코드 리펙토링 필수!  - 참조 : /urlSearch
        peerWebURLArr.push(address);
        let peerWebURLArrSet = new Set(peerWebURLArr);
        let resultURLArr = Array.from(peerWebURLArrSet);

        log.debug("connected peers grp by Peer Address ", peers);

        socket.in(config.channel).emit("input_address", address);
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

    socket.on("file-meta", (data) => {
        // console.log(data);
        //broadcast 동일하게 가능 자신 제외 룸안의 유저
        socket.in(data.channel).emit("fs-meta", data);
    });
    socket.on("file-progress", (progress, channel) => {
        socket.in(channel).emit("fs-progress", progress);
    });

    socket.on("file-receiver", (data) => {
        socket
            .in(data.channel)
            .emit(
                "file-send",
                data.state,
                data.uid,
                data.peer,
                data.receiverCheck
            );
    });

    socket.on("join-hash", (channelName) => {
        socket.join(channelName);
    });

    socket.on("submit_hash", (hash, textHtmlId, channelName) => {
        let data = {
            hash: hash,
            textHtmlId: textHtmlId,
        };
        socket.to(channelName).emit("input_hash", data);
    });

    socket.on("leave-hash", (channelName) => {
        socket.leave(channelName);
    });

    /**
     * @Author 전형동
     * @param {*} mouseEvent
     * @Date 2022 04 12
     * @Description
     * Socket Mouse Event
     * @returns pageX, pageY, clientX, clientY, offsetX, offsetY, screenX, screenY
     */

    let mouseData = {
        mousePeer: null,
        clientX: null,
        clientY: null,
        offsetX: null,
        offsetY: null,
        screenX: null,
        screenY: null,
        pageX: null,
        pageY: null,
    };

    socket.on("active_mouseover", (config) => {
        mouseData.mousePeer = config.peer;
        mouseData.clientX = config.clientX;
        mouseData.clientY = config.clientY;
        mouseData.offsetX = config.offsetX;
        mouseData.offsetY = config.offsetY;
        mouseData.screenX = config.screenX;
        mouseData.screenY = config.screenY;
        mouseData.pageX = config.pageX;
        mouseData.pageY = config.pageY;
        socket.in(config.channel).emit("receive_mouseover", mouseData);
    });

    socket.on("active_mouseup", (config) => {
        mouseData.mousePeer = config.peer;
        mouseData.clientX = config.clientX;
        mouseData.clientY = config.clientY;
        mouseData.offsetX = config.offsetX;
        mouseData.offsetY = config.offsetY;
        mouseData.screenX = config.screenX;
        mouseData.screenY = config.screenY;
        mouseData.pageX = config.pageX;
        mouseData.pageY = config.pageY;
        socket.in(config.channel).emit("receive_mouseover", mouseData);
    });

    socket.on("active_mousedown", (config) => {
        mouseData.mousePeer = config.peer;
        mouseData.clientX = config.clientX;
        mouseData.clientY = config.clientY;
        mouseData.offsetX = config.offsetX;
        mouseData.offsetY = config.offsetY;
        mouseData.screenX = config.screenX;
        mouseData.screenY = config.screenY;
        mouseData.pageX = config.pageX;
        mouseData.pageY = config.pageY;
        socket.in(config.channel).emit("receive_mouseover", mouseData);
    });

    socket.on("active_mouseout", (config) => {
        mouseData.mousePeer = config.peer;
        mouseData.clientX = config.clientX;
        mouseData.clientY = config.clientY;
        mouseData.offsetX = config.offsetX;
        mouseData.offsetY = config.offsetY;
        mouseData.screenX = config.screenX;
        mouseData.screenY = config.screenY;
        mouseData.pageX = config.pageX;
        mouseData.pageY = config.pageY;
        socket.in(config.channel).emit("receive_mouseover", mouseData);
    });

    socket.on("active_mousemove", (config) => {
        mouseData.mousePeer = config.peer;
        mouseData.clientX = config.clientX;
        mouseData.clientY = config.clientY;
        mouseData.offsetX = config.offsetX;
        mouseData.offsetY = config.offsetY;
        mouseData.screenX = config.screenX;
        mouseData.screenY = config.screenY;
        mouseData.pageX = config.pageX;
        mouseData.pageY = config.pageY;
        socket.in(config.channel).emit("receive_mouseover", mouseData);
    });

    socket.on("active_wheel", (config) => {
        mouseData.mousePeer = config.peer;
        mouseData.clientX = config.clientX;
        mouseData.clientY = config.clientY;
        mouseData.offsetX = config.offsetX;
        mouseData.offsetY = config.offsetY;
        mouseData.screenX = config.screenX;
        mouseData.screenY = config.screenY;
        mouseData.pageX = config.pageX;
        mouseData.pageY = config.pageY;
        socket.in(config.channel).emit("receive_wheel", mouseData);
    });

    /**
     * Remove peers from channel aka room
     * @param {*} channel
     */
    async function removePeerFrom(channel) {
        if (!(channel in socket.channels)) {
            log.debug("[" + socket.id + "] [Warning] not in ", channel);
            return;
        }

        delete socket.channels[channel];
        delete channels[channel][socket.id];
        delete peers[channel][socket.id];

        switch (Object.keys(peers[channel]).length) {
            case 0:
                // last peer disconnected from the room without room status set, delete room data
                delete peers[channel];
                break;
            case 1:
                // last peer disconnected from the room having room status set, delete room data
                if ("Locked" in peers[channel]) delete peers[channel];
                break;
        }
        log.debug("connected peers grp by roomId", peers);

        for (let id in channels[channel]) {
            await channels[channel][id].emit("removePeer", {
                peer_id: socket.id,
            });
            log.debug("[" + socket.id + "] emit removePeer [" + id + "]");
        }
    }
});

server.listen(port, '0.0.0.0', () => {
    log.debug(`Server Listen... ${port}`);
});
