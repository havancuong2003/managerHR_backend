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

export const createDepartment = async (req, res) => {
    try {
        const { name, description } = req.body;
        const newDepartment = new Department({
            name: name,
            description: description,
        });
        const savedDepartment = await newDepartment.save();
        return res.status(201).json({ department: savedDepartment });
    } catch (error) {
        console.error("Lỗi khi tạo phòng ban:", error);
        return res.status(500).json({ message: "Server error!" });
    }
};

export const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const updatedDepartment = await Department.findByIdAndUpdate(
            id,
            { name, description },
            { new: true }
        );
        return res.status(200).json({ department: updatedDepartment });
    } catch (error) {
        console.error("Lỗi khi cập nhật phòng ban:", error);
        return res.status(500).json({ message: "Server error!" });
    }
};

export const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedDepartment = await Department.findByIdAndDelete(id);
        return res.status(200).json({ department: deletedDepartment });
    } catch (error) {
        console.error("Lỗi khi xóa phòng ban:", error);
        return res.status(500).json({ message: "Server error!" });
    }
};
