import fs from "fs";
import cloudinary from "../config/cloudinary.js";
import sharp from "sharp"; // Import sharp để nén ảnh

export const uploadMedia = async (file) => {
  try {
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      const compressedFilePath = `uploads/compressed-${file.filename}`;

      await sharp(file.path)
        .resize(800) // Chỉnh kích thước ảnh, có thể thay đổi theo nhu cầu
        .jpeg({ quality: 80 }) // Nén ảnh với chất lượng giảm xuống (80%), có thể thay đổi
        .toFile(compressedFilePath);

      // Upload ảnh đã nén lên Cloudinary
      const result = await cloudinary.uploader.upload(compressedFilePath, {
        folder: "uploads",
        resource_type: "image", // Kiểu tài nguyên là hình ảnh
      });

      // Xóa các file tạm sau khi upload thành công
      fs.unlinkSync(file.path);
      fs.unlinkSync(compressedFilePath);

      return {
        message: "File uploaded and compressed successfully",
        url: result.secure_url, // Trả về URL của ảnh đã upload
      };
    } else {
      // Nếu file có kích thước nhỏ hơn giới hạn, upload trực tiếp lên Cloudinary
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "uploads",
        resource_type: "image",
      });

      // Xóa file tạm sau khi upload
      fs.unlinkSync(file.path);

      return {
        message: "File uploaded successfully",
        url: result.secure_url, // Trả về URL của ảnh đã upload
      };
    }
  } catch (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }
};
