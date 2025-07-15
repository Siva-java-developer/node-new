

const nodemailer = require('nodemailer');
require('dotenv').config(); 

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASSWORD  
  }
});


transporter.verify((error, success) => {
  if (error) {
    console.error('Error with email transporter config:', error);
  } else {
    console.log('Email transporter is ready.');
  }
});

module.exports = transporter;
