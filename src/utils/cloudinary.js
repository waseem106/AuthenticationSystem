import { v2 as cloudinary } from "cloudinary";
import { error } from "console";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const uploadOnCloudinary = async (localpath) => {
  try {
    const absolutePath = path.resolve(localpath);
    if (!fs.existsSync(absolutePath)) {
    
      console.error("File doesnot exist in given path", error);
    }

    const response = await cloudinary.uploader.upload(absolutePath, {
      resource_type: "auto",
    });
    if (!response) {
      console.error("Image doesnot uploaded on the cloudinary");
    }
    console.log("Image uploaded on cloudinary successfully", response.url);
    fs.unlinkSync(absolutePath);
    return response;
  } catch (error) {
    console.error("Error uploading image on cloudinary", error);
    console.log(
      process.env.CLOUDINARY_API_KEY,
      process.env.CLOUDINARY_CLOUD_NAME
    );
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
    return null;
  }
};

export default uploadOnCloudinary;
