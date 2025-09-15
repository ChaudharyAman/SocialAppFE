
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Pages/loginPage";
import Dashboard from "./Pages/dashboard";
import React, { Suspense, lazy } from "react";
import ProfilePostPage from "./Pages/profilePostPage";
import ProfileUpdatePage from "./Pages/profileUpdatePage";
import FriendsList from "./Pages/friendsList";
import ProfileCard from "./Pages/profileDashboardPage";
import Feed from "./Pages/feed";
import UserProfilePage from "./Pages/userProfilePage";
import Signup from "./Pages/signUpPage";
import CreatePost from "./Pages/createPost";



function App() {
  return (
    <BrowserRouter>
       <Suspense fallback={<p>Loading...</p>}>
       <Dashboard /> 
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<ProfilePostPage />} />
          <Route path="/updateProfile" element={<ProfileUpdatePage />} />
          <Route path="/friends" element={<FriendsList/>} />
          <Route path="/profileDashboard" element={<ProfileCard/>} />
          <Route path="/feed" element={<Feed/>} />
          <Route path="/User/:username" element={<UserProfilePage />} />
          <Route path="/signUp" element={<Signup />} />
           <Route path="/createPost" element={<CreatePost/>} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
