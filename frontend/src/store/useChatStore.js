import toast from 'react-hot-toast';
import {create} from 'zustand';
import {axiosInstance} from '../lib/axios.js';
import {useAuthStore} from './useAuthStore.js';

export const useChatStore = create((set,get) => ({
  
    messages:[],
    users:[],
    selectedUser:null,
    isUsersLoading:false,
    isMessagesLoading:false,
  
   
  //fetching users for sidebar
    getUsers:async()=>{
      set({isUsersLoading:true});
      try{
        const res=await axiosInstance.get("/messages/users");
        console.log("Users data:", res.data);
        set({users:res.data});
      }catch(error){
        console.log("Error in getUsers:",error);
        toast.error("Error fetching users");
      }finally{
        set({isUsersLoading:false});
      }
    },

    //fetching messages for selected user
    getMessages:async(userId)=>{
        set({isMessagesLoading:true});
        try{
            const res=await axiosInstance.get('/messages/'+userId);
            set({messages:res.data});
        }catch(error){
            console.log("Error in getMessages:",error);
            toast.error("Error in fetching messages",error.response.data.message);
        }finally{
            set({isMessagesLoading:false});
        }
      },

      sendMessage:async (messageData) => {
           const {messages,selectedUser} = get();
          const userToSend = selectedUser._id;
          try{
            const res = await axiosInstance.post(`/messages/send/${userToSend}`, messageData);
            console.log("Message sent:", res.data);
            set({messages:[...messages,res.data]});
            toast.success("Message sent successfully");
          }catch(error){
            console.log("Error in sendMessage:", error);
            toast.error("Error in sending message", error.response.data.message);
          }
      },
     subscribeToMessages: () => {
       const {selectedUser, messages} = get();
        if (!selectedUser) {
          console.warn("No user selected to subscribe to messages.");
          return;
        }
        
        // Get the socket from the auth store
        const socket = useAuthStore.getState().socket;
        if (!socket) {
          console.warn("Socket is not connected.");
          return;
        }

        socket.on("newMessage", (newMessage) => {
          if (newMessage.receiverId === selectedUser._id || newMessage.senderId === selectedUser._id) {
            set({messages: [...messages, newMessage]});
          }
        });
     },
     unSubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (socket) {
          socket.off("newMessage");
        }
      },

      setSelectedUser:(user)=>set({selectedUser:user}),
}));