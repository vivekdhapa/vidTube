/*comments [icon: comment] {
  id string pk
  video ObjectId videos
  tweet ObjectId tweets
  owner ObjectId users
  content string
  createdAt Date
  updatedAt Date
}*/

import mongoose,{ Schema }  from "mongoose";
import mongooseAggregatePaginate from "mongoose-paginate-v2";
const commentsSchema=new Schema(
    {   //either of 'video','comment' or 'tweet' will be assigned others are null
        video: {
            type:Schema.Types.ObjectId,
            ref:"Video"
        },
        tweet: {
            type:Schema.Types.ObjectId,
            ref:"Tweet"
        },
        owner: {
            type:Schema.Types.ObjectId,
            ref:"User"
        },
        content:{
            type:String,
            required:true
        }
    },
    {timestamps: true}
)
commentsSchema.plugin(mongooseAggregatePaginate)
export const Comments=mongoose.model("Comments",commentsSchema)