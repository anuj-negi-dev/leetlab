import express from "express";
import { authMiddleware } from "../middleware/auth-middleware.js";
import { isAdmin } from "../middleware/isAdmin-middleware.js";
import { createProblem } from "../controllers/problem-controller.js";

const router = express.Router();

router.post("/create-problem", authMiddleware, isAdmin, createProblem);

export default router;
