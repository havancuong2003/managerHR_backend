import Salary from "../models/salary.model.js";
import Employee from "../models/user.model.js";
import Attendance from "../models/attendance.model.js";
import LeaveRequest from "../models/leave_request.model.js";
import BonusSalary from "../models/bonus_salary.model.js";
// ...existing code...

export const addSalary = async (req, res) => {
    try {
        const { employeeId, total_salary, payment_date, description } =
            req.body;

        const newSalary = new Salary({
            employeeId,
            total_salary,
            payment_date,
            description,
        });

        await newSalary.save();
        return res.status(200).json({ message: "Salary added successfully!" });
    } catch (error) {
        console.error("Error adding salary:", error);
        return res.status(500).json({ message: "Server error!" });
    }
};

export const calculateTotalSalary = async (req, res) => {
    try {
        const { employeeId, month, year } = req.body;

        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ message: "Employee not found!" });
        }

        const dailyWage = employee.base_salary; // Giả sử bạn có trường daily_wage trong model Employee

        const startOfMonth = new Date(year, month - 1, 1);
        startOfMonth.setHours(7, 0, 0, 0);
        const endOfMonth = new Date(year, month, 0);
        endOfMonth.setHours(30, 59, 59, 999);

        const attendances = await Attendance.find({
            employeeId: employeeId,
            timeIn: { $ne: null, $gte: startOfMonth, $lte: endOfMonth },
            timeOut: { $ne: null },
        });

        let workDays = 0;
        let totalOTHours = 0;

        attendances.forEach((att) => {
            if (att.status === "present" && att.timeIn && att.timeOut) {
                workDays++;

                // Tính tổng số giờ làm trong ngày
                const timeIn = new Date(att.timeIn);
                const timeOut = new Date(att.timeOut);
                const workHours = (timeOut - timeIn) / (1000 * 60 * 60); // Chuyển milliseconds → hours

                // Tính OT
                if (workHours > 9) {
                    const overtime = workHours - 9; // Chỉ tính giờ vượt quá 8h làm việc
                    totalOTHours += overtime;
                }
            }
        });

        const baseSalary = dailyWage * workDays;
        const otSalary = (dailyWage / 8) * totalOTHours;
        const remainingLeaveDays = await calculateRemainingLeavesDays(
            employeeId,
            year,
            month
        );
        const remainingLeaveDaysSalary =
            (await calculateRemainingLeavesDays(employeeId, year, month)) *
            dailyWage;
        const totalSalary = baseSalary + otSalary + remainingLeaveDaysSalary;

        return res.status(200).json({
            totalSalary,
            workDays,
            totalOTHours,
            remainingLeaveDays,
            dailyWage,
        });
    } catch (error) {
        console.error("Error calculating total salary:", error);
        return res.status(500).json({ message: "Server error!" });
    }
};

export const getDepartmentSalaryReport = async (req, res) => {
    try {
        const { departmentId, month, year } = req.body;

        if (!month || !year) {
            return res
                .status(400)
                .json({ message: "Vui lòng cung cấp tháng và năm!" });
        }

        const startOfMonth = new Date(year, month - 1, 1);
        startOfMonth.setHours(7, 0, 0, 0);
        const endOfMonth = new Date(year, month, 0);
        endOfMonth.setHours(30, 59, 59, 999);

        const employees = await Employee.find({ departmentId: departmentId });
        // console.log(employees);
        if (!employees.length) {
            return res
                .status(404)
                .json({ message: "Không có nhân viên trong phòng ban này!" });
        }

        const employeeIds = employees.map((emp) => emp._id);
        const attendances = await Attendance.find({
            employeeId: { $in: employeeIds },
            timeIn: { $ne: null, $gte: startOfMonth, $lte: endOfMonth },
            timeOut: { $ne: null },
        });
        // console.log(attendances);

        const report = await Promise.all(
            employees.map(async (employee) => {
                const empAttendances = attendances.filter(
                    (att) =>
                        att.employeeId.toString() === employee._id.toString()
                );
                // console.log(empAttendances);

                let workDays = 0;
                let totalOTHours = 0;

                empAttendances.forEach(async (att) => {
                    if (att.status === "present" && att.timeIn && att.timeOut) {
                        workDays++;

                        // Tính tổng số giờ làm trong ngày
                        const timeIn = new Date(att.timeIn);
                        const timeOut = new Date(att.timeOut);
                        const workHours = (timeOut - timeIn) / (1000 * 60 * 60); // Chuyển milliseconds → hours

                        // Tính OT
                        if (workHours > 9) {
                            const overtime = workHours - 9; // Chỉ tính giờ vượt quá 8h làm việc
                            totalOTHours += overtime;
                        }
                    }
                });

                const dailyWage = employee.base_salary; // Giả sử bạn có trường base_salary trong model Employee
                const baseSalary = dailyWage * workDays;
                const otSalary = (dailyWage / 8) * totalOTHours;
                const remainingLeaveDaysSalary =
                    (await calculateRemainingLeavesDays(
                        employee._id.toString(),
                        year,
                        month
                    )) * dailyWage;
                const remainingLeaveDays = await calculateRemainingLeavesDays(
                    employee._id.toString(),
                    year,
                    month
                );
                const totalBonusSalary = await calculateTotalBonusSalary(
                    employee._id.toString(),
                    year,
                    month
                );
                const totalSalary =
                    baseSalary +
                    otSalary +
                    remainingLeaveDaysSalary +
                    totalBonusSalary;
                console.log(employee.fullName, employee.phone, totalSalary);
                return {
                    id: employee._id,
                    fullName: employee.fullName,
                    gender: employee.gender,
                    dateOfBirth: employee.dob,
                    workDays: workDays,
                    totalOTHours: totalOTHours,
                    baseSalary: baseSalary,
                    bonus_salary: totalBonusSalary,
                    dailyWage: dailyWage,
                    remainingLeaveDays: remainingLeaveDays,
                    totalSalary: totalSalary,
                };
            })
        );

        return res.status(200).json(report);
    } catch (error) {
        console.error("Error fetching department salary report:", error);
        return res.status(500).json({ message: "Server error!" });
    }
};

export const getQuarterlySalaryReport = async (req, res) => {
    try {
        const { departmentId, year, quarter } = req.body;

        if (!year || !quarter) {
            return res
                .status(400)
                .json({ message: "Vui lòng cung cấp năm và quý!" });
        }

        const startMonth = (quarter - 1) * 3;
        const endMonth = startMonth + 2;

        const startOfQuarter = new Date(year, startMonth, 1);
        startOfQuarter.setHours(7, 0, 0, 0);
        const endOfQuarter = new Date(year, endMonth + 1, 0);
        endOfQuarter.setHours(30, 59, 59, 999);

        const employees = await Employee.find({ departmentId: departmentId });

        if (!employees.length) {
            return res
                .status(404)
                .json({ message: "Không có nhân viên trong phòng ban này!" });
        }

        const employeeIds = employees.map((emp) => emp._id);
        const salaries = await Salary.find({
            employeeId: { $in: employeeIds },
            payment_date: { $gte: startOfQuarter, $lte: endOfQuarter },
        });

        const report = employees.map((employee) => {
            const empSalaries = salaries.filter(
                (sal) => sal.employeeId.toString() === employee._id.toString()
            );

            const monthlySalaries = [0, 0, 0];
            let totalSalary = 0;

            empSalaries.forEach((sal) => {
                const paymentMonth = new Date(sal.payment_date).getMonth();
                const monthIndex = paymentMonth - startMonth;
                if (monthIndex >= 0 && monthIndex < 3) {
                    monthlySalaries[monthIndex] += sal.total_salary;
                    totalSalary += sal.total_salary;
                }
            });

            return {
                fullName: employee.fullName,
                gender: employee.gender,
                monthlySalaries: {
                    month1: monthlySalaries[0],
                    month2: monthlySalaries[1],
                    month3: monthlySalaries[2],
                },
                totalSalary: totalSalary,
            };
        });

        return res.status(200).json(report);
    } catch (error) {
        console.error("Error fetching quarterly salary report:", error);
        return res.status(500).json({ message: "Server error!" });
    }
};

export const getSalaryByEmployeeId = async (req, res) => {
    try {
        const { employeeId } = req.params;

        const salaries = await Salary.find({ employeeId })
            .populate("employeeId")
            .sort({
                payment_date: -1,
            });

        if (!salaries.length) {
            return res.status(404).json({
                message: "Không tìm thấy thông tin lương cho nhân viên này!",
            });
        }

        return res.status(200).json(salaries);
    } catch (error) {
        console.error("Error fetching salary by employee ID:", error);
        return res.status(500).json({ message: "Server error!" });
    }
};

const calculateRemainingLeavesDays = async (employeeId, year, month) => {
    // Code to calculate remaining leave days
    // ...
    const employee = await Employee.findById(employeeId);
    const annualLeaveDays = employee.annualLeave;
    const leaveRequests = await LeaveRequest.find({
        employeeId: employeeId,
        leave_reason: { $ne: "Nghỉ không lương" },
        start_date: {
            $gte: new Date(`${year}-${month}-01`),
            $lte: new Date(`${year}-${month}-30`),
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
    return remainingLeaveDays;
};

const calculateTotalBonusSalary = async (employeeId, year, month) => {
    // Code to calculate total bonus salary
    // ...
    const startOfMonth = new Date(year, month - 1, 1);
    startOfMonth.setHours(7, 0, 0, 0);
    const endOfMonth = new Date(year, month, 0);
    endOfMonth.setHours(30, 59, 59, 999);
    const bonusSalaries = await BonusSalary.find({
        employeeId: employeeId,
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    });
    const totalBonusSalary = bonusSalaries.reduce(
        (total, salary) => total + salary.bonus_salary,
        0
    );
    return totalBonusSalary;
};
// ...existing code...
