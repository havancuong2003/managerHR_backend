// controller process logic API
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import Role from "../models/role.model.js";
import cloudinary from "../config/cloudinary.js";
import { uploadMedia } from "../utils/upload-media-helpers.js";
import RefreshToken from "../models/refresh_token.model.js";
import {
    generateAccessToken,
    generateRefreshToken,
} from "../middlewares/authMiddleware.js";
import jwt from "jsonwebtoken";

export const getRoleId = async (roleName) => {
    try {
        const role = await Role.findOne({ name: roleName });
        return role._id;
    } catch (error) {
        console.log("Error when getRoleId:", error);
        return null;
    }
};
const register = async (req, res) => {
    try {
        const {
            fullName,
            dob,
            gender,
            address,
            phone,
            department,
            position,
            base_salary,
            startDate,
        } = req.body;
        // Check if phone already exists
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return res
                .status(400)
                .json({ message: "phone number đã được sử dụng!" });
        }

        const hashedPassword = await bcrypt.hash("123", 10);
        let avatarUrl = "";
        const roleId = await getRoleId("employee");

        if (req.file) {
            // Upload the single file (avatar)
            const responseAfterUpload = await uploadMedia(req.file);
            avatarUrl = responseAfterUpload.url; // Use the URL returned from Cloudinary
        }

        const user = new User({
            fullName,
            dob,
            gender,
            address,
            phone,
            departmentId: department,
            positionId: position,
            base_salary,
            startDate,
            password: hashedPassword,
            roleId: roleId,
            avatarUrl,
        });

        await user.save();
        return res.status(201).json({ user });
    } catch (error) {
        console.log("Error while registering:", error);
        return res.status(500).json({ message: "Server error!" });
    }
};

const login = async (req, res) => {
    try {
        const { phone, password } = req.body;
        const user = await User.findOne({ phone }).populate("roleId");

        if (!user) {
            return res.status(401).json({ error: "Invalid phone or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid phone or password" });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = await generateRefreshToken(user);

        // res.cookie("refreshToken", refreshToken, {
        //     httpOnly: true,
        //     secure: process.env.NODE_ENV === "production",
        //     sameSite: "Strict",
        //     maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
        // });

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 5 * 60 * 1000, // 5 phút
        });

        res.status(200).json({
            role: user.roleId.name,
            accessToken,
            userId: user._id,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const refreshToken = async (req, res) => {
    try {
        const { userId } = req.body; // ✅ Nhận userId từ frontend

        if (!userId) {
            return res.status(400).json({ error: "No userId provided" });
        }

        // ✅ Tìm User trong Database
        const user = await User.findById(userId).populate("roleId");
        if (!user) {
            return res.status(403).json({ error: "User not found" });
        }

        // ✅ Kiểm tra Refresh Token trong Database
        const refreshTokenOld = await RefreshToken.findOne({ userId });

        if (!refreshTokenOld) {
            return res
                .status(403)
                .json({ error: "No valid refresh token found" });
        }

        // ✅ Kiểm tra Refresh Token có hết hạn không
        if (refreshTokenOld.expiresAt < new Date()) {
            // ✅ Nếu hết hạn, xóa Refresh Token khỏi DB
            await RefreshToken.deleteOne({ userId });
            return res
                .status(403)
                .json({ error: "Refresh token expired, please login again" });
        }

        // ✅ Giải mã Refresh Token
        try {
            const decode = jwt.verify(
                refreshTokenOld.token,
                process.env.JWT_REFRESH_SECRET
            );
        } catch (err) {
            await RefreshToken.deleteOne({ userId }); // ✅ Xóa nếu token không hợp lệ
            return res
                .status(403)
                .json({ error: "Invalid refresh token, please login again" });
        }

        // ✅ Tạo Access Token mới
        const newAccessToken = generateAccessToken(user);

        // ✅ Lưu Access Token mới vào Cookie
        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 5 * 60 * 1000, // 5  phut
        });

        // ✅ Trả về Access Token mới
        res.status(200).json({
            accessToken: newAccessToken,
            role: user.roleId.name,
            userId: user._id,
        });
    } catch (error) {
        console.error("Error in refreshToken:", error);
        res.status(500).json({ error: error.message });
    }
};

const logout = async (req, res) => {
    try {
        const accessToken = req.cookies.accessToken;
        const payload = jwt.verify(accessToken, process.env.JWT_SECRET);

        const user = await User.findById(payload.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await RefreshToken.deleteOne({ userId: user._id });

        // res.clearCookie("refreshToken", {
        //     httpOnly: true,
        //     secure: true,
        //     sameSite: "Strict",
        // });
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: true,
            sameSite: "Strict",
        });

        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export { register, login, logout };
