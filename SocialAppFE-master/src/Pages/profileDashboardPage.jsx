import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLoggedinUser } from "../Redux/Slices/loggedInUserSlice";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa"

const ProfileCard = () => {
  const dispatch = useDispatch();

  const navigate = useNavigate();
  
  const { data: loggedInUser, status, error } = useSelector((state) => state.loggedInUser);

  useEffect(() => {
    if (!loggedInUser && status === "idle") {
      dispatch(fetchLoggedinUser());
    }
  }, [dispatch, loggedInUser, status]);

  if (status === "loading") 
    return <p className="text-center">Loading...</p>;
  if (status === "failed")
    return <p className="text-center text-red-500">Error: {error}</p>;
  if (!loggedInUser) return null;

  return (
    <div className=" rounded-2xl pt-8 mt-8 p-1 m-1 ml-4 justify-center shadow-lg overflow-hidden">
      <div className="h-28 w-full relative">
        <img
          src={loggedInUser.media_url}
          alt="cover"
          className="w-full h-full blur-sm object-cover"
        />
        <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-10">
          <img
            src={loggedInUser.media_url}
            alt="profile"
            
            className="w-20 h-20 rounded-full border-4 border-white shadow-md object-cover"
          />
        </div>
      </div>

      <div className="mt-12 text-center px-4 pb-6">
        <h2 className="text-xl font-bold text-gray-800">
          {loggedInUser.first_name} {loggedInUser.last_name}
        </h2>
        <p
        onClick={() => navigate(`/profile`)} 
        className="text-sm text-gray-500 hover:text-gray-700 hover:font-semibold cursor-pointer">@{loggedInUser.username}</p>
        <p className="text-sm text-gray-600 mt-2">{loggedInUser.bio}</p>

        <div className="flex justify-around mt-4 text-gray-700">
          <div className="text-center">
            <p className="font-bold">{loggedInUser.posts?.length || 0}</p>
            <p className="text-xs text-gray-500">Posts</p>
          </div>
          <div className="text-center">
            <p className="font-bold">{loggedInUser.friends.length || 0}</p>
            <p className="text-xs text-gray-500">Connections</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/profile`)}
          className="w-full mt-6 py-2 bg-gray-300 text-gray-800 hover:text-white font-semibold rounded-lg hover:bg-gray-600 cursor-pointer transition flex items-center justify-center gap-2"
        >
          <FaUserCircle className="text-lg" />
          View Profile
        </button>
      </div>
    </div>
  );
};

export default ProfileCard;
