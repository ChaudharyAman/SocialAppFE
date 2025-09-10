import React from "react";
import { useNavigate } from "react-router-dom";
import { FaPhotoVideo, FaImage, FaVideo, FaFont, FaNewspaper, FaPlus } from "react-icons/fa";
import { useSelector } from "react-redux";

const ProfileNavbar = ({ onFilter }) => {
  const navigate = useNavigate();

    const { data: loggedInUser, status, error } = useSelector(
      (state) => state.loggedInUser
    );

  const btnClass = "gap-2 cursor-pointer px-4 py-2 flex items-center bg-red-100 text-red-600 rounded-lg shadow hover:bg-red-600/90 hover:text-white transition-all";

  return (
  <div
  className="w-full flex justify-center items-center gap-6 shadow-md p-4 rounded-xl mb-6 top-0 z-20 flex-wrap relative overflow-hidden"
>
  <img
    src={loggedInUser?.media_url}
    alt="background"
    className="absolute inset-0 w-full h-full object-cover blur-sm scale-110 opacity-40"
  />

  <div className="absolute inset-0 bg-gray-200/30" />

  <div className="relative flex flex-wrap justify-center items-center gap-6">
    <button onClick={() => onFilter("media")} className={btnClass}>
      <FaPhotoVideo /> Posts
    </button>
    <button onClick={() => onFilter("images")} className={btnClass}>
      <FaImage /> Images
    </button>
    <button onClick={() => onFilter("videos")} className={btnClass}>
      <FaVideo /> Videos
    </button>
    <button onClick={() => onFilter("text")} className={btnClass}>
      <FaFont /> Words
    </button>
    <button onClick={() => navigate("/feed")} className={btnClass}>
      <FaNewspaper /> Feed
    </button>
    <button onClick={() => navigate("/createPost")} className={btnClass}>
      <FaPlus /> New Post
    </button>
  </div>
</div>

  );
};

export default ProfileNavbar;
