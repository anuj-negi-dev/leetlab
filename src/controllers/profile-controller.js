import { db } from "../lib/db.js";
import { uploadImage } from "../lib/cloudinary.js";

export const uploadProfileImage = async (req, res) => {
  const userID = req.user.id;
  const { path } = req.file;
  try {
    const user = await db.user.findUnique({
      where: {
        id: userID,
      },
    });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    const imageUrl = await uploadImage(path);
    await db.user.update({
      where: {
        id: userID,
      },
      data: {
        image: imageUrl,
      },
    });
    return res.json({
      message: "Image uploaded successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error while uploading image",
    });
  }
};
