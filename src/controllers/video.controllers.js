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
    //extract query params
    let { page = 1, limit = 10, query, sortBy="createdAt", sortType="desc", userId } = req.query
    //converting types(query params[strings]-->int)
    page = Math.max(1, parseInt(page) || 1);
    limit = Math.max(1, parseInt(limit) || 10);
    //items to ignore before starting to return data
    const skip=(page-1)*limit;

    const allowedSortFields = ["createdAt", "views"];

    if (!allowedSortFields.includes(sortBy)) {
        sortBy = "createdAt";
    }
    
    const sortOrder = sortType === "asc" ? 1 : -1;
    //Match condition 
    const match = {isPublished: true};
    if (query) {
        match.$or = [          //adding new condition to match object
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ];
        }

    if (userId && mongoose.isValidObjectId(userId)) {
        match.owner = new mongoose.Types.ObjectId(userId);
        }

    //finding videos using aggregation
     const videos = await Video.aggregate([
        { $match: match },

        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullname: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },

        {
            $addFields: {
                ownerDetails: { $first: "$ownerDetails" }
            }
        },

        {
            $sort: {
                [sortBy]: sortOrder
            }
        },

        { $skip: skip },
        { $limit: limit },

        {
            $project: {
                title: 1,
                thumbnail: 1,
                views: 1,
                duration: 1,
                createdAt: 1,
                ownerDetails: 1
            }
        }
    ]);

    const totalVideos = await Video.countDocuments(match);

    return res.status(200).json(
        new ApiResponse(200, {
            videos,
            page,
            limit,
            totalVideos,
            totalPages: Math.ceil(totalVideos / limit)
        }, "Videos fetched successfully")
    );

})


const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description }= req.body;

    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400,"invalid video id")
    }
    //finding video
    const video = await Video.findById(videoId);
     if (!video) {
        throw new ApiError(404, "Video not found");
    }

     //Checking ownership
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video");
    }
    //updating of title and description
    try {
        if (title && title.trim() != "") {
            video.title = title;
            console.log("title updated")
        }
        if (description && description.trim() != "") {
            video.description = description;
            console.log("description updated")
        }

    } catch (error) {
        throw new ApiError(400,"error updating video details")
    }

    //updating thumbnail
    const thumbnailLocalPath=req.files?.thumbnail?.[0]?.path;
    if(thumbnailLocalPath){
        try {
            const thumbnailUpload=await uploadOnCloudinary(thumbnailLocalPath)

            if(video.thumbnail){
                const publicId=video.thumbnail.split("/").pop().split(".")[0];
                await deleteFromCloudinary(publicId);
            }

             video.thumbnail = thumbnailUpload.secure_url;
        } catch (error) {
            throw new ApiError(500, "Failed to update thumbnail");
        }
    }

    //Save updated video
    await video.save();
    return res.status(200).json(
        new ApiResponse(200, video, "Video updated successfully")
    );
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const userId=req.user._id

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    //finding video
    const video= await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"video not found")
    }
    // allow deletion only when the current user is the owner of that video
    if(video.owner.toString() != userId.toString()){
       throw new ApiError(400,"you are not authorised to delete this video")
    }

    //delete from cloudinary
    try {
        if (video.videoFile) {
            const videoPublicId = video.videoFile.split("/").pop().split(".")[0];
            await deleteFromCloudinary(videoPublicId, "video");
        }

        if (video.thumbnail) {
            const thumbnailPublicId = video.thumbnail.split("/").pop().split(".")[0];
            await deleteFromCloudinary(thumbnailPublicId, "image");
        }
    } catch (error) {
        console.log("Cloudinary deletion error:", error);
    }
    //delete from db
    await Video.findByIdAndDelete(videoId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Video deleted successfully")
    );
})

const togglePublishStatus = asyncHandler(async (req, res) => {
   const { videoId }=req.params;

   if(!mongoose.isValidObjectId(videoId)){
    throw new ApiError(400,"invalid video id")
   }

   const video= await Video.findById(videoId);
   if(!video){
    throw new ApiError(404,"video not found")
   }
   
   if (video.owner.toString() != req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized");
    }

    //toggle
    video.isPublished=!video.isPublished;

    await video.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            { isPublished: video.isPublished },
            `Video is now ${video.isPublished ? "Published" : "Unpublished"}`
        )
    );
})

export {
    publishAVideo,
    getVideoById,
    getAllVideos,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
