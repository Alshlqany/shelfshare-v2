import User from "../models/User.js";
import bcrypt from "bcrypt";
import validator from "validator";
import sendEmail from "../utils/sendEmail.js";
import generateToken from "../utils/generateToken.js";

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const signup = async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;

    if (!validator.isEmail(email))
      return res.status(400).json({ message: "Invalid email" });
    if (!validator.isStrongPassword(password))
      return res.status(400).json({
        message:
          "Password must include uppercase, lowercase, number, and special char",
      });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    const user = new User({
      name,
      email,
      password: hashedPassword,
      address,
      phone,
      otp,
      otpExpires,
    });
    await user.save();

    await sendEmail(email, "Confirm your email", `Your OTP is: ${otp}`);
    res
      .status(201)
      .json({ message: "Account created. Please confirm email via OTP." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  if (user.isVerified)
    return res.status(400).json({ message: "User already verified" });
  if (user.otp !== otp || Date.now() > user.otpExpires)
    return res.status(400).json({ message: "Invalid or expired OTP" });

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();
  res.status(200).json({ message: "Email verified successfully!" });
};

export const resendOTP = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.isVerified)
    return res.status(400).json({ message: "User already verified" });

  const otp = generateOTP();
  user.otp = otp;
  user.otpExpires = Date.now() + 10 * 60 * 1000;
  await user.save();

  await sendEmail(email, "Your new OTP", `Your OTP is: ${otp}`);
  res.status(200).json({ message: "OTP resent successfully." });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });
  if (!user.isVerified)
    return res.status(401).json({ message: "Email not verified" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ message: "Invalid credentials" });

  const token = generateToken(user.id, user.role);

  res.status(200).json({ message: "Login successful", token });
};

export const forgetPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const otp = generateOTP();
  user.otp = otp;
  user.otpExpires = Date.now() + 10 * 60 * 1000;
  await user.save();

  await sendEmail(
    email,
    "Password Reset OTP",
    `Your OTP to reset password is: ${otp}`
  );
  res.status(200).json({ message: "OTP sent to your email" });
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  if (user.otp !== otp || Date.now() > user.otpExpires)
    return res.status(400).json({ message: "Invalid or expired OTP" });

  const hashed = await bcrypt.hash(newPassword, 10);
  user.password = hashed;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  res.status(200).json({ message: "Password reset successfully" });
};
