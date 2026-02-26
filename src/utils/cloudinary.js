import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

 // Configuration of cloudinary
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDIANRY_API_SECRET
    });

const uploadOnCloudinary =  async (localFilePath)=>{
    try {
        if (!localFilePath) return null
        const response= await cloudinary.uploader.upload(
            localFilePath, {
                resource_type : "auto" //automatically detects what file is comming in
            }
        )
        console.log("file uploaded on cloudinary. file src: "+ response.url);
        //once the file is uploaded , we would like to delete it from our server
        fs.unlinkSync(localFilePath)
        return response
        
    } catch (error) {
        //if something goes wrong in upload file to the cloudinary we would like to remove this file from our server
        fs.unlinkSync(localFilePath) //unlinksync-undefined 
        return null
    }
}

export {uploadOnCloudinary}