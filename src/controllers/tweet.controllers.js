import mongoose, { isValidObjectId } from "mongoose"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Tweets } from "../models/tweet.models.js"

const createTweet = asyncHandler(async (req, res) => {
    //content--->frontend 
    //check if content is empty-->throw error if yes
    //create tweet inside tweet varibale -->place content and owner
    const {content}=req.body
    if(!content || content.trim()===""){
        throw new ApiError(400,"content cannot be empty")
    }
    try {
        const tweet=await Tweets.create({
            content,
            owner:req.user?._id 
        });
        console.log("check tweet:",tweet);
        if(!tweet){
            throw new ApiError(400,"tweet could not be created")
        }

        return res.status(200).json(new ApiResponse(200,tweet,"tweet created successfully"))

    } catch (error) {
        throw new ApiError(400,"error creating tweet, try again")
    }


})  

const getUserTweets = asyncHandler(async (req, res) => {

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
