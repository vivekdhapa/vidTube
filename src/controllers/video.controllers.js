import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary,deleteFromCloudinary} from "../utils/cloudinary.js"

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body;
    if(!title || title.trim()===""){
        throw new ApiError (400,"title is required")
    }
    //giving local file path of video and thumbnail
    const videoLocalPath= req.files?.videoFile?.[0]?.path
    const thumbnailLocalPath= req.files?.thumbnail?.[0]?.path
    if(!videoLocalPath){
        throw new ApiError(400,"video file is required")
    }
    if(!thumbnailLocalPath){
        throw new ApiError(400,"thumbnail is required")
    }
    //uploading on cloudinary
    let videoUpload;
    try {
        videoUpload=await uploadOnCloudinary(videoLocalPath)
        console.log("video uploaded", videoUpload);
    } catch (error) {
        console.log("Error uploading video",error);
        throw new ApiError(500,"failed to upload video")
    }
    let thumbnailUpload;
    try {
        thumbnailUpload=await uploadOnCloudinary(thumbnailLocalPath)
        console.log("thumbnail uploaded", thumbnailUpload);
    } catch (error) {
        console.log("Error uploading thumbnail",error);
        throw new ApiError(500,"failed to upload thumbnail")
    }

    if (!videoUpload?.url) {
    throw new ApiError(500, "Video upload failed");
    }

    if (!thumbnailUpload?.url) {
    throw new ApiError(500, "Thumbnail upload failed");
    }
    //creating Video document in DB
    try {
        const video=await Video.create({
            title,
            description,
            videoFile:videoUpload?.url,
            thumbnail:thumbnailUpload?.url,
            owner:req.user._id,
            duration: await videoUpload.duration||0,
            views:0,    
            isPublished:true,
        })

        const createdVideo= await Video.findById(video?._id) //we already have video
        // const createdVideo= video;            
        if(!createdVideo){
            throw new ApiError(500,"something went wrong")
        }

        return res
        .status(201)
        .json( new ApiResponse(200, createdVideo,"Video created successfully"))
    } catch (error) {
        console.log("failed to upload video",error);

        if(videoUpload){
            await deleteFromCloudinary(videoUpload.public_id)
        }
        if (thumbnailUpload) {
            await deleteFromCloudinary(thumbnailUpload.public_id)
        }
        throw new ApiError(500,"something went wrong while creating a video and files were deleted")
    }
})


const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"invalid video id");
    }
    //incrementing view count
    await Video.findByIdAndUpdate(
        videoId,
        {$inc: {views:1} },
        {new : true}
    );
    const video=await Video.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(videoId)
            }
        },{
             $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"ownerDetails",
                pipeline:[
                   { $project:{
                        username:1,
                        fullname:1,
                        avatar:1
                    }}
                ]
            }
        },{
            $addFields:{
                ownerDetails:{$first:"$ownerDetails"}
            }
        },{
            $project:{
                title:1,
                description:1,
                videoFile:1,
                thumbnail:1,
                views:1,
                duration:1,
                createdAt:1,
                ownerDetails:1
            }
        }
        
    ]);
    if(!video|| video.length===0){
        throw new ApiError(404,"video not found");
    }

    await User.findByIdAndUpdate(req.user._id,{
        $addToSet: {watchHistory:videoId}        
    })
    console.log("added to watchHistory");
    return res.status(200).json(new ApiResponse(200,video[0],"video fetched successfully"))

})

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})


const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    publishAVideo,
    getVideoById,
    getAllVideos,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
