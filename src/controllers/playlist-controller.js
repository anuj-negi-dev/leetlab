import { db } from "../lib/db.js";

export const createPlayList = async (req, res) => {
  const { title, description } = req.body;
  const userID = req.user.id;

  try {
    const playlist = await db.playlist.create({
      data: {
        title,
        description,
        userID,
      },
    });
    return res.json({
      data: playlist,
      message: "Playlist created successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error while creating playlist",
    });
  }
};

export const getPlaylists = async (req, res) => {
  const userID = req.user.id;
  try {
    const playlists = await db.playlist.findMany({
      where: {
        userID,
      },
    });
    return res.json({
      data: playlists,
      message: "Playlists fetched successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error while getting playlists",
    });
  }
};

export const getPlaylist = async (req, res) => {
  const userID = req.user.id;
  const { id } = req.params;
  try {
    const playlist = await db.playlist.findUnique({
      where: {
        id,
        userID,
      },
      include: {
        problemInPlaylist: {
          include: {
            problem: true,
          },
        },
      },
    });
    if (!playlist) {
      return res.status(404).json({
        message: "Playlist not found",
      });
    }
    return res.json({
      data: playlist,
      message: "Playlist fetched successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error while getting playlist",
    });
  }
};

export const deletePlaylist = async (req, res) => {
  const userID = req.user.id;
  const { id } = req.params;
  try {
    const playlist = await db.playlist.findUnique({
      where: {
        id,
        userID,
      },
    });
    if (!playlist) {
      return res.status(404).json({
        message: "Playlist not found",
      });
    }
    await db.playlist.delete({
      where: {
        id,
      },
    });
    return res.json({
      message: "Playlist deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error while deleting playlist",
    });
  }
};

export const addProblemToPlaylist = async (req, res) => {
  const userID = req.user.id;
  const { playlistID, problemID } = req.body;
  try {
    const playlist = await db.playlist.findUnique({
      where: {
        id: playlistID,
        userID,
      },
    });
    if (!playlist) {
      return res.status(404).json({
        message: "Playlist not found",
      });
    }
    const problem = await db.problemInPlaylist.findFirst({
      where: {
        playlistID,
        problemID,
      },
    });
    if (problem) {
      return res.status(400).json({
        message: "Problem already added to playlist",
      });
    }
    await db.problemInPlaylist.create({
      data: {
        playlistID,
        problemID,
      },
    });
    return res.json({
      message: "Problem added to playlist successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error while adding problem to playlist",
    });
  }
};

export const deleteProblemFromPlaylist = async (req, res) => {
  const userID = req.user.id;
  const { playlistID, problemID } = req.params;
  try {
    const playlist = await db.playlist.findUnique({
      where: {
        id: playlistID,
        userID,
      },
    });
    if (!playlist) {
      return res.status(404).json({
        message: "Playlist not found",
      });
    }
    await db.problemInPlaylist.delete({
      where: {
        playlistID_problemID: {
          playlistID,
          problemID,
        },
      },
    });
    return res.json({
      message: "Problem deleted from playlist successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error while deleting problem from playlist",
    });
  }
};
