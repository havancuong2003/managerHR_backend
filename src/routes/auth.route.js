import express from "express";
import {
    login,
    refreshToken,
    register,
} from "../controllers/auth.controller.js";

const router = express.Router();
import { upload } from "../middlewares/multer.js";

router.post("/register", upload.single("avatar"), register);

router.post("/login", login);
router.post("/refresh-token", refreshToken);

export default router;
