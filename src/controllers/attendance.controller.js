import Attendance from "../models/attendance.model";

export const checkInAttendance = async (req, res) => {
    try{
        const {id} = req.params;
        const attendance = new Attendance({
            employeeId: id,
            status: "present",
            timeIn: new Date()
        });
        await attendance.save();
        return res.status(200).json({message: "Check in thành công! - " + attendance.timeIn});
    }catch(error){
        console.error("Lỗi khi check in:", error);
        return res.status(500).json({message: "Server error!"});
    }
}

export const checkOutAttendance = async (req, res) => {
    try{
        const {id} = req.params;
        const {date} = req.body;
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0); // Đặt về 00:00:00

        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        const attendance = await Attendance.findOne({employeeId: id, timeIn: {$gte: startDate, $lte: endDate}});
        if(!attendance){
            return res.status(404).json({message: "Không tìm thấy bản ghi chấm công!"});
        }
        attendance.timeOut = new Date();
        await attendance.save();
        return res.status(200).json({message: "Check out thành công! - " + attendance.timeOut});
    }catch(error){
        console.error("Lỗi khi check out:", error);
        return res.status(500).json({message: "Server error!"});
    }
}

export const getAttendanceByEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const { startDate, endDate } = req.body;

        if (!startDate || !endDate) {
            return res.status(400).json({ message: "Vui lòng cung cấp ngày bắt đầu và ngày kết thúc!" });
        }

        // Xác định khoảng ngày
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        // Lấy dữ liệu chấm công có timeOut hợp lệ
        const attendances = await Attendance.find({
            employeeId: id,
            timeIn: {$ne: null},
            timeIn: { $gte: start, $lte: end },
            timeOut: { $ne: null }
        });

        let totalWorkDays = 0;
        let totalWorkHours = 0;
        let totalOTHours = 0;

        attendances.forEach(att => {
            if (att.timeIn && att.timeOut) {
                const timeIn = new Date(att.timeIn);
                const timeOut = new Date(att.timeOut);

                // Tính số giờ làm trong ngày
                const workHours = (timeOut - timeIn) / (1000 * 60 * 60); // Chuyển đổi ms → giờ
                totalWorkHours += workHours;

                // Nếu làm ≥ 6.5 giờ, tính là 1 ngày công
                if (workHours >= 6.5) {
                    totalWorkDays++;
                }

                // Nếu làm > 8h, tính số giờ OT
                if (workHours > 8) {
                    totalOTHours += workHours - 8;
                }
            }
        });

        return res.status(200).json({
            employeeId: id,
            totalWorkDays: totalWorkDays,
            totalWorkHours: totalWorkHours,
            totalOTHours: totalOTHours,
            details: attendances
        });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách chấm công:", error);
        return res.status(500).json({ message: "Server error!" });
    }
};


export const getAttendanceReportByMonth = async (req, res) => {
    try {
        const { departmentId } = req.params;
        const { month, year } = req.body;

        if (!month || !year) {
            return res.status(400).json({ message: "Vui lòng cung cấp tháng và năm!" });
        }

        const startOfMonth = new Date(year, month - 1, 1);
        startOfMonth.setHours(0, 0, 0, 0);
        const endOfMonth = new Date(year, month, 0);
        endOfMonth.setHours(23, 59, 59, 999);

        const employees = await User.find({ departmentId })
            .populate("positionId")
            .populate("roleId");

        if (!employees.length) {
            return res.status(404).json({ message: "Không có nhân viên trong phòng ban này!" });
        }

        const employeeIds = employees.map(emp => emp._id);
        const attendances = await Attendance.find({
            employeeId: { $in: employeeIds },
            timeIn: {$ne: null},
            timeIn: { $gte: startOfMonth, $lte: endOfMonth },
            timeOut: { $ne: null }
        });

        // Xử lý dữ liệu: đếm số ngày làm việc và tính OT
        const report = employees.map(employee => {
            const empAttendances = attendances.filter(att => att.employeeId.toString() === employee._id.toString());

            let workDays = 0;
            let totalOTHours = 0;

            empAttendances.forEach(att => {
                if (att.status === "present" && att.timeIn && att.timeOut) {
                    workDays++;

                    // Tính tổng số giờ làm trong ngày
                    const timeIn = new Date(att.timeIn);
                    const timeOut = new Date(att.timeOut);
                    const workHours = (timeOut - timeIn) / (1000 * 60 * 60); // Chuyển milliseconds → hours

                    // Tính OT
                    if (workHours > 8) {
                        const overtime = workHours - 8; // Chỉ tính giờ vượt quá 8h làm việc

                        if (overtime > 1.5 && overtime < 2) {
                            totalOTHours += 2; // Nếu OT từ 1.5h - 2h → tính 2h OT
                        } else if (overtime > 1 && overtime <= 1.5) {
                            totalOTHours += 1; // Nếu OT từ 1h - 1.5h → tính 1h OT
                        } else if (overtime >= 2) {
                            totalOTHours += overtime; // Nếu OT ≥ 2h → tính đúng số giờ OT
                        }
                    }
                }
            });

            return {
                fullName: employee.fullName,
                positionName: employee.positionId?.name || "N/A",
                roleName: employee.roleId?.name || "N/A",
                workDays: workDays,
                totalOTHours: totalOTHours
            };
        });

        return res.status(200).json(report);
    } catch (error) {
        console.error("Lỗi khi lấy báo cáo chấm công:", error);
        return res.status(500).json({ message: "Server error!" });
    }
};

// export const 


