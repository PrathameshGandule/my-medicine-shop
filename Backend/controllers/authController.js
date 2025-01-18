const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

// to register the user
const register = async(req, res) => {
    try{
        const { phoneNumber , password , role } = req.body

        if(!phoneNumber || !password || !role){
            return res.status(400).json({ message: "Please fill all fields !" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ phoneNumber , password: hashedPassword , role });
        await newUser.save();
        res.status(201).json({
            message: `User registered with phone number ${phoneNumber}`
        });
    } catch(err) {
        res.status(500).json({ message: "Internal Server Error" });
        console.log(err);
    }
}

const login = async(req, res) => {
    try{
        const { phoneNumber , password } = req.body;

        if(!phoneNumber || !password){
            return res.status(400).json({ message: "Please fill all fields !" });
        }

        const user = await User.findOne({ phoneNumber });

        if(!user){
            return res.status(404).json({
                message: `User with username ${phoneNumber} not found !`
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({ message: "Invalid Password !" })
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "6h" }
        )

        res.status(200).json({
            message: "Login successful",
            token
        });
    } catch(err) {
        return res.status(500).json({ message: "Internal Server Error !" });
        console.log(err);
    }
}
  
module.exports = {
    register,
    login,
}