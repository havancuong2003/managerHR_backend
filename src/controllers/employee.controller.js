import Employee from "../models/user.model.js";
import Role from "../models/role.model.js";

export const getEmployees = async (req, res) => {
    try {
        const employeeRole = await Role.findOne({ name: "employee" }).select(
            "_id"
        );

        if (!employeeRole) {
            return res
                .status(400)
                .json({ message: "Không tìm thấy role 'employee'" });
        }

        const employees = await Employee.find({ roleId: employeeRole._id })
            .populate("departmentId")
            .populate("positionId")
            .populate("roleId");

        return res.status(200).json(employees);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách nhân viên:", error);
        return res.status(500).json({ message: "Server error!" });
    }
};

export const getEmployeeById = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id)
            .populate("departmentId")
            .populate("positionId")
            .populate("roleId");

        if (!employee) {
            return res
                .status(404)
                .json({ message: "Không tìm thấy nhân viên" });
        }

        return res.status(200).json(employee);
    } catch (error) {
        console.error("Lỗi khi lấy nhân viên:", error);
        return res.status(500).json({ message: "Server error!" });
    }
};
