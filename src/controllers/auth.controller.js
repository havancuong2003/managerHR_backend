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
import ActivityLog from "../models/activity_log.model.js";
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
        const validation = validateRegisterData(req.body);
        if (!validation.isValid) {
            return res.status(400).json({ message: validation.message });
        }
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
        const userWithOutPassword = await User.findById(user._id).select(
            "-password"
        );
        console.log("user", user);

        const saveLogs = await ActivityLog.create({
            userId: req.user._id,
            action: "create",
            affected_userId: user._id,
            old_data: null,
            new_data: userWithOutPassword,
            roleName: req.user.roleId.name,
        });
        return res.status(201).json({ user });
    } catch (error) {
        console.log("Error while registering:", error);
        return res.status(500).json({ message: "Server error!" });
    }
};

// validate.js - Tạo hàm validate riêng
const validateRegisterData = (data) => {
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
    } = data;

    // Validate fullName: Ít nhất 3 ký tự
    if (!fullName || fullName.length < 3) {
        return { isValid: false, message: "Tên ít nhất 3 ký tự" };
    }

    // Validate dob: Ngày sinh phải hợp lệ và phải là trong quá khứ
    if (!dob || isNaN(Date.parse(dob)) || new Date(dob) >= new Date()) {
        return { isValid: false, message: "Ngày sinh phải ở trong quá khứ" };
    }

    // Validate gender: Chỉ chấp nhận "Nam" hoặc "Nữ"
    if (!gender || !["Nam", "Nữ"].includes(gender)) {
        return {
            isValid: false,
            message: "Giới tính chỉ có thể là Nam hoặc Nữ",
        };
    }

    // Validate address: Địa chỉ ít nhất 5 ký tự
    if (!address || address.length < 5) {
        return { isValid: false, message: "Địa chỉ ít nhất 5 ký tự" };
    }

    // Validate phone: Số điện thoại phải có 10 chữ số
    if (!phone || !/^\d{10}$/.test(phone)) {
        return { isValid: false, message: "Số điện thoại phải có 10 số" };
    }

    // Validate department: Phòng ban không được trống
    if (!department || department.length < 1) {
        return { isValid: false, message: "Chọn phòng ban" };
    }

    // Validate position: Chức vụ không được trống
    if (!position || position.length < 1) {
        return { isValid: false, message: "Chọn chức vụ" };
    }

    // Validate base_salary: Lương tối thiểu 3 triệu
    if (!base_salary || base_salary < 3000000) {
        return { isValid: false, message: "Lương tối thiểu 3 triệu" };
    }

    // Validate startDate: Ngày bắt đầu phải ở trong tương lai
    if (
        !startDate ||
        isNaN(Date.parse(startDate)) ||
        new Date(startDate) <= new Date()
    ) {
        return {
            isValid: false,
            message: "Ngày bắt đầu phải ở trong tương lai",
        };
    }

    return { isValid: true };
};

const login = async (req, res) => {
    try {
        const { phone, password } = req.body;
        const user = await User.findOne({ phone }).populate("roleId");

        if (!user) {
            return res.status(400).json({ error: "Invalid phone or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid phone or password" });
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
