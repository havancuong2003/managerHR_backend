import Position from "../models/position.model.js";

export const getAllPositions = async (req, res) => {
    try {
        const positions = await Position.find();
        res.status(200).json(positions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
