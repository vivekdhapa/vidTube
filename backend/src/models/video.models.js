import mongoose ,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-paginate-v2";
const videoSchema=new Schema(
    {
        videoFile:{
            type:String, //cloudinary URL
            required: true,   
        },
        thumbnail:{
            type:String, //cloudinary URL
            required: true, 
        },
        title:{
            type:String,
            required: true, 
        },
        description:{
            type:String,
            required: true
        },
        duration:{
            type:Number,
            required:true
        },
        views:{
            type:Number,
            default:0 //by default views is 0
        },
        isPublished:{
            type:Boolean,
            default:true
        },
        owner:{ //objectid[] user (will come from user)
            type:Schema.Types.ObjectId,
            ref:"User"
        }
    },{timestamps:true}
)

videoSchema.plugin(mongooseAggregatePaginate)
export const Video=mongoose.model("Video",videoSchema)