let express = require("express");
let router = express.Router();

/** Firebase Settings */
const firebase = require("firebase/app");
const firebaseConfig = require("../config/firebaseConfig.js");

require("firebase/firestore");
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const firebaseCollection = db.collection("ChannelList");

router.get("/list", (req, res, next) => {
    const roomArray = [];
    firebaseCollection
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
    const snapshot = await firebaseCollection
        .where("channelName", "==", bodyData.channelName)
        .get();

    if (snapshot.empty) {
        // doc에 특정 이름을 설정하고 싶을때
        firebaseCollection
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

    firebaseCollection
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

    firebaseCollection
        .doc(bodyData.channelName)
        .update({
            channelType: bodyData.channelType,
            channelPassword: bodyData.channelPassword,
            channelCategory: bodyData.channelCategory,
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

router.post("/delete", (req, res) => {
    const bodyData = req.body;

    firebaseCollection
        .doc(bodyData.channelName)
        .delete()
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

router.post("/info", (req, res) => {
    const bodyData = req.body;
    const channelArray = [];

    firebaseCollection
        .where("adminId", "==", bodyData.adminId)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                channelArray.push(doc.data());
            });

            return res.status(200).json({
                success: true,
                adminChannelList: channelArray,
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
