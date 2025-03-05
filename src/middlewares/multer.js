import multer from "multer";
import path from "path";
import fs from "fs";

// Kiểm tra và tạo thư mục nếu chưa tồn tại
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration for images and videos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

// Storage configuration for Excel files
const excelStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "temp/");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, "restore-" + uniqueSuffix + path.extname(file.originalname));
    },
});

// File filter for images and videos
const fileFilter = (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "video/mp4"];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPEG, JPG, PNG, or MP4 files are allowed!"), false);
    }
};

// File filter for Excel files
const excelFileFilter = (req, file, cb) => {
    if (
        file.mimetype ===
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.mimetype === "application/vnd.ms-excel"
    ) {
        cb(null, true);
    } else {
        cb(new Error("Only Excel files are allowed!"), false);
    }
};

// Multer configuration for images and videos
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});

// Multer configuration for Excel files
export const uploadExcel = multer({
    storage: excelStorage,
    fileFilter: excelFileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
});
