import express from "express";
import {
    login,
    refreshToken,
    register,
    logout,
} from "../controllers/auth.controller.js";
import {
    authMiddleware,
    roleMiddleware,
} from "../middlewares/authMiddleware.js";

const router = express.Router();
import { upload } from "../middlewares/multer.js";

router.post(
    "/register",
    upload.single("avatar"),
    authMiddleware,
    roleMiddleware(["admin"]),
    register
);

router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);

export default router;
