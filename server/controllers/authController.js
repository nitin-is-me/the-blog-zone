const Blogger = require("../models/Blogger");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

exports.signup = async (req, res) => {
  const { username, password, name, email } = req.body;

  // Checking if username already exists
  const existingUser = await Blogger.findOne({ where: { username } });
  if (existingUser) {
    return res.status(400).send("Username already exists!");
  }

  // If email is provided, check if it already exists
  if (email) {
    const existingEmail = await Blogger.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).send("Email is already in use by another account!");
    }
  }

  // Hashing the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await Blogger.create({ username, name, password: hashedPassword, email: email || null });

  const token = jwt.sign({ id: newUser.id, username: newUser.username }, process.env.JWT_SECRET, {
    expiresIn: "365d",
  });

  res.status(201).json({ token, message: "User registered successfully" });
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  // Finding user by username or email
  const user = await Blogger.findOne({ 
    where: username.includes("@") ? { email: username } : { username } 
  });
  
  if (!user) {
    return res.status(400).send("User doesn't exist");
  }

  // Checking password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).send("Incorrect password");
  }

  // Check if banned
  if (user.isBanned) {
    return res.status(403).send("Your account has been banned. Please contact admin to remove the ban.");
  }

  // Generating JWT
  const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
    expiresIn: "365d",
  });

  res.json({ token });
};

exports.verifyToken = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Blogger.findOne({ where: { username: decoded.username } });
    if (!user || user.isBanned) {
      return res.status(403).json({ message: "User is banned or not found" });
    }
    res.status(200).json({ message: "User is authorized", user: decoded });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

exports.suppressWarning = async (req, res) => {
  try {
    const user = await Blogger.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.isWarningSuppressed = true;
    await user.save();
    res.json(user);
  } catch (error) {
    console.error("Error suppressing warning:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.user = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Blogger.findOne({ where: { username: decoded.username } });
    if (!user || user.isBanned) {
      return res.status(403).json({ error: "User is banned or not found" });
    }
    res.json({ user: decoded });
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
};

exports.me = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    // Verify the JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user details from the database using the decoded user ID
    const user = await Blogger.findOne({ where: { username: decoded.username } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    if (user.isBanned) {
      return res.status(403).json({ error: "User is banned" });
    }

    return res.json(user);
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};


exports.updateProfile = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify the JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get fields to update from request body
    const { name, newUsername, email } = req.body;

    // Find the user
    const user = await Blogger.findOne({ where: { id: decoded.id } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Only check for existing username if newUsername is provided and different from current
    if (newUsername && newUsername !== user.username) {
      const existingUser = await Blogger.findOne({ where: { username: newUsername } });
      if (existingUser) {
        return res.status(400).send("Username already exists!");
      }
      user.username = newUsername;
    }

    // Check if new email is provided and different
    if (email !== undefined && email !== user.email) {
      // Email updates are now handled by requestEmailUpdate and verifyEmailUpdate endpoints
      // We ignore email changes here to enforce OTP verification
    }

    // Update user fields if provided
    if (name) user.name = name;

    const newToken = jwt.sign({
      id: decoded.id,
      username: newUsername || user.username // Use new username if provided, otherwise keep current
    }, process.env.JWT_SECRET, {
      expiresIn: "365d",
    });

    // Save changes
    await user.save();

    return res.status(200).json({
      token: newToken,
      message: "Profile updated successfully"
    });

  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ error: "Failed to update profile" });
  }
};

exports.changePassword = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify the JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get new password from request body
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: "New password is required" });
    }

    // Find the user
    const user = await Blogger.findOne({ where: { username: decoded.username } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });

  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({ error: "Failed to change password" });
  }
};

// Transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.forgotPassword = async (req, res) => {
  const { identifier } = req.body;
  if (!identifier) return res.status(400).json({ error: "Please provide your username or email" });

  try {
    const user = await Blogger.findOne({
      where: identifier.includes("@") ? { email: identifier } : { username: identifier }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.email) {
      return res.status(400).json({ error: "No email linked to this account" });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    user.resetOtp = otp;
    user.resetOtpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Your Password Reset OTP - The Blog Zone",
      html: `<h2>Password Reset Request</h2>
             <p>Hi ${user.name},</p>
             <p>Your OTP for password reset is: <strong style="font-size: 24px;">${otp}</strong></p>
             <p>This OTP will expire in 15 minutes.</p>`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "OTP sent to your email", email: user.email });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Failed to process request" });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await Blogger.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.resetOtp || user.resetOtp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (new Date() > user.resetOtpExpiry) {
      return res.status(400).json({ error: "OTP has expired" });
    }

    // Generate a temporary reset token valid for 15 mins to allow password reset
    const resetToken = jwt.sign({ id: user.id, reset: true }, process.env.JWT_SECRET, { expiresIn: '15m' });

    res.status(200).json({ message: "OTP verified", resetToken });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
};

exports.resetPassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;

  try {
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    if (!decoded.reset) return res.status(400).json({ error: "Invalid token type" });

    const user = await Blogger.findByPk(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetOtp = null;
    user.resetOtpExpiry = null;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(400).json({ error: "Invalid or expired token" });
  }
};

exports.requestEmailUpdate = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { newEmail } = req.body;

    if (!newEmail) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if email is already in use
    const existingEmail = await Blogger.findOne({ where: { email: newEmail } });
    if (existingEmail) {
      return res.status(400).json({ error: "Email is already in use by another account" });
    }

    const user = await Blogger.findByPk(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    user.resetOtp = otp;
    user.resetOtpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save();

    // Create a temporary token containing the target email
    const emailToken = jwt.sign({ newEmail }, process.env.JWT_SECRET, { expiresIn: '15m' });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: newEmail,
      subject: "Verify your Email - The Blog Zone",
      html: `<h2>Email Verification</h2>
             <p>Hi ${user.name},</p>
             <p>Use the following OTP to verify and link this email address to your account:</p>
             <p><strong style="font-size: 24px;">${otp}</strong></p>
             <p>This OTP will expire in 15 minutes.</p>`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "OTP sent to new email", emailToken });
  } catch (error) {
    console.error("Request email update error:", error);
    res.status(500).json({ error: "Failed to process request" });
  }
};

exports.verifyEmailUpdate = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { otp, emailToken } = req.body;

    // Decode the email token to ensure the user is verifying the exact email they requested
    let decodedEmailToken;
    try {
      decodedEmailToken = jwt.verify(emailToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ error: "Invalid or expired email verification session" });
    }

    const targetEmail = decodedEmailToken.newEmail;

    const user = await Blogger.findByPk(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.resetOtp || user.resetOtp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (new Date() > user.resetOtpExpiry) {
      return res.status(400).json({ error: "OTP has expired" });
    }

    // Verify again that email isn't taken (in case someone snatched it in the last 15 mins)
    const existingEmail = await Blogger.findOne({ where: { email: targetEmail } });
    if (existingEmail && existingEmail.id !== user.id) {
      return res.status(400).json({ error: "Email is already in use" });
    }

    user.email = targetEmail;
    user.resetOtp = null;
    user.resetOtpExpiry = null;
    await user.save();

    res.status(200).json({ message: "Email verified and updated successfully", email: targetEmail });
  } catch (error) {
    console.error("Verify email update error:", error);
    res.status(500).json({ error: "Failed to verify email" });
  }
};
