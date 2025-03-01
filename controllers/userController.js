import { User } from "../schema/user.schema.js";
import { ApiError } from "../utilities/ApiError.js";
import { AsyncHandler } from "../utilities/AsyncHandler.js";
import { cloudinaryUploader } from "../utilities/cloudinary.js";
import { Responce } from "../utilities/Responce.js";

//generate random password
function generatePassword(length) {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters[randomIndex];
  }

  return password;
}

// generate access token and refresh token 
let genToken = async (id) => {
  try {
    if (!id) {
      throw new ApiError(404, "not getting id to generate token ");
    }
    let user = await User.findById(id);
    if (!user) {
      throw new ApiError(404, "not getting user from id")
    }
    let refreshToken = await user.genRefreshToken();
    let accessToken = await user.genAccessToken();
    if (!refreshToken || !accessToken) {
      throw new ApiError(404, "not gen token from methods");
    }
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false })
    return { refreshToken, accessToken }
  } catch (error) {
    throw new ApiError(404, "Error in gen tokens from method")
  }
}
let options = {
  secure: true,
  httpOnly: true,
  sameSite: "none"
}

//       AUTENTICATION

export const signIn = AsyncHandler(async (req, res, next) => {
  try {
    let { username, email, password } = req.body
    if (!username && !email) {
      throw new ApiError(404, "please give either email or password");
    }
    if (!password) {
      throw new ApiError(404, "password is required")
    }
    let user = await User.findOne({ email: email });
    if (!user) {
      throw new ApiError(404, "Invalid email");
    }
    let checker = user.checkPassword(password);
    if (!checker) {
      throw new ApiError(404, "Invalid password");
    }
    let { refreshToken, accessToken } = await genToken(user._id);
    if (!refreshToken || !accessToken) {
      throw new ApiError(404, "not getting token from function");
    }
    return res.status(200).cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new Responce(200, {
        refreshToken,
        accessToken,
        user
      }, "Sucessfully Logged in"))
  } catch (error) {
    throw new ApiError(404, "Error in logged in")
  }

});

export const signUp = AsyncHandler(async (req, res, next) => {

  let { email, password, username } = req.body;
  if (!email || !password || !username) {
    throw new ApiError(404, "required all data to register")
  }
  try {
    let createUser = await User.create({
      email: email,
      password: password,
      username: username
    });
    if (!createUser) {
      throw new ApiError(404, "User creation error")
    }
    // let { refreshToken, accessToken } = await genToken(createUser._id);
    // if (!refreshToken || !accessToken) {
    //   throw new ApiError(404, "notgetting token from function");
    // }
    // let user = await User.findById(createUser._id).select("-password  -refreshToken");
    // if (!user) {
    //   throw new ApiError(404, "Not getting user after remove password or token")
    // }
    return res.status(200).json(new Responce(200, createUser, "Sucessfully Register"))
  } catch (error) {
    throw new ApiError(404, `Having error in registeration ${error}`)
  }

});

export const signOut = AsyncHandler(async (req, res, next) => {
  try {
    let user = req.user;
    if (!user) {
      throw new ApiError(404, "unAuthorized in logout")
    }
    let getUser = await User.findById(user._id);
    if (!getUser) {
      throw new ApiError(404, "not getting user in logout")
    }
    getUser.refreshToken = "";
    await getUser.save({ validateBeforeSave: false });
    return res.status(200).clearCookie("accessToken").clearCookie("refreshToken").json(new Responce(404, "user is logout"))
  } catch (error) {
    throw new ApiError(404, "error in logout")
  }
});
//OAUTH GOOGLE
export const googleAuth = AsyncHandler(
  async (req, res, next) => {
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        // login
        let { username, email } = req.body
        if (!username && !email) {
          throw new ApiError(404, "please give either email or password");
        }

        let user = await User.findOne({ email: email });
        if (!user) {
          throw new ApiError(404, "Invalid email");
        }
        let { refreshToken, accessToken } = await genToken(user._id);
        if (!refreshToken || !accessToken) {
          throw new ApiError(404, "not getting token from function");
        }
        return res.status(200).cookie("accessToken", accessToken, options)
          .cookie("refreshToken", refreshToken, options)
          .json(new Responce(200, {
            refreshToken,
            accessToken,
            avatar:user.avatar
          }, "Sucessfully Logged in"))
      } else {
        // singUP
        let password = generatePassword(8);
        let createUser = await User.create({
          email: req.body.email,
          password: password,
          username: req.body.username
        });
        if (!createUser) {
          throw new ApiError(404, "User creation error")
        }
        return res.status(200).json(new Responce(200, createUser, "Sucessfully Register"))
      }
    } catch (error) {
      throw new ApiError(404, "Error in server auth " + error)
    }
  }
)
//
export const changeProfilePic = AsyncHandler(async (req, res, next) => {
  try {
    if (!req.user) {
      throw new ApiError(404, "User is not authonticated for change profile picture");
    }
    let cloudinaryPath = await cloudinaryUploader(req.file?.path);
    console.log(`cloudinaryPath  is ${cloudinaryPath.url}`);
    let user = await User.findOne({email:req.user.email});
    if(!user){
      throw new ApiError(404, "error in getting user for change profile");
    }
    user.avatar=cloudinaryPath.url;
    await user.save();
    return res.status(200).json(new Responce(200, user, "Suceesfully change"))
  } catch (error) {
    throw new ApiError(404, "error in change profile picture")
  }
})
export const updateUserData=AsyncHandler(async (req,res,next)=>{
  console.log("In controller");
  
  let {username,password,email} =req.body;
  if(!username || !password || !email ){
    throw new ApiError(404,"Required all fields for updation");
  }
  if(!req.user){
    throw new ApiError(404,"user is not authenticated");
  }
 let getUser = await User.findOne({email:req.user.email});
 if(!getUser){
  throw new ApiError(404,"user is not found");
 }
let updatedUser = await User.findByIdAndUpdate(getUser._id,
    {
      username:username,
    email:email,
    password:password
  },
  {
    new:true
  }
 );

 if (!updatedUser) {
  throw new ApiError(500, "Error updating user");
}
res.status(200).json(new Responce(200,updatedUser,"sucessfully updated"))
 
})
export const deleteAccount=AsyncHandler(async(req,res,next)=>{
  if(!req.user){
    throw new ApiError(404,"user is not authenticated");
  }
  let deluser = await User.findOneAndDelete({email:req.user.email});
  if(!deluser){
    throw new ApiError(401,"Cannot delete user");
  }
  return res.status(200).clearCookie("accessToken").clearCookie("refreshToken").json(new Responce(404,deluser ,"user is deleted"))
})

export let automateLogin = AsyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    if (token) {
      console.log("it has user");
      const verification =  jwt.verify(token, "mySecret");
      if (!verification) {
        throw new ApiError(400, "Token verification failed");
      }

      // Find the user based on the token payload
      const user = await User.findOne({ _id: verification._id }).select(
        "-password -refreshToken"
      );
      if (!user) {
        throw new ApiError(400, "User not found in the database");
      }
      return res.json(new Responce(200, user, "Successfully logged in"));
    } else {
      console.log("it has not user");
      return res.json(new Responce(200, null, "Not logged in"));
    }
  } catch (error) {
    console.log("it has error user");
    throw new ApiError(404, "error in automate login",error);
  }
});

