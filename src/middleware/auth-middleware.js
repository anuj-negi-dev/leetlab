import jwt from "jsonwebtoken";
import { db } from "../lib/db.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const { accessToken } = req.cookies;
    if (!accessToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);
    const user = await db.user.findUnique({
      where: {
        id: decodedToken.id,
      },
      select: {
        id: true,
        userName: true,
        email: true,
        role: true,
      },
    });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Error while authenticating user",
    });
  }
};
