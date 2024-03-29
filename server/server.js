const { Server } = require("socket.io");
const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const Logger = require("./Logger");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const log = new Logger("server");
require("dotenv").config();
const port = process.env.PORT || 1227;

let channels = {}; // collect channels
let sockets = {}; // collect sockets
let peers = {}; // collect peers info grp by channels
let channel;
let peerId;
let peerName;
let peerWebURLArr = [];

let urlObj = {};

let io, server;

server = require("http").createServer(app);

io = new Server({
    /**
     * 참조
     * https://stackoverflow.com/questions/29073746/socket-io-disconnect-event-transport-close-client-namespace-disconnect
     */
    pingInterval: 25000,
    pingTimeout: 180000,
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

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Max-Age", "3600");

    next();
});

app.use(redirectSec);
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(
    cookieParser(process.env.COOKIE_SECRET, { sameSite: "none", secure: true })
);

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.static(path.join(__dirname, "../public/css")));
app.use(express.static(path.join(__dirname, "../public/img")));
app.use(express.static(path.join(__dirname, "../public/lib")));
app.use(express.static(path.join(__dirname, "../public/utils")));
app.use(express.static(path.join(__dirname, "../public/utils/parts")));
app.use(express.static(path.join(__dirname, "../public/icons")));
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

app.get("/map", (req, res, next) => {
    // res.render("index");
    res.render("map");
});

app.get("/:channelName/:channelType/:governType", (req, res) => {
    let appID = "50b9cd9de2d54849a139e3db52e7928a";

    if (req.params.governType === "WE") {
        res.render("channel", {
            channelName: req.params.channelName,
            channelType: req.params.channelType,
            appID,
        });
    } else {
        res.render("igovern-channel", {
            channelName: req.params.channelName,
            channelType: req.params.channelType,
            appID,
        });
    }
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

app.get("/requestURL", (req, res, next) => {
    console.log({ url: req.query[0] });
    urlObj.link = req.query[0];
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

io.sockets.on("connect", (socket) => {
    // io.on("connection", (socket) => {
    socket.channels = {};
    sockets[socket.id] = socket;

    log.debug("[" + socket.id + "] connection accepted");

    ///// igovern //////////////////////////////////////

    socket.on("igovern-join-channel", (channelName) => {
        socket.join(channelName);
    });

    socket.on("igovern-leave-channel", (channelName) => {
        socket.leave(channelName);
    });

    socket.on("igoven-fileDevery", (channelName, deliveryActive) => {
        socket.to(channelName).emit("igoven-fileDevery-client", deliveryActive);
    });

    socket.on("igoven-fileHash", (channelName, identifireActivator) => {
        socket
            .to(channelName)
            .emit("igoven-fileHash-client", identifireActivator);
    });

    socket.on("igoven-momentShare", (channelName, momentShareActive) => {
        socket
            .to(channelName)
            .emit("igoven-momentShare-client", momentShareActive);
    });

    socket.on("igoven-contentShare", (channelName, contentShareActive) => {
        socket
            .to(channelName)
            .emit("igoven-contentShare-client", contentShareActive);
    });

    socket.on(
        "igoven-choice-host-media",
        (channelName, fileType, choiceFile, originUser) => {
            socket
                .to(channelName)
                .emit(
                    "igoven-play-host-media",
                    fileType,
                    choiceFile,
                    originUser
                );
        }
    );

    socket.on("igoven-pdfShare", (channelName, pdfShareActive) => {
        socket.to(channelName).emit("igoven-pdfShare-client", pdfShareActive);
    });

    socket.on(
        "igoven-choice-host-pdf",
        (channelName, originUser, choicedFile, currentPage) => {
            socket
                .to(channelName)
                .emit(
                    "igoven-play-host-pdf",
                    originUser,
                    choicedFile,
                    currentPage
                );
        }
    );

    socket.on("igoven-whiteBoard", (channelName, whiteBoardBtnActive) => {
        socket
            .to(channelName)
            .emit("igoven-whiteBoard-client", whiteBoardBtnActive);
    });

    socket.on("igoven-whiteBoard-clearAll", (channelName) => {
        socket.to(channelName).emit("igoven-whiteBoard-clearAll-client");
    });

    socket.on("igoven-audioMixing", (channelName, audioMixActive) => {
        socket
            .to(channelName)
            .emit("igoven-audioMixing-client", audioMixActive);
    });

    /////////////////////////////////////////////////////

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

        // resultURLArr.forEach((url) => {
        //     peers[config.channel][config.peerID] = {
        //         web: url,
        //     };
        // });

        log.debug("connected peers grp by Peer Address ", peers);

        socket.in(config.channel).emit("input_address", config.link);
    });

    socket.on("web-origin-info", (channelName, tabURL, iframeInit) => {
        socket.to(channelName).emit("web-remote-info", tabURL, iframeInit);
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

    socket.on("file-meta", (metadata) => {
        let file = metadata;
        //broadcast 동일하게 가능 자신 제외 룸안의 유저
        socket.in(file.channel).emit("fs-meta", file);
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

    socket.on("play-origin", (channelName, fileName, currentTime) => {
        socket.to(channelName).emit("play-remote", fileName, currentTime);
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

    socket.on("delete-origin-tag", (channelName, deleteTagName) => {
        socket.to(channelName).emit("delete-remote-tag", deleteTagName);
    });

    socket.on("leave-contents", (channelName) => {
        socket.leave(channelName);
    });

    socket.on("join-pdf", (channelName) => {
        socket.join(channelName);
    });

    socket.on("pdf-info", (channelName, userName, fileName, fileType) => {
        let data = {
            userName: userName,
            fileName: fileName,
            fileType: fileType,
        };
        socket.to(channelName).emit("input-pdf", data);
    });

    socket.on("delete-origin-pdf-tag", (channelName, deleteTagName) => {
        socket.to(channelName).emit("delete-remote-pdf-tag", deleteTagName);
    });

    socket.on("pdf-origin-next", (channelName, nextPage, fileName) => {
        socket.to(channelName).emit("pdf-remote-next", nextPage, fileName);
    });

    socket.on("pdf-origin-previous", (channelName, previousPage, fileName) => {
        socket
            .to(channelName)
            .emit("pdf-remote-previous", previousPage, fileName);
    });

    socket.on("pdf-origin-pageNumber", (channelName, desiredPage, fileName) => {
        socket
            .to(channelName)
            .emit("pdf-remote-pageNumber", desiredPage, fileName);
    });

    socket.on(
        "scroll-origin-pdf",
        (channelName, originTop, originLeft, fileName) => {
            socket
                .to(channelName)
                .emit("scroll-remote-pdf", originTop, originLeft, fileName);
        }
    );

    socket.on("leave-pdf", (channelName) => {
        socket.leave(channelName);
    });

    /**
     * STT Translator Communication
     */

    socket.on("speech-join", (params) => {
        console.log(`Speech-Socket Channel-Join: ${JSON.stringify(params)}`);
        socket.join(params.channel);
    });

    socket.on("speech-leave", (params) => {
        console.log(`${params.peer} Speech-Socket-OFF!`);
        socket.leave(params.channel);
    });

    // socket.on("subTitleBox-enable", (params) => {
    //     console.log("subTitleBox-enable", params);
    //     socket.in(params.channel).emit("subtitle-box-on", params);
    // });

    // socket.on("subTitleBox-disable", (params) => {
    //     console.log("subTitleBox-disable", params);
    //     socket.leave(params.channel);
    //     socket.in(params.channel).emit("subtitle-box-off", params);
    // });

    socket.on("speech-send", (params) => {
        socket.in(params.channel).emit("speech-receive", params);
    });

    /**
     * Maps Point
     */

    socket.on("map-point", (params) => {
        socket.emit("receive-point", params);
    });

    socket.on("caller", (id) => {
        log.debug("Caller :::", id);
        socket.emit("Recipients", id);
    });

    /**
     * @Author 전형동
     * @param {*} mouseEvent
     * @Date 2022 04 12
     * @Description
     * Socket Mouse Event
     * @returns pageX, pageY, clientX, clientY, offsetX, offsetY, screenX, screenY
     */

    // socket.on("active_mousedown", (config) => {
    //     console.log(":::::::::Link ::::::::::::", config);
    //         socket.in(config.channel).emit("receive_mousedown", config);
    // });

    socket.on("active_click", (config) => {
        console.log(":::::::::Link ::::::::::::", config);
        if (config.link === null) {
            setTimeout(() => {
                log.debug("Socket 전달할 Link ::", urlObj.link);
                config.link = urlObj.link;
                socket.in(config.channel).emit("receive_click", config);
            }, 100);
        }

        config.link = null;
    });

    // socket.on("active_touchend", (config) => {
    //     console.log(":::::::::Link ::::::::::::", config);
    //     socket.in(config.channel).emit("receive_touchend", config);
    // });

    // socket.on("active_scroll", (config) => {
    //     console.log(config);
    //     socket.in(config.channel).emit("receive_scroll", config);
    // });

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
