import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import RefreshToken from "../models/refresh_token.model.js";
import { getRoleId } from "../controllers/auth.controller.js";
import Role from "../models/role.model.js";

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id)
            .select("-password")
            .populate("roleId");

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid Token" });
    }
};

const generateAccessToken = (user) => {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.TIME_ACCESSTOKEN,
    });
};

const generateRefreshToken = async (user) => {
    const checkOldRefreshToken = await RefreshToken.findOne({
        userId: user._id,
    });

    if (checkOldRefreshToken) {
        await RefreshToken.findOneAndDelete({ userId: user._id });
    }
    const refreshToken = jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.TIME_REFRESHTOKEN }
    );

    await RefreshToken.create({
        userId: user._id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày
    });

    return refreshToken;
};

const roleMiddleware = (roles) => async (req, res, next) => {
    try {
        const getRole = await Role.findById(req.user.roleId); // ✅ Truy vấn đúng

        if (!getRole || !roles.includes(getRole.name)) {
            // ✅ Kiểm tra role
            return res
                .status(403)
                .json({ message: "Forbidden: You don't have permission" });
        }

        next(); // ✅ Cho phép request tiếp tục
    } catch (error) {
        console.error("Error in roleMiddleware:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export {
    authMiddleware,
    generateAccessToken,
    generateRefreshToken,
    roleMiddleware,
};
