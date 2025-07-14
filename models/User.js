const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  mobile: { type: String, required: true },
  status: {
    type: String,
    enum: ["Active", "InActive"],
    default: "Active"
  },
  role: { type: String, required: true },
  resetPasswordExpires: { type: Date },
  isForgot:{type:Boolean,default:false},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);
