import express from "express";

import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
// app.use(cors);
//we have to get data from user or frontend so we have to prepare for what type of data we are collecting, so first set middlewares
app.use(express.json({ limit: "16kb" })); // for collecting json data from frontend
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // if url contain spaces , it will
//automatically set accordingly
app.use(cookieParser());

//above all code is production setup , actual code is start from below
//===================================================================================================//
//import user routes
import userRoutes from "./routes/user.routes.js";
//routs declaration
app.use("/user", userRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

export { app };
