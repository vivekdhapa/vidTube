import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import {uploadOnCloudinary,deleteFromCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const registerUser=asyncHandler(async (req,res)=>{
   
    const {fullname,email,username,password}=req.body

    //validation
    if(
        [fullname,username,email,password].some((field)=> field?.trim()=== "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    //checking if the user already exists with the same name or email
    //mongodb  query using operator
    //findOne() means:Find the first document that matches the condition.
    //$or is a MongoDB operator which means Match if ANY one condition is true.
    const existedUser=await User.findOne({
        $or:[{username},{email}]
    })

    if(existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }

    //handling images

    console.warn(req.files)
    const avatarLocalPath=req.files?.avatar?.[0]?.path
    const coverLocalPath=req.files?.coverImage?.[0]?.path
    if(!avatarLocalPath){
        throw new ApiError(400,"avatar file is missing")
    }


    //uploading to cloudinary
    // const avatar=await uploadOnCloudinary(avatarLocalPath)
    // const coverImage=""
    // if(coverLocalPath){
    //     coverImage=await uploadOnCloudinary(coverLocalPath)
    // }
    let avatar;
    try {
        avatar= await uploadOnCloudinary(avatarLocalPath)
        console.log("uploaded avatar",avatar);
    } catch (error) {
        console.log("Error uploading avatar",error);
        throw new ApiError(500,"failed to upload avatar")
    }
    let coverImage;
    try {
        coverImage= await uploadOnCloudinary(coverLocalPath)
        console.log("uploaded coverImage",coverImage);
    } catch (error) {
        console.log("Error uploading coverImage",error);
        throw new ApiError(500,"failed to upload coverImage")
        
    }


    //construct a user -mongoose mongodb or creating a user
    try {
        const user= await User.create({
           fullname:fullname, 
           avatar:avatar.url,
           coverImage:coverImage?.url || "" ,
           email,
           username:username.toLowerCase(),
           password
        })
        //this is comming from database
        const createdUser=await User.findById(user._id).select("-password -refreshToken")
    
        if(!createdUser){
            throw new ApiError(500,"something went wrong while registering a user")
        }
        return res
        .status(201)
        .json( new ApiResponse(200, createdUser),"user registered successfully")
    } catch (error) {
        console.log("user creation failed",error);
        //if user is not created delete those avatar and coverimages from cloudiinary
        if(avatar){
            await deleteFromCloudinary(avatar.public_id)
        }
        if (coverImage) {
            await deleteFromCloudinary(coverImage.public_id)
        }
        throw new ApiError(500,"something went wrong while registering a user and images were deleted")
    }

})


export {
    registerUser
}