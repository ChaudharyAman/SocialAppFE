import { useState, useEffect, useRef } from "react";
import { FaThumbsUp, FaRegCommentAlt } from "react-icons/fa";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { fetchLikes, toggleLike } from "../Redux/Slices/likeSlice";
import { createComment, fetchComments } from "../Redux/Slices/commentSlice";
import LikesModal from "../Models/likeModel";
import CommentsModal from "../Models/commentModel";
import ProfileCard from "./profileDashboardPage";
import FriendsList from "./friendsList";
import { useNavigate } from "react-router-dom";
import CreatePost from "./createPost";

const Feed = () => {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [showLikesModal, setShowLikesModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);

  const [commentInputs, setCommentInputs] = useState({});
  const [playingVideo, setPlayingVideo] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const loggedInUser = useSelector((state) => state.loggedInUser.data);

  const dispatch = useDispatch();
  const { likesByPost, likedStatusByPost } = useSelector((state) => state.likes);
  const { commentsByPost, countsByPost } = useSelector((state) => state.comments);

  const fetchPosts = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const res = await axios.get(
        `${API_BASE_URL}/feed?page=${page + 1}&limit=5`,
        { withCredentials: true }
      );

      if (res.data.success) {
        const newPosts = res.data.feed;
        if (newPosts.length === 0) {
          setHasMore(false);
        } else {
          setData((prev) => [...prev, ...newPosts]);
          setPage((prev) => prev + 1);

          newPosts.forEach((post) => {
            dispatch(fetchComments(post.post_id));
            dispatch(fetchLikes(post.post_id));
          });
        }
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 50 >=
        document.documentElement.scrollHeight
      ) {
        fetchPosts();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [page, hasMore]);

  const handleShowLikes = (postId) => {
    setSelectedPostId(postId);
    setShowLikesModal(true);
    dispatch(fetchLikes(postId));
  };

  const handleToggleLike = (postId) => {
    dispatch(toggleLike(postId));
  };

  const handleShowComments = (postId) => {
    setSelectedPostId(postId);
    setShowCommentsModal(true);
    dispatch(fetchComments(postId));
  };

  const handleCommentSubmit = (postId) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    dispatch(createComment({ postId, text }));
    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
  };

  const handleVideoClick = (postId) => {
    const videoEl = document.getElementById(`video-${postId}`);
    if (videoEl) {
      if (playingVideo === postId) {
        videoEl.pause();
        setPlayingVideo(null);
      } else {
        if (playingVideo) {
          const prevVideo = document.getElementById(`video-${playingVideo}`);
          prevVideo?.pause();
        }
        videoEl.muted = false;
        videoEl.play();
        setPlayingVideo(postId);
      }
    }
  };

  return (
    <div>
      <div className="flex flex-row m-0">
        <div className="bg-white mt-8 min-w-[24%]">
          <ProfileCard />
        </div>

        <div className="flex flex-col mt-8 pt-6 items-center gap-2 min-w-[50%] bg-white min-h-screen">
          <div className="w-full">
            <CreatePost />
          </div>

          {data.map((post) => {
            const postLikes = likesByPost[post.post_id] || post.likes || [];
            const isLiked = likedStatusByPost[post.post_id] || false;
            const allComments = commentsByPost[post.post_id] || [];
            const commentCount =
              countsByPost[post.post_id] ?? post.comments?.length ?? 0;
            const latestComments = allComments.slice(-3);

          
            return (
              <div
                key={post.post_id}
                className="w-full max-w-xl bg-white rounded-2xl shadow-md p-4"
              >

                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={post.user.media_url}
                    alt={post.user.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h2 className="font-semibold">
                      {post.user.first_name} {post.user.last_name}
                    </h2>
                    <p
                      onClick={() => navigate(`/User/${post.user.username}`)}
                      className="text-sm cursor-pointer text-gray-500 hover:text-gray-700 hover:font-semibold"
                    >
                      @{post.user.username}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(post.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {post.media_url && (
                  <div className="relative">
                    {post.media_url.endsWith(".mp4") ? (
                      <div
                        className="relative cursor-pointer"
                        onClick={() => handleVideoClick(post.post_id)}
                      >
                        <video
                          id={`video-${post.post_id}`}
                          src={post.media_url}
                          loop
                          playsInline
                          className="w-full rounded-lg mb-3"
                        />
                        {playingVideo !== post.post_id && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-lg font-semibold rounded-lg">
                           Click to play
                          </div>
                        )}
                      </div>
                    ) : (
                      <img
                        src={post.media_url}
                        alt="post"
                        className="w-full rounded-lg mb-3 object-cover"
                      />
                    )}
                  </div>
                )}

                {post.text && <p className="mb-3 text-gray-800">{post.text}</p>}

                <div className="flex justify-between text-gray-600 text-sm mb-2">
                  <span
                    onClick={() => handleShowLikes(post.post_id)}
                    className="cursor-pointer hover:underline"
                  >
                    👍 {Array.isArray(postLikes) ? postLikes.length : 0} Likes
                  </span>
                  <span
                    onClick={() => handleShowComments(post.post_id)}
                    className="cursor-pointer hover:underline"
                  >
                    💬 {commentCount} Comments
                  </span>
                </div>

                <div className="flex justify-around border-t pt-2 text-gray-600 text-sm">
                  <button
                    className={`flex items-center gap-2 ${
                      isLiked
                        ? "text-blue-500"
                        : "text-gray-600 hover:text-blue-500"
                    }`}
                    onClick={() => handleToggleLike(post.post_id)}
                  >
                    <FaThumbsUp /> {isLiked ? "Liked" : "Like"}
                  </button>
                  <button
                    className="flex items-center gap-2 hover:text-green-500"
                    onClick={() => handleShowComments(post.post_id)}
                  >
                    <FaRegCommentAlt /> Comment
                  </button>
                </div>

                <div className="mt-3 space-y-2">
                  {latestComments.map((c) => (
                    <div key={c.id} className="flex items-start gap-2">
                      <img
                        src={c.user?.media_url}
                        alt={c.user?.username}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <div className="bg-gray-100 px-3 py-1 rounded-lg text-sm">
                        {c.text}
                      </div>
                    </div>
                  ))}
                </div>

                {loggedInUser && (
                  <div className="flex items-center mt-3 gap-2">
                    <img
                      src={loggedInUser.media_url}
                      alt="your profile"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={commentInputs[post.post_id] || ""}
                      onChange={(e) =>
                        setCommentInputs((prev) => ({
                          ...prev,
                          [post.post_id]: e.target.value,
                        }))
                      }
                      className="flex-1 px-3 py-1 rounded-full border text-sm focus:outline-none"
                    />
                    <button
                      onClick={() => handleCommentSubmit(post.post_id)}
                      className="px-3 py-1 bg-gray-700 text-white rounded-full hover:bg-black text-sm"
                    >
                      Post
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {loading && <p className="text-gray-500">Loading more posts...</p>}
          {!hasMore && <p className="text-gray-500">No more posts</p>}

          {showLikesModal && selectedPostId && (
            <LikesModal
              postId={selectedPostId}
              onClose={() => setShowLikesModal(false)}
            />
          )}
          {showCommentsModal && selectedPostId && (
            <CommentsModal
              postId={selectedPostId}
              onClose={() => setShowCommentsModal(false)}
            />
          )}
        </div>

        <div className="mt-8 min-w-[24%] bg-white">
          <FriendsList />
        </div>
      </div>
    </div>
  );
};

export default Feed;
