import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import bookRouter from "./routers/book_router.js";
import userRouter from "./routers/user.router.js";
import ordermanagerRouter from "./routers/ordermanager.router.js";

dotenv.config();


const app = express();

app.use(cookieParser());
app.use(express.json());


app.use("/book",bookRouter)
app.use("/author",userRouter)
app.use("/order",ordermanagerRouter)



mongoose.connect(process.env.databaseUrl).then(()=>{
  app.listen(3001,()=>{
    console.log("Server is running on port 3001");
  })
})