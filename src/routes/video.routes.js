import { Router } from "express";
import  {
    publishAVideo,
    getVideoById,
    getAllVideos,
    getMyVideos,
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

router.route("/").get(getAllVideos);
router.route("/my-videos").get(verifyJWT,getMyVideos);
router.route("/:videoId").get(getVideoById);
router.route("/:videoId").patch(upload.fields([{name:"thumbnail",maxCount:1}]),updateVideo);
router.route("/:videoId").delete(deleteVideo);
router.route("/:videoId/toggle-publish").patch(togglePublishStatus);






export default router