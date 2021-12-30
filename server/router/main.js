//let moment = require("moment");
//const nowDate = moment().format("YYYY-MM-DD");
//const nowDateAndTime = moment().format("YYYY-MM-DD h:mm:ss a");
const fs = require("fs");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = multer.diskStorage({
    destination: function (req, res, cb) {
        cb(null, `./server/uploads`);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage: storage });

/** Firebase Settings */
const firebase = require("firebase/app");
const firebaseConfig = require("../config/firebaseConfig.js");

require("firebase/firestore");
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const firebaseCollection = db.collection("ChannelList");

//uploads 폴더 없을시 생성
fs.readdir("./server/uploads", (err) => {
    if (err) {
        fs.mkdirSync("./server/uploads");
    }
});

//날짜마다 이미지 파일들 관리할수 있게 날짜 폴더 생성
/*fs.readdir(`./server/uploads/${nowDate}`, (err) => {
    if (err) {
        fs.mkdirSync(`./server/uploads/${nowDate}`);
    }
});*/

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
    const docName =
        bodyData.adminId +
        bodyData.adminPassword +
        bodyData.channelName +
        bodyData.channelType;

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
        .where("channelType", "==", bodyData.channelType)
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

router.post("/update", upload.single("image"), async (req, res) => {
    const bodyData = req.body;
    const docName =
        bodyData.adminId +
        bodyData.adminPassword +
        bodyData.channelName +
        bodyData.channelType;

    firebaseCollection
        .doc(docName)
        .update({
            channelPassword: bodyData.channelPassword,
            channelCategory: bodyData.channelCategory,
            imageName: bodyData.imageName,
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
    const docName =
        bodyData.adminId +
        bodyData.adminPassword +
        bodyData.channelName +
        bodyData.channelType;

    firebaseCollection
        .doc(docName)
        .get()
        .then((doc) => {
            if (doc.exists) {
                realDeleteData(docName, res);
            } else {
                return res.status(200).json({
                    success: false,
                });
            }
        });
});

function realDeleteData(docName, res) {
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
}

router.post("/info", (req, res) => {
    const bodyData = req.body;
    const docName =
        bodyData.adminId +
        bodyData.adminPassword +
        bodyData.channelName +
        bodyData.channelType;
    const channelInfo = [];

    firebaseCollection
        .doc(docName)
        .get()
        .then((doc) => {
            if (doc.exists) {
                return res.status(200).json({
                    success: true,
                    channelInfo: doc.data(),
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
