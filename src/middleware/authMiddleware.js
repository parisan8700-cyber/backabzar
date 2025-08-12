const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      if (!token) {
        req.user = null;
        return next();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        req.user = null;
      }

      return next();
    } catch (error) {
      console.error("JWT Error:", error.message);
      req.user = null;  // اگر توکن نامعتبر بود مهمان فرض شود
      return next();
    }
  } else {
    // هیچ توکنی وجود ندارد → حالت مهمان
    req.user = null;
    return next();
  }
};
