const { Server } = require("socket.io");
const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const Logger = require("./Logger");
const bodyParser = require("body-parser");
const log = new Logger("server");
const port = process.env.PORT || 1227;

let channels = {}; // collect channels
let sockets = {}; // collect sockets
let peers = {}; // collect peers info grp by channels
let channel;
let peerId;
let peerName;
let urlParams;

let peerWebURLArr = [];

let io, server;

// const CORS_fn = (req, res) => {
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader(
//         "Access-Control-Allow-Headers",
//         "Origin, X-Requested-With, Content-Type, Accept"
//     );
//     res.setHeader("Access-Control-Allow-Credentials", "true");
//     res.setHeader("Access-Control-Allow-Methods", "*");
//     res.setHeader("Access-Control-Max-Age", "3600");

//     if (req.method === "OPTIONS") {
//         res.writeHead(200);
//         res.end();
//         return;
//     }
// };

server = require("http").createServer(app);

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

app.use(
    cors({
        origin: "*",
        credential: true,
    })
);

app.use(redirectSec);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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
app.use(express.static(path.join(__dirname, "./contents/")));
app.use(express.static(path.join(__dirname, "../views")));

app.use(express.json());

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

// app.post("/requestURL", async (req, res) => {
//     urlParams = req.query[0];
//     console.log("Response Site URL ", urlParams);
// });

// app.get("/receiveURL", async (req, res) => {
//     return res.status(200).json({
//         success: true,
//         url: urlParams,
//     });
// });

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

    socket.on("submit_address", (config) => {
        // 이 코드 리펙토링 필수!  - 참조 : /urlSearch
        peerWebURLArr.push(config.link);
        let peerWebURLArrSet = new Set(peerWebURLArr);
        let resultURLArr = Array.from(peerWebURLArrSet);

        log.debug("connected peers grp by Peer Address ", peers);

        socket.in(config.channel).emit("input_address", config.link);
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

    socket.on("join-contents", (channelName) => {
        socket.join(channelName);
    });

    socket.on("content-info", (channelName, userName, fileName, fileType) => {
        let data = {
            userName: userName,
            fileName: fileName,
            fileType: fileType,
        };
        socket.to(channelName).emit("input-content", data);
    });

    socket.on("play-origin", (channelName, fileName) => {
        socket.to(channelName).emit("play-remote", fileName);
    });

    socket.on("pause-origin", (channelName, fileName) => {
        socket.to(channelName).emit("pause-remote", fileName);
    });

    socket.on("volume-origin", (channelName, originVolume, fileName) => {
        socket.to(channelName).emit("volume-remote", originVolume, fileName);
    });

    socket.on("currentTime-origin", (channelName, currentTime, fileName) => {
        socket
            .to(channelName)
            .emit("currentTime-remote", currentTime, fileName);
    });

    socket.on(
        "scroll-origin",
        (channelName, originTop, originLeft, fileName) => {
            socket
                .to(channelName)
                .emit("scroll-remote", originTop, originLeft, fileName);
        }
    );

    socket.on("leave-contents", (channelName) => {
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

    // socket.on("active_mouseover", (config) => {
    //     socket.in(config.channel).emit("receive_mouseover", config);
    // });

    // socket.on("active_mouseup", (config) => {
    //     socket.in(config.channel).emit("receive_mouseup", config);
    // });

    socket.on("active_mousedown", (config) => {
        console.log(":::::::::Link ::::::::::::", config);
        socket.in(config.channel).emit("receive_mousedown", config);
    });

    // socket.on("active_mouseout", (config) => {
    //     socket.in(config.channel).emit("receive_mouseout", config);
    // });

    // socket.on("active_mousemove", (config) => {
    //     socket.in(config.channel).emit("receive_mousemove", config);
    // });

    socket.on("active_scroll", (config) => {
        console.log(config);
        socket.in(config.channel).emit("receive_scroll", config);
    });

    // socket.on("active_wheel", (config) => {
    //     socket.in(config.channel).emit("receive_wheel", config);
    // });

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

server.listen(port, () => {
    log.debug(`Server Listen... ${port}`);
});
