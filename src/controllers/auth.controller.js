// controller process logic API
import User from "../models/user.model.js";
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        console.log("check body", req.body);
        const user = new User({ username, email, password });
        await user.save();
        //  const token = await user.generateAuthToken();
        console.log("user" + user);
        res.status(201).send({ user });
    } catch (error) {
        res.status(400).send(error);
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).send({
                error: "Login failed! Check authentication credentials",
            });
        }
        // const token = await user.generateAuthToken();
        res.send({ user });
    } catch (error) {
        res.status(400).send(error);
    }
};

export { register, login };
