import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
import dotevn from "dotenv"
import { log } from 'console';

dotevn.config()

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
        console.log("error on cloudinary",error)
        fs.unlinkSync(localFilePath) //unlinksync-undefined 
        return null
    }
}

const deleteFromCloudinary= async (publicId)=>{
    try {
        const result= await cloudinary.uploader.destroy(publicId)
        console.log("deleted from cloudinary. PublicId:",publicId);
        
    } catch (error) {
        console.log("Error deleting from cloudinary",error)
        return null
    }
}





export {uploadOnCloudinary,deleteFromCloudinary}