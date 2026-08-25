import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  try {
    // const authHeader = req.headers.Authorization;
    const token =  req.headers.authorization?.split(" ")[1] ;


    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const user = await User.findById({ _id: decoded.id });

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    const userStatus = (user.status || "Active").toLowerCase();
    if (userStatus === "deactive" || userStatus === "inactive") {
      return res.status(403).json({ success: false, message: "Your account is deactivated. Please contact the administrator." });
    }

    if (userStatus === "blocked") {
      return res.status(403).json({ success: false, message: "Your account is blocked. Access denied." });
    }
    
    req.user = {
      id: user._id,
      name: user.name,
      role: user.role,
      status: user.status || "Active",
    };
    next();
  } catch (error) {
    console.error("Error in authMiddleware:", error);
    return res.status(500).json({ success: false, message: "Internal server error in middleware" });
  }
};

export default authMiddleware;

