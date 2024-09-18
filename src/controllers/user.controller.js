import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import ApiRespose from "../utils/ApiResponse.js";
const registerUser = asyncHandler(async (req, res) => {
  //just for checking purpose
  // res.status(200).json({
  //     message: "ok",
  //   });
  //=======================================================================================
  //STEPS TO REGISTER USER
  /*
1. GET USER DETAILS FROM FRONTEND
2. VALIDATION - ANY EMPTY DETAIL
3. CHECT IF USER ALREADY EXIST- BY EMAIL OR USERNAME
4. CHECK FOR IMAGES AND AVATAR
5. UPLOUD THEM ON CLOUDINARY
6. CREATE USER OBJECT , CREATE ENTRY IN DB
7. REMOVE PASSWORD AND REFRESH TOKEN FIELD FROM THE RESPONSE
8. CHECK FOR USER CREATION 
9. RETURN RESPONSE  
=========================================================================================
*/
  //1. GET USER DETAILS FROM FRONTEND

  const { email, fullname, password, username } = req.body;
  console.log(email, fullname, password, username);
  // console.log("email", email, fullname, password);
  //for file handling go to the routes and execute multer middleware

  //2. VALIDATION - ANY EMPTY DETAIL
  if (
    [email, fullname, password].some((fields) => {
      return fields?.trim() === "";
    })
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // 3. CHECT IF USER ALREADY EXIST- BY EMAIL OR USERNAME

  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (existedUser) {
    throw new ApiError(
      409,
      " user with this email or username is already exist "
    );
  }

  // 4. CHECK FOR IMAGES AND AVATAR

  // jesy req.body hoti hai asy he req.files b hota hai

  // const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  // console.log(avatarLocalPath);
  // if (!avatarLocalPath) {

  //   throw new ApiError(400, "avatar file is compulsary");
  // }

  // 5. UPLOUD THEM ON CLOUDINARY
  // const avatar = await uploadOnCloudinary(avatarLocalPath);
  // const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  // 6. CREATE USER OBJECT , CREATE ENTRY IN DB
  // const user = await User.create({
  //   fullname,
  //   coverImage: coverImage?.url || " ",
  //   avatar: avatar.url,
  //   username: username.toLowerCase(),
  //   email,
  //   password,
  // });

  // 7. REMOVE PASSWORD AND REFRESH TOKEN FIELD FROM THE RESPONSE

  // const createdUser = await User.findById(user._id).select(
  //   "-password -refreshToken"
  // );
  // if (!createdUser) {
  //   throw new ApiError(500, " something went wrong while creating user "); //srver error
  // }

  // 9. RETURN RESPONSE
  return res
    .status(201)
    .json(new ApiRespose(200, " user registered successfully "));
});

//lec 15 = login user
const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    //save refresh token in database
    user.refreshToken = refreshToken;
    await user.save({ ValidateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wromg while generating access and refersh token "
    );
  }
};

export const loginUser = asyncHandler(async (req, res) => {
  //get data from user / req.body
  //check by username or email
  //find the user / user exist in the database or not
  //if user found , check password
  //if correct , generate access and refresh token
  //then send these tokens in  cookies
  //send response
  //========================================================================================//

  // 1. get data from user / req.body

  const { email, password } = req.body;

  // 2. check by username or email
  if (!(email || password)) {
    throw new ApiError(400, "email or user is required");
  }
  // 3. find the user / user exist in the database or not
  const findUser = await User.findOne({
    $or: [{ email }, { password }],
  });

  if (!findUser) {
    throw new ApiError(404, "user not found");
  }
  // 3. If user found , check password
  const isPasswordValid = await findUser.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Passeord is invalid");
  }
  //if correct , generate access and refresh token
  // we have to reuse this method so we will creat separately
  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(findUser._id);
  //optional
  const loggedinUser = await User.findById(findUser._id).select(
    "-password",
    "-refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  //then send these tokens in  cookies
  //send response
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiRespose(
        200,
        {
          loggedinUser,
          accessToken,
          refreshToken,
        },
        "User loggedIn successfully"
      )
    );
});

export const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiRespose(200, {}, "User logged Out"));
});

export const accessRefreshToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.body.refreshToken || req.cookie.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "UnAuthorized accessed");
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      sdkfhdkshgsdkghsdkfghkjsfhgkshghskj
    );
    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(201, "invalid refresh token ");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "refresh token is used or expired");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, newRefreshToken } =
      await generateAccessTokenAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("newRefreshToken", newRefreshToken, options)
      .json(
        new ApiRespose(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Accessed token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.nessage || "invalid refresh token ");
  }
  //lec 17
  //this is a controller , now go to the routes and make an end point for this controller
});
export default registerUser;
