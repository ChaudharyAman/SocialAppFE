import { FaTimes } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { fetchLikes } from "../Redux/Slices/likeSlice";
import "./customCss.css";
import Loader from "../Logo/loader";

const LikesModal = ({ postId, onClose }) => {
  const dispatch = useDispatch();
  const { likesByPost, status } = useSelector((state) => state.likes);

  useEffect(() => {
    if (postId) {
      dispatch(fetchLikes(postId));
    }
  }, [dispatch, postId]);

  return (
    <div className="fixed inset-0 bg-gray-300/30 backdrop-blur-[20px] flex justify-center items-center z-50">
      <div className="bg-gray-200/30 rounded-xl p-6 w-96 max-h-[80vh] scrollbar-hide overflow-y-auto shadow-lg">
        <div className="flex flex-row justify-between">
          <h2 className="text-lg font-semibold mb-4">Liked by</h2>
          <button
            onClick={onClose}
            className=" mb-4 rounded-lg text-black cursor-pointer"
          >
            <div className=" text-gray-700 hover:text-black">
              <FaTimes size={20} />
            </div>
          </button>
        </div>

        {status === "loading" ? (
          <p className="text-gray-500"><Loader/></p>
        ) : (likesByPost[postId] || []).length === 0 ? (
          <p className="text-gray-500">No likes yet</p>
        ) : (
          <ul className="space-y-3">
            {likesByPost[postId].map((like) => (
              <li
                key={like.id}
                className="flex items-center gap-3 border-b border-gray-400 pb-3"
              >
                <img
                  src={like.user?.media_url}
                  alt={like.user?.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="font-medium">
                  {like.user?.username || "Unknown User"}
                </span>
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

export default LikesModal;
