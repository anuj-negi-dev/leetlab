import { v2 as cloudinary } from "cloudinary";
import fs from "node:fs/promises";

export const cloudinaryConfig = cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (filePath) => {
  try {
    if (!filePath) return null;
    const data = await cloudinary.uploader.upload(filePath);
    await fs.unlink(filePath);
    return data.url;
  } catch (error) {
    await fs.unlink(filePath);
    console.error(error);
    return null;
  }
};
