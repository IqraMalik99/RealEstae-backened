import { Router } from "express";
import { automateLogin, changeProfilePic, deleteAccount, googleAuth, signIn, signOut, signUp, updateUserData } from "../controllers/userController.js";
import { auth } from "../middlerware/auth.middleware.js";
import { upload } from "../middlerware/multer.js";

const userRouter = Router();
userRouter.route('/sign-in').post(signIn);
userRouter.route('/sign-out').post(auth,signOut);
userRouter.route('/sign-up').post(signUp);  // add multer middleware
userRouter.route('/oauth').post(googleAuth);
userRouter.route('/updateDp').post(auth,upload.single("avatar"),changeProfilePic);
userRouter.route('/update').post(auth,updateUserData);
userRouter.route('/delete').post(auth,deleteAccount);
userRouter.route('/autoLogin').get(automateLogin)
export {userRouter}