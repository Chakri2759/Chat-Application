import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import {SidebarSkeleton} from "../skeletons/SideBarSkeleton.jsx";
import { Users } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { authUser ,onlineUsers} = useAuthStore();
  // console.log(onlineUsers);
 const [showOnlineUsersOnly,setShowOnlineUsersOnly] = useState(false);
  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // Filter out the current logged-in user
 const filteredUsers=showOnlineUsersOnly?users.filter((user) => onlineUsers.includes(user._id)).filter((user) => user._id !== authUser._id):users;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
        {/* TODO: Online filter toggle */}
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineUsersOnly}
              onChange={(e) => setShowOnlineUsersOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">({onlineUsers.length-1} online)</span>
        </div>
       </div> 
    
        <div className="overflow-y-auto w-full py-3">
            {filteredUsers.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-gray-500">No users found</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <button
                  key={user._id}
                  className={`w-full p-3 flex items-center gap-3 hover:bg-base-200 transition-colors duration-200 ${
                    selectedUser?._id === user._id ? "bg-base-200" : ""
                  }`}
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="relative mx-auto lg:mx-0">
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt="Profile"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {onlineUsers.includes(user._id) && (
                      <span className="absolute right-0 bottom-0 w-3 h-3 bg-green-500 border border-white rounded-full"></span>
                    )}
                  </div>
                  <div className="hidden lg:block text-left min-w-0 flex-1">
                    <h4 className="font-medium">{user.fullName || user.name}</h4>
                  </div>
                </button>
              ))
            )}
        </div>
    </aside>
  );
};

export default Sidebar;