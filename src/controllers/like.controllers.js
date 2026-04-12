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
    const {tweetId} = req.params
    //TODO: toggle like on tweet
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}

