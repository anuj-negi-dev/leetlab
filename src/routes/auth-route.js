import express from "express";
import {
  login,
  logout,
  register,
  self,
} from "../controllers/auth-controller.js";
import { authMiddleware } from "../middleware/auth-middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);
router.get("/self", authMiddleware, self);

export default router;
