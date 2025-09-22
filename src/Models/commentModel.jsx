import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { fetchComments, createComment } from "../Redux/Slices/commentSlice";
import "./customCss.css";


const CommentsModal = ({ postId, onClose }) => {
  const dispatch = useDispatch();
  const { commentsByPost, status } = useSelector((state) => state.comments);

  const [text, setText] = useState("");

  useEffect(() => {
    if (postId) {
      dispatch(fetchComments(postId));
    }
  }, [dispatch, postId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    dispatch(createComment({ postId, text }));
    setText("");
  };

  return (
    <div className="fixed inset-0 bg-gray-300/30 backdrop-blur-[20px] flex justify-center items-center z-50">
      <div className="bg-gray-200/30 rounded-xl p-6 w-[700px] max-h-[80vh] scrollbar-hide overflow-y-auto shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Comments</h2>
          <button 
          onClick={onClose} 
          className="text-gray-700 cursor-pointer hover:text-black">
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} 
        className="flex gap-2 mb-4">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
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

        {status === "loading" ? (
          <p className="text-gray-500">Loading comments...</p>
        ) : (commentsByPost[postId] || []).length === 0 ? (
          <p className="text-gray-500">No comments yet</p>
        ) : (
          <ul className="space-y-3">
            {commentsByPost[postId].map((comment) => (
              <li
                key={comment.id}
                className="flex items-center gap-3 border-b border-gray-400 pb-3"
              >
                <img
                  src={comment.user?.media_url}
                  alt={comment.user?.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <span className="font-medium">
                    {comment.user?.username || "Unknown User"}
                  </span>
                  <p className="text-sm text-gray-700">{comment.text}</p>
                </div>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-500/30 text-white rounded-lg hover:bg-gray-900/70 cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default CommentsModal;
