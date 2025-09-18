import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaRegEdit, FaThumbsUp } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { FaRegSmile } from "react-icons/fa";
import axios from "axios";
import ProfileNavbar from "../Models/profileNavbar";
import ProfileUpdateModal from "./profileUpdatePage";
import LikesModal from "../Models/likeModel";
import CommentsModal from "../Models/commentModel";

import { fetchLoggedinUser } from "../Redux/Slices/loggedInUserSlice";
import { fetchLikes, toggleLike } from "../Redux/Slices/likeSlice";
import { fetchComments, createComment } from "../Redux/Slices/commentSlice";
import { removeFriend } from "../Redux/Slices/friendSlice";

const ProfilePostPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    data: loggedInUser,
    status,
    error,
  } = useSelector((state) => state.loggedInUser);

  const { likesByPost, likedStatusByPost } = useSelector((s) => s.likes);
  const { commentsByPost } = useSelector((s) => s.comments);

  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [isProfileUpdateOpen, setIsProfileUpdateOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [openLikesModalFor, setOpenLikesModalFor] = useState(null);
  const [openCommentsModalFor, setOpenCommentsModalFor] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!loggedInUser && status === "idle") {
      dispatch(fetchLoggedinUser())
        .unwrap?.()
        .catch(() => navigate("/login"));
    }
  }, [dispatch, loggedInUser, status, navigate]);

  const sortedPosts = useMemo(() => {
    const posts = [...(loggedInUser?.posts || [])];
    posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return posts;
  }, [loggedInUser]);

  const filteredPosts = useMemo(() => {
    switch (filter) {
      case "media":
        return sortedPosts.filter(
          (post) => post.media_type === "image" || post.media_type === "video"
        );
      case "images":
        return sortedPosts.filter((post) => post.media_type === "image");
      case "videos":
        return sortedPosts.filter((post) => post.media_type === "video");
      case "text":
        return sortedPosts.filter(
          (post) => post.text && (!post.media_url || post.media_type === "none")
        );
      default:
        return sortedPosts.filter(
          (post) => post.media_type === "image" || post.media_type === "video"
        );
    }
  }, [filter, sortedPosts]);

  const fetchFriendsList = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/v1/friends", {
        withCredentials: true,
      });
      return res.data.friends || [];
    } catch {
      return [];
    }
  };

  const likedByMeFallback = (postId) => {
    const list = likesByPost?.[postId];
    if (!Array.isArray(list) || !loggedInUser?.id) return false;
    return list.some((like) => like.user?.id === loggedInUser.id);
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:3000/api/v1/logoutUser",
        {},
        { withCredentials: true }
      );
    } finally {
      navigate("/login");
    }
  };

  const openPost = (post) => {
    setSelectedPost(post);
    setCommentText("");
    if (post?.id) {
      dispatch(fetchLikes(post.id));
      dispatch(fetchComments(post.id));
    }
  };

  const closePost = () => {
    setSelectedPost(null);
    setCommentText("");
  };

  const handleToggleLike = (postId, e) => {
    e?.stopPropagation();
    dispatch(toggleLike(postId));
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedPost?.id) return;
    await dispatch(
      createComment({ postId: selectedPost.id, text: commentText.trim() })
    );
    setCommentText("");
    dispatch(fetchComments(selectedPost.id));
  };

  const openLikesModal = (postId) => {
    dispatch(fetchLikes(postId));
    setOpenLikesModalFor(postId);
  };

  const openCommentsModal = (postId) => {
    dispatch(fetchComments(postId));
    setOpenCommentsModalFor(postId);
  };

  const showFriends = async () => {
    setShowFriendsModal(true);
    setLoadingFriends(true);
    const list = await fetchFriendsList();
    setFriends(list);
    setLoadingFriends(false);
  };

  const handleRemoveFriend = (username) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to remove @${username} from your friends?`
    );
    if (!confirmDelete) return;
    dispatch(removeFriend(username));
    setFriends((prev) => prev.filter((f) => f.username !== username));
  };

  if (status === "loading")
    return <p className="text-center mt-20">Loading...</p>;
  if (status === "failed")
    return <p className="text-center mt-20 text-red-500">Error: {error}</p>;
  if (!loggedInUser) return null;

  return (
    <div className="p-6 bg-gradient-to-b from-white to-gray-200 min-h-screen">
      <div className="relative w-full h-[40vh] rounded-lg overflow-hidden mb-2">
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
              <h1 className="text-2xl font-bold">
                {loggedInUser.first_name} {loggedInUser.last_name}
              </h1>
              <h3 className="font-semibold text-gray-700 mt-2 hover:text-black hover:underline cursor-pointer">
                @{loggedInUser.username}
              </h3>
              <div className="rounded-lg mt-1 mb-1 mr-4">
                <span className="font-semibold">{loggedInUser.bio}</span>
              </div>
            </div>
          </div>

          <div className="absolute top-4 right-[-15px] flex flex-col items-end justify-between h-full py-6">
            <button
              onClick={handleLogout}
              className="gap-2 cursor-pointer px-7 mt-[-20px] py-2 flex items-center bg-red-100 text-red-600 rounded-lg shadow hover:bg-red-600/90 hover:text-white transition-all"
            >
              <FaSignOutAlt /> Logout
            </button>

            <span
              onClick={showFriends}
              className="text-gray-700 mr-[10px] hover:text-black cursor-pointer hover:underline font-medium"
            >
              {`${loggedInUser.friends?.length || 0} • Connections`}
            </span>

            <button
              onClick={() => setIsProfileUpdateOpen(true)}
              className="gap-2 cursor-pointer px-4 mt-[-20px] py-2 flex items-center bg-red-100 text-red-600 rounded-lg shadow hover:bg-red-600/90 hover:text-white transition-all"
            >
              <FaRegEdit /> Edit Profile
            </button>

            <ProfileUpdateModal
              isOpen={isProfileUpdateOpen}
              onClose={() => setIsProfileUpdateOpen(false)}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl">
        <ProfileNavbar onFilter={setFilter} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => openPost(post)}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden border border-gray-100"
            >
              {post.media_type &&
                post.media_url &&
                (post.media_type === "video" ? (
                  <video
                    src={post.media_url}
                    className="w-full h-56 object-cover"
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <img
                    src={post.media_url}
                    alt="Post"
                    className="w-full h-56 object-cover"
                    loading="lazy"
                  />
                ))}
              {post.text && (
                <div className="p-4">
                  <p className="text-gray-800 text-sm line-clamp-2">
                    {post.text}
                  </p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center text-gray-500 mt-10 animate-pulse">
            <FaRegSmile className="text-6xl mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">No posts available</p>
            <p className="text-sm text-gray-400 mb-4">
              You haven't shared anything yet. Start creating your first post!
            </p>
            <button
              onClick={() => navigate("/createPost")}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg shadow hover:bg-gray-600 transition-all"
            >
              Create Post
            </button>
          </div>
        )}
      </div>

      {showFriendsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-300/30 backdrop-blur-[30px]"
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
              friends.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between bg-gray-200/30 shadow rounded-lg p-3 hover:bg-white/30 transition mb-2"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={f.media_url}
                      alt={f.username}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium">
                        {f.first_name} {f.last_name}
                      </p>
                      <p
                        className="text-xs hover:text-black hover:underline cursor-pointer text-gray-500"
                        onClick={() => navigate(`/User/${f.username}`)}
                      >
                        @{f.username}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFriend(f.username)}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition"
                  >
                    Remove
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No friends yet.</p>
            )}
          </div>
        </div>
      )}

      {selectedPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-300/30 backdrop-blur-[30px]"
          onClick={closePost}
        >
          <div
            className="bg-gray-200/30 rounded-xl shadow-lg w-11/12 max-w-3xl max-h-[90vh] overflow-y-auto p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-2xl font-bold"
              onClick={closePost}
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
                <h2 className="text-gray-400 hover:text-black hover:underline cursor-pointer">
                  @{loggedInUser.username}
                </h2>
              </div>
            </div>

            {selectedPost.text && (
              <p className="mb-3 text-gray-800">{selectedPost.text}</p>
            )}
            {selectedPost.media_type &&
              selectedPost.media_url &&
              (selectedPost.media_type === "video" ? (
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
              ))}

            <div className="flex justify-between items-center text-sm text-gray-600 border-b border-gray-200 pb-2 mb-4">
              <button
                onClick={(e) => handleToggleLike(selectedPost.id, e)}
                className={`flex items-center gap-2 hover:text-blue-600 ${
                  likedStatusByPost[selectedPost.id] ??
                  likedByMeFallback(selectedPost.id)
                    ? "text-blue-600 font-semibold"
                    : ""
                }`}
              >
                <FaThumbsUp />{" "}
                {likedStatusByPost[selectedPost.id] ??
                likedByMeFallback(selectedPost.id)
                  ? "Liked"
                  : "Like"}
              </button>
              <div className="flex gap-6">
                <button
                  onClick={() => openLikesModal(selectedPost.id)}
                  className="hover:underline"
                >
                  {Array.isArray(likesByPost[selectedPost.id])
                    ? likesByPost[selectedPost.id].length
                    : selectedPost.likes?.length || 0}{" "}
                  Likes
                </button>
                <button
                  onClick={() => openCommentsModal(selectedPost.id)}
                  className="hover:underline"
                >
                  {Array.isArray(commentsByPost[selectedPost.id])
                    ? commentsByPost[selectedPost.id].length
                    : selectedPost.comments?.length || 0}{" "}
                  Comments
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitComment} className="flex gap-2 mb-4">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 p-2 rounded-lg border border-gray-400 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gray-500/30 text-white rounded-lg cursor-pointer hover:bg-gray-900/70"
              >
                Post
              </button>
            </form>
          </div>
        </div>
      )}

      {openLikesModalFor && (
        <LikesModal
          postId={openLikesModalFor}
          onClose={() => setOpenLikesModalFor(null)}
        />
      )}
      {openCommentsModalFor && (
        <CommentsModal
          postId={openCommentsModalFor}
          onClose={() => setOpenCommentsModalFor(null)}
        />
      )}
    </div>
  );
};

export default ProfilePostPage;
