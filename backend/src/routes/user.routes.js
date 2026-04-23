import { Router } from "express";
import { 
    refreshAccessToken,
    registerUser ,
    logoutUser,
    loginUser,
    changeCurrentPassword,
    getCurrentUser,
    getUserChannelProfile,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getWatchHistory,
} from "../controllers/user.controllers.js";

import {upload} from "../middlewares/multer.middlewares.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js";
const router=Router()

//post req because data will be sent to server
//unsecured routes
router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount: 1
        },{
            name:"coverImage",
            maxCount: 1
        }
    ]),
    registerUser) 

         //login route
router.route("/login").post(loginUser)
router.route("/refresh-token").post(refreshAccessToken)



//secured routes

router.route("/logout").post(verifyJWT,logoutUser)
router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/current-user").get(verifyJWT,getCurrentUser)
router.route("/channel/:username").get(verifyJWT,getUserChannelProfile)
router.route("/update-account").patch(verifyJWT,updateAccountDetails)
router.route("/history").get(verifyJWT,getWatchHistory)

//files route secured
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)


export default router 