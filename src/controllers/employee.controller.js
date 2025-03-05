import Employee from "../models/user.model.js";
import Role from "../models/role.model.js";
import { uploadMedia } from "../utils/upload-media-helpers.js";
import XLSX from "xlsx";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import mongoose from "mongoose";

// Thêm những dòng này để thay thế __dirname trong ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
            .populate("roleId")
            .select("-password");

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
            .populate("roleId")
            .select("-password");

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

export const updateEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id).select(
            "-password"
        );

        if (!employee) {
            return res
                .status(404)
                .json({ message: "Không tìm thấy nhân viên" });
        }
        let avatarUrl = "";
        if (req.file) {
            const responseAfterUpload = await uploadMedia(req.file);

            avatarUrl = responseAfterUpload.url;
        }
        const updateEmployee = await Employee.findByIdAndUpdate(
            req.params.id,
            {
                fullName: req.body.fullName,
                dob: req.body.dob,
                gender: req.body.gender,
                address: req.body.address,
                phone: req.body.phone,
                avatarUrl:
                    avatarUrl.length > 0 ? avatarUrl : employee.avatarUrl,
            },
            { new: true }
        );

        return res.status(200).json(updateEmployee);
    } catch (error) {
        console.error("Lỗi khi cập nhật nhân viên:", error);
        return res.status(500).json({ message: "Server error!" });
    }
};

export const backupData = async (req, res) => {
    try {
        const employees = await Employee.find()
            .populate("departmentId")
            .populate("positionId")
            .select("-password"); // Loại bỏ trường password

        // Xử lý dữ liệu trước khi xuất Excel
        const processedEmployees = employees.map((emp) => {
            return {
                ID: emp._id.toString(),
                "Họ và tên": emp.fullName,
                "Ngày sinh": emp.dob,
                "Giới tính": emp.gender,
                "Địa chỉ": emp.address,
                "Số điện thoại": emp.phone,
                "ID Phòng ban": emp.departmentId._id.toString(),
                "ID Chức vụ": emp.positionId._id.toString(),
                "Lương cơ bản": emp.base_salary,
                "Ngày bắt đầu": emp.startDate,
                Avatar: emp.avatarUrl,
            };
        });

        // Chuyển dữ liệu thành Excel
        const ws = XLSX.utils.json_to_sheet(processedEmployees);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Employees");

        // Tạo tên file với timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const fileName = `employees_backup_${timestamp}.xlsx`;
        const filePath = path.join(__dirname, "..", "..", "temp", fileName);

        // Đảm bảo thư mục temp tồn tại
        const tempDir = path.join(__dirname, "..", "..", "temp");
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // Ghi file Excel
        XLSX.writeFile(wb, filePath);

        // Trả về file cho người dùng tải về
        res.download(filePath, fileName, (err) => {
            if (err) {
                console.error("Error sending file:", err);
                res.status(500).send("Failed to download file");
            }
            // Xoá file sau khi gửi
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) console.error("Error deleting file:", unlinkErr);
            });
        });
    } catch (error) {
        console.error("Lỗi khi xuất dữ liệu nhân viên:", error);
        return res
            .status(500)
            .json({ message: "Lỗi server khi xuất dữ liệu!" });
    }
};

export const restoreData = async (req, res) => {
    try {
        // Kiểm tra xem file có được gửi lên không
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Đọc file Excel đã tải lên
        const filePath = req.file.path;
        const workbook = XLSX.readFile(filePath);

        // Lấy sheet đầu tiên trong workbook
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Chuyển dữ liệu từ sheet thành mảng JSON
        const employees = XLSX.utils.sheet_to_json(sheet);

        // Duyệt qua từng nhân viên và cập nhật vào cơ sở dữ liệu
        for (const empData of employees) {
            const {
                ID,
                "Họ và tên": fullName,
                "Ngày sinh": dob,
                "Giới tính": gender,
                "Địa chỉ": address,
                "Số điện thoại": phone,
                "ID Phòng ban": departmentId,
                "ID Chức vụ": positionId,
                "Lương cơ bản": base_salary,
                "Ngày bắt đầu": startDate,
                Avatar,
            } = empData;

            // Kiểm tra nhân viên có tồn tại trong cơ sở dữ liệu không
            let employee = await Employee.findOne({ _id: ID });

            if (!employee) {
                // Nếu không tồn tại, tạo mới
                employee = new Employee({
                    _id: ID,
                    fullName,
                    dob,
                    gender,
                    address,
                    phone,
                    departmentId,
                    positionId,
                    base_salary,
                    startDate,
                    avatarUrl: Avatar,
                });
            } else {
                // Nếu tồn tại, cập nhật thông tin
                employee.fullName = fullName;
                employee.dob = dob;
                employee.gender = gender;
                employee.address = address;
                employee.phone = phone;
                employee.departmentId = departmentId;
                employee.positionId = positionId;
                employee.base_salary = base_salary;
                employee.startDate = startDate;
                employee.avatarUrl = Avatar;
            }

            // Lưu thông tin vào cơ sở dữ liệu
            await employee.save();
        }

        // Xóa file tạm sau khi xử lý xong
        fs.unlinkSync(filePath);

        // Trả lời thông báo thành công
        return res.status(200).json({ message: "Dữ liệu phục hồi thành công" });
    } catch (error) {
        console.error("Lỗi khi phục hồi dữ liệu:", error);
        return res
            .status(500)
            .json({ message: "Lỗi server khi phục hồi dữ liệu!" });
    }
};

export const updateEmployeeByAdmin = async (req, res) => {
    try {
        const id = req.body._id;

        // Chuyển đổi ID thành ObjectId
        const objectId = new mongoose.Types.ObjectId(id);

        const employee = await Employee.findById(objectId);

        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        const updateEmployee = await Employee.findByIdAndUpdate(req.body._id, {
            fullName: req.body.fullName,
            dob: req.body.dob,
            gender: req.body.gender,
            address: req.body.address,
            phone: req.body.phone,
            departmentId: req.body.departmentId._id,
            positionId: req.body.positionId._id,
            base_salary: req.body.base_salary,
            startDate: req.body.startDate,
            avatarUrl: req.body.avatarUrl,
        });

        return res.status(200).json("updateEmployee");
    } catch (error) {
        console.error("Lỗi khi cập nhật nhân viên:", error);
        return res
            .status(500)
            .json({ message: "Lỗi server khi cập nhật nhân viên!" });
    }
};

export const adminDeleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.body.id);

        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        await Employee.findByIdAndDelete(req.body.id);

        return res.status(200).json("deleteEmployee");
    } catch (error) {
        console.error("Lỗi khi xóa nhân viên:", error);
        return res
            .status(500)
            .json({ message: "Lỗi server khi xóa nhân viên!" });
    }
};
