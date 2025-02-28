import multer from "multer";
import path from "path";
import fs from "fs";

// Kiểm tra và tạo thư mục nếu chưa tồn tại
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Lưu vào thư mục uploads
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const fileFilter = (req, file, cb) => {
    // Cho phép các file ảnh JPEG, JPG, PNG và video MP4
    const allowedTypes = /jpeg|jpg|png|mp4/;
    const extname = allowedTypes.test(
        path.extname(file.originalname).toLowerCase()
    );

    if (extname) {
        cb(null, true); // Cho phép file hợp lệ
    } else {
        cb(new Error("Only JPEG, JPG, PNG, or MP4 files are allowed!")); // Hiển thị lỗi khi file không hợp lệ
    }
};

export const upload = multer({
    storage,
    fileFilter,
});
