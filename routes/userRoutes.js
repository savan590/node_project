const express = require("express");
const { register, login, listUsers, getUserDetails } = require("../controller/user");
const { authMiddleware, isAdmin } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/users", [authMiddleware, isAdmin], listUsers);
router.get("/users/:userId", authMiddleware, getUserDetails);

module.exports = router;
