import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPhotoVideo, FaImage, FaVideo, FaFont, FaNewspaper, FaPlus, FaUserFriends } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { fetchPendingRequests, acceptFriendRequest } from "../Redux/Slices/friendSlice";

const ProfileNavbar = ({ onFilter }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: loggedInUser } = useSelector((state) => state.loggedInUser);
  const { pendingRequests } = useSelector((state) => state.friends);

  const [showPendingModal, setShowPendingModal] = useState(false);

  const btnClass = "gap-2 cursor-pointer px-4 py-2 flex items-center bg-red-100 text-red-600 rounded-lg shadow hover:bg-red-600/90 hover:text-white transition-all";

  const handleShowPending = () => {
    setShowPendingModal(true);
    dispatch(fetchPendingRequests());
  };

  const handleAccept = async (username) => {
    if (window.confirm(`Accept friend request from ${username}?`)) {
      await dispatch(acceptFriendRequest(username));
      window.location.reload();
    }
  };

  return (
    <div className="w-full flex justify-center items-center gap-6 shadow-md p-4 rounded-xl mb-6 top-0 z-20 flex-wrap relative overflow-hidden">
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
        <button onClick={handleShowPending} className={btnClass}>
          <FaUserFriends /> Friend Requests
        </button>
      </div>

      {showPendingModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-300/30 backdrop-blur-[10px]"
          onClick={() => setShowPendingModal(false)}
        >
          <div
            className="bg-gray700/40 rounded-xl shadow-lg w-11/12 max-w-md max-h-[80vh] overflow-y-auto p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-2xl font-bold"
              onClick={() => setShowPendingModal(false)}
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4">Pending Friend Requests</h2>

            {pendingRequests.length === 0 ? (
              <p className="text-gray-500">No pending requests</p>
            ) : (
              pendingRequests.map((req) => (
                <div
                  key={req.user_id}
                  className="flex justify-between items-center mb-3 p-2 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={req.media_url}
                      alt={req.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p
                        className="font-medium"
                      >
                        {req.first_name} {req.last_name}
                      </p>
                      <p className="text-sm text-gray-500 cursor-pointer hover:underline hover:text-black"
                        onClick={() => navigate(`/User/${req.username}`)}
                      
                      >@{req.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAccept(req.username)}
                    className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                  >
                    Accept
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileNavbar;
