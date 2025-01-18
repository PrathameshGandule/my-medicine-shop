const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    phoneNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    // no need for explicit otp and otpExpiration fields here
    // a twilio route can be implmented to verify the user using otp 
    
    // otp: { type: String },
    // otpExpiration: { type: Date },
    role: { type: String, enum: ["admin", "manager", "user"], default: "user" }, // Default role is 'user'
});

module.exports = mongoose.model("User", userSchema);
