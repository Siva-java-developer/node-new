const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  discount: { 
    type: String, 
    required: false 
  },
  price: { 
    type: String, 
    required: true 
  },
  duration: { 
    type: String, 
    required: true 
  },
  fileupload: { 
    type: String, 
    required: true 
  },
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
courseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Course", courseSchema);