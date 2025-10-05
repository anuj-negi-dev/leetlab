import express from "express";
import { authMiddleware } from "../middleware/auth-middleware.js";
import { isAdmin } from "../middleware/isAdmin-middleware.js";
import {
  createProblem,
  getAllProblems,
  getProblem,
  updateProblem,
  getAllProblemSolvedByUser,
  deleteProblem,
} from "../controllers/problem-controller.js";

const router = express.Router();

router.post("/create-problem", authMiddleware, isAdmin, createProblem);

router.get("/get-problems", authMiddleware, getAllProblems);

router.get("/get-problem/:id", authMiddleware, getProblem);

router.put("/update-problem/:id", authMiddleware, isAdmin, updateProblem);

router.delete("/delete-problem/:id", authMiddleware, isAdmin, deleteProblem);

router.get("/get-solved-problems", authMiddleware, getAllProblemSolvedByUser);

export default router;
