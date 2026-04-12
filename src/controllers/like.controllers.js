import mongoose, {isValidObjectId} from "mongoose"
import {Likes} from "../models/like.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    const existingLike = await Likes.findOne({
        video: videoId,
        likedBy: req.user._id
    });

    if (existingLike) {
        //unlike if already liked
        await Likes.findByIdAndDelete(existingLike._id);

        return res.status(200).json(
            new ApiResponse(200, {}, "Video unliked")
        );
    }

    //Like if no previous data
    await Likes.create({
        video: videoId,
        likedBy: req.user._id
    });

    return res.status(200).json(
        new ApiResponse(200, {}, "Video liked")
    );
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id");
    }

    const existingLike = await Likes.findOne({
        comment: commentId,
        likedBy: req.user._id
    });

    if (existingLike) {
        await Likes.findByIdAndDelete(existingLike._id);

        return res.status(200).json(
            new ApiResponse(200, {}, "Comment unliked")
        );
    }

    await Likes.create({
        comment: commentId,
        likedBy: req.user._id
    });

    return res.status(200).json(
        new ApiResponse(200, {}, "Comment liked")
    );
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!mongoose.isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id");
    }

    const existingLike = await Likes.findOne({
        tweet: tweetId,
        likedBy: req.user._id
    });

    if (existingLike) {
        await Likes.findByIdAndDelete(existingLike._id);

        return res.status(200).json(
            new ApiResponse(200, {}, "Tweet unliked")
        );
    }

    await Likes.create({
        tweet: tweetId,
        likedBy: req.user._id
    });

    return res.status(200).json(
        new ApiResponse(200, {}, "Tweet liked")
    );
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideos = await Likes.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user._id),
                video: { $ne: null }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails",
                pipeline: [
                    {
                        $project: {
                            title: 1,
                            thumbnail: 1,
                            views: 1,
                            createdAt: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                videoDetails: { $first: "$videoDetails" }
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    );
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}

