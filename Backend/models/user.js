const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    phoneNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    role: { type: String, enum: ["admin", "manager", "user"], default: "user" },

    // Relationship Fields
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // Only for users
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // Only for managers

    // Earnings for Managers and Admins
    earnings: { type: Number, default: 0 },
});

module.exports = mongoose.model("User", userSchema);
    