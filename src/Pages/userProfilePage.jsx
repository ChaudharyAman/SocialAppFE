/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaRegSmile } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFriends,
  sendFriendRequest,
  cancelFriendRequest,
  fetchSentRequests,
  removeFriend,
} from "../Redux/Slices/friendSlice";
import { fetchLikes, toggleLike } from "../Redux/Slices/likeSlice";
import { fetchComments, createComment } from "../Redux/Slices/commentSlice";
import api from "../Api/api";
import {
  FaUserPlus,
  FaUserTimes,
  FaPhotoVideo,
  FaImage,
  FaVideo,
  FaFont,
  FaThumbsUp,
} from "react-icons/fa";
import LikesModal from "../Models/likeModel";
import CommentsModal from "../Models/commentModel";
import Loader from "../Logo/loader";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const UserProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { myFriends, sentRequests } = useSelector((state) => state.friends);
  const { likesByPost, likedStatusByPost } = useSelector(
    (state) => state.likes
  );
  const { commentsByPost } = useSelector((state) => state.comments);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState([]);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [openLikesModalFor, setOpenLikesModalFor] = useState(null);
  const [openCommentsModalFor, setOpenCommentsModalFor] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`${API_BASE_URL}/api/v1/user/${username}`, {
          withCredentials: true,
        });
        setUser(res.data.user[0]);
      } catch (err) {
        console.error("Error fetching user:", err);
        navigate("/profile");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [username, navigate]);

  useEffect(() => {
    dispatch(fetchFriends());
    dispatch(fetchSentRequests());
  }, [dispatch]);

  useEffect(() => {
    if (username) fetchFriendsList();
  }, [username]);

  const fetchFriendsList = async () => {
    try {
      const res = await api.get(`${API_BASE_URL}/api/v1/friends/${username}`, {
        withCredentials: true,
      });
      setFriends(res.data.friends || []);
    } catch (e) {
      console.error("Error fetching friends:", e);
    }
  };

  const getFriendStatus = () => {
    if (!user) return "not_friend";
    if (myFriends.some((f) => f.username === user.username)) return "connected";
    if (sentRequests.some((req) => req.friend_username === user.username))
      return "pending";
    return "not_friend";
  };

  const friendStatus = getFriendStatus();

  const handleFriendAction = async () => {
    if (!user) return;
    try {
      if (friendStatus === "not_friend")
        await dispatch(sendFriendRequest(user.username));
      else if (friendStatus === "pending")
        await dispatch(cancelFriendRequest(user.username));
      else if (friendStatus === "connected") {
        const confirmRemove = window.confirm(
          `Remove ${user.first_name} ${user.last_name} from connections?`
        );
        if (confirmRemove) await dispatch(removeFriend(user.username));
      }
    } catch (err) {
      console.error("Error updating friend status:", err);
    }
  };

  const sortedPosts = useMemo(() => {
    if (!user?.posts) return [];
    return [...user.posts].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
  }, [user]);

  const filteredPosts = useMemo(() => {
    switch (filter) {
      case "images":
        return sortedPosts.filter((p) => p.media_type === "image");
      case "videos":
        return sortedPosts.filter((p) => p.media_type === "video");
      case "text":
        return sortedPosts.filter(
          (p) => p.text && (!p.media_url || p.media_type === "none")
        );
      default:
        return sortedPosts.filter(
          (p) => p.media_type === "image" || p.media_type === "video"
        );
    }
  }, [filter, sortedPosts]);

  const likedByMeFallback = (postId) => {
    const list = likesByPost?.[postId];
    if (!Array.isArray(list) || !user?.id) return false;
    return list.some((like) => like.user?.id === user.id);
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

  const openLikesModal = (postId) => {
    dispatch(fetchLikes(postId));
    setOpenLikesModalFor(postId);
  };

  const openCommentsModal = (postId) => {
    dispatch(fetchComments(postId));
    setOpenCommentsModalFor(postId);
  };

  if (loading) return <p className="text-center mt-20"><Loader/></p>;
  if (!user) return <p className="text-center mt-20">User not found</p>;

  return (
    <div className="p-6 bg-gradient-to-b from-white to-gray-200 min-h-screen">
      <div className="relative w-full h-[40vh] rounded-lg overflow-hidden mb-10">
        <img
          src={user.media_url}
          alt="cover"
          className="w-full h-full object-cover blur-md scale-110"
        />
        <div className="absolute inset-0 mb-2 flex justify-between items-end w-[95%] left-4">
          <div className="flex items-center gap-6">
            <img
              src={user.media_url}
              alt="profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <div>
              <h1 className="text-2xl font-bold">
                {user.first_name} {user.last_name}
              </h1>
              <h3 className="font-semibold text-gray-700 mt-2">
                @{user.username}
              </h3>
              <p className="font-semibold text-gray-600">{user.bio}</p>
            </div>
          </div>

          <div className="text-end mr-0">
            <span
              className="text-gray-700 hover:text-black cursor-pointer hover:underline font-medium"
              onClick={() => {
                fetchFriendsList();
                setShowFriendsModal(true);
              }}
            >
              {`${friends.length} • Connections`}
            </span>
          </div>

          <div className="absolute top-4 right-[-15px]">
            {friendStatus === "connected" ? (
              <button
                onClick={handleFriendAction}
                className="px-4 py-2 flex items-center gap-2 bg-red-100 text-red-600 rounded-lg shadow hover:bg-red-600/90 hover:text-white transition-all"
                title="Remove Friend"
              >
                
                <FaUserTimes /> Remove Friend
              </button>
            ) : friendStatus === "pending" ? (
              <button
                onClick={handleFriendAction}
                className="px-4 py-2 flex items-center gap-2 bg-red-100 text-red-600 rounded-lg shadow hover:bg-red-600/90 hover:text-white transition-all"
              >
                <FaUserTimes /> Cancel Request
              </button>
            ) : (
              <button
                onClick={handleFriendAction}
                className="px-4 py-2 flex items-center gap-2 bg-gray-100 text-gray-600 rounded-lg shadow hover:bg-gray-600/90 hover:text-white transition-all"
              >
                <FaUserPlus /> Send Request
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="relative flex flex-wrap justify-center items-center gap-6">
        <button
          onClick={() => setFilter("media")}
          className="px-3 py-2 rounded-lg hover:bg-gray-200 flex items-center gap-2"
        >
          <FaPhotoVideo /> Posts
        </button>
        <button
          onClick={() => setFilter("images")}
          className="px-3 py-2 rounded-lg hover:bg-gray-200 flex items-center gap-2"
        >
          <FaImage /> Images
        </button>
        <button
          onClick={() => setFilter("videos")}
          className="px-3 py-2 rounded-lg hover:bg-gray-200 flex items-center gap-2"
        >
          <FaVideo /> Videos
        </button>
        <button
          onClick={() => setFilter("text")}
          className="px-3 py-2 rounded-lg hover:bg-gray-200 flex items-center gap-2"
        >
          <FaFont /> Words
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
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
            <p className="text-lg font-medium">No posts available</p>
            <p className="text-sm text-gray-400">
              This user hasn’t shared anything yet.
            </p>
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
            {friends.length > 0 ? (
              friends.map((f) => (
                <div
                  key={f.id}
                  className="flex flex-row items-start bg-gray-200/30 shadow rounded-lg p-3 hover:bg-white/30 transition"
                >
                  <img
                    src={f.media_url}
                    alt={f.username}
                    className="w-16 h-16 rounded-full object-cover mb-2"
                  />
                  <div className="flex flex-col mt-3.5 ml-4">
                    <p className="text-sm font-medium">
                      {f.first_name} {f.last_name}
                    </p>
                    <p
                      onClick={() => navigate(`/User/${f.username}`)}
                      className="text-xs text-gray-500 hover:text-black hover:underline cursor-pointer"
                    >
                      @{f.username}
                    </p>
                  </div>
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
                src={user.media_url}
                alt="profile"
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <h3 className="font-semibold">
                  {user.first_name} {user.last_name}
                </h3>
                <p className="text-gray-400">@{user.username}</p>
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
                  {(likesByPost[selectedPost.id]?.length ??
                    selectedPost.likes?.length) ||
                    0}{" "}
                  Likes
                </button>
                <button
                  onClick={() => openCommentsModal(selectedPost.id)}
                  className="hover:underline"
                >
                  {(commentsByPost[selectedPost.id]?.length ??
                    selectedPost.comments?.length) ||
                    0}{" "}
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

export default UserProfilePage;
