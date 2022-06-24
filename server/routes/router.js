let moment = require("moment");
const nowDate = moment().format("YYYY-MM-DD");
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
        cb(null, req.body.adminId + "_" + nowDate + "_" + file.originalname);
    },
});
const contentsStorage = multer.diskStorage({
    destination: function (req, res, cb) {
        fs.readdir(`./server/contents/${req.body.channelName}/${req.body.userName}`, (err) => {
            if (err) {
                fs.mkdirSync(`./server/contents/${req.body.channelName}/${req.body.userName}`);
                cb(null, `./server/contents/${req.body.channelName}/${req.body.userName}`);
            }else{
                cb(null, `./server/contents/${req.body.channelName}/${req.body.userName}`);
            }
        });
    },
    filename: function (req, file, cb) {
        if (req.body.userName) {
            cb(null, req.body.userName + "_" + file.originalname);
        } else {
            cb(null, file.originalname);
        }
    },
});

const upload = multer({
    storage: storage,
});
const contentsUpload = multer({
    storage: contentsStorage,
    limits: {
        fileSize: 1024 * 1024 * 150,
    },
});
const path = require("path");
const axios = require("axios");

/** Firebase Settings */
const firebase = require("firebase/app");
const firebaseConfig = require("../config/firebaseConfig.js");

require("firebase/firestore");
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const firebaseCollection = db.collection("ChannelList");
const FormData = require("form-data");

// 파일 사이즈 오류 핸들러
// const fileSizeLimitErrorHandler = (err, req, res, next) => {
//     if (err) {
//         console.debug("err : fileSizeLimitErrorHandler Error!!!");
//         res.write("Please check the file size (2MB or less)");
//         res.end();
//     } else {
//         next();
//     }
// };

//uploads 폴더 없을시 생성
fs.readdir("./server/uploads", (err) => {
    if (err) {
        fs.mkdirSync("./server/uploads");
    }
});

//contents 폴더 없을시 생성
fs.readdir("./server/contents", (err) => {
    if (err) {
        fs.mkdirSync("./server/contents");
    }
});

//날짜마다 이미지 파일들 관리할수 있게 날짜 폴더 생성
/*fs.readdir(`./server/uploads/${nowDate}`, (err) => {
    if (err) {
        fs.mkdirSync(`./server/uploads/${nowDate}`);
    }
});*/

let fileName;
let jwt;

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
    bodyData.imageName =
        bodyData.adminId + "_" + nowDate + "_" + bodyData.imageName;
    bodyData.userNames = [];

    const docName =
        bodyData.channelName.replace(/\s/gi, "") + bodyData.channelType;

    fs.readdir(`./server/contents/${bodyData.channelName}`, (err) => {
        if (err) {
            fs.mkdirSync(`./server/contents/${bodyData.channelName}`);
        }
    });

    const snapshot = await firebaseCollection
        .where("channelName", "==", bodyData.channelName)
        .where("channelType", "==", bodyData.channelType)
        .get();

    if (snapshot.empty) {
        bodyData.registreTime = firebase.firestore.FieldValue.serverTimestamp();
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
        bodyData.channelName.replace(/\s/gi, "") + bodyData.channelType;
    const imageUpdateYN = bodyData.imageName.indexOf(bodyData.adminId);
    
    fileName = bodyData.imageName;

    firebaseCollection
        .doc(docName)
        .update({
            channelPassword: bodyData.channelPassword,
            channelCategory: bodyData.channelCategory,
            governType: bodyData.governType,
            imageName:
                imageUpdateYN < 0
                    ? bodyData.adminId + "_" + nowDate + "_" + fileName
                    : fileName,
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
        })
        .catch((err) => {
            return res.status(413).json({
                success: false,
                error: err,
            });
        });
});

router.post("/delete", (req, res) => {
    const bodyData = req.body;
    const docName =
        bodyData.channelName.replace(/\s/gi, "") + bodyData.channelType;
    const imagePath = path.join(__dirname, `../uploads/${bodyData.imageName}`);

    firebaseCollection
        .doc(docName)
        .get()
        .then((doc) => {
            if (doc.exists) {
                realDeleteData(docName, res);
                // 이미지 삭제
                try {
                    if (fs.statSync(imagePath)) {
                        fs.unlinkSync(imagePath);
                    }

                    fs.rmdir(`./server/contents/${bodyData.channelName}`,{ recursive: true }, err => {
                        console.log("err : ", err);
                    })
                } catch (err) {
                    if (err.code === "ENOENT") {
                        console.log(
                            `${bodyData.channelName} Channels are channels that do not exist`
                        );
                    }
                }
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

router.post("/info", async (req, res) => {
    const bodyData = req.body;
    const docName =
        bodyData.channelName.replace(/\s/gi, "") + bodyData.channelType;

    const snapshot = await firebaseCollection.doc(docName).get();

    if (snapshot.exists) {
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
    } else {
        return res.status(200).json({
            success: false,
            error: "It's a channel that doesn't exist",
        });
    }
});
/**
 * @anthor 박형길
 * @date 2022.03.22
 * @version 1.0
 * @descrption
 * 유저 이름 DB에 등록
 */
router.post("/enrollUserNameOnChannel", async (req, res) => {
    const bodyData = req.body;
    const docName =
        bodyData.channelName.replace(/\s/gi, "") + bodyData.channelType;

    firebaseCollection
        .doc(docName)
        .update({
            userNames: firebase.firestore.FieldValue.arrayUnion(
                bodyData.userId
            ),
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

/**
 * @anthor 박형길
 * @date 2022.03.22
 * @version 1.0
 * @descrption
 * 유저 이름 DB에서 삭제
 */
router.post("/removeUserNameOnChannel", async (req, res) => {
    const bodyData = req.body;
    const docName =
        bodyData.channelName.replace(/\s/gi, "") + bodyData.channelType;

    fs.rmdir(`./server/contents/${bodyData.channelName}/${bodyData.userId}`,{ recursive: true }, err => {
        console.log("err : ", err);
    });

    firebaseCollection
        .doc(docName)
        .update({
            userNames: firebase.firestore.FieldValue.arrayRemove(
                bodyData.userId
            ),
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

/**
 * @anthor 박형길
 * @date 2022.03.25
 * @version 1.0
 * @descrption
 * trustOS api 사용하여 파일 해쉬화
 *
 */
router.post("/jwt", async (req, res) => {
    const bodyData = req.body;
    bodyData.id = process.env.trustOsId;
    bodyData.password = process.env.trustOsPassword;

    axios
        .post("https://pro.virtualtrust.io/cert/login", bodyData)
        .then((result) => {
            jwt = result.data.message;
            return res.json({
                success: true,
            });
        })
        .catch((err) => {
            return res.json({
                success: false,
                error: err,
            });
        });
});

router.post(
    "/hashFile",
    contentsUpload.single("fileInput"),
    async (req, res) => {
        const formData = new FormData();

        fs.readFile(`./server/contents/${req.body.channelName}/${req.body.userName}/${req.file.filename}`, (err, data) => {
            formData.append("fileInput", data, {
                filename: req.file.originalname,
            });

            axios
                .post(
                    "https://pro.virtualtrust.io/cert/certificate/file/hash",
                    formData,
                    {
                        headers: {
                            ...formData.getHeaders(),
                            Authorization: "Bearer " + jwt,
                        },
                        maxContentLength: Infinity,
                        maxBodyLength: Infinity
                    },
                )
                .then((result) => {
                    fs.unlinkSync(`./server/contents/${req.body.channelName}/${req.body.userName}/${req.file.filename}`);
                    return res.json({
                        hashCode: result.data.output.file_hash,
                    });
                })
                .catch((err) => {
                    return res.json({
                        error: err,
                    });
                });
        });
    }
);

router.post(
    "/contentsUpload",
    contentsUpload.single("content"),
    async (req, res) => {
        return res.status(200).json({
            success: true,
        });
    }
);

router.post("/contentsDelete", async (req, res) => {
    const bodyData = req.body;

    if (fs.existsSync(`./server/contents/${bodyData.channelName}/${bodyData.userName}/${bodyData.fileName}`)) {
        try {
            fs.unlinkSync(`./server/contents/${bodyData.channelName}/${bodyData.userName}/${bodyData.fileName}`);
            return res.status(200).json({
                success: true,
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                result: err,
            });
        }
    } else {
        return res.status(200).json({
            success: false,
            result: "No files exist",
        });
    }
});

router.get("/downloadPdf", async (req, res) => {
    /*fs.readFile("./server/contents/리눅스 명령어.pdf", (err, data) => {
        res.setHeader('Content-Type', 'application/octet-stream');
        res.send(data);
    });*/

    const fileName = req.query.fileName;
    const channelName = req.query.channelName;
    const userName = req.query.userName;
    res.download(`./server/contents/${channelName}/${userName}/${fileName}`);
});

router.post("/channelFirstSpinnerDelete", (req, res) => {
    return res.status(200).json({
        success: true,
    });
});

module.exports = router;