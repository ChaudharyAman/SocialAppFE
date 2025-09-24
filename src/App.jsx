import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React, { Suspense } from "react";
import Login from "./Pages/loginPage";
import Dashboard from "./Pages/dashboard";
import ProfilePostPage from "./Pages/profilePostPage";
import ProfileUpdatePage from "./Pages/profileUpdatePage";
import FriendsList from "./Pages/friendsList";
import ProfileCard from "./Pages/profileDashboardPage";
import Feed from "./Pages/feed";
import UserProfilePage from "./Pages/userProfilePage";
import Signup from "./Pages/signUpPage";
import CreatePost from "./Pages/createPost";
import FriendsPage from "./Messages/friendsPageMessage";
import PrivateRoute from "./Components/privateRoute";
import { SpeedInsights } from "@vercel/speed-insights/react"
import Loader from "./Logo/loader";


function App() {
  return (
    <BrowserRouter>
      <SpeedInsights/>
      <Suspense fallback={<p><Loader/></p>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signUp" element={<Signup />} />

          <Route element={<PrivateRoute />}>
            <Route element={<Dashboard />}>
              <Route path="/feed" element={<Feed />} />
              <Route path="/profile" element={<ProfilePostPage />} />
              <Route path="/updateProfile" element={<ProfileUpdatePage />} />
              <Route path="/friends" element={<FriendsList />} />
              <Route path="/profileDashboard" element={<ProfileCard />} />
              <Route path="/User/:username" element={<UserProfilePage />} />
              <Route path="/createPost" element={<CreatePost />} />
              <Route path="/chat" element={<FriendsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
