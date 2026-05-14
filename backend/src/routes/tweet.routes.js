import { Router } from 'express';
import {
    createTweet,
    deleteTweet,
    getUserTweets,
    getAllTweets,
    updateTweet,
} from "../controllers/tweet.controllers.js"
import {verifyJWT} from "../middlewares/auth.middlewares.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/create-tweet").post(createTweet);
// router.route("/user/:userId").get(getUserTweets);
// router.route("/get-my-tweets").get(getUserTweets);
router.route("/all-tweets").get(getAllTweets);
router.route("/user-tweets/:username").get(getUserTweets);

router.route("/update/:tweetId").patch(updateTweet);
router.route("/delete/:tweetId").delete(deleteTweet);

export default router