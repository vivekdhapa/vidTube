/*
users [icon: user] {
  id string pk
  username string
  email string
  fullName string
  avatar string
  coverImage string
  watchHistory ObjectId[] videos
  password string
  refreshToken string
  createdAt Date
  updatedAt Date
}
   */


import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema =new Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
        },
        fullname:{
            type:String,
            required:true,
            trim:true,
            index:true
        },
        avatar:{
            type:String,   //cloudinary URL
            required:true
        },
        coverImage:{
            type:String,   //cloudinary URL
            
        },
        //objectid[] videos (will come from videos)
        watchHistory: [
            {
                //imp syntax to import something from diff model
                type:Schema.Types.ObjectId,//but objectids form where?
                ref: "Video"
            }
        ],
        password: {
            type:String,
            required: [true,"password is required"], //ifFalseWhatMessage 
        },
        refreshToken:{
            type:String
        }
    },
    {timestamps: true}
)

userSchema.pre("save", async function (next){
    if(!this.modified("password") )return next() //we dont want to encrypt password everytime but only when password is updated
    this.password=bcrypt.hash(this.password,10) 
    next()
})
//now we'll compare the encryped password with the user entered password

userSchema.methods.isPasswordCorrect=async function(password){
   return await bcrypt.compare(password,this.password)
}

userSchema.method.generateAccessToken= function (){
    //short lived access token
    return jwt.sign({
//stored users in db's info
       _id: this._id,
       email: this.email,
       username: this.username,
       fullname : this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,    
    { expiresIn:process.env.ACCESS_TOKEN_EXPIRY}
    );
}
userSchema.method.generateRefreshToken= function (){
    //long lived token
    return jwt.sign({
//stored users in db's info
       _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,    
    { expiresIn:process.env.REFRESH_TOKEN_EXPIRY}
    );
}






export const User = mongoose.model("User",userSchema)