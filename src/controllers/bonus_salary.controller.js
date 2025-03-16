import BonusSalary from "../models/bonus_salary.model.js";
import Employee from "../models/user.model.js";
// ...existing code...

export const addBonusSalary = async (req, res) => {
    try {
        const { employeeId, bonus_salary, description, payment_date } =
            req.body;

        const newBonusSalary = new BonusSalary({
            employeeId,
            bonus_salary,
            description,
            payment_date,
        });

        await newBonusSalary.save();
        return res
            .status(200)
            .json({ message: "Bonus salary added successfully!" });
    } catch (error) {
        console.error("Error adding bonus salary:", error);
        return res.status(500).json({ message: "Server error!" });
    }
};

export const getBonusSalaryForEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params;

        const bonusSalaries = await BonusSalary.find({ employeeId }).sort({
            payment_date: -1,
        });

        return res.status(200).json({ bonusSalaries });
    } catch (error) {
        console.error("Error fetching bonus salary for employee:", error);
        return res.status(500).json({ message: "Server error!" });
    }
};

export const getBonusSalaryForDepartment = async (req, res) => {
    try {
        const { departmentId, month, year } = req.body;

        if (!month || !year) {
            return res
                .status(400)
                .json({ message: "Vui lòng cung cấp tháng và năm!" });
        }

        const startOfMonth = new Date(year, month - 1, 1);
        startOfMonth.setHours(0, 0, 0, 0);
        const endOfMonth = new Date(year, month, 0);
        endOfMonth.setHours(23, 59, 59, 999);

        const employees = await Employee.find({ departmentId: departmentId });

        if (!employees.length) {
            return res
                .status(404)
                .json({ message: "Không có nhân viên trong phòng ban này!" });
        }

        const employeeIds = employees.map((emp) => emp._id);
        const bonusSalaries = await BonusSalary.find({
            employeeId: { $in: employeeIds },
            payment_date: { $gte: startOfMonth, $lte: endOfMonth },
        }).sort({ payment_date: -1 });

        const report = employees.map((employee) => {
            const empBonusSalaries = bonusSalaries.filter(
                (bonus) =>
                    bonus.employeeId.toString() === employee._id.toString()
            );

            return {
                fullName: employee.fullName,
                gender: employee.gender,
                dateOfBirth: employee.dob,
                bonusSalaries: empBonusSalaries,
            };
        });

        return res.status(200).json(report);
    } catch (error) {
        console.error("Error fetching bonus salary for department:", error);
        return res.status(500).json({ message: "Server error!" });
    }
};
// ...existing code...
