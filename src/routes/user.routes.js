import { Router } from "express";
import registerUser, {
  accessRefreshToken,
  logOutUser,
  loginUser,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

// router.route("/register").post(registerUser);
//now i have to implement multer middleware for uploading images, avatar etc

router.route("/register").post( 
  //before register user , execute middleware
  //fields method will take more then one different types  of files
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1, // we can use more then 1
    },
  ]),
  registerUser
);

//login route
router.route("/login").post(loginUser);

//logout user , we have to add auth middleware , for authentication

router.route("/logout").post(verifyJWT, logOutUser); // verifyJWT is a middleware

//part of lect 17
//end point of user refresh token 
router.route("/refresh-token").post(accessRefreshToken)

export default router;

//this router and controller will be imported in app file
