const jwt = require("jsonwebtoken");
const User = require("../models/User");


const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      if (!token) {
        return res.status(401).json({ message: "توکن وجود ندارد" });
      }

    
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(404).json({ message: "کاربر یافت نشد" });
      }

      next(); 
    } catch (error) {
      console.error("JWT Error:", error.message);
      return res.status(401).json({ message: "توکن معتبر نیست" });
    }
  } else {
    return res.status(401).json({ message: "توکن در هدر یافت نشد" });
  }
};


const adminProtect = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "دسترسی غیرمجاز" });
  }
};

module.exports = { protect, adminProtect };
