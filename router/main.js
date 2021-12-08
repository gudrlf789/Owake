let express = require("express");
let router = express.Router();

/** Firebase Settings */
const firebase = require("firebase/app");
const firebaseConfig = require("../server/config/firebaseConfig.js");

require("firebase/firestore");
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const firebaseDB = db.collection("ChannelList");
/** Firebase Settings End */

router.get("/", (req, res, next) => {
    res.render("index", { title: "Owake" });
});

router.get("/list", (req, res, next) => {
    const roomArray = [];
    firebaseDB
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                roomArray.push(doc.data());
            });

            return res.status(200).json({
                success: true,
                channelList: roomArray,
            });
        })
        .catch((err) => {
            return res.status(500).json({
                success: false,
                error: err,
            });
        });
});

router.post("/register", async (req, res) => {
    const bodyData = req.body;
    const snapshot = await firebaseDB
        .where("channelName", "==", bodyData.channelName)
        .get();

    if (snapshot.empty) {
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

router.post("/search", async (req, res) => {
    const bodyData = req.body;
    const roomArray = [];

    firebaseDB
        .where("channelName", ">=", bodyData.channelName)
        .where("channelName", "<=", bodyData.channelName + "\uf8ff")
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                roomArray.push(doc.data());
            });

            return res.status(200).json({
                success: true,
                channelList: roomArray,
            });
        })
        .catch((err) => {
            return res.status(500).json({
                success: false,
                error: err,
            });
        });
});

router.post("/update", async (req, res) => {
    const bodyData = req.body;

    firebaseDB
        .doc(bodyData.channelName)
        .update({
            channelType: bodyData.channelType,
            channelPassword: bodyData.channelPassword,
            channelTheme: bodyData.channelTheme,
            channelDescription: bodyData.channelDescription,
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
});

module.exports = router;
