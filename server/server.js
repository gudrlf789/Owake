const express = require("express");
const app = express();
const path = require("path");
const server = require("http").createServer(app);
const io = require("socket.io")(server);

const firebase = require("firebase/app");
const firebaseConfig = require("./config/firebaseConfig.js");
const dotenv = require("dotenv");
dotenv.config();

require('firebase/firestore');
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const firebaseDB = db.collection("ChannelList");

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
app.use(express.static(path.join(__dirname, "../public/utils/parts")));
app.use(express.static(path.join(__dirname, "../public/img/favicon")));
app.use(express.static(path.join(__dirname, "../public/img/button")));
app.use(express.static(path.join(__dirname, "../views")));

app.use(express.urlencoded({
    extended: true
}));

app.use(express.json());

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/channel", (req, res, next) => {
    res.render("channel");
});

app.get("/channel/list", (req, res) => {
    const channelArray = [];

    db.collection("ChannelList").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            channelArray.push(doc.data());
        });

        return res.status(200).json({
            success: true,
            channelList: channelArray
        })
    }).catch((err) => {
        return res.status(500).json({
            success: false,
            error: err
        })
    });
});

app.post("/channel/register", async (req, res) => {
    const bodyData = req.body;
    const snapshot = await db.collection("ChannelList").where("channelName", "==", bodyData.channelName).get();

    if(snapshot.empty){
        // doc에 특정 이름을 설정하고 싶을때
        firebaseDB
            .doc(bodyData.channelName)
            .set(bodyData)
            /*db.collection("ChannelList").add({
            adminId: bodyData.adminId,
            adminPassword: bodyData.adminPassword,
            roomType: bodyData.roomType,
            channelName: bodyData.channelName,
            roomPassword: bodyData.roomPassword,
            roomTheme: bodyData.roomTheme,
            roomDescription: bodyData.roomDescription
        })*/
        .then((e) => {
            return res.status(200).json({
                success: true
            })
        })
        .catch((err) => {
            return res.status(500).json({
                success: false,
                error: err
            });
        })
    }else{
        return res.status(200).json({
            success : false
        });
    }
});

app.post("/channel/search", async (req, res) => {
    const bodyData = req.body;
    const channelArray = [];

    firebaseDB
        .where("channelName", ">=", bodyData.channelName)
        .where("channelName", "<=", bodyData.channelName + "\uf8ff")
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                channelArray.push(doc.data());
            });

            return res.status(200).json({
                success: true,
                channelList: channelArray,
            });
        })
        .catch((err) => {
            return res.status(500).json({
                success: false,
                error: err,
            });
        });
});

app.patch("/channel/update", (req, res) => {
    const bodyData = req.body;

    db.collection("ChannelList").doc(bodyData.channelName).update({
        channelType: bodyData.channelType,
        channelPassword: bodyData.channelPassword,
        channelCategory: bodyData.channelCategory,
        channelDescription: bodyData.channelDescription
    })
    .then((e) => {
        return res.status(200).json({
            success: true
        })
    })
    .catch((err) => {
        return res.status(500).json({
            success: false,
            error: err
        });
    });
});

app.post('/channel/delete', (req, res) => {
    const bodyData = req.body;

    db.collection("ChannelList").doc(bodyData.channelName).delete()
    .then((e) => {
        return res.status(200).json({
            success: true
        })
    })
    .catch((err) => {
        return res.status(500).json({
            success: false,
            error: err
        });
    });

});

app.post("/channel/info", (req, res) => {
    const bodyData = req.body;
    const channelArray = [];

    db.collection("ChannelList")
        .where("adminId", "==", bodyData.adminId)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                channelArray.push(doc.data());
            });

            return res.status(200).json({
                success: true,
                adminChannelList: channelArray
            });
        })
        .catch((err) => {
            return res.status(500).json({
                success: false,
                error: err,
            });
        });
});

io.on("connection", (socket) => {
    socket.on("join-room", (channelName) => {
        socket.join(channelName);
    });

    socket.on("leave-room", (channelName) => {
        socket.leave(channelName);
    });

    socket.on("submit_address", (address, channelName) => {
        socket.to(channelName).emit("input_address", address);
    });
});

const port = process.env.PORT || 1227;
server.listen(port, () => {
    console.log(`Server Listen... ${port}`);
});
