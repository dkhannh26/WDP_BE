const auth = (req, res, next) => {
  const token = req.headers["authorization"];

  if (token) {
    next();
  } else {
    res
      .status(401)
      .json({ message: "Please login to continue", isAuthenticated: false });
  }
};

module.exports = auth;
