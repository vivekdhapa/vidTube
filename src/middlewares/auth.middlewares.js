import jwt from "jsonwebtoken"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {asyncHandler} from "../utils/asyncHandler.js"



export const verifyJWT= asyncHandler(async(req,_,next)=>{ 
    const token=req.cookie.accessToken|| req.header("Authorization")?.replace("Bearer ","")
    if(!token){
        throw new ApiError(401,"Unauthorized")
    }

    try {
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user=await User.findById(decodedToken?._id).select("-password -refreshToken")

        if(!user){
        throw new ApiError(401,"Unauthorized")

        req.user=user //user containing value (extracted)
        next() //trasfering the req and flow of control from middleware to controller
    }
    } catch (error) {
        throw new ApiError(401,error?.meassage || "invalid access token")
    }

    //we need to set up the route that connects this middleware and controller together
})