// controller process logic API
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import Role from "../models/role.model.js";
import cloudinary from "../config/cloudinary.js";
import { uploadMedia } from "../utils/upload-media-helpers.js";

const getRoleId = async (roleName) => {
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
            salary,
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
            console.log("check responseAfterUpload", responseAfterUpload);
        }

        const user = new User({
            fullName,
            dob,
            gender,
            address,
            phone,
            department,
            position,
            salary,
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
        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(401).send({
                error: "Login failed! Check authentication credentials",
            });
        }
        // const token = await user.generateAuthToken();
        res.send({ user });
    } catch (error) {
        res.status(400).send(error);
    }
};

export { register, login };
