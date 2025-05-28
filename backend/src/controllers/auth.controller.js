import express from "express";
import {User} from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  console.log(req.body);
  const { email, fullName, password } = req.body;

  try {
    if(!fullName || !email || !password){
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be a six characters" });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "email already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      email: email,
      fullName: fullName,
      password: hashedPassword
    })
    if (newUser) {
      //create jwt token
      generateToken(newUser._id, res);
      await newUser.save();
      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      })

    }
    else {
      res.status(400).json({ message: "invalid user data" });
    }
  } catch (error) {
    console.log("new user error",error);
  }

}

export const login = async(req, res) => {
  let { email, password } = req.body;
  console.log(req.body);
  try{
    if(!email || !password){
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
      return res.status(400).json({ message: "Invalid credentials" });
    }
    //create jwt token
    generateToken(user._id, res);
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    })
}catch(error){
  console.log("login error",error);
  res.status(500).json({message:"internal server error"});

}
}

export const logout = (req, res) => {
    try{
      res.clearCookie("jwt");
      res.status(200).json({message:"logged out successfully"});
    }catch(error){
      console.log("logout error",error);
      res.status(500).json({message:"internal server error"});
    }
}

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile server:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
