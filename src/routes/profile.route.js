import express from "express";
import { upload } from "../middleware/multer-middleware.js";
import { authMiddleware } from "../middleware/auth-middleware.js";
import {
  uploadProfileImage,
  updateProfile,
  deleteProfile,
} from "../controllers/profile-controller.js";

const router = express.Router();

router.post(
  "/upload-image",
  authMiddleware,
  upload.single("image"),
  uploadProfileImage
);

router.patch("/update-profile", authMiddleware, updateProfile);

router.delete("/delete-profile", authMiddleware, deleteProfile);

export default router;
