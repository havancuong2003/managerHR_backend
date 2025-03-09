import Department from "../models/department.model.js";
import User from "../models/user.model.js";
export const getDepartments = async (req, res) => {
    try {
        const departments = await Department.find();
        return res.status(200).json(departments);
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

export const getEmployeesByDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const employees = await User.find({ departmentId: id })
            .populate("departmentId")
            .populate("positionId")
            .populate("roleId");
        return res.status(200).json({
            department: employees[0].departmentId.name,
            NumberOfEmployees: employees.length,
            employees: employees.map((employee) => {
                return {
                    fullName: employee.fullName,
                    dob: employee.dob,
                    gender: employee.gender,
                    address: employee.address,
                    phone: employee.phone,
                    positionName: employee.positionId.name,
                    roleName: employee.roleId.name,
                    baseSalary: employee.base_salary,
                };
            }),
        });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách nhân viên theo phòng ban:", error);
        return res.status(500).json({ message: "Server error!" });
    }
};
