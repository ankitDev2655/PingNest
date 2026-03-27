import express from 'express';
import { getAllUsers, loginUser, myProfile, updateName, verifyUser, getUserById } from '../controller/user.controller.js';
import { isAuthenticated } from '../middlewares/isAuth.js';

const userRouter = express.Router();

userRouter.post("/login", loginUser);
userRouter.post("/verify-otp", verifyUser);
userRouter.get("/my-profile", isAuthenticated, myProfile);
userRouter.put("/update-name", isAuthenticated, updateName);
userRouter.get("/get-users", isAuthenticated, getAllUsers);
userRouter.get("/get-user/:id", getUserById);


export default userRouter;