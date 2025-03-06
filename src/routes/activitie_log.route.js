import express from "express";
import {
    authMiddleware,
    roleMiddleware,
} from "../middlewares/authMiddleware.js";
import {
    downloadActivityLogs,
    getAllActivityLogs,
} from "../controllers/activity_log.controller.js";

const router = express.Router();

router.get("/", getAllActivityLogs);
router.post(
    "/download",
    authMiddleware,
    roleMiddleware(["admin"]),
    downloadActivityLogs
);
export default router;
