import Department from "../models/department.model.js";
export const getDepartments = async (req, res) => {
    try {
        const departments = await Department.find();
        return res.status(200).json({ departments });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách phòng ban:", error);
        return res.status(500).json({ message: "Server error!" });
    }
};
