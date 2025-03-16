import LeaveRequest from "../models/leave_request.model.js";
import Employee from "../models/user.model.js";

export const createLeaveRequest = async (req, res) => {
    try {
        const { id, leave_reason, start_date, end_date } = req.body;
        const newLeaveRequest = LeaveRequest.create({
            employeeId: id,
            leave_reason: leave_reason,
            start_date: start_date,
            end_date: end_date,
            status: "pending",
        });
        await newLeaveRequest.save();
        return res
            .status(200)
            .json({ message: "Tạo request nghỉ phép thành công!" });
    } catch {
        console.error("Lỗi khi tạo leave request:", error);
        return res.status(500).json({ message: "Server error!" });
    }
};

export const updateLeaveRequest = async (req, res) => {
    try {
        const { id, status } = req.body;
        const leaveRequest = await LeaveRequest.findById(id);

        if (!leaveRequest) {
            return res
                .status(404)
                .json({ message: "Leave request not found!" });
        }

        leaveRequest.status = status || leaveRequest.status;

        await leaveRequest.save();
        return res
            .status(200)
            .json({ message: "Leave request updated successfully!" });
    } catch (error) {
        console.error("Error updating leave request:", error);
        return res.status(500).json({ message: "Server error!" });
    }
};

export const getRemainingLeaveDays = async (req, res) => {
    try {
        const { employeeId, year, month } = req.params;
        const employee = await Employee.findById(employeeId);
        const annualLeaveDays = employee.annualLeave;
        const leaveRequests = await LeaveRequest.find({
            employeeId: employeeId,
            leave_reason: { $in: ["Nghỉ phép ốm", "Nghỉ phép bệnh"] },
            start_date: {
                $gte: new Date(`${year}-${month}-01`),
                $lte: new Date(`${year}-${month}-31`),
            },
            status: "approved",
        });

        let usedLeaveDays = 0;
        leaveRequests.forEach((request) => {
            const startDate = new Date(request.start_date);
            const endDate = new Date(request.end_date);
            const diffTime = Math.abs(endDate - startDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Tính số ngày nghỉ phép
            usedLeaveDays += diffDays;
        });

        const remainingLeaveDays = annualLeaveDays - usedLeaveDays;

        return res.status(200).json({ remainingLeaveDays: remainingLeaveDays });
    } catch (error) {
        console.error("Error calculating remaining leave days:", error);
        return res.status(500).json({ message: "Server error!" });
    }
};

export const getPendingLeaveRequestsForManager = async (req, res) => {
    try {
        const { managerId } = req.params;
        const manager = await Employee.findById(managerId).populate(
            "departmentId"
        );
        // Giả sử bạn có một model Employee để lấy thông tin nhân viên
        const employees = await Employee.find({
            departmentId: manager.departmentId._id,
        });

        const employeeIds = employees.map((employee) => employee._id);

        const pendingLeaveRequests = await LeaveRequest.find({
            employeeId: { $in: employeeIds },
            status: "pending",
        });

        return res
            .status(200)
            .json({ pendingLeaveRequests: pendingLeaveRequests });
    } catch (error) {
        console.error("Error fetching pending leave requests:", error);
        return res.status(500).json({ message: "Server error!" });
    }
};

export const getLeaveRequestHistoryForEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params;

        const leaveRequests = await LeaveRequest.find({
            employeeId: employeeId,
        }).sort({ start_date: -1 }); // Sắp xếp theo thời gian gần nhất

        return res.status(200).json({ leaveRequests: leaveRequests });
    } catch (error) {
        console.error(
            "Error fetching leave request history for employee:",
            error
        );
        return res.status(500).json({ message: "Server error!" });
    }
};

export const getLeaveRequestHistoryForManager = async (req, res) => {
    try {
        const { managerId } = req.params;

        const manager = await Employee.findById(managerId).populate(
            "departmentId"
        );
        const employees = await Employee.find({
            departmentId: manager.departmentId._id,
        });

        const employeeIds = employees.map((employee) => employee._id);

        const leaveRequests = await LeaveRequest.find({
            employeeId: { $in: employeeIds },
            status: { $in: ["approved", "denied"] },
        }).sort({ start_date: -1 }); // Sắp xếp theo thời gian gần nhất

        return res.status(200).json({ leaveRequests: leaveRequests });
    } catch (error) {
        console.error(
            "Error fetching leave request history for manager:",
            error
        );
        return res.status(500).json({ message: "Server error!" });
    }
};
