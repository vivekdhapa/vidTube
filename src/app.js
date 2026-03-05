import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
const app=express()

//who can talk to your application
//cors- cross origin resourse sharing(basically to make our app more secure)
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true
        
    })
)
//common middlewares 
//express's middleware to make our app even more secure
//express.json so thata all the json data is allowed to come in
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({ extended : true, limit:"16kb"}))
app.use(express.static("public")) //used to serve any static files eg. html css image video pdf etc

app.use(cookieParser())

//import routes
import heathcheckRouter from "./routes/healthcheck.routes.js"
import userRouter from "./routes/user.routes.js"
import { errorHandler } from "./middlewares/error.middleweares.js"


//routes
app.use("/api/v1/healthcheck",heathcheckRouter)
app.use("/api/v1/users",userRouter)


//error handler
//app.use(errorHandler)


export { app }