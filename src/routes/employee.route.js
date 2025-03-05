import express from "express";
import {
    getEmployees,
    getEmployeeById,
    updateEmployee,
    backupData,
    restoreData,
    updateEmployeeByAdmin,
} from "../controllers/employee.controller.js";
import {
    authMiddleware,
    roleMiddleware,
} from "../middlewares/authMiddleware.js";
import { upload, uploadExcel } from "../middlewares/multer.js";

const router = express.Router();

router.post(
    "/restoreEmployee",
    authMiddleware,
    roleMiddleware(["admin"]),
    uploadExcel.single("file"),
    restoreData
);
router.get(
    "/backupEmployee",
    authMiddleware,
    roleMiddleware(["admin"]),
    backupData
); // Đảm bảo route cụ thể ("/backup") khai báo trước
router.get("/", authMiddleware, roleMiddleware(["admin"]), getEmployees); // Route tổng quát ("/") khai báo sau

router.post(
    "/admin/:id",
    authMiddleware,
    roleMiddleware(["admin"]),
    updateEmployeeByAdmin
);
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware(["employee"]),
    getEmployeeById
);
router.post(
    "/:id",
    authMiddleware,
    roleMiddleware(["employee"]),
    upload.single("avatar"),
    updateEmployee
);

export default router;
