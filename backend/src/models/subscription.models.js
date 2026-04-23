/*
subscriptions [icon: money] {
  subscriber ObjectId users
  channel ObjectId users
  createdAt Date
  updatedAt Date
}
*/
import mongoose,{ Schema }  from "mongoose";
const subscriptionSchema=new Schema(
    {  
        subscriber: {
            // one who is SUBSCRIBING is a "user"
            type:Schema.Types.ObjectId,
            ref:"User"
        },
        channel: {
            //one to whome a subscriber is SUBSCRIBING is also a "user"
            //where is subscribing is also a user (channel is also a user)
            type:Schema.Types.ObjectId,
            ref:"User"
        }
    },
    {timestamps: true}
)

export const Subscription=mongoose.model("Subscription",subscriptionSchema)