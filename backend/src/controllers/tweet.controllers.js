import mongoose, { isValidObjectId } from "mongoose"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Tweets } from "../models/tweet.models.js"
import { updateAccountDetails } from "./user.controllers.js"

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
 // approach 1:
    // const { userId } = req.params;

    // if (!userId) {
    //     throw new ApiError(400, "UserId is required");
    // }

    // const tweets = await Tweets.find({
    //     owner: userId
    // })
    // .sort({ createdAt: -1 })
    // .populate("owner", "username fullname avatar");

    // return res.status(200).json(
    //     new ApiResponse(200, tweets, "Tweets fetched successfully")
    // );

//approach 2 using aggregation pipeline
            //getting userid from url
            //checking userid's existence 
            //matching if tweet.owner === userId  userid=123456(form url) Tweets.owner=123456(from db)
            //nextpipeline extracts details of owners whose userid is matched (this returns an array)
            //$unwind:"$ownerDetails" converts array into single object
            //project and sort lifo
    const {username} = req.params;
    const user=await User.findOne({username});
    if(!user){
        throw new ApiError(400,"User not found");
    }
    
    try {
        const allTweets=await Tweets.aggregate([
            {
                $match:{
                    owner:user._id,
                    // owner:new mongoose.Types.ObjectId(userId)//mongodb stores _id as objectid not as string so we convert string to objectid
                }
            },{
                $lookup:{
                    from:"users",
                    localField:"owner",
                    foreignField:"_id",
                    as:"ownerDetails"
                }
            },{
                $unwind:"$ownerDetails"
            },{
                $project:{
                    content:1,
                    createdAt:1,
                    "ownerDetails.username":1,
                    "ownerDetails.fullname":1,
                    "ownerDetails.avatar":1,
    
                }
            },{
                $sort:{
                    createdAt:-1
                }
            }
        ]);
    
        return res.status(200).json(new ApiResponse(200,allTweets,"Tweets fetched successfully"))
    } catch (error) {
        throw new ApiError(400,"error fetching tweets")
    }
});



// const getMyTweets = asyncHandler(async (req, res) => {
// try {
//         const myTweets=await Tweets.aggregate([
//             {
//                 $match:{
//                     owner: new mongoose.Types.ObjectId(req.user._id)
//                 }
//             },
//             {
//                 $lookup:{
//                     from:"users",
//                     localField:"owner",
//                     foreignField:"_id",
//                     as:"ownerDetails"
//                 } 
//             },
//             {
//                 $unwind:"$ownerDetails"
//             },{
//                 $project:{
//                     content:1,
//                     createdAt:1,
//                     "ownerDetails.username":1,
//                     "ownerDetails.fullname":1,
//                     "ownerDetails.avatar":1,
    
//                 }
//             },{
//                 $sort:{createdAt:-1}
//             }
//         ])
    
//         return res.status(200).json(new ApiResponse(200,myTweets,"tweets fetched successfully"))
// } catch (error) {
//     throw new ApiError(400,"error fetching tweets")
// }
// });

const updateTweet = asyncHandler(async (req, res) => {
    //tweet must exist
    //only onwer can update
    //content cant be empty
    const {tweetId}=req.params;
    const {content}=req.body;

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"invalid tweet id")
    }
    if(!content || content.trim()===""){
        throw new ApiError(400,"content cannot he empty")
    }
    const updatedTweet=await Tweets.findByIdAndUpdate(
        {
            _id:tweetId,
            owner:req.user?._id
        },
        {
            $set:{content}
        },
        {
            new:true
        }
    );
    if(!updateTweet){
        throw new ApiError(404,"tweet not found or unauthorized")
    }
     return res.status(200).json(
        new ApiResponse(200, updatedTweet, "Tweet updated successfully")
    );

})

const deleteTweet = asyncHandler(async (req, res) => {
    //only if user owns a tweet 
    const {tweetId}=req.params;
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"invalid tweet id")
    }
    const deleteTweet=await Tweets.findOneAndDelete(
        {
            _id:tweetId,
            owner: req.user?._id,
        }
    );
     if (!deleteTweet) {
        throw new ApiError(404, "Tweet not found or unauthorized");
    }
     return res.status(200).json(
        new ApiResponse(200, {}, "Tweet deleted successfully")
    );
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
