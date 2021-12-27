const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = multer.diskStorage({
    destination: function(req, res, cb) {
        cb(null, '/server/uploads')
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname + '-' + Date.now());
    }
});
const upload = multer({ storage: storage });

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

router.get("/kronosaChannelList", (req, res, next) => {
    const roomArray = [];
    firebaseCollection
        .where("Kronosa", "==", "Y")
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

router.post("/register", upload.single("image"), async (req, res) => {
    const bodyData = req.body;
    const docName = bodyData.adminId+bodyData.adminPassword+bodyData.channelName+bodyData.channelType;

    const snapshot = await firebaseCollection
        .where("channelName", "==", bodyData.channelName)
        .where("channelType", "==", bodyData.channelType)
        .get();

    if (snapshot.empty) {
        bodyData.registreTime = firebase.firestore.FieldValue.serverTimestamp();
        bodyData.privateId = docName;
        bodyData.Kronosa = "N";

        // doc에 특정 이름을 설정하고 싶을때
        firebaseCollection
            .doc(docName)
            .set(bodyData)
            .then((e) => {
                return res.status(200).json({
                    success: true
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
            success: false
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
    const docName = bodyData.adminId+bodyData.adminPassword+bodyData.channelName+bodyData.channelType;

    firebaseCollection
        .doc(docName)
        .update({
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
    const docName = bodyData.adminId+bodyData.adminPassword+bodyData.channelName+bodyData.channelType;

    firebaseCollection
        .doc(docName)
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
    const docName = bodyData.adminId+bodyData.adminPassword+bodyData.channelName+bodyData.channelType;
    const channelInfo = [];

    firebaseCollection
        .doc(docName)
        .get()
        .then((doc) => {
            if(doc.exists){
                return res.status(200).json({
                    success: true,
                    channelInfo: channelInfo.push(doc.data())
                });
            }
        })
        .catch((err) => {
            return res.status(500).json({
                success: false,
                error: err,
            });
        });
});

module.exports = router;
