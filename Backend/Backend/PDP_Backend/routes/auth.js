const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const HRAdmin = require('../models/HRAdmin');
const crypto = require('crypto');
const transporter = require('../utils/email');

const router = express.Router();

// ==========================================
// 1. REGISTER A NEW HR ADMIN
// ==========================================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, companyName } = req.body;

    if (!name || !email || !password || !companyName) {
      return res.status(400).json({ error: "Please provide all required fields." });
    }

    // Check if the email is already registered
    let existingAdmin = await HRAdmin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ error: "Email already in use!" });
    }

    // Scramble (Hash) the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the new Admin in the database
    const newAdmin = new HRAdmin({
      name,
      email,
      password: hashedPassword, // Save the scrambled password, NEVER the plain text
      companyName
    });

    await newAdmin.save();
    res.status(201).json({ message: "HR Admin registered successfully!" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error during registration." });
  }
});

// ==========================================
// 2. LOGIN TO GET THE JWT TOKEN
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the Admin by email
    const admin = await HRAdmin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    // Compare the typed password with the scrambled database password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    // Generate the Digital Key (JWT)
    // We embed the admin's unique MongoDB ID inside this token
    const token = jwt.sign(
      { adminId: admin._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' } // Token expires in 1 day
    );
    res.cookie('token', token, {
  httpOnly: true, // Stops JavaScript/hackers from reading it
  secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
  sameSite: 'strict', // Protects against CSRF attacks
  maxAge: 24 * 60 * 60 * 1000 // 1 day in milliseconds
});

// Send a much cleaner JSON response without the token exposed
res.status(200).json({ 
  message: "Login successful!", 
  adminName: admin.name
});

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error during login." });
  }
});

// ==========================================
// 3. LOGOUT TO CLEAR THE COOKIE
// ==========================================
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  res.status(200).json({ message: "Logged out successfully!" });
});

// ==========================================
// 4. FORGOT PASSWORD
// ==========================================
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const admin = await HRAdmin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ error: "No account with that email found." });
    }

    // Generate token
    const token = crypto.randomBytes(20).toString('hex');
    
    // Set token & expiration
    admin.resetPasswordToken = token;
    admin.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await admin.save();

    // Send email
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const resetUrl = `${clientUrl}/hr/reset-password/${token}`;
    
    const mailOptions = {
      from: `"${transporter.senderName}" <${transporter.senderEmail}>`,
      replyTo: transporter.senderEmail,
      to: admin.email,
      subject: "HireAI Password Reset Request",
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
            `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
            `${resetUrl}\n\n` +
            `If you did not request this, please ignore this email and your password will remain unchanged.\n`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Password reset link sent to your email!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error during forgot password." });
  }
});

// ==========================================
// 5. RESET PASSWORD
// ==========================================
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const admin = await HRAdmin.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!admin) {
      return res.status(400).json({ error: "Password reset token is invalid or has expired." });
    }

    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(password, salt);
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;
    await admin.save();

    res.status(200).json({ message: "Password has been successfully reset!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error during reset password." });
  }
});

module.exports = router;
