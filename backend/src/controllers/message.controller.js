import { User } from "../models/user.model.js";
import Message from "../models/message.model.js";
import  cloudinary  from "../lib/cloudinary.js";
import { getReceiverSocketId } from "../lib/socket.js"; 
import { io } from "../lib/socket.js"; // Assuming you have a socket instance exported from your socket.js file
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUser = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUser} });
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("getUsersForSidebar error", error);
  }
}

export const getMessages = async (req, res) => {
    try{
        const {id : userToChatId}=req.params;
        const myId=req.user._id;
        const messages=await Message.find({
            $or:[
                {senderId:myId,receiverId:userToChatId},
                {senderId:userToChatId,receiverId:myId}
            ]
        })
        res.status(200).json(messages);
    }catch(error){
        console.log("getMessages error",error);
        res.status(500).json({message:"internal server error"});
    }
}

export const sendMessage = async (req, res) => {
    try{
       
        const {text,image}=req.body;
        const {id : receiverId}=req.params;
        const senderId=req.user._id;
        let imageUrl;
        if(image){
            const uploadResponse=await cloudinary.uploader.upload(image);
            imageUrl=uploadResponse.secure_url;
        }
        const newMessage=new Message({
            senderId,
            receiverId,
            text,
            image:imageUrl
        });
        await newMessage.save();
       
        const receiverSocketId = getReceiverSocketId(receiverId); // Assuming you have a function to get the receiver's socket ID
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage); // Emit the new message to the receiver
        }
     

        res.status(200).json(newMessage);
    }catch(error){
        console.log("sendMessage error",error);
        res.status(500).json({message:"internal server error"});
    }
}