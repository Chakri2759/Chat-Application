import React from 'react'
import {Routes,Route,Navigate} from 'react-router-dom'
import {Navbar}from "../src/components/Navbar"
import {ProfilePage} from "../src/components/ProfilePage"
import {SettingsPage} from "../src/components/SettingsPage"
import {LoginPage} from "../src/components/LoginPage"
import {SignUpPage} from "../src/components/SignUpPage"
import {HomePage} from "../src/components/HomePage"
import {useAuthStore} from "../src/store/useAuthStore.js"
import { useThemeStore } from "../src/store/useThemeStore.js"
import { useEffect } from 'react'
import { Toaster } from "react-hot-toast"
import {Loader} from "lucide-react"
const App = () => {
   const {authUser,checkAuth,isCheckingAuth}=useAuthStore();
   const {theme}=useThemeStore();
   useEffect(()=>{
    checkAuth();
   })
  //  console.log("Auth User:",{authUser});
   if(!authUser && isCheckingAuth)
   {
        return(
          <div className='flex justify-center items-center h-screen'>
            <Loader className='size-10 animate-spin'/>
          </div>
        )
   }
   return(
    <div data-theme={theme} >
      <Navbar/>
      <Routes>
      <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>
       <Toaster
         position="top-center"
         reverseOrder={false}
       />
    </div>
  )
}

export default App