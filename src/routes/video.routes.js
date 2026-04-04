import { Router } from "express";
import  {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
} from "../controllers/video.controllers.js"
import {upload} from "../middlewares/multer.middlewares.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js";
const router=Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file
router.route("/publish").post(upload.fields([
    {
        name:"videoFile",
        maxCount:1
    },{
        name:"thumbnail",
        maxCount:1
    }
]),publishAVideo);





export default router