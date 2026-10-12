
export const validateAvailabilityQuery = (req, res, next) => {
  const { checkIn, checkOut, minPrice, maxPrice, guests } = req.query;

  if (Boolean(checkIn) !== Boolean(checkOut)) {
    return res.status(400).json({
      success: false,
      message: "Both checkIn and checkOut are required together.",
    });
  }

  if (checkIn && checkOut) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid check-in and check-out dates.",
      });
    }

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: "Check-out must be after check-in.",
      });
    }
  }

  for (const [field, value] of [
    ["minPrice", minPrice],
    ["maxPrice", maxPrice],
    ["guests", guests],
  ]) {
    if (value !== undefined) {
      const number = Number(value);

      if (
        value.trim() === "" ||
        !Number.isFinite(number) ||
        number < 0 ||
        (field === "guests" && (!Number.isInteger(number) || number < 1))
      ) {
        return res.status(400).json({
          success: false,
          message: `${field} must be a valid ${field === "guests" ? "positive whole number" : "non-negative number"}.`,
        });
      }
    }
  }

  if (
    minPrice !== undefined &&
    maxPrice !== undefined &&
    Number(minPrice) > Number(maxPrice)
  ) {
    return res.status(400).json({
      success: false,
      message: "minPrice cannot be greater than maxPrice.",
    });
  }

  next();
};
