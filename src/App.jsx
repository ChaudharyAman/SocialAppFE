
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Pages/loginPage";
// import Dashboard from "./Pages/dashboard";;
import React, { Suspense, lazy } from "react";
import ProfilePostPage from "./Pages/profilePostPage";
import ProfileUpdatePage from "./Pages/profileUpdatePage";
import FriendsList from "./Pages/friendsList";
import ProfileCard from "./Pages/profileDashboardPage";
import Feed from "./Pages/feed";
import UserProfilePage from "./Pages/userProfilePage";
import Signup from "./Pages/signUpPage";

const Dashboard = lazy(() => import("./Pages/dashboard"));



function App() {
  return (
    <BrowserRouter>
       <Suspense fallback={<p>Loading...</p>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<ProfilePostPage />} />
          <Route path="/updateProfile" element={<ProfileUpdatePage />} />
          <Route path="/friends" element={<FriendsList/>} />
          <Route path="/profileDashboard" element={<ProfileCard/>} />
          <Route path="/feed" element={<Feed/>} />
          <Route path="/user/:id" element={<UserProfilePage />} />
          <Route path="/signUp" element={<Signup />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
