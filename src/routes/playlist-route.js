import express from "express";
import { authMiddleware } from "../middleware/auth-middleware.js";
import {
  addProblemToPlaylist,
  createPlayList,
  deletePlaylist,
  getPlaylist,
  getPlaylists,
  deleteProblemFromPlaylist,
} from "../controllers/playlist-controller.js";

const router = express.Router();

router.post("/create", authMiddleware, createPlayList);

router.get("/get-all-playlists", authMiddleware, getPlaylists);

router.get("/get-playlist/:id", authMiddleware, getPlaylist);

router.delete("/delete-playlist/:id", authMiddleware, deletePlaylist);

router.post("/add-problem", authMiddleware, addProblemToPlaylist);

router.delete(
  "/delete/:playlistId/delete-problem/:problemId",
  authMiddleware,
  deleteProblemFromPlaylist
);

export default router;
