export const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Mongoose Validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: Object.values(err.errors).map((error) => error.message),
    });
  }

  // Invalid MongoDB data format
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid data format",
    });
  }

  // Duplicate unique field
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "A record with this value already exists",
    });
  }

  // Invalid JSON sent by the client
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON request body",
    });
  }
  // unexpected server errors
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
