const express = require("express");
const router = express.Router();

//@route    GET api/profiles/test
//@desc     Tests profiles route
//@access   Public route
router.get("/test", (req, res) => res.json({ message: "profile Works" }));

module.exports = router;
