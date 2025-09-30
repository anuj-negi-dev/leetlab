import express from "express";
import { authMiddleware } from "../middleware/auth-middleware.js";
import { submitCode } from "../controllers/submitCode-controller.js";

const router = express.Router();

router.post("/submit", authMiddleware, submitCode);

export default router;
