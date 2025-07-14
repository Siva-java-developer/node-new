const Course = require("../models/Course");
const Lesson = require('../models/lessons');
const path = require("path");
const fs = require("fs");

// Create a new course
exports.createCourse = async (req, res) => {
  try {
    const { name, description, discount, price, duration } = req.body;

    // Validation
    if (!name || !description || !price || !duration) {
      return res.status(400).json({ 
        message: "All fields are required: name, description, price, duration" 
      });
    }
    // ✅ Check if course with same name already exists
    const existing = await Course.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({ message: "Course already exists" });
    }
    // Check if file is uploaded
    if (!req.file) {
      return res.status(400).json({ 
        message: "File upload is required" 
      });
    }

    // Create course with status set to "Active" by default
    const course = new Course({
      name,
      description,
      discount,
      price,
      duration,
      fileupload: req.file.filename, // Save filename from multer
      status: "Active" // Set status inside the method
    });

    const savedCourse = await course.save();
    
    res.status(201).json({
      message: "Course created successfully",
      course: savedCourse
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error creating course", 
      error: error.message 
    });
  }
};

// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({ status: "Active" }).sort({ _id: -1 });
    
    res.status(200).json({
      message: "Courses retrieved successfully",
      count: courses.length,
      courses
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error retrieving courses", 
      error: error.message 
    });
  }
};

// Get course by ID
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ 
        message: "Course not found" 
      });
    }

    res.status(200).json({
      message: "Course retrieved successfully",
      course
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error retrieving course", 
      error: error.message 
    });
  }
};

// Update course
exports.updateCourse = async (req, res) => {
  try {
    const { name, description, discount, price, duration } = req.body;
    
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ 
        message: "Course not found" 
      });
    }

    // Update fields if provided
    if (name) course.name = name;
    if (description) course.description = description;
    if (discount) course.discount = discount;
    if (price) course.price = price;
    if (duration) course.duration = duration;
    
    // Update file if new file is uploaded
    if (req.file) {
      course.fileupload = req.file.filename;
    }

    const updatedCourse = await course.save();
    
    res.status(200).json({
      message: "Course updated successfully",
      course: updatedCourse
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error updating course", 
      error: error.message 
    });
  }
};

// Toggle course status (Active/Inactive)
exports.toggleCourseStatus = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ 
        message: "Course not found" 
      });
    }

    // Toggle status
    course.status = course.status === "Active" ? "Inactive" : "Active";
    
    const updatedCourse = await course.save();
    
    res.status(200).json({
      message: `Course status changed to ${course.status}`,
      course: updatedCourse
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error updating course status", 
      error: error.message 
    });
  }
};

// Delete course
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ 
        message: "Course not found" 
      });
    }
    await Lesson.deleteMany({ "courseId._id": course._id });

    await Course.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      message: "Course deleted successfully"
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error deleting course", 
      error: error.message 
    });
  }
};

// Get courses by status
exports.getCoursesByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    
    if (!["Active", "Inactive"].includes(status)) {
      return res.status(400).json({ 
        message: "Invalid status. Use 'Active' or 'Inactive'" 
      });
    }

    const courses = await Course.find({ status }).sort({ createdAt: -1 });
    
    res.status(200).json({
      message: `${status} courses retrieved successfully`,
      count: courses.length,
      courses
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error retrieving courses by status", 
      error: error.message 
    });
  }
};

// Download course file by course ID
exports.downloadCourseFile = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ 
        message: "Course not found" 
      });
    }

    if (!course.fileupload) {
      return res.status(404).json({ 
        message: "No file associated with this course" 
      });
    }

    // Construct file path
    const filePath = path.join(process.cwd(), 'uploads', course.fileupload);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        message: "File not found on server" 
      });
    }

    // Get file stats for additional info
    const stats = fs.statSync(filePath);
    const fileExtension = path.extname(course.fileupload);
    
    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${course.name}${fileExtension}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Length', stats.size);
    
    // Send file
    res.download(filePath, `${course.name}${fileExtension}`, (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        if (!res.headersSent) {
          res.status(500).json({ 
            message: "Error downloading file", 
            error: err.message 
          });
        }
      }
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error downloading file", 
      error: error.message 
    });
  }
};

// Download file by filename
exports.downloadFileByName = async (req, res) => {
  try {
    const { filename } = req.params;
    
    if (!filename) {
      return res.status(400).json({ 
        message: "Filename is required" 
      });
    }

    // Construct file path
    const filePath = path.join(process.cwd(), 'uploads', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        message: "File not found on server" 
      });
    }

    // Get file stats for additional info
    const stats = fs.statSync(filePath);
    
    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Length', stats.size);
    
    // Send file
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        if (!res.headersSent) {
          res.status(500).json({ 
            message: "Error downloading file", 
            error: err.message 
          });
        }
      }
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error downloading file", 
      error: error.message 
    });
  }
};