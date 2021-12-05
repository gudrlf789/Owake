const express = require("express");
const app = express();
const path = require("path");
const bodyParder = require("body-parser");
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const firebase = require("firebase/app");

const dotenv = require("dotenv");
dotenv.config();

require("firebase/firestore");
const firebaseConfig = require("./config/firebaseConfig.js");

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

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

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.static(path.join(__dirname, "../public/css")));
app.use(express.static(path.join(__dirname, "../public/img")));
app.use(express.static(path.join(__dirname, "../public/lib")));
app.use(express.static(path.join(__dirname, "../public/utils")));
app.use(express.static(path.join(__dirname, "../public/img/favicon")));
app.use(express.static(path.join(__dirname, "../public/img/button")));
app.use(express.static(path.join(__dirname, "../views")));
app.use(
    bodyParder({
        extended: true,
    })
);
app.use(bodyParder.json());

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/room", (req, res, next) => {
    res.render("room");
});

app.post("/room/register", async (req, res) => {
    const bodyData = req.body;
    const snapshot = await db
        .collection("RoomList")
        .where("roomName", "==", bodyData.roomName)
        .get();

    if (snapshot.empty) {
        // doc에 특정 이름을 설정하고 싶을때
        //db.collection("RoomList").doc(bodyData.roomName).set(bodyData)
        db.collection("RoomList")
            .add({
                adminId: bodyData.adminId,
                adminPassword: bodyData.adminPassword,
                roomName: bodyData.roomName,
                roomType: bodyData.roomType,
                roomPassword: bodyData.roomPassword,
                roomTheme: bodyData.roomTheme,
                roomIntroduce: bodyData.roomIntroduce,
            })
            .then((e) => {
                return res.status(200).json({
                    success: true,
                });
            })
            .catch((err) => {
                return res.status(500).json({
                    success: false,
                    error: err,
                });
            });
    } else {
        return res.status(200).json({
            success: false,
        });
    }
});

app.post("/room/search", async (req, res) => {
    const bodyData = req.body;
    const roomArray = [];

    db.collection("RoomList")
        .where("roomName", ">=", bodyData.roomName)
        .where("roomName", "<=", bodyData.roomName + "\uf8ff")
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                roomArray.push(doc.data());
            });

            return res.status(200).json({
                success: true,
                roomList: roomArray,
            });
        })
        .catch((err) => {
            return res.status(500).json({
                success: false,
                error: err,
            });
        });
});

app.post("/room/update", async (req, res) => {});

io.on("connection", (socket) => {
    socket.on("join-room", (roomName) => {
        socket.join(roomName);
    });

    socket.on("leave-room", (roomName) => {
        socket.leave(roomName);
    });

    socket.on("submit_address", (address, roomName) => {
        socket.to(roomName).emit("input_address", address);
    });
});

const port = process.env.PORT || 1227;
server.listen(port, () => {
    console.log(`Server Listen... ${port}`);
});
