import express from "express";
import { upload } from "../middleware/multer-middleware.js";
import { authMiddleware } from "../middleware/auth-middleware.js";
import { uploadProfileImage } from "../controllers/profile-controller.js";

const router = express.Router();

router.post(
  "/upload-image",
  authMiddleware,
  upload.single("image"),
  uploadProfileImage
);

export default router;
