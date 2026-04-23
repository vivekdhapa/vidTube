import { Router } from "express";
import { addComment, 
        getVideoComments, 
        updateComment,
        deleteComment 
    } from "../controllers/comment.controllers.js"

    import { verifyJWT } from "../middlewares/auth.middlewares.js";

    const router=Router();
    router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

    router.route("/video/:videoId").post(verifyJWT,addComment)
    router.route("/tweet/:tweetId").post(verifyJWT,addComment)
    router.route("/video-comments/:videoId").get(verifyJWT,getVideoComments)
    router.route("/update/:commentId").patch(verifyJWT,updateComment)
    router.route("/delete/:commentId").delete(verifyJWT,deleteComment)





    export default router
    
    