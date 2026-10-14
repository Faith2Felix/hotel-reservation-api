import jwt from "jsonwebtoken";

// Creates a signed JWT for a user
const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// Sends the token and only safe user fields
const sendAuthResponse = (user, statusCode, res) => {
  const token = signToken(user);

  const safeUser = {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isActive: user.isActive,
  };

  return res.status(statusCode).json({
    success: true,
    token,
    user: safeUser,
  });
};

export { signToken, sendAuthResponse };
