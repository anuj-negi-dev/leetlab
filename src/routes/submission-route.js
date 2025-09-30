import express from "express";
import { authMiddleware } from "../middleware/auth-middleware.js";
import {
  submitCode,
  getAllSubmissions,
  getSubmission,
  getSubmissionsCount,
} from "../controllers/submitCode-controller.js";

const router = express.Router();

router.post("/submit", authMiddleware, submitCode);

router.get("/get-all-submissions", authMiddleware, getAllSubmissions);

router.get("/get-submission/:problemID", authMiddleware, getSubmission);

router.get(
  "/get-submissions-count/:problemID",
  authMiddleware,
  getSubmissionsCount
);

export default router;
