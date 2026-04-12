import mongoose from "mongoose"
import { Video } from "../models/video.models.js"
import { Tweets } from "../models/tweet.models.js"
import {Comments} from "../models/comment.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const addComment = asyncHandler(async (req, res) => {
    // adding comment to video or tweet
    const { videoId, tweetId } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment cannot be empty");
    }

    if (!videoId && !tweetId) {
        throw new ApiError(400, "VideoId or TweetId is required");
    }
    const commentData = {
        content: content.trim(),
        owner: req.user._id
    };

    //in case of video
     if (videoId) {
        if (!mongoose.isValidObjectId(videoId)) {
            throw new ApiError(400, "Invalid video id");
        }
        //adding "video" property to commentData object with value videoId
        // obj.key=value
        commentData.video = videoId;  
    }
    //in case of tweet
     if (tweetId) {
        if (!mongoose.isValidObjectId(tweetId)) {
            throw new ApiError(400, "Invalid tweet id");
        }
        // obj.key=value
        commentData.tweet = tweetId;  
    }

      if (videoId && tweetId) {
        throw new ApiError(400, "Comment cannot belong to both video and tweet");
    }

    const comment = await Comments.create(commentData);
     return res.status(201).json(
        new ApiResponse(201, comment, "Comment added successfully")
    );

})


const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    let { page = 1, limit = 10 } = req.query;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    // converting pagination values
    page = Math.max(1, parseInt(page));
    limit = Math.max(1, parseInt(limit));

    const skip = (page - 1) * limit;

    
    const comments = await Comments.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },

        // joining with users who commented
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

        //convert array to object
        {
            $addFields: {
                ownerDetails: { $first: "$ownerDetails" }
            }
        },

        // sorting of comments
        {
            $sort: { createdAt: -1 }
        },

        // adding pagination
        { $skip: skip },
        { $limit: limit },
        {
            $project: {
                content: 1,
                createdAt: 1,
                ownerDetails: 1
            }
        }
    ]);

    // counting of comments
    const totalComments = await Comments.countDocuments({
        video: videoId
    });

    return res.status(200).json(
        new ApiResponse(200, {
            comments,
            page,
            limit,
            totalComments,
            totalPages: Math.ceil(totalComments / limit)
        }, "Comments fetched successfully")
    );
});


const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id");
    }

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content cannot be empty");
    }

    const comment = await Comments.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment.owner.toString() != req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to update this comment");
    }

    comment.content = content.trim();

    await comment.save();

    return res.status(200).json(
        new ApiResponse(200, comment, "Comment updated successfully")
    );
});

/*
const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id");
    }

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content cannot be empty");
    }

    const updatedComment = await Comments.findOneAndUpdate(
        {
            _id: commentId,
            owner: req.user._id
        },
        {
            $set: { content: content.trim() }
        },
        { new: true }
    );

    if (!updatedComment) {
        throw new ApiError(404, "Comment not found or unauthorized");
    }

    return res.status(200).json(
        new ApiResponse(200, updatedComment, "Comment updated successfully")
    );
});
*/

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id");
    }

    const comment = await Comments.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment.owner.toString() != req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to delete this comment");
    }

    await Comments.findByIdAndDelete(commentId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Comment deleted successfully")
    );
});


export {
    addComment, 
    getVideoComments, 
    updateComment,
     deleteComment
    }
