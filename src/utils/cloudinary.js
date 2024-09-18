import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
cloudinary.config({
  cloud_name: "munawar-cloud",
  api_key: "816326782994632310",
  api_secret: "thisIsMyApiSecretKeyWhichIDontWntToTellYou",
});

//upload file on cloudiary
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //upload method to upload file on cloudinary

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", // check by yourself which type of file is uploaded , image  or video etc
    });

    //check if file is uploaded
    console.log("file is uploaded on cloudinary", response.url); //file upload hony k uska url print krwa lyn
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); //remove the locally saved file on cloudinary , if operation got failed
    return null;
  }
};

export { uploadOnCloudinary };
