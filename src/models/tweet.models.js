/*
tweets [icon: twitter] {
  owner ObjectId users
  content string
  createdAt Date
  updatedAt Date  
}
  */

import mongoose,{ Schema }  from "mongoose";
const tweetschema=new Schema(
    {
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

export const Tweets=mongoose.model("Tweets",tweetschema)