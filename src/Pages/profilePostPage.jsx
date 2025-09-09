import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaRegEdit } from "react-icons/fa";
import { fetchLoggedinUser } from "../Redux/Slices/loggedInUserSlice";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import ProfileUpdateModal from "./profileUpdatePage";
// import LikesModal from "../Models/likeModel";
// import CommentsModal from "../Models/commentModel";


const ProfilePostPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data: loggedInUser, status, error } = useSelector(
    (state) => state.loggedInUser
  );

  const [selectedPost, setSelectedPost] = useState(null);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [activePostId, setActivePostId] = useState(null);

  useEffect(() => {
    if (!loggedInUser && status === "idle") {
      dispatch(fetchLoggedinUser())
        .unwrap()
        .catch(() => navigate("/login"));
    }
  }, [dispatch, navigate, loggedInUser, status]);

  const handleLogout = async () => {
    await axios.post(
      "http://localhost:3000/api/v1/logoutUser",
      {},
      { withCredentials: true }
    );
    navigate("/login");
  };

  const fetchFriends = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/v1/friends", {
        withCredentials: true,
      });
      return res.data.friends;
    } catch (err) {
      console.error("Error fetching friends:", err);
      return [];
    }
  };

  if (status === "loading")
    return <p className="text-center mt-20">Loading...</p>;
  if (status === "failed")
    return <p className="text-center mt-20 text-red-500">Error: {error}</p>;
  if (!loggedInUser) return null;

  return (
    <div className="p-6 bg-gradient-to-b from-white to-gray-200">
      <div className="relative w-full h-[40vh] rounded-lg overflow-hidden mb-20">
        <img
          src={loggedInUser.media_url}
          alt="cover"
          className="w-full h-full object-cover blur-md scale-110"
        />

        <div className="absolute inset-0 mb-2 flex justify-between items-end w-[95%] left-4">
          <div className="flex items-center gap-6">
            <img
              src={loggedInUser.media_url}
              alt="profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <div>
              <h1 className="flex flex-col justify-between text-2xl font-bold">
                {loggedInUser.first_name} {loggedInUser.last_name}
              </h1>
              <h3 className="font-semibold text-gray-700 mt-2 hover:text-black hover:underline cursor-pointer">
                {`@${loggedInUser.username}`}
              </h3>
              <div className="rounded-lg mt-1 mb-1 mr-4">
                <span className="font-semibold">{loggedInUser.bio}</span>
              </div>
            </div>
          </div>
          <div className="absolute top-4 right-[-15px] flex flex-col items-end justify-between h-full py-6">
            <button
              onClick={handleLogout}
              className="gap-2 cursor-pointer px-7 mt-[-20px] py-2 whitespace-nowrap flex items-center bg-red-100 text-red-600 rounded-lg shadow hover:bg-red-600/90 hover:text-white transition-all"
            >
              <FaSignOutAlt />
              Logout
            </button>
            <span
              onClick={async () => {
                setShowFriendsModal(true);
                setLoadingFriends(true);
                const data = await fetchFriends();
                setFriends(data);
                setLoadingFriends(false);
              }}
              className="text-gray-700 mr-[10px] hover:text-black cursor-pointer hover:underline font-medium"
            >
              {`${loggedInUser.friends?.length || 0} • Connections`}
            </span>
             <button
                onClick={() => setIsModalOpen(true)}
                className="gap-2 cursor-pointer px-4 mt-[-20px] py-2 whitespace-nowrap flex items-center bg-red-100 text-red-600 rounded-lg shadow hover:bg-red-600/90 hover:text-white transition-all"
              >
                <FaRegEdit/>
                Edit Profile
              </button>
              <ProfileUpdateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
              />
          </div>
        </div>
      </div>

      {showFriendsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-300/30 backdrop-blur-[30px] bg-opacity-70"
          onClick={() => setShowFriendsModal(false)}
        >
          <div
            className="bg-gray-200/30 rounded-xl shadow-lg w-11/12 max-w-2xl max-h-[80vh] overflow-y-auto p-6 relative"
            onClick={(e) => e.stopPropagation()} 
          >
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-2xl font-bold"
              onClick={() => setShowFriendsModal(false)}
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4">Connections</h2>

            {loadingFriends ? (
              <p className="text-center text-gray-500">Loading...</p>
            ) : friends.length > 0 ? (
              <div>
                {friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex flex-row items-start bg-gray-200/30 shadow rounded-lg p-3 hover:bg-white/30 transition"
                  >
                    <img
                      src={friend.media_url}
                      alt={friend.username}
                      className="w-16 h-16 rounded-full object-cover mb-2"
                    />
                    <div className=" flex flex-col mt-3.5 ml-4">
                    <p className="text-sm font-medium text-center">
                      {friend.first_name} {friend.last_name}
                    </p>
                    <p className="text-xs text-gray-500">@{friend.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No friends yet.</p>
            )}
          </div>
        </div>
      )}

     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {loggedInUser.posts?.map((post) => (
          <div
            key={post.id}
            onClick={() => setSelectedPost(post)}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden border border-gray-100"
          >
            {/* Post Media */}
            <div className="relative w-full h-56 bg-gray-100">
              {post.media_type === "video" ? (
                <video
                  src={post.media_url}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img
                  src={post.media_url}
                  alt="Post"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}
            </div>

            {/* Post Content */}
            <div className="p-4">
              {post.text && (
                <p className="text-gray-800 text-sm line-clamp-2 mb-3">
                  {post.text}
                </p>
              )}
             <div className="flex justify-between items-center text-xs text-gray-500">
                <span
                  onClick={() => {
                    setActivePostId(post.id);
                    setShowLikesModal(true);
                  }}
                  className="cursor-pointer hover:underline"
                >
                  ❤️ {post.likes?.length || 0} Likes
                </span>
                <span
                  onClick={() => {
                    setActivePostId(post.id);
                    setShowCommentsModal(true);
                  }}
                  className="cursor-pointer hover:underline"
                >
                  💬 {post.comments?.length || 0} Comments
                </span>
              </div>

            </div>
          </div>
        ))}
      </div>



      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-300/30 backdrop-blur-[30px] bg-opacity-70 bg-opacity-70">
          <div className="bg-gray-200/30 rounded-xl shadow-lg w-11/12 max-w-3xl max-h-[90vh] overflow-y-auto p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-2xl font-bold"
              onClick={() => setSelectedPost(null)}
            >
              &times;
            </button>

            <div className="flex items-center mb-4">
              <img
                src={loggedInUser.media_url}
                alt="profile"
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <h3 className="font-semibold">
                  {loggedInUser.first_name} {loggedInUser.last_name}
                </h3>
                <p className="text-xs text-gray-400"> Public</p>
              </div>
            </div>

            {selectedPost.text && (
              <p className="mb-3 text-gray-800">{selectedPost.text}</p>
            )}

            {selectedPost.media_type === "video" ? (
              <video
                src={selectedPost.media_url}
                className="w-full max-h-[500px] object-contain rounded-lg bg-gray-300/30 mb-4"
                controls
                autoPlay
              />
            ) : (
              <img
                src={selectedPost.media_url}
                alt="Post"
                className="w-full max-h-[500px] object-contain rounded-lg bg-gray-300/30 mb-4"
              />
            )}

            <div className="flex justify-between items-center text-sm text-gray-600 border-b border-gray-200 pb-2 mb-2">
              <p>{selectedPost.likes?.length || 0} Likes</p>
              <p>{selectedPost.comments?.length || 0} Comments</p>
            </div>

            <div className="flex justify-around text-gray-600 mb-4">
              <button className="flex items-center gap-2 hover:text-blue-600">
                👍 Like
              </button>
              <button className="flex items-center gap-2 hover:text-blue-600">
                💬 Comment
              </button>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold mb-2">Comments</h3>
              {selectedPost.comments?.length > 0 ? (
                selectedPost.comments.map((c) => (
                  <div key={c.id} className="flex items-start mb-3">
                    <img
                      src={c.user?.image_url || "#"}
                      alt="comment user"
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <div className="bg-gray-100 rounded-lg p-2 w-full">
                      <p className="font-semibold text-sm">
                        {c.user?.name || `User ${c.user_id}`}
                      </p>
                      <p className="text-sm">{c.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No comments yet.</p>
              )}
            </div>
          </div> 
        </div>
      )}
    </div>
  );
};

export default ProfilePostPage;
