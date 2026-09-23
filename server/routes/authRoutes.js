const express = require("express");

const router = express.Router();

const { register, login } = require("../controllers/authController");
router.post("/login", login);

router.post("/register", register);
const authMiddleware = require("../middleware/authMiddleware");
router.get("/protected", authMiddleware, (req, res) => {
    res.json({
        message: "You accessed a protected route",
        user: req.user
    });
});
module.exports = router;