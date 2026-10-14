import jwt from "jsonwebtoken";

// Creates a signed JWT for a user
const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// Signs a token and sends { token, user } as the response
const sendAuthResponse = (user, statusCode, res) => {
  const token = signToken(user);
  res.status(statusCode).json({ success: true, token, user });
};

export { signToken, sendAuthResponse };
