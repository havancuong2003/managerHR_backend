import LeaveRequest from "../models/leave_request.model";

export const createLeaveRequest = async (req, res) => {
    try{
        const {id, leave_reason, start_date, end_date} = req.body;
        const newLeaveRequest = LeaveRequest.create({
            employeeId: id,
            leave_reason: leave_reason,
            start_date: start_date,
            end_date: end_date,
            status: "pending"
        })
        await newLeaveRequest.save()
        return res.status(200).json({message: "Tạo request nghỉ phép thành công!"});
    }catch{
        console.error("Lỗi khi tạo leave request:", error);
        return res.status(500).json({message: "Server error!"});
    }
}