let express = require("express");
let router = express.Router();

router.get("/", (req, res, next) => {
    res.render("channel", { title: "Owake Channel" });
});

module.exports = router;
