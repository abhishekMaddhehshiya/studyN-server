import { v2 as cloudinary } from "cloudinary";
 const uploadVideoToCloudinary = async (file,folder,height, quality )=>{
    const options = {folder}
    
    options.resource_type = "video";
    options.format= "mp4"

    const url =  await cloudinary.uploader.upload(file.tempFilePath, options);
    return url;
}

export default uploadVideoToCloudinary